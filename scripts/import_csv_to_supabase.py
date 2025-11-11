import os
import sys
import json
from datetime import datetime
import pandas as pd
import requests

CSV_PATH_DEFAULT = "/Users/dwraputra/Code/ChatbotV2/data_riset_prewedding.csv"


def to_bool(v):
    if pd.isna(v):
        return None
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    if s in {"true", "ya", "yes", "1"}:
        return True
    if s in {"false", "tidak", "no", "0"}:
        return False
    return None


def to_ts(s):
    if pd.isna(s):
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M:%S"):
        try:
            return datetime.strptime(str(s), fmt).isoformat()
        except Exception:
            pass
    try:
        # ISO passthrough
        return datetime.fromisoformat(str(s)).isoformat()
    except Exception:
        return None


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else CSV_PATH_DEFAULT
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
    table = os.environ.get("SUPABASE_TABLE", "data_riset_prewedding")

    if not url or not key:
        print("ERROR: set SUPABASE_URL and SUPABASE_SERVICE_KEY env variables.")
        sys.exit(1)

    endpoint = f"{url.rstrip('/')}/rest/v1/{table}?on_conflict=conversation_id,timestamp"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    df = pd.read_csv(csv_path)

    # Drop rows that accidentally contain header names duplicated in data
    if "timestamp" in df.columns and df["timestamp"].astype(str).str.lower().eq("timestamp").any():
        df = df[df["timestamp"].astype(str).str.lower() != "timestamp"]

    # Normalize/ensure columns exist
    expected = [
        "timestamp",
        "nama_pasangan",
        "kisah_cinta",
        "latar_belakang",
        "tahu_legenda_sebelumnya",
        "rekomendasi_tema",
        "kepuasan",
        "budget",
        "conversation_id",
    ]
    for col in expected:
        if col not in df.columns:
            df[col] = None
    # Filter out empty rows without essential identifiers
    df = df[~df["conversation_id"].astype(str).str.strip().eq("")]
    df = df[df["conversation_id"].notna()]
    df = df[~df["timestamp"].astype(str).str.strip().eq("")]
    df = df[df["timestamp"].notna()]

    payload = []
    for _, r in df.iterrows():
        item = {
            "timestamp": to_ts(r["timestamp"]),
            "nama_pasangan": None if pd.isna(r["nama_pasangan"]) else str(r["nama_pasangan"]).strip(),
            "kisah_cinta": None if pd.isna(r["kisah_cinta"]) else str(r["kisah_cinta"]).strip(),
            "latar_belakang": None if pd.isna(r["latar_belakang"]) else str(r["latar_belakang"]).strip(),
            "tahu_legenda_sebelumnya": to_bool(r["tahu_legenda_sebelumnya"]),
            "rekomendasi_tema": None if pd.isna(r["rekomendasi_tema"]) else str(r["rekomendasi_tema"]).strip(),
            "kepuasan": None if pd.isna(r["kepuasan"]) else float(str(r["kepuasan"]).replace(",", ".")) if str(r["kepuasan"]).strip() else None,
            "budget": None if pd.isna(r["budget"]) else str(r["budget"]).strip(),
            "conversation_id": None if pd.isna(r["conversation_id"]) else str(r["conversation_id"]).strip(),
        }
        payload.append(item)

    resp = requests.post(endpoint, headers=headers, data=json.dumps(payload))
    if resp.status_code >= 200 and resp.status_code < 300:
        print(f"Uploaded {len(payload)} rows to {table}.")
    else:
        print("Upload failed.")
        print(resp.status_code, resp.text)
        sys.exit(1)


if __name__ == "__main__":
    main()
