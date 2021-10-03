import typer
import json
import csv
import time
import sys

# aws logs tail /aws/lambda/FuelFinder --since 2h | grep '{"id"' | cut -f 3- -d ' ' | python data/create_json.py update-stats fuelfinder/public/stations.json


def get_name(d):
    return ", ".join(
        list(
            set(
                filter(
                    lambda s: s and len(s) > 0,
                    map(lambda s: s.strip(), [d["name"], d["brand"], d["operator"]]),
                )
            )
        )
    )


app = typer.Typer()


@app.command()
def create_dict(file_name):
    out = []
    ts = int(time.time())
    with open(file_name) as csvfile:
        reader = csv.DictReader(csvfile, delimiter="\t")
        for r in reader:
            row = {
                "id": r["id"],
                "coords": [float(r["lon"]), float(r["lat"])],
                "name": get_name(r),
                "last_update": ts - 7000,
                "phone": r["phone"],
                "addr": r["addr"],
                "stats": {
                    "1800": {
                        "queue": 0,
                        "diesel": {"yes": 0, "no": 0},
                        "petrol": {"yes": 0, "no": 0},
                    },
                    "7200": {
                        "queue": 0,
                        "diesel": {"yes": 0, "no": 0},
                        "petrol": {"yes": 0, "no": 0},
                    },
                },
            }
            out.append(row)
    print(json.dumps({"last_update": ts, "station_data": out}, indent=4))


@app.command()
def update_stats(json_file_name: str, backup: bool = False):
    with open(json_file_name) as f:
        obj = json.load(f)
        data = obj["station_data"]
    if backup:
        bkp_file_name = json_file_name + ".bkp"
        print(f"Creating backup in {bkp_file_name}")
        with open(bkp_file_name, "w") as f:
            json.dump(obj, f)
    stats_map = {}
    lu_map = {}
    ts = int(time.time())
    for station in data:
        stats = {
            "1800": {
                "queue": 0,
                "diesel": {"yes": 0, "no": 0},
                "petrol": {"yes": 0, "no": 0},
            },
            "7200": {
                "queue": 0,
                "diesel": {"yes": 0, "no": 0},
                "petrol": {"yes": 0, "no": 0},
            },
        }

        stats_map[station["id"]] = stats
        station["stats"] = stats
        lu_map[station["id"]] = station["last_update"]
    count = 0
    for line in sys.stdin:
        count += 1
        row = json.loads(line)
        id = row["id"]
        event_ts = row["ts"]
        if lu_map[id] < event_ts:
            lu_map[id] = event_ts
        for fuel_type in ["diesel", "petrol"]:
            if fuel_type in row:
                if row[fuel_type]:
                    value = "yes"
                else:
                    value = "no"
                stats_map[id]["7200"][fuel_type][value] += 1
                if ts - event_ts < 1800:
                    stats_map[id]["1800"][fuel_type][value] += 1
    data.sort(key=lambda d: d["id"])
    for station in data:
        station["last_update"] = lu_map[station["id"]]
    out = {"last_update": ts, "station_data": data}
    with open(json_file_name, "w") as f:
        json.dump(out, f, indent=4)
    print(f"Updated with {count} metrics")


if __name__ == "__main__":
    app()
