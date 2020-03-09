#!/bin/bash 

echo Launching ganache blockchain

osascript -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'
if [ "$1" == "initial" ]; then
	osascript -e 'tell app "Terminal" to do script "cd eth-shop-server && yarn ethserver-initial"'
else
	osascript -e 'tell app "Terminal" to do script "cd eth-shop-server && yarn ethserver"'
fi

echo Launching server

osascript -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'
if [ "$1" == "initial" ]; then
	osascript -e 'tell app "Terminal" to do script "cd th-shop-server && yarn install && yarn dev-start"'
else
	osascript -e 'tell app "Terminal" to do script "cd th-shop-server && yarn dev-start"'
fi

echo Launching client

osascript -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'
if [ "$1" == "initial" ]; then
	osascript -e 'tell app "Terminal" to do script "cd eth-shop-client && yarn install && yarn start"'
else
	osascript -e 'tell app "Terminal" to do script "cd eth-shop-client && yarn start"'
fi

echo Done