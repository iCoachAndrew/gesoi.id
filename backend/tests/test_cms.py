"""Tests for CMS content API + upload (iteration 3)."""
import struct
import zlib

import requests

from conftest import BASE_URL


def _tiny_png_bytes() -> bytes:
    # 1x1 red PNG
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t: bytes, d: bytes) -> bytes:
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    raw = b"\x00" + bytes([255, 0, 0])
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


class TestContentAPI:
    def test_put_requires_auth(self) -> None:
        r = requests.put(f"{BASE_URL}/api/admin/content", json={"foo": "bar"}, timeout=10)
        assert r.status_code == 401

    def test_delete_requires_auth(self) -> None:
        r = requests.delete(f"{BASE_URL}/api/admin/content", timeout=10)
        assert r.status_code == 401

    def test_get_public(self) -> None:
        r = requests.get(f"{BASE_URL}/api/content", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_put_then_get_then_reset(self, auth_headers: dict[str, str]) -> None:
        payload = {"id": {"hero": {"badge": "TEST_CMS_BADGE_XYZ"}}}
        r = requests.put(f"{BASE_URL}/api/admin/content", json=payload, headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

        r2 = requests.get(f"{BASE_URL}/api/content", timeout=10)
        assert r2.status_code == 200
        data = r2.json()
        assert data.get("id", {}).get("hero", {}).get("badge") == "TEST_CMS_BADGE_XYZ"

        r3 = requests.delete(f"{BASE_URL}/api/admin/content", headers=auth_headers, timeout=10)
        assert r3.status_code == 200
        assert r3.json() == {"ok": True}

        r4 = requests.get(f"{BASE_URL}/api/content", timeout=10)
        assert r4.status_code == 200
        assert r4.json() == {}


class TestUpload:
    def test_upload_requires_auth(self) -> None:
        files = {"file": ("t.png", _tiny_png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, timeout=15)
        assert r.status_code == 401

    def test_upload_rejects_txt(self, auth_headers: dict[str, str]) -> None:
        files = {"file": ("t.txt", b"hello", "text/plain")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=15)
        assert r.status_code == 400

    def test_upload_png_and_serve(self, auth_headers: dict[str, str]) -> None:
        png = _tiny_png_bytes()
        files = {"file": ("test.png", png, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "url" in j and j["url"].startswith("/api/files/gesoi/uploads/")
        assert "path" in j

        # Serve public
        r2 = requests.get(f"{BASE_URL}{j['url']}", timeout=30)
        assert r2.status_code == 200
        # Content should look like PNG
        assert r2.content[:8] == b"\x89PNG\r\n\x1a\n"
