'use strict';

var childProcess = require('child_process');
var fs = require('fs');

var Promise = require('promise');

function fileExists(path) {
  return new Promise(function (resolve, reject) {
    fs.exists(path, resolve);
  });
}

function unlinkFile(path) {
  return new Promise(function (resolve, reject) {
    fs.unlink(path, resolve);
  });
}

function shellExec(command) {
  return new Promise(function (resolve, reject) {
    childProcess.exec(command, function(error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  fileExists: fileExists,
  shellExec: shellExec,
  unlinkFile: unlinkFile
};
