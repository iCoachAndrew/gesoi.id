"""
Skrip Migrasi Data MongoDB -> MySQL (.sql dump) untuk Hostinger Web Hosting
---------------------------------------------------------------------------
Cara pakai:
  PowerShell:
    $env:MONGO_URL = "mongodb+srv://USER:PASS@HOST/?..."
    $env:DB_NAME = "social-impact-web-2"
    python hostinger/migrate_mongo_to_mysql.py

Hasil:
  - hostinger/gesoi_data_dump.sql (siap di-import di phpMyAdmin Hostinger setelah schema.sql)
"""

import json
import os
from datetime import datetime
from pathlib import Path
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "").strip()
DB_NAME = os.environ.get("DB_NAME", "social-impact-web-2").strip() or "social-impact-web-2"

OUT_SQL = Path(__file__).resolve().parent / "gesoi_data_dump.sql"


def sql_val(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, datetime):
        v = v.isoformat()
    s = str(v)
    s = (
        s.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\r", "\\r")
        .replace("\n", "\\n")
        .replace("\x00", "")
    )
    return f"'{s}'"


def main() -> None:
    if not MONGO_URL:
        raise SystemExit(
            "ERROR: Environment variable MONGO_URL belum diisi.\n"
            "Contoh (PowerShell): $env:MONGO_URL='mongodb+srv://USER:PASS@HOST/?...'; "
            "python hostinger/migrate_mongo_to_mysql.py"
        )
    print(f"Menghubungkan ke MongoDB (DB: {DB_NAME})...")
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=15000)
    db = client[DB_NAME]

    lines = [
        "-- Dump Data MongoDB GESOI untuk MySQL / MariaDB (Hostinger)",
        "SET NAMES utf8mb4;",
        "SET time_zone = '+00:00';",
        "",
    ]

    # 1. users
    users = list(db.users.find({}, {"_id": 0}))
    if users:
        lines.append("-- Data: users")
        for u in users:
            lines.append(
                "INSERT INTO `users` (`email`, `password_hash`, `name`, `role`, `created_at`) VALUES ("
                f"{sql_val(u.get('email'))}, {sql_val(u.get('password_hash'))}, "
                f"{sql_val(u.get('name', 'Admin GESOI'))}, {sql_val(u.get('role', 'admin'))}, "
                f"{sql_val(u.get('created_at', ''))}"
                ") ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `name` = VALUES(`name`);"
            )
        lines.append("")

    # 2. contacts
    contacts = list(db.contacts.find({}, {"_id": 0}))
    if contacts:
        lines.append("-- Data: contacts")
        for c in contacts:
            lines.append(
                "INSERT IGNORE INTO `contacts` (`id`, `name`, `email`, `organization`, `interest`, `message`, `created_at`) VALUES ("
                f"{sql_val(c.get('id'))}, {sql_val(c.get('name'))}, {sql_val(c.get('email'))}, "
                f"{sql_val(c.get('organization'))}, {sql_val(c.get('interest'))}, "
                f"{sql_val(c.get('message'))}, {sql_val(c.get('created_at', ''))});"
            )
        lines.append("")

    # 3. orders
    orders = list(db.orders.find({}, {"_id": 0}))
    if orders:
        lines.append("-- Data: orders")
        for o in orders:
            lines.append(
                "INSERT IGNORE INTO `orders` (`id`, `publication_title`, `price`, `name`, `email`, `phone`, `organization`, `status`, `created_at`) VALUES ("
                f"{sql_val(o.get('id'))}, {sql_val(o.get('publication_title'))}, {sql_val(o.get('price'))}, "
                f"{sql_val(o.get('name'))}, {sql_val(o.get('email'))}, {sql_val(o.get('phone'))}, "
                f"{sql_val(o.get('organization'))}, {sql_val(o.get('status', 'pending'))}, "
                f"{sql_val(o.get('created_at', ''))});"
            )
        lines.append("")

    # 4. site_content
    content_doc = db.site_content.find_one({"_id": "content"})
    if content_doc:
        content_doc.pop("_id", None)
        raw_json = json.dumps(content_doc, ensure_ascii=False)
        # Ubah URL domain preview lama menjadi path relatif /api/files/
        raw_json = raw_json.replace(
            "https://social-impact-web-2.preview.emergentagent.com/api/files/",
            "/api/files/",
        )
        lines.append("-- Data: site_content")
        lines.append(
            "INSERT INTO `site_content` (`id`, `data`, `updated_at`) VALUES ("
            f"'content', {sql_val(raw_json)}, {sql_val(datetime.utcnow().isoformat() + 'Z')}"
            ") ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = VALUES(`updated_at`);"
        )
        lines.append("")

    # 5. files
    files = list(db.files.find({}, {"_id": 0}))
    if files:
        lines.append("-- Data: files")
        for f in files:
            lines.append(
                "INSERT IGNORE INTO `files` (`id`, `storage_path`, `original_filename`, `content_type`, `size`, `is_deleted`, `created_at`) VALUES ("
                f"{sql_val(f.get('id'))}, {sql_val(f.get('storage_path'))}, "
                f"{sql_val(f.get('original_filename'))}, {sql_val(f.get('content_type'))}, "
                f"{sql_val(int(f.get('size', 0)))}, {sql_val(bool(f.get('is_deleted', False)))}, "
                f"{sql_val(f.get('created_at', ''))});"
            )
        lines.append("")

    # 6. analytics
    analytics = list(db.analytics.find({}, {"_id": 0}))
    if analytics:
        lines.append("-- Data: analytics")
        for a in analytics:
            lines.append(
                "INSERT IGNORE INTO `analytics` (`id`, `type`, `name`, `visitor_id`, `lang`, `device`, `referrer`, `date`, `created_at`) VALUES ("
                f"{sql_val(a.get('id'))}, {sql_val(a.get('type'))}, {sql_val(a.get('name'))}, "
                f"{sql_val(a.get('visitor_id'))}, {sql_val(a.get('lang'))}, {sql_val(a.get('device'))}, "
                f"{sql_val(a.get('referrer'))}, {sql_val(a.get('date'))}, {sql_val(a.get('created_at', ''))});"
            )
        lines.append("")

    OUT_SQL.write_text("\n".join(lines), encoding="utf-8")
    print(f"Berhasil membuat dump SQL: {OUT_SQL}")


if __name__ == "__main__":
    main()
