Introduction
------------

This module contains read/write and more advanced operations on files

## Installation
Install via npm:
```js
npm i os-file-stream-handler
```

## Usage       
Require fsh:
```js
var fsh = require("os-file-stream-handler")
```
## Functions and signatures:
```js


/**
* Will read a file into an array of lines
*
* @param filePath -> the path to the file
*/
readFile: function (filePath) {
    return new Promise(function (resolve, reject) {

        let lineReader = require('readline').createInterface({
            input: fs.createReadStream(filePath)
        });
        let lines = [];
        lineReader.on('line', function (line) {
            lines.push(line)
        });
        lineReader.on('close', function () {
            resolve(lines);
        });
    }.bind())
},

/**
 * Will read a file with encoding to a string
 *
 * @param filePath -> the path to the file
 * @param encoding -> the desired encoding
 */
readFileWithEncoding: function (filePath, encoding='utf8') {
    return fs.readFileSync(filePath, encoding);
},

/**
 * Will read a file to json
 */
fileToJson: async function (filePath) {
    const fileStr = await self.readFileWithEncoding(filePath);
    return JSON.parse(fileStr);
},


/**
 * Will save text or, a bunch of lines in an array, into a file
 *
 * @param text -> optional text to save
 * @param filePath -> the path to the file
 */
writeFileSync: function (text = null, filePath) {
    const fh = require('os-file-handler');
    const parentDir = fh.getParentDir(filePath);
    fh.createDir(parentDir);
    fs.writeFileSync(filePath, text);
},

/**
 * Will save a json into a file
 *
 * @param jsonObj
 * @param filePath
 * @returns {Promise<void>}
 * @constructor
 */
JSONObjectToFile: async function (jsonObj, filePath) {

    // stringify JSON Object
    const jsonContent = JSON.stringify(jsonObj);

    fs.writeFile(filePath, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
},

/**
 * Will read a range of lines from a file.
 * Will start from lineToStart and stop at the first occurrence of lineToStop, as long as lineToStart found.
 *
 * @param filePath -> the path to the file
 * @param lineToStart -> the line to start the reading
 * @param lineToStop -> the line to stop the reading (we will start to look for this line only after
 * the lineToStart has been found)
 * @param includeFirstLine -> set to true to include the first line in the reading
 * @param includeLastLine -> set to true to include the last line in the reading
 * @param isLineIdentical -> true if the line should hold the exact match. False to if the line contains
 * @param caseSensitive -> case sensitive toggler (if you set isLineIdentical to true, it of course, doesn't matter)
 */
readFileInRange: function (filePath,
                           lineToStart,
                           lineToStop,
                           includeFirstLine = true,
                           includeLastLine = true,
                           isLineIdentical = true,
                           caseSensitive = true) {
    return new Promise(function (resolve, reject) {
        let caseSensitiveFunc = returnSelf;
        if (!caseSensitive) {
            caseSensitiveFunc = textToLowerCase;
            lineToStart = caseSensitiveFunc(lineToStart);
            lineToStop = caseSensitiveFunc(lineToStop)
        }

        let compareFunc = isContains;
        if (isLineIdentical) {
            compareFunc = isMatch
        }
        let lineReader = require('readline').createInterface({
            input: fs.createReadStream(filePath)
        });

        let startFound = false;
        let lines = [];
        let closed = false;
        lineReader.on('line', function (line) {
            let cLine = caseSensitiveFunc(line);
            if (!startFound) {
                if (compareFunc(cLine, lineToStart)) {
                    startFound = true;
                    if (includeFirstLine) {
                        lines.push(line)
                    }
                }
            } else {
                if (compareFunc(cLine, lineToStop)) {
                    if (includeLastLine) {
                        lines.push(line)
                    }
                    resolve(lines);
                    closeLineReader(lineReader);
                    closed = true;
                } else {
                    lines.push(line)
                }
            }

        });
        lineReader.on('close', function () {
            if(!closed) {
                closeLineReader(lineReader);
                resolve(undefined)
            }

        });
    }.bind())
},


/**
 * Will check if a file contains text. If it does, return true else, false.
 *
 * @param filePath -> the path to the file
 * @param text -> the text which you'd like to look for
 * @param isLineIdentical -> true if the line should hold the exact match. False to if the line contains
 * @param caseSensitive -> case sensitive toggler (if you set isLineIdentical to true, it of course, doesn't matter)
 */
isFileContainsText: function (filePath, text, isLineIdentical = true, caseSensitive = true) {
    return new Promise(function (resolve, reject) {

        let caseSensitiveFunc = returnSelf;
        if (!caseSensitive) {
            caseSensitiveFunc = textToLowerCase;
            text = caseSensitiveFunc(text)
        }

        let compareFunc = isContains;
        if (isLineIdentical) {
            compareFunc = isMatch
        }
        let lineReader = require('readline').createInterface({
            input: fs.createReadStream(filePath)
        });

        lineReader.on('line', function (line) {
            line = caseSensitiveFunc(line);
            if (compareFunc(line, text)) {
                resolve(true);
                closeLineReader(lineReader)
            }
        });
        lineReader.on('close', function () {
            resolve(false)
        });
    }.bind())
},

/**
 * Will return the file paths contains a text from a bunch of files.
 *
 * @param filePaths -> an array carrying the list of files to look upon
 * @param text -> the text which you'd like to look for
 * @param isLineIdentical -> true if the line should hold the exact match. False to if the line contains
 * @param caseSensitive -> case sensitive toggler (if you set isLineIdentical to true, it of course, doesn't matter)
 * @return Promise -> a promise carrying an array to all of the files found (an empty array if nothing's found)
 */
getFilesContainsText: function (filePaths = [], text, isLineIdentical = true, caseSensitive = true) {
    return new Promise(async function (resolve, reject) {

        let filesFound = [];
        for (let i = 0; i < filePaths.length; i++) {
            let found = await self.isFileContainsText(filePaths[i], text, isLineIdentical, caseSensitive);
            if (found) {
                filesFound.push(filePaths[i])
            }
        }
        resolve(filesFound)
    }.bind())
},

/**
 * Will look for expression in a file (or in array of lines) and return all of the occurrences
 * in which the expression exists.
 *
 * For example, if you have a file contains:
 *
 * package in.remotify.www.hathwayremote;
 * import android.annotation.SuppressLint;
 * import android.content.Context;
 * import android.content.SharedPreferences.Editor;
 * import android.hardware.ConsumerIrManager;
 * import android.hardware.Gyroscope;
 * import android.os.Bundle;
 *
 * and you want to scrape all of the lines which has the expression 'hardware', using this
 * function will return the array:
 * ['import android.hardware.ConsumerIrManager;', 'import android.hardware.Gyroscope;']
 *
 *
 * @param filePath -> optional file path instead of just an array of lines
 * @param lines -> optional strings in an array instead of a file
 * @param lineToFocusOn -> the line which includes the string you want to scrape
 * @param strContainsStart -> a string marking the start of the expression to return
 * @param includeAllOfStart -> true to include all of the start expression in the selection,
 * false to exclude it and return only the expression after it
 * @param strContainsEnd -> a string marking the end of the expression to return
 * @param includeAllOfEnd -> true to include all of the end expression in the selection,
 * false to exclude it and return only the expression after it
 */
findExpression: function (filePath,
                          lines = [],
                          lineToFocusOn,
                          strContainsStart,
                          includeAllOfStart = false,
                          strContainsEnd = null,
                          includeAllOfEnd = false,) {
    return new Promise(async function (resolve, reject) {

        let txtLines = lines;
        if (lines.length === 0) {
            txtLines = self.readFile(filePath)
        }

        let matches = [];
        // run on all of the lines in a java files
        for (let j = 0; j < txtLines.length; j++) {
            let line = txtLines[j];
            if (line.includes(strContainsStart)) {
                let startIdx = line.indexOf(strContainsStart);
                if (!includeAllOfStart) {
                    startIdx += strContainsStart.length
                }

                let endIdx = line.indexOf(strContainsEnd, startIdx + 1);
                if (includeAllOfEnd) {
                    endIdx += strContainsEnd.length
                }

                let ans = "";
                if (strContainsEnd !== null) {
                    ans = line.substring(startIdx, endIdx);
                    matches.push(ans);
                } else {
                    ans = line.substring(startIdx, line.length);
                    matches.push(ans)
                }
            }
        }
        resolve(matches)
    })
},
```
And more...


## Links -> see more tools
* [os-tools-npm](https://github.com/osfunapps/os-tools-npm) -> This module contains fundamental functions to implement in an npm project
* [os-file-handler-npm](https://github.com/osfunapps/os-file-handler-npm) -> This module contains fundamental files manipulation functions to implement in an npm project
* [os-file-stream-handler-npm](https://github.com/osfunapps/os-file-stream-handler-npm) -> This module contains read/write and more advanced operations on files
* [os-xml-handler-npm](https://github.com/osfunapps/os-xml-handler-npm) -> This module will build, read and manipulate an xml file. Other handy stuff is also available, like search for specific nodes

[GitHub - osfunappsapps](https://github.com/osfunapps)

## Licence
ISC