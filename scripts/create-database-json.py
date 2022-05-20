#!/usr/bin/python3

# install http://www.pogo.org.uk/~mark/bpm-tools/ for bpm detection
# install ffprobe for reading music file metadata

# install https://github.com/bbc/audiowaveform
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

musicDir = "/MUSIC/acatest/"
pathSearchReplace = [
    "/MUSIC/acatest/",
    "./acatest/"
]
'''
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
'''



musicDir = "/MUSIC/aca2/"
pathSearchReplace = [
    "/MUSIC/aca2/",
    "./aca2/"
]

createPeakFiles = True
peakPixelsPerSecond = 200
detectSilence = True

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
                enrichedDb.append(toFixedAll(entry))
                continue
            for propName in mergeProps[entry['path']]:
                entry[propName] = mergeProps[entry['path']][propName]
            
            enrichedDb.append(toFixedAll(entry))

        writeTextFile(
            Path(f'{instrupellaDir}/{targetJson}'),
            json.dumps(enrichedDb, indent=2)
        )
        print('done')


def toFixedAll(item):
    item['bpm'] = toFixed(item['bpm'])
    item['bpmdetect'] = toFixed(item['bpmdetect'])
    item['length'] = toFixed(item['length'])
    if item['downbeat'] != None:
        item['downbeat'] = toFixed(item['downbeat'])
        
    for silence in item['silences']:
        silence['start'] = toFixed(silence['start'])
        silence['end'] = toFixed(silence['end'])
        silence['duration'] = toFixed(silence['duration'])
    return item


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
    #print(r'"%s"' % musicFilePath)
    #print(targetJsonPath)
    if os.path.isfile(targetJsonPath):
        # we already have a peak json file
        return

    cmdArgs = [
        "/usr/bin/audiowaveform",
        "-i", str(musicFilePath),
        "-o", str(targetJsonPath),
        "--pixels-per-second", str(peakPixelsPerSecond),
        "--bits", "8"
    ]
    #print(' '.join(cmdArgs))
    p1 = Popen(cmdArgs, stdout=PIPE, stderr=PIPE)
    p1.communicate()

    if os.path.isfile(targetJsonPath):
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
    file_content = json.dumps(json_content, separators=(',', ':')).replace('-', '')

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
    dbItem["length"] = toFixed(tags["duration"])
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

# thanks to https://stackoverflow.com/questions/5419389/how-to-overwrite-the-previous-print-to-stdout-in-python#43952192
def printStatusline(msg: str):
    #print(msg)
    #return
    last_msg_length = len(printStatusline.last_msg) if hasattr(printStatusline, 'last_msg') else 0
    print(' ' * last_msg_length, end='\r')
    print(msg, end='\r')
    sys.stdout.flush()  # Some say they needed this, I didn't.
    printStatusline.last_msg = msg

def createDatabaseJson():
    files = collectAllMusicFiles(musicDir)
    jsonObject = []
    #print(files)
    fileCount = 1
    print("found music files", len(files))
    for file in files:
        path = str(file)
        printStatusline(f'{fileCount}/{len(files)} {path}')
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
            "silences": [],
            "hotcues": []
        }
        getTagsForFile(dbItem)

        if len(pathSearchReplace) == 2:
            dbItem["path"] = dbItem["path"].replace(pathSearchReplace[0], pathSearchReplace[1])

        peakJsonFilePath = ''
        if createPeakFiles == True:
            md5 = hashlib.md5(path.encode()).hexdigest()
            peakJsonFileName = Path(path).stem[0:30]
            peakJsonFilePath = f'{peakfilesDir}/{peakJsonFileName}-{md5}-{peakPixelsPerSecond}.json'
            createPeakFile(file, peakJsonFilePath)

            if os.path.isfile(peakJsonFilePath):
                if detectSilence == True:
                    dbItem["silences"] = detectSilences(peakJsonFilePath)
                dbItem["peakfile"] = peakJsonFilePath.replace(
                    pathSearchReplace[0],
                    pathSearchReplace[1]
                )

        # TODO: consider to skip bpm detection if it already exists
        dbItem["bpmdetect"] = toFixed(detectBpm(file))
        dbItem["key"] = str(detectKey(file))
        jsonObject.append(dbItem)

        fileCount += 1
        #if fileCount > 3:
        #    break
    printStatusline('')
    print('finished')

    writeTextFile(
        Path(f'{instrupellaDir}/{targetJson}'),
        json.dumps(jsonObject, indent=2)
    )

def toFixed(num):
    return float("{:10.4f}".format(float(num)))

def detectSilences(jsonFilePath):
    f = open(jsonFilePath)
    
    # returns JSON object as
    # a dictionary
    silences = []
    silenceTresholdSeconds = 1.0
    lastSilenceStart = 0
    currentlySilence = False

    data = json.load(f)
    silenceTresholdPeak = max(data['data'])/10
    currentSecond = 0
    secondsPerValue = 1/peakPixelsPerSecond/2
    for val in data['data']:
        if val < silenceTresholdPeak:
            if currentlySilence == False:
                lastSilenceStart = currentSecond
                currentlySilence = True
            
        else:
            if currentlySilence == True:
                currentlySilence = False
                if currentSecond - lastSilenceStart > silenceTresholdSeconds:
                    #print('have silence', lastSilenceStart, currentSecond, currentSecond - lastSilenceStart)
                    silences.append(
                        {
                            'start': toFixed(lastSilenceStart),
                            'end': toFixed(currentSecond),
                            'duration': toFixed(currentSecond - lastSilenceStart)
                        }
                    )
                    #sys.exit()

        currentSecond += secondsPerValue
        #print(val, currentSecond)

    # append possible trailing silence as well
    currentSecond -= secondsPerValue
    if currentlySilence == True and currentSecond - lastSilenceStart > silenceTresholdSeconds:
        #print('have trailing silence', lastSilenceStart, currentSecond, currentSecond - lastSilenceStart)
        silences.append(
            {
                'start': toFixed(lastSilenceStart),
                'end': toFixed(currentSecond),
                'duration': toFixed(currentSecond - lastSilenceStart)
            }
        )
        #sys.exit()
    f.close()
    return silences

def ensureExistingDirectory(dirPath):
    dirPath.mkdir(parents=True, exist_ok=True)

if __name__ == "__main__":
    main()
