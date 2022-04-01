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
import hashlib
import sys
import re
import os
import select
import glob
from subprocess import Popen, PIPE, DEVNULL, STDOUT
from pathlib import Path
import eyed3

import argparse



# include trailing slash!
targetJson = "instrupella-db.json"
mergePropsJson = "trackprops*.json"
musicDir = "/MUSIC/aca2/testaca/"
pathSearchReplace = [
    "/MUSIC/aca2/testaca/",
    "./testaca/"
]

musicDir = "/MUSIC/aca2/"
pathSearchReplace = [
    "/MUSIC/aca2/",
    "./aca2/"
]



mergeProps = {}


parser = argparse.ArgumentParser()
parser.add_argument('action', type=str, choices=['scan', 'merge'])
res = parser.parse_args()

instrupellaDir = Path(f'{musicDir}/instrupella')
peakfilesDir = Path(f'{musicDir}/instrupella/peakfiles')

def main():
    ensureExistingDirectory(instrupellaDir)
    ensureExistingDirectory(peakfilesDir)
    print(instrupellaDir)

    if res.action == 'scan':
        mergeProps = getPropsToMerge()
        print('scanning files')
        createDatabaseJson()

    if res.action == 'merge':
        mergeProps = getPropsToMerge()
        # read json database instead of scanning files
        dbJson = getDbJson()
        enrichedDb = []
        print('merging properties')
        for entry in dbJson:
            if not entry['path'] in mergeProps:
                enrichedDb.append(entry)
                continue
            for propName in mergeProps[entry['path']]:
                entry[propName] = mergeProps[entry['path']][propName]
            
            enrichedDb.append(entry)

        writeTextFile(
            Path(f'{instrupellaDir}/{targetJson}'),
            json.dumps(enrichedDb, indent=2)
        )
        print('done')


def getPropsToMerge():
    propsToMerge = {}
    for name in sorted(glob.glob(f'{instrupellaDir}/{mergePropsJson}')):
        try:
            with open(name) as json_file:
                bla = json.load(json_file)
                for track in bla:
                    trackPath = track.pop('path', None)
                    if not trackPath in propsToMerge:
                        propsToMerge[trackPath] = track
                        print(f'{trackPath} not exists')
                        continue
                    print(f'{trackPath} already exists')
                    for propName in track:
                        propsToMerge[trackPath][propName] = track[propName]
                    #sys.exit()
        except FileNotFoundError:
            print(f'file {musicDir}{mergePropsJson} does not exist')
        except json.decoder.JSONDecodeError:
            print(f'file {musicDir}{mergePropsJson} is not a valid json')
    return propsToMerge

def createPeakFile(musicFilePath, targetJsonPath):
    print('createPeakFile')
    print(musicFilePath)
    print(targetJsonPath)
    p1 = Popen(["/usr/bin/audiowaveform", "-i", musicFilePath, "-o", targetJsonPath, "--pixels-per-second", "400", "--bits", "8"], stdout=PIPE, stderr=PIPE)
    p1.communicate()

    scale_json(targetJsonPath)


def scale_json(filename):
    with open(filename, "r") as f:
        file_content = f.read()

    json_content = json.loads(file_content)
    data = json_content["data"]
    channels = json_content["channels"]
    # number of decimals to use when rounding the peak value
    digits = 8

    max_val = float(max(data))
    new_data = []
    for x in data:
        new_data.append(round(x / max_val, digits))
        #new_data.append(abs(round(x / max_val, digits)))
    # audiowaveform is generating interleaved peak data when using the --split-channels flag, so we have to deinterleave it
    if channels > 1:
        deinterleaved_data = deinterleave(new_data, channels)
        json_content["data"] = deinterleaved_data
    else:
        json_content["data"] = new_data
    file_content = json.dumps(json_content, separators=(',', ':'))

    with open(filename, "w") as f:
        f.write(file_content)


def deinterleave(data, channelCount):
    # first step is to separate the values for each audio channel and min/max value pair, hence we get an array with channelCount * 2 arrays
    deinterleaved = [data[idx::channelCount * 2] for idx in range(channelCount * 2)]
    new_data = []

    # this second step combines each min and max value again in one array so we have one array for each channel
    for ch in range(channelCount):
        idx1 = 2 * ch
        idx2 = 2 * ch + 1
        ch_data = [None] * (len(deinterleaved[idx1]) + len(deinterleaved[idx2]))
        ch_data[::2] = deinterleaved[idx1]
        ch_data[1::2] = deinterleaved[idx2]
        new_data.append(ch_data)
    return new_data


def getDbJson():
    dbJson = {}
    try:
        with open(Path(f'{instrupellaDir}/{targetJson}')) as json_file:
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

        md5 = hashlib.md5(path.encode()).hexdigest()
        peakJsonFileName = Path(path).stem[0:30]
        peakJsonFilePath = f'{peakfilesDir}/{peakJsonFileName}-{md5}.json'
        createPeakFile(file, peakJsonFilePath)
        #sys.exit()

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
            "peakfile": peakJsonFilePath.replace(pathSearchReplace[0], pathSearchReplace[1]),
            "hotcues": []


        })

        fileCount += 1
        #if fileCount > 3:
        #    break


    writeTextFile(
        Path(f'{instrupellaDir}/{targetJson}'),
        json.dumps(jsonObject, indent=2)
    )

def ensureExistingDirectory(dirPath):
    dirPath.mkdir(parents=True, exist_ok=True)

if __name__ == "__main__":
    main()
