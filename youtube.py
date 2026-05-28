import csv
import os
import time
from yt_dlp import YoutubeDL

INPUT = "songs.txt"
OUTPUT = "youtube_results.csv"

# 既存CSVから完了済み曲を読み込む
done = set()

if os.path.exists(OUTPUT):
    with open(OUTPUT, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            done.add(row["song"])

# 曲一覧読み込み
with open(INPUT, encoding="utf-8") as f:
    songs = [x.strip() for x in f if x.strip()]

print(f"曲数: {len(songs)}")

ydl_opts = {
    "quiet": True,
    "extract_flat": True,
    "no_warnings": True,
}

with YoutubeDL(ydl_opts) as ydl:

    for i, song in enumerate(songs, 1):

        if song in done:
            continue

        print(f"[{i}/{len(songs)}] {song}")

        try:
            info = ydl.extract_info(
                f"ytsearch1:{song} audio",
                download=False
            )

            entry = info["entries"][0]

            row = {
                "song": song,
                "youtube_title": entry.get("title"),
                "url": f"https://youtube.com/watch?v={entry['id']}"
            }

        except Exception as e:

            print("ERROR:", song)
            print(e)

            row = {
                "song": song,
                "youtube_title": "",
                "url": ""
            }

        file_exists = os.path.exists(OUTPUT)

        with open(
            OUTPUT,
            "a",
            newline="",
            encoding="utf-8-sig"
        ) as f:

            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "song",
                    "youtube_title",
                    "url"
                ]
            )

            if not file_exists:
                writer.writeheader()

            writer.writerow(row)

        time.sleep(0.2)

print("完了")
