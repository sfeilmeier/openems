import os
import sys
import requests

url = os.environ["GITEA_SERVER_URL"].rstrip("/")
repo = os.environ["GITEA_REPOSITORY"]

token = os.environ["INPUT_GITEA_TOKEN"]
pr = os.environ["INPUT_PR_NUMBER"]
body = os.environ["INPUT_BODY"]
marker = os.environ["INPUT_MARKER"]

if not body:
    print("No comment body provided, skipping comment creation.")
    sys.exit(1)

headers = {
    "Authorization": f"token {token}",
    "Content-Type": "application/json",
}

base_url = f"{url}/api/v1/repos/{repo}/issues"
comments_url = f"{base_url}/{pr}/comments"
comments = requests.get(comments_url, headers=headers).json()

comment_id = None
if not isinstance(comments, list):
    print(f"[url={comments_url}] Error fetching comments: {comments}", file=sys.stderr)
    raise Exception("Failed to fetch comments")

for c in comments:
    if not isinstance(c, dict):
        print(f"[url={comments_url}] Invalid comment format: {c}", file=sys.stderr)
        continue
    if marker in c["body"]:
        comment_id = c["id"]
        break

payload = {"body": f"<!-- {marker} -->\n{body}"}

print(f"Comment ID: {comment_id}")
print(f"Payload: {payload}")
print(f"Comments URL: {comments_url}")

if comment_id:
    requests.delete(
        f"{base_url}/comments/{comment_id}",
        headers=headers,
    )

requests.post(
    comments_url,
    headers=headers,
    json=payload,
).raise_for_status()