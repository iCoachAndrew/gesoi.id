"""
Skrip Bantu Upload Foto & Konten Migrasi ke Hostinger via API Admin CMS
----------------------------------------------------------------------
Gunakan skrip ini jika Anda lebih suka mengunggah 29 foto dari gesoi.id langsung
lewat terminal (tanpa perlu membuka File Manager dan phpMyAdmin).

Cara pakai:
  python hostinger/upload_migrasi_admin.py
"""

import getpass
import json
import sys
from pathlib import Path
import requests

MEDIA_DIR = Path(__file__).resolve().parent / "migrated_uploads"
MANIFEST = MEDIA_DIR / "manifest.json"
DEFAULT_TARGET = "https://darkseagreen-hare-699313.hostingersite.com"


def rewrite_urls(obj, url_map: dict[str, str]):
    if isinstance(obj, dict):
        return {k: rewrite_urls(v, url_map) for k, v in obj.items()}
    if isinstance(obj, list):
        return [rewrite_urls(v, url_map) for v in obj]
    if isinstance(obj, str):
        return url_map.get(obj, obj)
    return obj


def main() -> None:
    if not MANIFEST.is_file():
        print(f"ERROR: Manifest tidak ditemukan di {MANIFEST}", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    files_list = manifest["files"]
    content_obj = manifest["content"]

    target = input(f"URL website Hostinger [{DEFAULT_TARGET}]: ").strip() or DEFAULT_TARGET
    target = target.rstrip("/")
    email = input("Email Admin CMS (/admin/login): ").strip()
    password = getpass.getpass("Password Admin CMS: ")

    session = requests.Session()
    print(f"\nLogin ke {target}/api/auth/login ...")
    login_resp = session.post(
        f"{target}/api/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    if login_resp.status_code != 200:
        print(f"Login gagal (HTTP {login_resp.status_code}): {login_resp.text}", file=sys.stderr)
        sys.exit(1)

    token = login_resp.json().get("access_token", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    url_map: dict[str, str] = {}
    total = len(files_list)
    print(f"\nMengunggah {total} foto ke {target}/api/admin/upload ...")

    for idx, item in enumerate(files_list, 1):
        local_file = MEDIA_DIR / item["filename"]
        if not local_file.is_file():
            print(f"  [{idx}/{total}] File tidak ada: {local_file}", file=sys.stderr)
            sys.exit(1)

        old_rel_url = f"/api/files/{item['storage_path']}"
        with local_file.open("rb") as fh:
            resp = session.post(
                f"{target}/api/admin/upload",
                headers=headers,
                files={"file": (item["original_filename"], fh, item["content_type"])},
                timeout=120,
            )
        if resp.status_code != 200:
            print(
                f"  [{idx}/{total}] Gagal upload {item['original_filename']} "
                f"(HTTP {resp.status_code}): {resp.text}",
                file=sys.stderr,
            )
            sys.exit(1)

        new_url = resp.json()["url"]
        url_map[old_rel_url] = new_url
        print(f"  [{idx}/{total}] OK: {item['original_filename']} -> {new_url}")

    updated_content = rewrite_urls(content_obj, url_map)
    print(f"\nMenyimpan konten CMS ke {target}/api/admin/content ...")
    put_resp = session.put(
        f"{target}/api/admin/content",
        headers=headers,
        json=updated_content,
        timeout=60,
    )
    if put_resp.status_code != 200:
        print(f"Gagal update konten (HTTP {put_resp.status_code}): {put_resp.text}", file=sys.stderr)
        sys.exit(1)

    print("\nSelesai! Semua 29 foto dan konten CMS dari gesoi.id sudah aktif di website baru.")


if __name__ == "__main__":
    main()
