import requests
import csv
import time

URL = "https://api.adofai.gg/forum/v1/levels/search"

OUTPUT = "adofai_levels.csv"

all_levels = []

skip = 0
take = 50

while True:

    print(f"取得中: skip={skip}")

    payload = {
        "skip": skip,
        "take": take,
        "query": {
            "filter": None,
            "sort": [
                {
                    "objective": "difficulty",
                    "direction": "asc"
                }
            ]
        }
    }

    response = requests.post(URL, json=payload)

    data = response.json()

    levels = data["results"]

    if not levels:
        break

    for level in levels:

        artists = []

        if level.get("music"):
            for artist in level["music"].get("artists", []):
                artists.append(artist.get("displayName", ""))

        creators = []

        for creator in level.get("creators", []):
            creators.append(creator.get("displayName", ""))

        row = {
    "title": level.get("title", ""),

    "artist": ", ".join(artists),

    "difficulty": level.get("difficulty", ""),

    "youtube_url": level.get("videoUrl", ""),

    "workshop_url": level.get("workshopUrl", ""),

    "download_url": level.get("downloadUrl", ""),

    "tile_count": level.get("tiles", ""),

    "creator": ", ".join(creators),

    "tags": ", ".join(
        tag.get("name", "")
        for tag in level.get("tags", [])
    )
}

        all_levels.append(row)

    skip += take

    time.sleep(0.2)

print(f"総数: {len(all_levels)}")

with open(
    OUTPUT,
    "w",
    newline="",
    encoding="utf-8-sig"
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=[
    "title",
    "artist",
    "difficulty",
    "youtube_url",
    "workshop_url",
    "download_url",
    "tile_count",
    "creator",
    "tags"
]
    )

    writer.writeheader()
    writer.writerows(all_levels)

print("CSV保存完了")
