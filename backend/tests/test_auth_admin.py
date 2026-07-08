"""Auth + admin endpoint tests for GESOI"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://social-impact-web-2.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@gesoi.or.id"
ADMIN_PASSWORD = "GesoiAdmin#2045"


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


# --- /api/auth/login ---

def test_login_success_returns_token_and_cookie(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert "access_token" in data and len(data["access_token"]) > 20
    assert "name" in data
    # httpOnly cookie set
    cookies_hdr = r.headers.get("set-cookie", "")
    assert "access_token=" in cookies_hdr.lower() or "access_token" in api.cookies
    assert "httponly" in cookies_hdr.lower()


def test_login_wrong_password_401(api):
    # Use fake email to avoid lockout on real admin
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPass!123"})
    assert r.status_code == 401


def test_login_lockout_after_5_attempts(api):
    fake = "lockout-test@example.com"
    codes = []
    for _ in range(5):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": fake, "password": "bad"})
        codes.append(r.status_code)
    # 6th attempt should be 429
    r6 = api.post(f"{BASE_URL}/api/auth/login", json={"email": fake, "password": "bad"})
    assert r6.status_code == 429, f"Expected 429 lockout, got {r6.status_code}: {r6.text}. Prev codes: {codes}"


# --- /api/auth/me ---

def test_me_requires_auth(api):
    r = api.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_me_with_bearer_token(api, admin_token):
    r = api.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    d = r.json()
    assert d["email"] == ADMIN_EMAIL


# --- /api/admin/contacts ---

def test_admin_contacts_requires_auth(api):
    r = api.get(f"{BASE_URL}/api/admin/contacts")
    assert r.status_code == 401


def test_admin_contacts_with_token(api, admin_token):
    r = api.get(f"{BASE_URL}/api/admin/contacts", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --- /api/contact protected GET ---

def test_get_contact_requires_auth(api):
    r = api.get(f"{BASE_URL}/api/contact")
    assert r.status_code == 401


def test_get_contact_with_token(api, admin_token):
    r = api.get(f"{BASE_URL}/api/contact", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --- Public POST /api/contact still open + regression via admin list ---

def test_post_contact_public_and_visible_in_admin(api, admin_token):
    payload = {
        "name": "TEST_AdminSeen",
        "email": f"test_seen_{int(time.time())}@example.com",
        "interest": "partner",
        "organization": "TEST_Org",
        "message": "regression"
    }
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    created_id = r.json()["id"]
    r2 = api.get(f"{BASE_URL}/api/admin/contacts", headers={"Authorization": f"Bearer {admin_token}"})
    assert r2.status_code == 200
    assert any(it["id"] == created_id for it in r2.json())


# --- Logout ---

def test_logout(api):
    r = api.post(f"{BASE_URL}/api/auth/logout")
    assert r.status_code == 200
