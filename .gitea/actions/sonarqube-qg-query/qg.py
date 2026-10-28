import os
import sys
import requests

from enum import Enum

host = os.environ.get("INPUT_SONAR_HOST_URL")
token = os.environ.get("INPUT_SONAR_TOKEN")
projects = os.environ.get("INPUT_PROJECT_KEYS").strip().split(",")
pr_number = os.environ.get("PR_NUMBER")

output_file = os.environ.get("GITEA_OUTPUT")

class Status(Enum):
    OK = "OK"
    ERROR = "ERROR"
    NA = "N/A"

class ConditionType(Enum):
    COVERAGE = "new_coverage"
    DUPLICATIONS = "new_duplicated_lines_density"
    NEW_ISSUES = "new_violations"

class Condition:
    type: ConditionType
    ok: bool
    value: str

    def __init__(self, type, ok, value):
        self.type = type
        self.ok = ok
        self.value = value

class Result:
    duplications: Condition | None
    issues: Condition | None
    coverage: Condition | None
    status: Status
    link: str

    def __init__(self, status, link=""):
        self.status = status
        self.link = link
        self.duplications = None
        self.issues = None
        self.coverage = None

    def set_duplications(self, duplications):
        self.duplications = duplications

    def set_issues(self, issues):
        self.issues = issues

    def set_coverage(self, coverage):
        self.coverage = coverage

results = {}
overall = Status.OK

headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/json",
}

def get_icon(status):
    if status == Status.OK:
        return "✅"
    elif status == Status.ERROR:
        return "❌"
    elif status == Status.NA:
        return "⬜"
    else:
        return "⚠️"
    
def get_link(project, pr_number, status):
    if status == Status.NA:
        return ""
    return f"{host}/dashboard?id={project}&codeScope=overall&pullRequest={pr_number}"

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
        results[project] = Result(Status.NA)
        continue
    r.raise_for_status()
    try:
        projectStatus = r.json().get("projectStatus", {})
        status = Status(projectStatus.get("status", "N/A"))
        results[project] = Result(status)
        print(f"Quality gate status for project '{project}': {status}")
        if status != Status.OK:
            overall = Status.ERROR
        
        conditions: list[dict] = projectStatus.get("conditions", [])
        print(f"Conditions for project '{project}': {conditions}")
        for condition in conditions:
            condition_type = ConditionType(condition.get("metricKey", ""))
            ok = condition.get("status", "") == "OK"
            value = condition.get("actualValue", "")
            match condition_type:
                case ConditionType.COVERAGE:
                    print(f"  - Coverage: {value} (OK: {ok})")
                    results[project].set_coverage(Condition(ConditionType.COVERAGE, ok, value))
                case ConditionType.DUPLICATIONS:
                    print(f"  - Duplications: {value} (OK: {ok})")
                    results[project].set_duplications(Condition(ConditionType.DUPLICATIONS, ok, value))
                case ConditionType.NEW_ISSUES:
                    print(f"  - New Issues: {value} (OK: {ok})")
                    results[project].set_issues(Condition(ConditionType.NEW_ISSUES, ok, value))

    except (Exception) as e:
        print(f"[url={request_url}] Error parsing response for project '{project}': {e}", file=sys.stderr)
        results[project] = Result(Status.ERROR)
        overall = Status.ERROR

def value_formatter_percentage(value: str) -> str:
    try:
        return f"{float(value):.2f}\\%"
    except ValueError:
        return value + "\\%"

def get_condition_printable(condition: Condition | None, value_formatter: callable = lambda x: x) -> str:
    if not condition:
        return "-"
    if condition.ok:
        return "$${" + value_formatter(condition.value) + "}$$"
    else:
        return "$${\\color{red}" + value_formatter(condition.value) + "}$$"

lines = [
    "## SonarQube Quality Gates",
    "",
    "| Project | Coverage | Duplications | New Issues | Status |",
    "|---------|----------|--------------|------------|--------|",
]

for project, status in results.items():
    if status.status != Status.NA:
        icon = get_icon(status.status)
        link = get_link(project.strip(), pr_number, status.status)
        coverage_value =    get_condition_printable(status.coverage, value_formatter_percentage)
        duplications_value = get_condition_printable(status.duplications, value_formatter_percentage)
        issues_value = get_condition_printable(status.issues)

        lines.append(f"| [{project.strip()}]({link}) | {coverage_value} | {duplications_value} | {issues_value} | {icon} |")

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
