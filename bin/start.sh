#!/bin/bash

#cd "$(dirname "$0")/.."
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v20
. .env
. .env.local

npm i @esbuild/linux-x64
PORT=$PORT NODE_ENV=$NODE_ENV npm run dev

