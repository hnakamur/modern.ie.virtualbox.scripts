modern.ie.virtualbox.scripts
============================

setup and start modern.ie virtual machines
------------------------------------------

We abbreviate virtual machine to vm hereafter.
For example, if you want to start a "IE9 - Win7" vm, run the following command in the terminal app.

```
$ ./start_modern_ie_virtualbox_vm.sh "IE9 - Win7"
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
* Take a snapshot of the vm.
* Start the vm.
* Set the shared clipboard config to bidirectional.
