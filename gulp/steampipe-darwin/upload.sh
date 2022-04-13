#!/bin/sh
yarn gulp standalone.prepareVDF.darwin
steamcmd.sh +login $STEAM_UPLOAD_SHAPEZ_ID $STEAM_UPLOAD_SHAPEZ_USER +run_app_build $PWD/scripts/app.vdf +quit
