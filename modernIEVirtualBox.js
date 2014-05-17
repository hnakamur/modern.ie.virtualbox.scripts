'use strict';

var stream = require('stream');

var Promise = require('promise');

var downloader = require('modernIEDownloader');
var myUtil = require('myUtil');
var vmList = require('modernIEVMList');


var snapshotName = 'Snapshot 1';
var clipboardMode = 'bidirectional';


function getOvaFilename(vmName) {
  return vmName + '.ova';
}

function getBrowserTitle(vmName) {
  return vmName.split(' - ')[0];
}

function getOsVersion(vmName) {
  return vmName.split(' - ')[1];
}

function downloadAndStartVM(vmListJsonFilePath, vmName) {
  return importVMIfNeeded(vmListJsonFilePath, vmName)
  .then(function (importedNow) {
    return startVM(vmName)
    .then(function() {
      if (importedNow) {
        return setClipboardMode(vmName, clipboardMode);
      }
    });
  });
}

function importVMIfNeeded(vmListJsonFilePath, vmName) {
  return vmExists(vmName)
  .then(function (exists) {
    if (exists) {
      console.log('VM "' + vmName + '" already imported.');
      return false;
    }

    var ovaFilename = getOvaFilename(vmName);
    return myUtil.fileExists(ovaFilename)
    .then(function (exists) {
      if (!exists) {
        console.log('will downloading and build "' + ovaFilename + '"');
        return downloadVMFiles(vmListJsonFilePath, vmName);
      }
    }).then(function () {
      console.log('importing vm "' + vmName + '"');
      return importVM(vmName)
      .then(function () {
        return true;
      });
    });
  });
}

function vmExists(vmName) {
  var command = 'VBoxManage showvminfo "' + vmName + '" > /dev/null 2>&1';
  return myUtil.shellExec(command)
  .then(function () {
    return true;
  }).catch(function (error) {
    return false;
  });
}

function listVM(vmListJsonFilePath) {
  return vmList.listVM(vmListJsonFilePath, 'mac', 'virtualbox');
}

function downloadVMFiles(vmListJsonFilePath, vmName) {
  var browserTitle = getBrowserTitle(vmName);
  var osVersion = getOsVersion(vmName);
  return vmList.getFileListForVM(vmListJsonFilePath, 'mac', 'virtualbox', browserTitle, osVersion)
  .then(function (fileInfos) {
    return Promise.all(fileInfos.map(downloader.downloadFileIfNeeded))
    .then(function (results) {
      return concatVMFiles(results[0]);
    }).then(function () {
      return Promise.all(fileInfos.map(function (fileInfo) {
        return myUtil.unlinkFile(fileInfo.name);
      }));
    });
  });
}

function concatVMFiles(sfxFilename) {
  console.log('concat downloaded files');
  var command = 'chmod +x ' + sfxFilename + '; ./' + sfxFilename;
  return myUtil.shellExec(command)
  .then(function () {
    console.log('concat done!');
  });
}

function importVM(vmName) {
  var ovaFilename = getOvaFilename(vmName);
  return doImportVM(ovaFilename)
  .then(function () {
    console.log('VM "' + vmName + '" imported.');
    return configVMMemory(vmName)
    .then(function() {
      return attachGuestAdditionsMedia(vmName);
    }).then(function () {
      return takeSnapshot(vmName, snapshotName);
    });
  });
}

function doImportVM(ovaFilename) {
  var command = 'VBoxManage import "' + ovaFilename + '"';
  return myUtil.shellExec(command);
}

function configVMMemory(vmName) {
  var command = 'VBoxManage modifyvm "' + vmName + '" --memory ';
  var osVersion = getOsVersion(vmName);
  if (osVersion === 'WinXP' || osVersion === 'Vista') {
    command += '1024';
  } else if (osVersion === 'Win7' || osVersion === 'Win8' || osVersion === 'Win8.1') {
    command += '2048 --vram 128';
  } else {
    return Promise.reject(new Error('Unsupported os version: ' + osVersion));
  }
  return myUtil.shellExec(command);
}

function attachGuestAdditionsMedia(vmName) {
  var command = 'VBoxManage storageattach "' + vmName + '" --storagectl IDE --port 1 --device 0 --type dvddrive --medium additions';
  return myUtil.shellExec(command);
}

function takeSnapshot(vmName, snapshotName) {
  var command = 'VBoxManage snapshot "' + vmName + '" take "' + snapshotName + '"';
  return myUtil.shellExec(command);
}

function startVM(vmName) {
  var command = 'VBoxManage startvm "' + vmName + '" --type gui';
  return myUtil.shellExec(command);
}

function setClipboardMode(vmName, clipboardMode) {
  var command = 'VBoxManage controlvm "' + vmName + '" clipboard ' + clipboardMode;
  return myUtil.shellExec(command);
}

function downloadVMListIfNeeded(vmListJsonFilePath) {
  return vmList.downloadVMListIfNeeded(vmListJsonFilePath);
}

module.exports = {
  downloadVMListIfNeeded: downloadVMListIfNeeded,
  downloadAndStartVM: downloadAndStartVM,
  listVM: listVM
};
