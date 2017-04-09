var Q = require('q');
var dbPlayer = require('../dbModule/dbPlayer.js');
var lobby = require('../dbModule/lobby.js');
var dbTable = require('../dbModule/dbTable.js');
var dbSaboteur = require('../dbModule/dbSaboteur.js');
var commonKeyMapping = {}
var gameKeyMapping = {};

function addCommonSocketKey(obj) {
    for (var key in obj) {
        // console.log('added', key);
        if (commonKeyMapping[key]) {
            console.error('duplicate socketAction', key, obj[key])
        } else {
            commonKeyMapping[key] = obj[key];
        }
    }
}
function addGameSocketKey(gameKey, socketsObj) {
    gameKeyMapping[gameKey] = {};
    for (var key in socketsObj) {
        if (gameKeyMapping[gameKey][key]) {
            console.error('duplicate socketAction', key, socketsObj[gameKey])
        } else {
            gameKeyMapping[gameKey][key] = socketsObj[key];
        }
    }
}
addCommonSocketKey(dbPlayer.socket);
addCommonSocketKey(lobby.socket);
addCommonSocketKey(dbTable.socket);
addGameSocketKey('saboteur', dbSaboteur.socket);

function addListener(socket, key) {
    socket.on(key, function (req) {
        console.log('received', key, req);
        return Q.resolve(commonKeyMapping[key].call(this, req, socket)).then(function (res) {
            console.log('res', res);
            socket.emit('_' + key, {
                status: 200, data: res
            });
        }, function (error) {
            console.log('error', error);
            socket.emit('_' + key, {
                status: 400, data: error
            });
        });
    })
}

function addGameListener(socket, whichGame) {
    function handleFuncWithToken(gameKey, func, tableId, reqData, socket, token) {
        return Q.resolve(func.call(this, reqData, socket)).then(function (res) {
            console.log('res', res);
            socket.emit('_' + whichGame, {
                status: 200, gameKey: gameKey, token: token, tableId: tableId, data: res
            });
        }, function (error) {
            console.log('error', error);
            socket.emit('_' + whichGame, {
                status: 400, gameKey: gameKey, token: token, tableId: tableId, data: error
            });
        });
    }

    socket.on(whichGame, function (req) {
        console.log('received', req);
        var gameKey = req.gameKey;
        var tableId = req.tableId;
        var reqData = req.data;
        var token = req.token;
        var handleFunc = gameKeyMapping[whichGame][gameKey] || null;
        if (handleFunc) {
            return handleFuncWithToken(gameKey, handleFunc, tableId, reqData, socket, token)
            // return Q.resolve(handleFunc.call(this, reqData, socket)).then(function (res) {
            //     console.log('res', res);
            //     socket.emit('_' + whichGame, {
            //         status: 200, gameKey: gameKey, token: token, data: res
            //     });
            // }, function (error) {
            //     console.log('error', error);
            //     socket.emit('_' + whichGame, {
            //         status: 400, gameKey: gameKey, token: token, data: error
            //     });
            // });
        } else {
            socket.emit('_' + whichGame, {
                status: 401, gameKey: gameKey, token: token
            });
        }
    })
}

var sock = {};

sock.setup = function (io, socket) {
    for (var key in commonKeyMapping) {
        addListener(socket, key);
    }
    for (var gameName in gameKeyMapping) {
        addGameListener(socket, gameName);
    }
    socket.on('disconnect', function () {
        // socket.broadcast.emit('playerLeave', allUsr[socket.id]);
        // delete allUsr[socket.id];
    });
}

module.exports = sock;