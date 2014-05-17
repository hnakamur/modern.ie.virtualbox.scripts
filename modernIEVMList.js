'use strict';

var fs = require('fs');
var stream = require('stream');

var _ = require('underscore');
var Promise = require('promise');
var JSONStream = require('JSONStream');

var myUtil = require('myUtil');

var osVersionMappingFromVMNameToVMList = {
  'WinXP' : 'XP',
  'Vista' : 'vista',
  'Win7' : 'win7',
  'Win8' : 'win8',
  'Win8.1' : 'win8.1'
};

function downloadVMListIfNeeded(vmListJsonFilePath) {
  return myUtil.fileExists(vmListJsonFilePath)
  .then(function (exists) {
    if (!exists) {
      return downloadVMList(vmListJsonFilePath);
    } else {
      return [];
    }
  });
}

function downloadVMList(vmListJsonFilePath) {
  console.log('downloading ' + vmListJsonFilePath + '...');
  var command = 'phantomjs downloadVMList.js > "' + vmListJsonFilePath + '"';
  return myUtil.shellExec(command)
  .then(function () {
    console.log('downloaded ' + vmListJsonFilePath + '.');
  });
}

function listVM(vmListJsonFilePath, osName, virtualizationSoftwareName) {
  return new Promise(function (resolve, reject) {
    var namesPicker = new stream.Writable();
    namesPicker._writableState.objectMode = true;
    namesPicker._write = function(osData, encoding, callback) {
      if (osData.osName === osName) {
        var software = _.find(osData.softwareList, function(software) {
          return software.softwareName === virtualizationSoftwareName;
        });
        if (software && software.browsers) {
          var reverseMapping = _.invert(osVersionMappingFromVMNameToVMList);
          var vmNames = software.browsers.map(function (browser) {
            var osVersion = reverseMapping[browser.osVersion];
            return [browser.title, osVersion].join(' - ');
          });
          this.emit('data', vmNames);
        }
      }
      callback();
    };
    var resolved = false;
    namesPicker.on('data', function(vmNames) {
      resolve(vmNames);
      resolved = true;
    }).on('finish', function() {
      if (!resolved) {
        reject(new Error('cannot found vmNames info in json'));
      }
    });

    fs.createReadStream(vmListJsonFilePath).on('error', reject)
      .pipe(JSONStream.parse("osList.*").on('error', reject))
      .pipe(namesPicker);
  });
}

function getFileListForVM(jsonFilePath, osName, virtualizationSoftwareName, browserTitle, osVersion) {
  return new Promise(function (resolve, reject) {
    var filesPicker = new stream.Writable();
    filesPicker._writableState.objectMode = true;
    filesPicker._write = function(osData, encoding, callback) {
      if (osData.osName === osName) {
        var software = _.find(osData.softwareList, function(software) {
          return software.softwareName === virtualizationSoftwareName;
        });
        if (software) {
          var browser = _.find(software.browsers, function(browser) {
            return browser.title === browserTitle &&
              browser.osVersion === osVersionMappingFromVMNameToVMList[osVersion];
          });
          if (browser) {
            this.emit('data', browser.files);
          }
        }
      }
      callback();
    };
    var resolved = false;
    filesPicker.on('data', function(files) {
      resolve(files);
      resolved = true;
    }).on('finish', function() {
      if (!resolved) {
        reject(new Error('cannot found files info in json'));
      }
    });

    fs.createReadStream(jsonFilePath).on('error', reject)
      .pipe(JSONStream.parse("osList.*").on('error', reject))
      .pipe(filesPicker);
  });
}

module.exports = {
  downloadVMListIfNeeded: downloadVMListIfNeeded,
  listVM: listVM,
  getFileListForVM: getFileListForVM
};
