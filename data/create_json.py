import typer
import json
import csv
import time
import sys

# aws logs tail /aws/lambda/FuelFinder --since 3h | grep '{"id"' | cut -f 3- -d ' ' | python data/create_json.py update-stats fuelfinder/public/stations.json


TIME_THRESHOLD = 3 * 3600
SMALL_TIME_THRESHOLD = 1800


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
                    str(SMALL_TIME_THRESHOLD): {
                        "queue": 0,
                        "diesel": {"yes": 0, "no": 0},
                        "petrol": {"yes": 0, "no": 0},
                    },
                    str(TIME_THRESHOLD): {
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
    station_map = {}
    ts = int(time.time())
    for station in data:
        stats = {
            str(SMALL_TIME_THRESHOLD): {
                "queue": 0,
                "diesel": {"yes": 0, "no": 0},
                "petrol": {"yes": 0, "no": 0},
            },
            str(TIME_THRESHOLD): {
                "queue": 0,
                "diesel": {"yes": 0, "no": 0},
                "petrol": {"yes": 0, "no": 0},
            },
        }

        station["stats"] = stats
        station_map[station["id"]] = station
    count = 0
    for line in sys.stdin:
        count += 1
        row = json.loads(line)
        id = row["id"]
        event_ts = row["ts"]
        station = station_map[id]
        if station["last_update"] < event_ts:
            station["last_update"] = event_ts
        if "addr" in row and row["addr"]:
            station["addr"] = row["addr"]
        for fuel_type in ["diesel", "petrol"]:
            if fuel_type in row:
                if row[fuel_type]:
                    value = "yes"
                else:
                    value = "no"
                station["stats"][str(TIME_THRESHOLD)][fuel_type][value] += 1
                if ts - event_ts < SMALL_TIME_THRESHOLD:
                    station["stats"][str(SMALL_TIME_THRESHOLD)][fuel_type][value] += 1
    data.sort(key=lambda d: d["id"])
    out = {"last_update": ts, "station_data": data}
    with open(json_file_name, "w") as f:
        json.dump(out, f, indent=4)
    print(f"Updated with {count} metrics")


if __name__ == "__main__":
    app()
