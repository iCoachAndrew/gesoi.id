import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://social-impact-web-2.preview.emergentagent.com').rstrip('/')


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("message") == "GESOI API"


def test_create_contact_and_persist(api):
    payload = {
        "name": "TEST_User",
        "email": "test_user@example.com",
        "organization": "TEST_Org",
        "interest": "partner",
        "message": "hello from pytest"
    }
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["organization"] == payload["organization"]
    assert data["interest"] == payload["interest"]
    assert "id" in data and len(data["id"]) > 0
    assert "created_at" in data
    created_id = data["id"]

    # Verify via GET
    r2 = api.get(f"{BASE_URL}/api/contact")
    assert r2.status_code == 200
    items = r2.json()
    assert any(it["id"] == created_id for it in items)


def test_create_contact_minimal(api):
    payload = {"name": "TEST_Min", "email": "min@example.com", "interest": "volunteer"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["organization"] is None
    assert d["message"] is None


def test_invalid_email_returns_422(api):
    payload = {"name": "TEST_X", "email": "not-an-email", "interest": "partner"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 422


def test_missing_required_field(api):
    payload = {"email": "a@b.com", "interest": "partner"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 422


def test_list_contacts(api):
    r = api.get(f"{BASE_URL}/api/contact")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
