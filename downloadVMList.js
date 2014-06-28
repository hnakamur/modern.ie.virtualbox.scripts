'use strict';

var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');
var fs = require('fs');

var downloadPageUrl = 'https://modern.ie/ja-jp/virtualization-tools#downloads';

function getVmListJsonFromHtml(html) {
  var $ = cheerio.load(html);
  var scripts = $('body').find('script');
  var i = 0;
  var len = scripts.length;
  var script;
  var text;
  var vmListRegexp = /d\.osList=(\[.*\]);/;
  var result;
  for (i = 0; i < len; i++) {
    script = scripts[i];
    text = $(script).text();
    result = vmListRegexp.exec(text);
    if (result) {
      return result[1];
    }
  }
  return null;
}

function downloadVMList(vmListJsonFilePath) {
  return new Promise(function (resolve, reject) {
    request(downloadPageUrl, function(error, response, html) {
      if (error) {
        console.log('Error!', error);
        return;
      }

      var json = getVmListJsonFromHtml(html);
      if (json) {
        var writable = fs.createWriteStream(vmListJsonFilePath).on('error', reject)
          .on('finish', resolve);
        writable.write(json);
        writable.end();
      }
    });
  });
}

module.exports = {
  downloadVMList: downloadVMList
};
