from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import bcrypt
import requests
import jwt as pyjwt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    organization: Optional[str] = None
    interest: str
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    organization: Optional[str] = None
    interest: str
    message: Optional[str] = None


JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access",
    }
    return pyjwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"email": payload["email"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"email": user["email"], "name": user.get("name", "Admin")}


@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower()
    ident = email
    now = datetime.now(timezone.utc)
    att = await db.login_attempts.find_one({"identifier": ident})
    if att and att.get("count", 0) >= 5:
        last = datetime.fromisoformat(att["last_attempt"])
        if (now - last).total_seconds() < 900:
            raise HTTPException(status_code=429, detail="Terlalu banyak percobaan. Coba lagi dalam 15 menit.")
        await db.login_attempts.delete_one({"identifier": ident})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1}, "$set": {"last_attempt": now.isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Email atau password salah")
    await db.login_attempts.delete_one({"identifier": ident})
    token = create_access_token(user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="lax", max_age=86400, path="/",
    )
    return {"email": user["email"], "name": user.get("name", "Admin"), "access_token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.get("/admin/contacts", response_model=List[ContactSubmission])
async def admin_contacts(admin: dict = Depends(get_current_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


class OrderCreate(BaseModel):
    publication_title: str
    price: str
    name: str
    email: EmailStr
    phone: str
    organization: Optional[str] = None


class Order(OrderCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate):
    obj = Order(**input.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return obj


@api_router.get("/admin/orders", response_model=List[Order])
async def admin_orders(admin: dict = Depends(get_current_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


@api_router.patch("/admin/orders/{order_id}")
async def update_order_status(order_id: str, payload: dict = Body(...), admin: dict = Depends(get_current_admin)):
    status = payload.get("status")
    if status not in {"pending", "contacted", "completed"}:
        raise HTTPException(status_code=400, detail="Status tidak valid")
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return {"ok": True}


@api_router.get("/")
async def root():
    return {"message": "GESOI API"}


STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "gesoi"
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png", "gif", "webp"}
ALLOWED_VIDEO_EXT = {"mp4", "webm", "mov"}


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXT and ext not in ALLOWED_VIDEO_EXT:
        raise HTTPException(status_code=400, detail="Format tidak didukung. Gunakan JPG, PNG, GIF, WEBP, MP4, WEBM, atau MOV.")
    data = await file.read()
    is_video = ext in ALLOWED_VIDEO_EXT
    max_size = 60 * 1024 * 1024 if is_video else 8 * 1024 * 1024
    if len(data) > max_size:
        raise HTTPException(status_code=400, detail=f"Ukuran file maksimal {'60MB untuk video' if is_video else '8MB untuk gambar'}.")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    default_ct = "video/mp4" if is_video else "image/jpeg"
    result = put_object(path, data, file.content_type or default_ct)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}


@api_router.get("/admin/files")
async def list_files(admin: dict = Depends(get_current_admin)):
    docs = await db.files.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.delete("/admin/files/{file_id}")
async def delete_file(file_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.files.update_one({"id": file_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    return {"ok": True}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(
        content=data,
        media_type=record.get("content_type") or content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@api_router.get("/content")
async def get_site_content():
    doc = await db.site_content.find_one({"_id": "content"})
    if not doc:
        return {}
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/content")
async def save_site_content(payload: dict = Body(...), admin: dict = Depends(get_current_admin)):
    await db.site_content.replace_one({"_id": "content"}, {"_id": "content", **payload}, upsert=True)
    return {"ok": True}


@api_router.delete("/admin/content")
async def reset_site_content(admin: dict = Depends(get_current_admin)):
    await db.site_content.delete_one({"_id": "content"})
    return {"ok": True}


@api_router.post("/contact", response_model=ContactSubmission)
async def create_contact(input: ContactSubmissionCreate):
    obj = ContactSubmission(**input.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    return obj


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts(admin: dict = Depends(get_current_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


class TrackEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str
    name: Optional[str] = None
    visitor_id: str
    lang: Optional[str] = None
    device: Optional[str] = None
    referrer: Optional[str] = None


@api_router.post("/track")
async def track_event(input: TrackEvent):
    if input.type not in {"pageview", "event"}:
        raise HTTPException(status_code=400, detail="Tipe tidak valid")
    now = datetime.now(timezone.utc)
    await db.analytics.insert_one({
        "id": str(uuid.uuid4()),
        "type": input.type,
        "name": (input.name or "")[:60] or None,
        "visitor_id": input.visitor_id[:64],
        "lang": input.lang if input.lang in ("id", "en") else None,
        "device": input.device if input.device in ("mobile", "desktop") else None,
        "referrer": (input.referrer or "")[:200] or None,
        "date": now.strftime("%Y-%m-%d"),
        "created_at": now.isoformat(),
    })
    return {"ok": True}


@api_router.get("/admin/analytics")
async def admin_analytics(days: int = 30, admin: dict = Depends(get_current_admin)):
    days = max(1, min(days, 90))
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=days - 1)).strftime("%Y-%m-%d")
    pv = {"date": {"$gte": start}, "type": "pageview"}

    daily_raw = await db.analytics.aggregate([
        {"$match": pv},
        {"$group": {"_id": "$date", "views": {"$sum": 1}, "visitors": {"$addToSet": "$visitor_id"}}},
        {"$project": {"_id": 0, "date": "$_id", "views": 1, "uniques": {"$size": "$visitors"}}},
    ]).to_list(200)
    by_date = {d["date"]: d for d in daily_raw}
    daily = []
    for i in range(days):
        key = (now - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        row = by_date.get(key, {"views": 0, "uniques": 0})
        daily.append({"date": key, "views": row["views"], "uniques": row["uniques"]})

    uniques_total = await db.analytics.aggregate([
        {"$match": pv},
        {"$group": {"_id": "$visitor_id"}},
        {"$count": "n"},
    ]).to_list(1)

    devices_raw = await db.analytics.aggregate([
        {"$match": {**pv, "device": {"$ne": None}}},
        {"$group": {"_id": "$device", "count": {"$sum": 1}}},
    ]).to_list(10)

    langs_raw = await db.analytics.aggregate([
        {"$match": {"date": {"$gte": start}, "lang": {"$ne": None}}},
        {"$group": {"_id": "$lang", "count": {"$sum": 1}}},
    ]).to_list(10)

    referrers = await db.analytics.aggregate([
        {"$match": {**pv, "referrer": {"$ne": None}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "source": "$_id", "count": 1}},
    ]).to_list(10)

    events_raw = await db.analytics.aggregate([
        {"$match": {"date": {"$gte": start}, "type": "event", "name": {"$ne": None}}},
        {"$group": {"_id": "$name", "count": {"$sum": 1}}},
    ]).to_list(50)

    return {
        "days": days,
        "totals": {
            "views": sum(d["views"] for d in daily),
            "uniques": uniques_total[0]["n"] if uniques_total else 0,
        },
        "daily": daily,
        "devices": {d["_id"]: d["count"] for d in devices_raw},
        "langs": {d["_id"]: d["count"] for d in langs_raw},
        "referrers": referrers,
        "events": {d["_id"]: d["count"] for d in events_raw},
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.analytics.create_index([("date", 1), ("type", 1)])
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin GESOI",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
