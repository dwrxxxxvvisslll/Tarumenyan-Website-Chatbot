#!/usr/bin/env python3
"""
Quick verification script to check latest rows in Supabase and CSV.

Usage examples:
  python scripts/verify_supabase_and_csv.py --limit 3
  python scripts/verify_supabase_and_csv.py --cid supabase-enabled-test-2

Env required:
  SUPABASE_URL
  SUPABASE_ANON_KEY (preferred) or SUPABASE_SERVICE_KEY/SUPABASE_KEY
Optional:
  SUPABASE_TABLE (default: data_riset_prewedding)
"""

import os
import sys
import json
import argparse
import requests
import pandas as pd


def verify_supabase(table: str, cid: str | None, limit: int) -> None:
    url = os.environ.get("SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_ANON_KEY")
        or os.environ.get("SUPABASE_SERVICE_KEY")
        or os.environ.get("SUPABASE_KEY")
    )

    if not url or not key:
        print("ERROR: set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY).")
        return

    endpoint = f"{url.rstrip('/')}/rest/v1/{table}?select=*&order=created_at.desc&limit={limit}"
    if cid:
        endpoint += f"&conversation_id=eq.{cid}"

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }

    try:
        r = requests.get(endpoint, headers=headers, timeout=15)
        r.raise_for_status()
        rows = r.json()
        print("Supabase rows:")
        print(json.dumps(rows, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"Supabase query error: {e}")


def verify_csv(csv_path: str, limit: int) -> None:
    try:
        if not os.path.exists(csv_path):
            print(f"CSV not found: {csv_path}")
            return
        df = pd.read_csv(csv_path)
        tail_df = df.tail(limit)
        # Replace NaN with empty string for nicer printing
        tail_dicts = tail_df.fillna("").to_dict(orient="records")
        print("\nCSV last rows:")
        print(json.dumps(tail_dicts, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"CSV read error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Verify latest rows in Supabase and CSV")
    parser.add_argument("--cid", "--conversation-id", dest="cid", default=None,
                        help="Filter by conversation_id (optional)")
    parser.add_argument("--limit", dest="limit", type=int, default=3,
                        help="Number of latest rows to fetch (default: 3)")
    parser.add_argument("--table", dest="table", default=os.environ.get("SUPABASE_TABLE", "data_riset_prewedding"),
                        help="Supabase table name (default: data_riset_prewedding)")
    parser.add_argument("--csv", dest="csv_path", default="data_riset_prewedding.csv",
                        help="Path to local CSV (default: data_riset_prewedding.csv)")

    args = parser.parse_args()

    verify_supabase(args.table, args.cid, args.limit)
    verify_csv(args.csv_path, args.limit)


if __name__ == "__main__":
    main()

