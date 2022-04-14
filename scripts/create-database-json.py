#!/usr/bin/python3

# install http://www.pogo.org.uk/~mark/bpm-tools/ for bpm detection
# install ffprobe for reading music file metadata


# TODO make bpm detect and keyfinder optional

# TODO read music directory from .env file(s) and add environment argument

import json
import hashlib
import sys
import re
import os
import glob
from subprocess import Popen, PIPE
from pathlib import Path

import argparse



# include trailing slash!
targetJson = "instrupella-db.json"
mergePropsJson = "trackprops*.json"

musicDir = "/MUSIC/testaca/"
pathSearchReplace = [
    "/MUSIC/testaca/",
    "./testaca/"
]

musicDir = "/MUSIC/aca2/2022-04/kingpella/"
pathSearchReplace = [
    "/MUSIC/aca2/2022-04/kingpella/",
    "./aca2/2022-04/kingpella/"
]

musicDir = "/MUSIC/aca2/2022-02/"
pathSearchReplace = [
    "/MUSIC/aca2/2022-02/",
    "./aca2/2022-02/"
]


musicDir = "/MUSIC/aca2/"
pathSearchReplace = [
    "/MUSIC/aca2/",
    "./aca2/"
]


createPeakFile = False

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


def readTags(filePath):
    p1 = Popen(["/usr/bin/ffprobe", "-v", "quiet", "-print_format", "json=compact=1", "-show_format", filePath], stdout=PIPE, stderr=PIPE)
    obj = json.loads(p1.communicate()[0].decode("utf-8"))
    if 'format' in obj:
        return obj['format']

    try:
        fallback = {"size": int(os.path.getsize(filePath))}
    except os.error:
        fallback = {"size": 0}

    return fallback


def writeTextFile(fileNameToWrite, fileContent):
    with open(fileNameToWrite, "w") as myfile:
        myfile.write(fileContent)

def collectAllMusicFiles(startDirectory):
    allFiles = sorted(Path(startDirectory).rglob('*.*'))
    musicFiles = []
    for foundFile in allFiles:
        if foundFile.suffix.lower() in ['.wav', '.flac', '.mp3', '.mp4', '.ogg', '.oga', '.m4a']:
            musicFiles += [ foundFile ]
            continue
    return musicFiles

def getTagsForFile(dbItem):
    tags = readTags(dbItem["path"])
    try:
        tags_lower = {k.lower():v for k,v in tags["tags"].items()}
    except KeyError:
        tags_lower = {
            "artist": Path(dbItem["path"]).stem,
            "title": Path(dbItem["path"]).stem,
            "year": 0
        }
    #print(tags_lower)
    dbItem["size"] = int(tags["size"])
    dbItem["length"] = float(tags["duration"])
    for k in ["artist", "title", "year"]:
        if k in tags_lower:
            dbItem[k] = tags_lower[k]
    if "date" in tags_lower:
        dbItem["year"] = tags_lower["date"]
    try:
        # ValueError: could not convert string to float: '2014-08-22'
        dbItem["year"] = int(float(dbItem["year"]))
    except ValueError:
        pass
    #print(tags)
    return dbItem


def createDatabaseJson():
    files = collectAllMusicFiles(musicDir)
    jsonObject = []
    #print(files)
    fileCount = 0
    print("found music files", len(files))
    for file in files:
        path = str(file)
        print(path)
        dbItem = {
            "path": path,
            "artist": Path(file).stem,
            "title": Path(file).stem,
            #"album": album,
            "year": 0,
            "length": 0,
            "size": 0,
            "bpmdetect": 0,
            "bpm": 0,
            "key": "",
            "downbeat": None,
            "peakfile": "",
            "hotcues": []
        }
        getTagsForFile(dbItem)

        if len(pathSearchReplace) == 2:
            dbItem["path"] = dbItem["path"].replace(pathSearchReplace[0], pathSearchReplace[1])

        peakJsonFilePath = ''
        if createPeakFile == True:
            md5 = hashlib.md5(path.encode()).hexdigest()
            peakJsonFileName = Path(path).stem[0:30]
            peakJsonFilePath = f'{peakfilesDir}/{peakJsonFileName}-{md5}.json'
            createPeakFile(file, peakJsonFilePath)
            dbItem["peakfile"] = peakJsonFilePath.replace(pathSearchReplace[0], pathSearchReplace[1])

        dbItem["bpmdetect"] = float(detectBpm(file))
        dbItem["key"] = str(detectKey(file))
        jsonObject.append(dbItem)

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
