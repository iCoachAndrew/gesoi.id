"""Order endpoint tests for GESOI iteration 6"""
import os
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
ADMIN_EMAIL = "admin@gesoi.or.id"
ADMIN_PASSWORD = "GesoiAdmin#2045"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --- POST /api/orders (public) ---

def test_create_order_success(api):
    payload = {
        "publication_title": "TEST_Publikasi Riset A",
        "price": "Rp 150.000",
        "name": "TEST_Buyer One",
        "email": "test_buyer1@example.com",
        "phone": "+628123456789",
        "organization": "TEST_Org"
    }
    r = api.post(f"{BASE_URL}/api/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["id"]
    assert data["status"] == "pending"
    assert data["publication_title"] == payload["publication_title"]
    assert data["email"] == payload["email"]
    assert data["created_at"]
    pytest.order_id = data["id"]


def test_create_order_without_organization(api):
    payload = {
        "publication_title": "TEST_Publikasi Riset B",
        "price": "Rp 200.000",
        "name": "TEST_Buyer Two",
        "email": "test_buyer2@example.com",
        "phone": "+628999888777"
    }
    r = api.post(f"{BASE_URL}/api/orders", json=payload)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "pending"


def test_create_order_invalid_email(api):
    payload = {
        "publication_title": "TEST_Pub",
        "price": "Rp 100.000",
        "name": "X",
        "email": "not-an-email",
        "phone": "+628000000000"
    }
    r = api.post(f"{BASE_URL}/api/orders", json=payload)
    assert r.status_code == 422


# --- GET /api/admin/orders ---

def test_admin_orders_requires_auth(api):
    r = requests.get(f"{BASE_URL}/api/admin/orders")
    assert r.status_code in (401, 403)


def test_admin_orders_list_desc(api, auth_headers):
    r = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    # Check desc order by created_at
    for i in range(len(data) - 1):
        assert data[i]["created_at"] >= data[i + 1]["created_at"]
    # Our TEST order present
    ids = [o["id"] for o in data]
    assert pytest.order_id in ids


# --- PATCH /api/admin/orders/{id} ---

def test_patch_order_status_contacted(api, auth_headers):
    r = api.patch(
        f"{BASE_URL}/api/admin/orders/{pytest.order_id}",
        json={"status": "contacted"},
        headers=auth_headers,
    )
    assert r.status_code == 200, r.text
    # Verify persistence via GET
    r2 = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers)
    found = next(o for o in r2.json() if o["id"] == pytest.order_id)
    assert found["status"] == "contacted"


def test_patch_order_status_completed(api, auth_headers):
    r = api.patch(
        f"{BASE_URL}/api/admin/orders/{pytest.order_id}",
        json={"status": "completed"},
        headers=auth_headers,
    )
    assert r.status_code == 200


def test_patch_order_invalid_status(api, auth_headers):
    r = api.patch(
        f"{BASE_URL}/api/admin/orders/{pytest.order_id}",
        json={"status": "invalid_status"},
        headers=auth_headers,
    )
    assert r.status_code == 400


def test_patch_order_missing_id(api, auth_headers):
    r = api.patch(
        f"{BASE_URL}/api/admin/orders/does-not-exist-xyz",
        json={"status": "pending"},
        headers=auth_headers,
    )
    assert r.status_code == 404


def test_patch_order_unauthorized(api):
    r = requests.patch(
        f"{BASE_URL}/api/admin/orders/{pytest.order_id}",
        json={"status": "pending"},
    )
    assert r.status_code in (401, 403)
