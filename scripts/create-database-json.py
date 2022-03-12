#!/usr/bin/python3

# install http://www.pogo.org.uk/~mark/bpm-tools/ for bpm detection
# sudo pip install eyed3  

# TODO make bpm detect and keyfinder optional

# TODO read music directory from .env file(s) and add environment argument


import logging
from shutil import copyfile
import subprocess
import time
import json
import sys
import re
import os
import select
from subprocess import Popen, PIPE, DEVNULL, STDOUT
from pathlib import Path
import eyed3

# include trailing slash!
musicDir = "/MUSIC/aca2/testaca/"
targetJson = "00-acajam.json"
pathSearchReplace = [
    "/MUSIC/aca2/testaca/",
    "./testaca/"
]
'''
musicDir = "/MUSIC/aca2/"
targetJson = "00-acajam.json"
pathSearchReplace = [
    "/MUSIC/aca2/",
    "./aca2/"
]
'''

# http://www.pogo.org.uk/~mark/bpm-tools/
# /usr/bin/bpm-tag -f -n MUSICFILE 2>&1 | grep --color=never " BPM" | awk '{print $(NF-1)}'
def detectBpm(filePath):
    p1 = Popen(["/usr/bin/bpm-tag", "-f", "-n", filePath], stdout=PIPE, stderr=PIPE)
    for line in p1.communicate():
        match = re.findall('\ ([0-9.]{1,})\ BPM$', line.decode("utf-8").strip())
        if match:
            return match[0]
    return "0"


# https://github.com/evanpurkhiser/keyfinder-cli
# /usr/local/bin/keyfinder-cli MUSICFILE
def detectKey(filePath):
    p1 = Popen(["/usr/local/bin/keyfinder-cli", filePath], stdout=PIPE, stderr=PIPE)
    return  p1.communicate()[0].decode("utf-8").strip()




def writeTextFile(fileNameToWrite, fileContent):
    with open(fileNameToWrite, "w") as myfile:
        myfile.write(fileContent)

def collectAllMusicFiles(startDirectory):
    allFiles = sorted(Path(startDirectory).rglob('*.*'))
    musicFiles = []
    for foundFile in allFiles:
        if foundFile.suffix.lower() in ['.wav', '.flac', '.mp3', '.mp4', '.ogg', '.oga']:
            musicFiles += [ foundFile ]
            continue
    return musicFiles

def main():
    files = collectAllMusicFiles(musicDir)
    jsonObject = []
    #print(files)
    fileCount = 0
    print("found music files", len(files))
    for file in files:
        path = str(file)
        audiofile = eyed3.load(file)
        if audiofile == None:
            continue
            print("ERROR:", file)
            continue
        artist = Path(file).stem
        title = Path(file).stem
        album = ""
        year = 0
        length = 0
        size = 0
        if len(pathSearchReplace) == 2:
            path = path.replace(pathSearchReplace[0], pathSearchReplace[1])
        if audiofile.tag != None:
            artist = audiofile.tag.artist if audiofile.tag.artist != "" else artist
            title = audiofile.tag.title if audiofile.tag.title != "" else title
            album = audiofile.tag.album
            tmpYear = audiofile.tag.getBestDate()
            if tmpYear != None:
                year = int(tmpYear.year)
        if audiofile.info != None:
            length = float("{:.3f}".format(audiofile.info.time_secs))

        try:
            size = int(os.path.getsize(file))
        except os.error:
            size = 0

        jsonObject.append({
            "path": path,
            "artist": artist,
            "title": title,
            #"album": album,
            "year": year,
            "length": length,
            "size": size,
            "bpmdetect": float(detectBpm(file)),
            "bpm": 0,
            "key": str(detectKey(file)),
            "downbeat": None,
            "hotcues": []


        })

        fileCount += 1
        #if fileCount > 3:
        #    break


    writeTextFile(f'{musicDir}{targetJson}', json.dumps(jsonObject, indent=2))


if __name__ == "__main__":
    main()
