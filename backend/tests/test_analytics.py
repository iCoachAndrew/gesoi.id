"""Backend tests for internal visitor analytics: POST /api/track + GET /api/admin/analytics.

All tests live in ONE class so xdist loadscope pins them to a single worker —
the aggregation delta tests snapshot shared state and must not interleave with
other tests that insert analytics docs.
"""
import os
import uuid

import pytest
import requests

from conftest import BASE_URL

# Unique per-run prefix to identify docs we insert (for cleanup)
RUN_TAG = f"pytest-{uuid.uuid4().hex[:8]}"


def _vid(suffix: str) -> str:
    return f"{RUN_TAG}-{suffix}"


def _dd(base: dict, after: dict, key: str) -> int:
    return after.get(key, 0) - base.get(key, 0)


def _ref_map(snapshot: dict) -> dict:
    return {r["source"]: r["count"] for r in snapshot["referrers"]}


SEEDS = [
    {"type": "pageview", "visitor_id": _vid("a"), "lang": "id", "device": "mobile", "referrer": "instagram.com"},
    {"type": "pageview", "visitor_id": _vid("a"), "lang": "id", "device": "mobile", "referrer": "instagram.com"},
    {"type": "pageview", "visitor_id": _vid("b"), "lang": "en", "device": "desktop", "referrer": "direct"},
    {"type": "pageview", "visitor_id": _vid("c"), "lang": "id", "device": "desktop", "referrer": "instagram.com"},
    {"type": "event", "name": "join_click", "visitor_id": _vid("a"), "lang": "id", "device": "mobile"},
    {"type": "event", "name": "join_click", "visitor_id": _vid("b"), "lang": "en", "device": "desktop"},
    {"type": "event", "name": "form_submit", "visitor_id": _vid("a"), "lang": "id", "device": "mobile"},
    {"type": "event", "name": "buy_click", "visitor_id": _vid("c"), "lang": "id", "device": "desktop"},
]


@pytest.fixture(scope="class")
def agg(api, auth_headers):
    """Snapshot analytics, seed tracked docs (3 new visitors), snapshot again."""
    def snap():
        return api.get(f"{BASE_URL}/api/admin/analytics?days=1", headers=auth_headers).json()

    base = snap()
    for s in SEEDS:
        r = api.post(f"{BASE_URL}/api/track", json=s)
        assert r.status_code == 200
    return base, snap()


class TestAnalytics:
    # ---------- POST /api/track (public) ----------

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
        assert r.json() == {"ok": True}

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

    # ---------- GET /api/admin/analytics (protected + shape) ----------

    def test_requires_auth(self):
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
        for k in ("days", "totals", "daily", "devices", "langs", "referrers", "events"):
            assert k in d
        assert "views" in d["totals"] and "uniques" in d["totals"]
        assert len(d["daily"]) == d["days"]

    # ---------- Aggregation deltas after seeded tracks ----------

    def test_views_delta(self, agg):
        base, after = agg
        assert after["totals"]["views"] - base["totals"]["views"] == 4

    def test_uniques_delta(self, agg):
        # RUN_TAG guarantees the 3 seeded visitor_ids are brand-new today
        base, after = agg
        assert after["totals"]["uniques"] - base["totals"]["uniques"] == 3

    def test_devices_delta_pageviews_only(self, agg):
        base, after = agg
        assert _dd(base["devices"], after["devices"], "mobile") == 2
        assert _dd(base["devices"], after["devices"], "desktop") == 2

    def test_langs_delta_includes_events(self, agg):
        # langs match ignores type by design: id = 3 pv + 3 events, en = 1 pv + 1 event
        base, after = agg
        assert _dd(base["langs"], after["langs"], "id") == 6
        assert _dd(base["langs"], after["langs"], "en") == 2

    def test_referrers_delta_pageviews_only(self, agg):
        base, after = agg
        assert _dd(_ref_map(base), _ref_map(after), "instagram.com") == 3
        assert _dd(_ref_map(base), _ref_map(after), "direct") == 1

    def test_events_delta(self, agg):
        base, after = agg
        assert _dd(base["events"], after["events"], "join_click") == 2
        assert _dd(base["events"], after["events"], "form_submit") == 1
        assert _dd(base["events"], after["events"], "buy_click") == 1


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
