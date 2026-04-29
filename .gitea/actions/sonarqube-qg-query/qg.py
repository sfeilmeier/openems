import os
import sys
import requests

host = os.environ.get("INPUT_SONAR_HOST_URL")
token = os.environ.get("INPUT_SONAR_TOKEN")
projects = os.environ.get("INPUT_PROJECT_KEYS").strip().split(",")
pr_number = os.environ.get("PR_NUMBER")

output_file = os.environ.get("GITHUB_OUTPUT")

results = {}
overall = "OK"

headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/json",
}

def get_icon(status):
    if status == "OK":
        return "✅"
    elif status == "ERROR":
        return "❌"
    elif status == "N/A":
        return "⬜"
    else:
        return "⚠️"
    
def get_link(project, pr_number, status):
    if status == "N/A":
        return ""
    return f"[Details]({host}/dashboard?id={project}&codeScope=overall&pullRequest={pr_number})"

for project in projects:
    request_url = f"{host}/api/qualitygates/project_status"
    r = requests.get(
        request_url,
        params={
            "projectKey": project.strip(),
            "pullRequest": pr_number
        },
        headers=headers,
        timeout=20,
    )
    if r.status_code == 404:
        print(f"[url={request_url}] PR #{pr_number} not found for '{project}'.", file=sys.stderr)
        results[project] = "N/A"
        continue
    r.raise_for_status()
    try:
        status = r.json()["projectStatus"]["status"]
        results[project] = status
        print(f"Quality gate status for project '{project}': {status}")
        if status != "OK":
            overall = "ERROR"
    except (Exception) as e:
        print(f"[url={request_url}] Error parsing response for project '{project}': {e}", file=sys.stderr)
        results[project] = "ERROR"
        overall = "ERROR"

# Markdown erzeugen
lines = [
    "## SonarQube Quality Gates",
    "",
    "| Projekt | Status | Link |",
    "|---------|--------|------|",
]

for project, status in results.items():
    icon = get_icon(status)
    link = get_link(project.strip(), pr_number, status)
    lines.append(f"| {project.strip()} | {icon} {status} | {link} |")

comment = "\n".join(lines)

# Outputs setzen
with open(output_file, "a") as f:
    f.write(f"overall_status={overall}\n")
    f.write("comment_body<<EOF\n")
    f.write(comment)
    f.write("\nEOF\n")

print(f"overall_status={overall}")
print("comment_body<<EOF")
print(comment)
print("EOF")
