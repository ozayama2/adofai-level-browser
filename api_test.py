import requests
import json

url = "https://api.adofai.gg/forum/v1/levels/search"

payload = {
    "skip": 0,
    "take": 5,
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

response = requests.post(url, json=payload)

print(response.status_code)

data = response.json()

print(json.dumps(data, indent=2, ensure_ascii=False))
