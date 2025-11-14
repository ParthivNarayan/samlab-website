# save as: make_alumni_json.py
import pandas as pd
import json
from pathlib import Path

INPUT = r"G:\parthiv\samlab_web\former_students.xlsx"   # <-- put your Excel filename here
OUTDIR = Path("data")            # we’ll keep JSON in /data/
OUTDIR.mkdir(exist_ok=True)
OUTPUT = OUTDIR / "alumni.json"

# Read first sheet
df = pd.read_excel(INPUT)

# Map columns (handles small variations)
def pick(df, names):
    for n in names:
        if n in df.columns: return df[n]
    return None

name   = pick(df, ["Name"])
typ    = pick(df, ["Type (PhD/Mtech/MS)", "Type (PhD/MTech/MS)", "Type"])
year   = pick(df, ["Awarded-Year","Awarded Year","Year"])
nextmv = pick(df, ["Next Move from IIT-Kgp","Next Move from IIT Kgp","Next Move"])
curr   = pick(df, ["Current Position & Organisation","Current Position and Organisation","Current Position"])

# Build minimal records and clean text
records = []
for i in range(len(df)):
    rec = {
        "name":   ("" if name   is None else str(name.iloc[i]).strip()),
        "type":   ("" if typ    is None else str(typ.iloc[i]).strip()),
        "year":   ("" if year   is None else str(year.iloc[i]).strip()),
        "next":   ("" if nextmv is None else str(nextmv.iloc[i]).strip()),
        "current":("" if curr   is None else str(curr.iloc[i]).strip())
    }
    # skip empty rows
    if rec["name"]:
        records.append(rec)

# Optional: normalize type labels
for r in records:
    t = r["type"].lower()
    if "phd" in t: r["type"] = "PhD"
    elif "mtech" in t or "mtech" in t.replace("t","T"): r["type"] = "MTech"
    elif t == "ms" or "ms" in t: r["type"] = "MS"

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump({"alumni": records}, f, ensure_ascii=False, indent=2)

print(f"✅ Wrote {OUTPUT.resolve()} with {len(records)} records")
