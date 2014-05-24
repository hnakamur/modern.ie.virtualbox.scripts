'use strict';

var fs = require('fs');

var Promise = require('promise');

var digest = require('./streamMessageDigest');
var httpStream = require('./httpStream');

function downloadFileIfNeeded(fileInfo) {
  if (fileInfo.md5.length > 0) {
    return readMD5FromRemote(fileInfo.md5)
    .then(function (remoteMD5) {
      return calculateMD5FromFile(fileInfo.name)
      .then(function (localMD5) {
        if (localMD5 !== remoteMD5) {
          return Promise.reject(new Error('Unmatched MD5 for localfile ' + fileInfo.name));
        }
        return fileInfo.name;
      }).catch(function (error) {
        console.log('downloading file ' + fileInfo.name + ' from ' + fileInfo.url);
        return downloadFileAndCalculateMD5(fileInfo.url, fileInfo.name)
        .then(function (localMD5) {
          console.log('downloaded file ' + fileInfo.name);
          if (localMD5 !== remoteMD5) {
            return Promise.reject(new Error('Unmatched MD5 for downloaded file ' + fileInfo.name));
          }
          return fileInfo.name;
        });
      });
    });
  }
  return null;
}

function readMD5FromRemote(url) {
  return new Promise(function (resolve, reject) {
    httpStream.createGetStream(url)
    .on('data', function (data) {
      resolve(data.toString().replace(/\s+$/, ''));
    }).on('error', reject);
  });
}

function calculateMD5FromFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.createReadStream(filePath).on('error', reject)
    .pipe(digest.createDigester('md5'))
    .on('data', function (data) {
      resolve(data.toString());
    });
  });
}

function downloadFileAndCalculateMD5(url, destFilename) {
  return new Promise(function (resolve, reject) {
    var s = httpStream.createGetStream(url).on('error', reject);
    s.pipe(digest.createDigester('md5'))
    .on('data', function (data) {
      resolve(data.toString());
    });
    s.pipe(fs.createWriteStream(destFilename).on('error', reject));
  });
}

module.exports = {
  downloadFileIfNeeded: downloadFileIfNeeded
};
