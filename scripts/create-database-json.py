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

import argparse



# include trailing slash!
targetJson = "00-acajam.json"
mergePropsJson = "00-trackprops.json"
musicDir = "/MUSIC/aca2/testaca/"
pathSearchReplace = [
    "/MUSIC/aca2/testaca/",
    "./testaca/"
]
'''
musicDir = "/MUSIC/aca2/"
pathSearchReplace = [
    "/MUSIC/aca2/",
    "./aca2/"
]
'''


mergeProps = {}


parser = argparse.ArgumentParser()
parser.add_argument('action', type=str, choices=['scan', 'merge'])
res = parser.parse_args()

def main():
    if res.action == 'scan':
        mergeProps = getPropsToMerge()
        print('scanning files')

    if res.action == 'merge':
        mergeProps = getPropsToMerge()
        # read json database instead of scanning files
        dbJson = getDbJson()
        enrichedDb = []
        print('merging properties')
        for entry in dbJson:
            if not entry['path'] in mergeProps:
                #print(f'no entry for path {entry["path"]}')
                enrichedDb.append(entry)
                continue

            #print('found props to merge')
            #print(mergeProps[entry['path']])
            for propName in mergeProps[entry['path']]:
                entry[propName] = mergeProps[entry['path']][propName]
            
            enrichedDb.append(entry)

        writeTextFile(f'{musicDir}{targetJson}', json.dumps(enrichedDb, indent=2))
        print('done')


def getPropsToMerge():
    propsToMerge = {}
    try:
        with open(f'{musicDir}{mergePropsJson}') as json_file:
            bla = json.load(json_file)
            for track in bla:
                propsToMerge[track.pop('path', None)] = track
    except FileNotFoundError:
        print(f'file {musicDir}{mergePropsJson} does not exist')
    except json.decoder.JSONDecodeError:
        print(f'file {musicDir}{mergePropsJson} is not a valid json')
    return propsToMerge


def getDbJson():
    dbJson = {}
    try:
        with open(f'{musicDir}{targetJson}') as json_file:
            dbJson = json.load(json_file)
    except FileNotFoundError:
        print(f'file {musicDir}{targetJson} does not exist')
    except json.decoder.JSONDecodeError:
        print(f'file {musicDir}{targetJson} is not a valid json')
    return dbJson

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

def createDatabaseJson():
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
