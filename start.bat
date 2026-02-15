@echo off
REM START /B redis-server
set MONGODB_URL=mongodb://10.211.55.2/hangman
set REDIS_URL=redis://default@127.0.0.1:6379
set PORT=3000
START /B npm start