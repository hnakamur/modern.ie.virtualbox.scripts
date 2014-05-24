'use strict';

var path = require('path');
var stream = require('stream');

var Promise = require('promise');

var myUtil = require('./myUtil');
var vmList = require('./modernIEVMList');
var vb = require('./modernIEVirtualBox');

var vmListJsonFilePath = 'vmList.json';

function usage(argv) {
  var jsFilename = path.basename(argv[1]);
  console.log("Usage: " + argv[0] + " " + jsFilename + " vmName");
  console.log("   ex: " + argv[0] + " " + jsFilename + " 'IE11 - Win8.1'");
  return myUtil.fileExists(vmListJsonFilePath)
  .then(function (exists) {
    if (exists) {
      return vb.listVM(vmListJsonFilePath)
      .then(function (vmNames) {
        console.log("Available vmNames are:");
        vmNames.forEach(function(vmName) {
          console.log("\t* " + vmName);
        });
      });
    }
  });
  process.exit(1);
}

function main(argv) {
  var vmName = argv[2];
  if (!vmName) {
    return usage(argv);
  }

  return vb.downloadVMListIfNeeded(vmListJsonFilePath)
  .then(function () {
    return vb.listVM(vmListJsonFilePath)
    .then(function (vmNames) {
      if (vmNames.indexOf(vmName) === -1) {
        return usage(argv);
      }

      return vb.downloadAndStartVM(vmListJsonFilePath, vmName);
    });
  }).catch(function (error) {
    console.log('error: ' + error);
  });
}

main(process.argv);
