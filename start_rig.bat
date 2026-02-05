@echo off
REM START /B redis-server
REM START /B mongod --dbpath C:\data\mongodb
set MONGODB_URL=mongodb://10.211.55.2/hangman
set REDIS_URL=redis://10.211.55.2:6379/
SLEEP 2
set PORT=3000
START /B npm start
SLEEP 1
set PORT=3001
START /B npm start
