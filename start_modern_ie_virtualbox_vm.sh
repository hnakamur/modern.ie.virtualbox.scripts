#!/bin/sh

usage() {
  cat <<EOF
Usage: $0 "VM type"

supported VM types:
* IE6 - WinXP
* IE8 - WinXP
* IE7 - Vista
* IE8 - Win7
* IE9 - Win7
* IE10 - Win7
* IE11 - Win7
* IE10 - Win8
* IE11 - Win8.1

example: $0 "IE8 - Win7"
EOF
  exit 1
}

echo_filename() {
  if [ $filecount -eq 1 ]; then
    echo ${ie}.${win}.For.MacVirtualBox.sfx
  else
    local index=$1
    if [ $index -eq 1 ]; then
      echo ${ie}.${win}.For.MacVirtualBox.part1.sfx
    else
      echo ${ie}.${win}.For.MacVirtualBox.part${index}.rar
    fi
  fi
}

download_file() {
  local file=$1
  if [ ! -f $file ]; then
    curl -O -L "http://www.modern.ie/vmdownload?platform=mac&virtPlatform=virtualbox&browserOS=$ie-$win&filename=VirtualBox/${ie}_${win}/Mac/$file"
  fi
}

download_and_concat() {
  case $vmtype in
  "IE6 - WinXP")
    filecount=1
    ;;
  "IE8 - WinXP")
    filecount=2
    ;;
  "IE7 - Vista")
    filecount=4
    ;;
  "IE8 - Win7")
    filecount=4
    ;;
  "IE9 - Win7")
    filecount=4
    ;;
  "IE10 - Win7")
    filecount=4
    ;;
  "IE11 - Win7")
    filecount=4
    ;;
  "IE10 - Win8")
    filecount=5
    ;;
  "IE11 - Win8.1")
    filecount=3
    ;;
  esac

  if [ $filecount -eq 1 ]; then
    download_file `echo_filename`
  else
    local i=1
    while [ $i -le $filecount ]; do
      download_file `echo_filename $i`
      i=`expr $i + 1`
    done
  fi

  local sfx=`echo_filename 1`
  chmod +x $sfx
  ./$sfx

  if [ $filecount -eq 1 ]; then
    rm `echo_filename`
  else
    local i=1
    while [ $i -le $filecount ]; do
      rm `echo_filename $i`
      i=`expr $i + 1`
    done
  fi
}

vm_exists() {
  local vmname=$1
  VBoxManage showvminfo "$vmname" > /dev/null 2>&1
  return $?
}


if [ $# -ne 1 ]; then
  usage
fi

vmtype="$1"

case $vmtype in
"IE6 - WinXP"|"IE8 - WinXP"|"IE7 - Vista"|"IE8 - Win7"|"IE9 - Win7"|"IE10 - Win7"|"IE11 - Win7"|"IE10 - Win8"|"IE11 - Win8.1")
  ;;
*)
  usage
esac

set -- $vmtype
ie=$1
win=$3

vmname=$vmtype

if ! vm_exists "$vmname"; then
  ova=$vmtype.ova
  if [ ! -f "$ova" ]; then
    download_and_concat
  fi

  VBoxManage import "$ova"
  VBoxManage storageattach "$vmname" --storagectl IDE --port 1 --device 0 --type dvddrive --medium additions
fi


VBoxManage snapshot "$vmname" take 'Snapshot 1'
VBoxManage startvm "$vmname" --type gui
VBoxManage controlvm "$vmname" clipboard bidirectional
