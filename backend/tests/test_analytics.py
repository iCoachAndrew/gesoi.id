"""Backend tests for internal visitor analytics: POST /api/track + GET /api/admin/analytics."""
import os
import uuid
from datetime import datetime, timezone

import pytest
import requests

from conftest import BASE_URL

# Unique per-run prefix to identify docs we insert (for optional cleanup)
RUN_TAG = f"pytest-{uuid.uuid4().hex[:8]}"


def _vid(suffix: str) -> str:
    return f"{RUN_TAG}-{suffix}"


# ---------- POST /api/track (public) ----------

class TestTrackPublic:
    def test_pageview_ok(self, api):
        r = api.post(f"{BASE_URL}/api/track", json={
            "type": "pageview", "visitor_id": _vid("v1"), "lang": "id",
            "device": "desktop", "referrer": "direct",
        })
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    def test_event_ok(self, api):
        r = api.post(f"{BASE_URL}/api/track", json={
            "type": "event", "name": "join_click", "visitor_id": _vid("v1"),
            "lang": "id", "device": "desktop",
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_invalid_type_rejected(self, api):
        r = api.post(f"{BASE_URL}/api/track", json={
            "type": "click", "visitor_id": _vid("bad"),
        })
        assert r.status_code == 400

    def test_missing_visitor_id_422(self, api):
        r = api.post(f"{BASE_URL}/api/track", json={"type": "pageview"})
        assert r.status_code == 422

    def test_no_auth_required(self, api):
        # public endpoint — no auth header sent
        r = api.post(f"{BASE_URL}/api/track", json={
            "type": "pageview", "visitor_id": _vid("public"),
        })
        assert r.status_code == 200


# ---------- GET /api/admin/analytics (protected + aggregation) ----------

class TestAdminAnalytics:
    def test_requires_auth(self, api):
        # ensure no leftover Authorization header on the session
        r = requests.get(f"{BASE_URL}/api/admin/analytics")
        assert r.status_code == 401

    def test_days_clamp_high(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/analytics?days=500", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["days"] == 90
        assert len(data["daily"]) == 90

    def test_days_clamp_zero(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/analytics?days=0", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["days"] == 1
        assert len(data["daily"]) == 1

    def test_default_days_shape(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/analytics", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        # Shape checks
        for k in ("days", "totals", "daily", "devices", "langs", "referrers", "events"):
            assert k in d
        assert "views" in d["totals"] and "uniques" in d["totals"]
        assert len(d["daily"]) == d["days"]

    def test_aggregation_after_seeded_tracks(self, api, auth_headers):
        # Seed: 3 unique visitors, mixed devices/langs, events + pageviews with referrers.
        seeds = [
            {"type": "pageview", "visitor_id": _vid("a"), "lang": "id", "device": "mobile",  "referrer": "instagram.com"},
            {"type": "pageview", "visitor_id": _vid("a"), "lang": "id", "device": "mobile",  "referrer": "instagram.com"},  # dup visitor -> uniques unchanged
            {"type": "pageview", "visitor_id": _vid("b"), "lang": "en", "device": "desktop", "referrer": "direct"},
            {"type": "pageview", "visitor_id": _vid("c"), "lang": "id", "device": "desktop", "referrer": "instagram.com"},
            {"type": "event", "name": "join_click",  "visitor_id": _vid("a"), "lang": "id", "device": "mobile"},
            {"type": "event", "name": "join_click",  "visitor_id": _vid("b"), "lang": "en", "device": "desktop"},
            {"type": "event", "name": "form_submit", "visitor_id": _vid("a"), "lang": "id", "device": "mobile"},
            {"type": "event", "name": "buy_click",   "visitor_id": _vid("c"), "lang": "id", "device": "desktop"},
        ]

        # baseline
        base = api.get(f"{BASE_URL}/api/admin/analytics?days=1", headers=auth_headers).json()
        base_views = base["totals"]["views"]
        base_devices = base["devices"]
        base_langs = base["langs"]
        base_events = base["events"]
        base_refs = {r["source"]: r["count"] for r in base["referrers"]}

        for s in seeds:
            rr = api.post(f"{BASE_URL}/api/track", json=s)
            assert rr.status_code == 200

        after = api.get(f"{BASE_URL}/api/admin/analytics?days=1", headers=auth_headers).json()

        # 4 pageview inserts
        assert after["totals"]["views"] - base_views == 4
        # Uniques increases by 3 new visitor_ids (a,b,c) — but only if they weren't present in today's baseline
        # We rely on unique RUN_TAG so these visitor_ids are guaranteed brand-new.
        assert after["totals"]["uniques"] - base["totals"]["uniques"] == 3

        # devices delta: mobile +2, desktop +2 (only pageviews count in devices per implementation)
        assert (after["devices"].get("mobile", 0) - base_devices.get("mobile", 0)) == 2
        assert (after["devices"].get("desktop", 0) - base_devices.get("desktop", 0)) == 2

        # langs include events (per implementation match ignores type) — id: 3 pv + 3 events = 6, en: 1 pv + 1 event = 2
        assert (after["langs"].get("id", 0) - base_langs.get("id", 0)) == 6
        assert (after["langs"].get("en", 0) - base_langs.get("en", 0)) == 2

        # referrers only counted for pageviews with non-null referrer
        after_refs = {r["source"]: r["count"] for r in after["referrers"]}
        assert (after_refs.get("instagram.com", 0) - base_refs.get("instagram.com", 0)) == 3
        assert (after_refs.get("direct", 0) - base_refs.get("direct", 0)) == 1

        # events
        assert (after["events"].get("join_click", 0) - base_events.get("join_click", 0)) == 2
        assert (after["events"].get("form_submit", 0) - base_events.get("form_submit", 0)) == 1
        assert (after["events"].get("buy_click", 0) - base_events.get("buy_click", 0)) == 1


@pytest.fixture(scope="module", autouse=True)
def _cleanup():
    """Best-effort cleanup of analytics docs created by this test run."""
    yield
    try:
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ.get("MONGO_URL")
        db_name = os.environ.get("DB_NAME")
        if not (mongo_url and db_name):
            return
        async def _wipe():
            cli = AsyncIOMotorClient(mongo_url)
            await cli[db_name].analytics.delete_many({"visitor_id": {"$regex": f"^{RUN_TAG}"}})
            cli.close()
        asyncio.run(_wipe())
    except Exception:
        pass
