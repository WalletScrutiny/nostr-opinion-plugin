#!/bin/bash

cd "$(dirname "$0")/.."
. $HOME/.bashrc
. .env
. .env.local

host=$HOST_DOMAIN
name=$HOST_PATH
project=$HOST_PROJECT

echo "current name: $name"

if [ -d "$HOME/www/${name}/${project}" ]; then
    # If both directories exist, run your command here
    echo "Both directories exist"
    cd $HOME/www/${name}/${project}
    nvm install v20
    node -v
    npm -v
    npm i
    npm install esbuild
    sudo systemctl stop ${META_SERVICE}
    sudo /etc/init.d/nginx reload
    sudo systemctl daemon-reload
    sudo systemctl start ${META_SERVICE}

  else
    echo "One or both directories do not exist"
fi

