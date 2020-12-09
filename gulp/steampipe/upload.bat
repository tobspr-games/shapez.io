@echo off
cmd /c yarn gulp standalone.prepareVDF
steamcmd +login %STEAM_UPLOAD_SHAPEZ_ID% %STEAM_UPLOAD_SHAPEZ_USER% +run_app_build %cd%/scripts/app.vdf +quit
start https://partner.steamgames.com/apps/builds/1318690
