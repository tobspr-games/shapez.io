#!/bin/sh
yarn gulp standalone.prepareVDF
steamcmd.sh +login $STEAM_UPLOAD_SHAPEZ_ID $STEAM_UPLOAD_SHAPEZ_USER +run_app_build $PWD/built_vdfs/app-darwin.vdf +quit
