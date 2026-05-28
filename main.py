import yt_dlp
import csv
import time

# =====================
# 曲一覧読み込み
# =====================

with open(
    "songs.txt",
    "r",
    encoding="utf-8"
) as f:

    songs = [
        line.strip()
        for line in f
        if line.strip()
    ]

print("曲数:", len(songs))
# =====================
# 曲名フィルタ
# =====================

filtered_songs = []

blocked = [
    "Easy",
    "Hard",
    "Normal",
    "Discord",
    "Login",
]

for song in songs:

    # 2文字以下除外
    if len(song) <= 2:
        continue

    # 数字だけ除外
    if song.isdigit():
        continue

    # UI文字除外
    if song in blocked:
        continue

    filtered_songs.append(song)

songs = filtered_songs

print("フィルタ後曲数:", len(songs))

# =====================
# YouTube検索
# =====================

results = []

ydl_opts = {
    "quiet": True,
    "extract_flat": True
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:

    for i, song in enumerate(songs):

        try:

            print(f"[{i+1}/{len(songs)}] {song}")

            info = ydl.extract_info(
                f"ytsearch1:{song} audio",
                download=False
            )

            entries = info.get("entries", [])

            if entries:

                video = entries[0]

                title = video["title"]

                url = (
                    "https://www.youtube.com/watch?v="
                    + video["id"]
                )

            else:

                title = ""

                url = ""

            results.append([
                song,
                title,
                url
            ])

            # 負荷軽減
            time.sleep(1)

        except Exception as e:

            print("ERROR:", song)

            results.append([
                song,
                "",
                ""
            ])

# =====================
# CSV保存
# =====================

with open(
    "youtube_results.csv",
    "w",
    newline="",
    encoding="utf-8-sig"
) as f:

    writer = csv.writer(f)

    writer.writerow([
        "Song",
        "YouTubeTitle",
        "YouTubeURL"
    ])

    writer.writerows(results)

print("保存完了")
