import pytest

from conftest import BASE_URL


@pytest.fixture(scope="module")
def created_contact(api):
    payload = {
        "name": "TEST_User",
        "email": "test_user@example.com",
        "organization": "TEST_Org",
        "interest": "partner",
        "message": "hello from pytest",
    }
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    return payload, r.json()


def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("message") == "GESOI API"


def test_create_contact_returns_fields(created_contact):
    payload, data = created_contact
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["organization"] == payload["organization"]
    assert data["interest"] == payload["interest"]


def test_create_contact_has_id_and_timestamp(created_contact):
    _, data = created_contact
    assert len(data.get("id", "")) > 0
    assert "created_at" in data


def test_created_contact_visible_to_admin(api, created_contact, auth_headers):
    _, data = created_contact
    r = api.get(f"{BASE_URL}/api/contact", headers=auth_headers)
    assert r.status_code == 200
    assert any(it["id"] == data["id"] for it in r.json())


def test_create_contact_minimal(api):
    payload = {"name": "TEST_Min", "email": "min@example.com", "interest": "volunteer"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert (d["organization"], d["message"]) == (None, None)


def test_invalid_email_returns_422(api):
    payload = {"name": "TEST_X", "email": "not-an-email", "interest": "partner"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 422


def test_missing_required_field(api):
    payload = {"email": "a@b.com", "interest": "partner"}
    r = api.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 422


def test_list_contacts(api, auth_headers):
    r = api.get(f"{BASE_URL}/api/contact", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
