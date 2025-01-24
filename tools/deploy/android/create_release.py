#!/usr/bin/env python3

import utils
import sys


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


def get_woodpecker_secret():
    if len(sys.argv) < 3:
        raise Exception("Service account file or version not provided")
    return sys.argv[2]


def get_version():
    if len(sys.argv) < 3:
        raise Exception("Service account file or version not provided")
    return sys.argv[1]


def create_full_release(service_account_file, version, package_name, aab_file_name):
    """creates a new release

    - Uploads a new .aab file
    - Uses aab version code for new release
    - Updates track production

    """
    _track = "production"
    aab_file = utils.download_bundle(aab_file_name)

    upload_aab(package_name, aab_file, service_account_file)
    update_track_production(_track, package_name, service_account_file, version)


def create_release_without_bundle(service_account_file, package_name):
    """updates the release track, also updates a current releases details

    - Uses aab version code for new release
    - Updates track production

    """
    _track = "production"
    update_track_production(_track, package_name, service_account_file)


if __name__ == "__main__":
    service_account_file = get_woodpecker_secret()
    version = get_version()
    create_full_release(service_account_file, version, "io.fenecon.ui", "feneconbeta")
