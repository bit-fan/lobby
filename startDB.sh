#! /bin/bash

scriptDir=$(dirname $0)

mkdir -p ${scriptDir}/DB/dbData

mkdir -p ${scriptDir}/DB/log

killall mongod
killall mongos

mongod --port 27017 --dbpath ${scriptDir}/DB/dbData --fork --maxConns 2000 --logpath ${scriptDir}/DB/log/mongod.log

