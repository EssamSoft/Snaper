from datetime import datetime
from time import sleep
import time
import json
import sys
import os

from bs4 import BeautifulSoup
import requests

def user_input():
    """Check for username argument Otherwise get it from user input"""
    try:
        username = sys.argv[1]
    except Exception:
        username = input("Enter a username: ")

    return username

def create_folder_path(username):
    current_date = datetime.now().strftime("%Y-%m-%d")
    folder_path = os.path.join(username, current_date)

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    return folder_path

YELLOW = "\033[1;32;40m"
RED = "\033[31m"

headers = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/103.0.2'}

base_url = "https://story.snapchat.com/@"

def get_json(username):
    mix = base_url + username
    r = requests.get(mix, headers=headers)

    if r.ok:
        pass
    else:
        sys.exit(f"{RED} Oh Snap! No connection with Snap!")

    soup = BeautifulSoup(r.content, "html.parser")
    snaps = soup.find(id="__NEXT_DATA__").string.strip()
    data = json.loads(snaps)

    return data

def profile_metadata(username):
    json_dict = get_json(username)

    try:
        bitmoji = json_dict["props"]["pageProps"]["userProfile"]["publicProfileInfo"]["snapcodeImageUrl"]
        bio = json_dict["props"]["pageProps"]["userProfile"]["publicProfileInfo"]["bio"]
    except KeyError:
        bitmoji = json_dict["props"]["pageProps"]["userProfile"]["userInfo"]["snapcodeImageUrl"]
        bio = json_dict["props"]["pageProps"]["userProfile"]["userInfo"]["displayName"]

        print(f"{YELLOW}Here is the Bio: \n {bio}\n")
        print(f"Bitmoji:\n {bitmoji}\n")
        print(f"{RED} This user is private.")
        sys.exit(1)

    print(f"{YELLOW}\nBio of the user:\n", bio)
    print(f"\nHere is the Bitmoji:\n {bitmoji} \n")
    print(f"Getting posts of: {username}\n")

def download_media(username):
    json_dict = get_json(username)

    try:
        snap_index = 0
        for i in json_dict["props"]["pageProps"]["story"]["snapList"]:
            snap_index = snap_index + 1
            file_url = i["snapUrls"]["mediaUrl"]

            if file_url == "":
                print("There is a Story but no URL is provided by Snapchat.")
                continue

            r = requests.get(file_url, stream=True, headers=headers)

            if "image" in r.headers['Content-Type']:
                file_name = str(snap_index) + ".jpeg"
                print(file_name)
            elif "video" in r.headers['Content-Type']:
                file_name = str(snap_index) + ".mp4"
                print(file_name)

            if os.path.isfile(file_name):
                continue

            sleep(0.3)

            if r.status_code == 200:
                with open(file_name, 'wb') as f:
                    for chunk in r:
                        f.write(chunk)
            else:
                print("Cannot make connection to download media!")

    except KeyError:
        print(f"{RED}No user stories found for the last 24h.")
    else:
        print("\nAt least one Story found. Successfully Downloaded.")

def main():
    username = user_input()
    folder_path = create_folder_path(username)
    os.chdir(folder_path)

    start = time.perf_counter()

    profile_metadata(username)
    download_media(username)

    end = time.perf_counter()
    total = end - start

    print(f"\n\nTotal time: {total}")

if __name__ == "__main__":
    main()
