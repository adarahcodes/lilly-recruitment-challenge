from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uvicorn
import json
import re
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / 'data.json'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_db() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        return {"medicines": []}
    try:
        with DATA_FILE.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        # If the file is corrupted or unreadable, return an empty shape
        return {"medicines": []}


def write_db(data: Dict[str, Any]) -> None:
    try:
        with DATA_FILE.open('w', encoding='utf-8') as fh:
            json.dump(data, fh, indent=4)
    except OSError:
        # Best-effort write; callers will not crash but data may not persist
        pass


def compute_average_from_db(db: Dict[str, Any]):
    """Compute average price from DB dict.

    - Accepts ints/floats directly.
    - Accepts numeric strings like "12.50", "$12.50", "12.50 USD" by stripping non-number characters.
    - Ignores None and non-numeric values such as "N/A".
    """
    prices = []
    for med in db.get('medicines', []):
        p = med.get('price')
        if p is None:
            continue
        if isinstance(p, (int, float)):
            prices.append(float(p))
            continue
        if isinstance(p, str):
            # Remove anything that's not digit, dot or minus (handles $ and text)
            s = re.sub(r"[^0-9.\-]", "", p)
            if not s:
                continue
            try:
                prices.append(float(s))
            except ValueError:
                continue

    if not prices:
        return {"average": None, "count": 0}

    avg = round(sum(prices) / len(prices), 2)
    return {"average": avg, "count": len(prices)}


@app.get('/medicines')
def get_all_meds():
    return read_db()


@app.get('/medicines/{name}')
def get_single_med(name: str):
    db = read_db()
    for med in db.get('medicines', []):
        if med.get('name') == name:
            return med
    return {"error": "Medicine not found"}


@app.post('/create')
def create_med(name: str = Form(...), price: float = Form(...)):
    db = read_db()
    db.setdefault('medicines', []).append({"name": name, "price": price})
    write_db(db)
    avg = compute_average_from_db(db)
    return {"message": f"Medicine created successfully with name: {name}", "average": avg["average"], "count": avg["count"]}


@app.post('/update')
def update_med(name: str = Form(...), price: float = Form(...)):
    db = read_db()
    for med in db.get('medicines', []):
        if med.get('name') == name:
            med['price'] = price
            write_db(db)
            avg = compute_average_from_db(db)
            return {"message": f"Medicine updated successfully with name: {name}", "average": avg["average"], "count": avg["count"]}
    return {"error": "Medicine not found"}


@app.delete('/delete')
def delete_med(name: str = Form(...)):
    db = read_db()
    meds = db.get('medicines', [])
    for med in list(meds):
        if med.get('name') == name:
            meds.remove(med)
            write_db(db)
            avg = compute_average_from_db(db)
            return {"message": f"Medicine deleted successfully with name: {name}", "average": avg["average"], "count": avg["count"]}
    return {"error": "Medicine not found"}


@app.get('/medicines/average')
def average_price():
    """Return average across non-null, numeric prices.

    Rules:
    - Accept ints/floats directly.
    - Accept numeric strings (e.g. "12.50", "$12.50").
    - Ignore null (JSON null -> Python None) and any non-numeric values such as "N/A".
    """
    db = read_db()
    return compute_average_from_db(db)


if __name__ == '__main__':
    # Run the app directly using the `app` object. Using the import-string
    # (e.g. 'backend.main:app') requires the package to be importable from
    # the current working directory. Running `uvicorn` with the `app` object
    # avoids ModuleNotFoundError when the script is executed from inside the
    # `backend/` folder (e.g. `python main.py`).
    uvicorn.run(app, host='0.0.0.0', port=8000)
