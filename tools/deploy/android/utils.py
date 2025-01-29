from google.oauth2 import service_account
import google.auth.transport.requests
import requests
import sys

ANDROID_PUBLISHER_API_URL = "https://androidpublisher.googleapis.com"


def create_access_token(service_account_file):
    # service account
    SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]

    # Load credentials from the JSON file
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file, scopes=SCOPES
    )

    # Refresh the token to get a fresh access token
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)

    # Access token
    access_token = credentials.token
    return access_token


def create_edit_id(package_name, access_token):
    # API-URL
    url = f"{ANDROID_PUBLISHER_API_URL}/androidpublisher/v3/applications/{package_name}/edits"

    # Header und Daten
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers)

    if response.status_code == 200:
        return response.json()["id"]
    else:
        print("Fehler:", response.status_code, response.text, response)
        raise Exception("Error response:", response.text)


def download_bundle(aab_file_name):
    url = f"https://dev.intranet.fenecon.de/develop/{aab_file_name}.aab"
    query_parameters = {"downloadformat": "aab"}
    response = requests.get(url, params=query_parameters)

    if response.status_code != 200:
        print(f"Failed to retrieve bundle: {response.status_code}")
        raise Exception("Error response:", response.text)

    return response


def get_available_tracks(editId, packageName, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    # API-URL
    url = f"{ANDROID_PUBLISHER_API_URL}/upload/androidpublisher/v3/applications/{packageName}/edits/{editId}/tracks"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()["id"]
    else:
        print("Fehler:", response.status_code, response.text, response)
        raise Exception("Error response:", response.text)


def upload_bundle(editId, packageName, access_token, aab_file):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/octet-stream",
    }
    # API-URL
    url = f"{ANDROID_PUBLISHER_API_URL}/upload/androidpublisher/v3/applications/{packageName}/edits/{editId}/bundles"
    response = requests.post(url, headers=headers, data=aab_file)

    if response.status_code == 200:
        print("Bundle uploaded successfully!")
    else:
        print(f"Failed to upload bundle: {response.status_code}")
        raise Exception("Error response:", response.text)


def get_latest_version_code_from_uploaded_bundles(editId, packageName, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/octet-stream",
    }
    url = f"{ANDROID_PUBLISHER_API_URL}/androidpublisher/v3/applications/{packageName}/edits/{editId}/bundles"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()["bundles"][-1]["versionCode"]
    else:
        print("Error response:", response.text)
        raise Exception("Error response:", response.text)


def commit_changes(edit_id, package_name, access_token):
    url = f"{ANDROID_PUBLISHER_API_URL}/androidpublisher/v3/applications/{package_name}/edits/{edit_id}:commit"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers)

    if response.status_code == 200:
        print("Committing changes successfull")
        return response.json()["id"]
    else:
        print("Fehler:", response.status_code, response.text, response)
        raise Exception("Error response:", response.text)


def update_track(
    edit_id, package_name, access_token, release_name, track, latest_version_code
):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    release = {
        "track": track,
        "releases": [
            {
                "name": release_name,
                "versionCodes": [latest_version_code],
                "status": "completed",  # Options: 'completed', 'draft', etc.
                "releaseNotes": [
                    #     {
                    #     'language': 'de-DE',
                    #     'text': 'Release notes for the new version2.'
                    # },{
                    #     'language': 'en-US',
                    #     'text': 'Release notes for the new version.'
                    # }
                ],
            }
        ],
    }

    url = f"{ANDROID_PUBLISHER_API_URL}/androidpublisher/v3/applications/{package_name}/edits/{edit_id}/tracks/{track}"

    response = requests.put(url, headers=headers, json=release)

    if response.status_code == 200:
        print(f"Updating track {track} successfull")
    else:
        print(response.status_code)
        raise Exception("Error response:", response.text)


def get_version_name(version_code):
    version_str = str(version_code)
    first_part = version_str[:8]
    year = first_part[:4]
    month = first_part[4:6]
    version = first_part[6:8]
    sub_version = version_str[8:10]

    if month.startswith("0"):
        month = month[1:]
    if version.startswith("0"):
        version = version[1:]
    if sub_version.startswith("0"):
        if sub_version.endswith("0"):
            sub_version = None
        else:
            sub_version = sub_version[1:]

    if sub_version == None:
        return f"{year}.{month}.{version}"

    return f"{year}.{month}.{version}.{sub_version}"
