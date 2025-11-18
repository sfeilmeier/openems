#!/usr/bin/env python3

from enum import Enum
import utils
import sys


class Theme(str, Enum):
    feneconbeta = "io.fenecon.ui"
    fenecon = "de.fenecon.fems"
    heckert = "com.heckertsolar.ems"

    @classmethod
    def from_key(cls, value: str) -> "Theme":
        try:
            return cls[value]
        except ValueError:
            raise ValueError(
                f"Invalid theme: '{value}'. Must be one of {[t.value for t in cls]}"
            )


def upload_aab(package_name, aab_file, service_account_file):
    access_token = utils.create_access_token(service_account_file)
    edit_id = utils.create_edit_id(package_name, access_token)
    utils.upload_bundle(edit_id, package_name, access_token, aab_file)
    utils.commit_changes(edit_id, package_name, access_token)


def update_track_production(track, package_name, service_account_file, release_name):
    access_token = utils.create_access_token(service_account_file)
    edit_id = utils.create_edit_id(package_name, access_token)
    latest_version_code = utils.get_latest_version_code_from_uploaded_bundles(
        edit_id, package_name, access_token
    )
    print("new version: ", release_name)
    utils.update_track(
        edit_id, package_name, access_token, release_name, track, latest_version_code
    )
    utils.commit_changes(edit_id, package_name, access_token)


def get_branch_name():
    if len(sys.argv) < 3:
        raise Exception("Service account file or version not provided")
    return sys.argv[4]


def get_woodpecker_secret():
    if len(sys.argv) < 3:
        raise Exception("Service account file or version not provided")
    return sys.argv[3]


def get_version():
    if len(sys.argv) < 3:
        raise Exception("Service account file or version not provided")
    return sys.argv[2]


def get_theme():
    if len(sys.argv) < 1:
        raise Exception("Service account file, theme or version not provided")
    return sys.argv[1]


def get_package_name(theme):
    return Theme.from_key(theme).value


def create_full_release(
    service_account_file, version, package_name, aab_file_name, branch_name
):
    """creates a new release

    - Uploads a new .aab file
    - Uses aab version code for new release
    - Updates track production

    """
    _track = "production"
    aab_file = utils.download_bundle(aab_file_name, branch_name)

    upload_aab(package_name, aab_file, service_account_file)
    update_track_production(_track, package_name, service_account_file, version)


def create_release_without_bundle(service_account_file, package_name):
    """updates the release track, also updates a current releases details

    - Uses previous uploaded aab version code for new release
    - Updates track production

    """
    _track = "production"
    update_track_production(_track, package_name, service_account_file)


if __name__ == "__main__":
    theme = get_theme()
    service_account_file = get_woodpecker_secret()
    version = get_version()
    branch_name = get_branch_name()
    package_name = get_package_name(theme)
    create_full_release(service_account_file, version, package_name, theme, branch_name)
