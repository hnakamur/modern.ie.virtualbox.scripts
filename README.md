modern.ie.virtualbox.scripts
============================

setup and start modern.ie virtual machines
------------------------------------------

We abbreviate virtual machine to vm hereafter.
For example, if you want to start a "IE9 - Win7" vm, run the following command in the terminal app.

The old version of this script which was written in bash script was deprecated.
The latest version of this script is written in [node.js](http://nodejs.org/)

## Setup

- Install node.js.
- Clone this repository and install local node modules.

```
$ git clone https://github.com/hnakamur/modern.ie.virtualbox.scripts
$ cd modern.ie.virtualbox.scripts
$ npm install
```

## Usage

```
$ node index.js "IE9 - Win7"
```

Supported vm types:

* IE6 - WinXP
* IE8 - WinXP
* IE7 - Vista
* IE8 - Win7
* IE9 - Win7
* IE10 - Win7
* IE11 - Win7
* IE10 - Win8
* IE11 - Win8.1


This script does the following things:

* If the vm of the same name as vm type does not exist, check the *.ova for the vm type file exists.
    * If *.ova file does not exist, download *.sfx and *.rar files and concat them to create *.ova file.
        * This script skips files which already exists. If you have imcomplete files, remove them and rerun this script.
    * Import *.ova file and create a vm.
    * Attach a dvd storage for VirtualBox GuestAdditions.
    * Take a snapshot of the vm so that you can reset quickly after the OS trial expires.
* Start the vm.
* Set the shared clipboard config to bidirectional.

## こちらも参考になるかも

* [modern.IEのOSX上のVirtualBox VMのダウンロードから起動までを自動化するスクリプト - Qiita](http://qiita.com/hnakamur/items/7b2c153c60ee1a637ff2)
* [Windows8.xのmodern.IEで日本語を入力、表示できるようにする。 - Qiita](http://qiita.com/hnakamur/items/cd37c9c8826afe4b4dda)
* [VirtualBox - modern.IEのWindows 7で日本語の表示と入力をできるようにする - Qiita](http://qiita.com/hnakamur/items/5f2f9e817dd0de60abb2)

