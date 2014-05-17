var page = require('webpage').create();
page.open('http://modern.ie/ja-jp/virtualization-tools#downloads', function() {
  var vmList = page.evaluate(function() {
    return vmListJSON;
  });
  console.log(JSON.stringify(vmList));
  phantom.exit();
});
