var Q = require('q');
var dbPlayer = require('../dbModule/dbPlayer.js');
var lobby = require('../dbModule/lobby.js');
var dbTable = require('../dbModule/dbTable.js');
var dbSaboteur = require('../dbModule/dbSaboteur.js');
var commonKeyMapping = {}
var gameKeyMapping = {};

var allUsr = {
    games: {},
    table: {},
    player: {}
};
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

// dbSaboteur.dbFunc.initTable('1', [{"playerId" : "Anna",
//     "iconHash" : "97a9d330e236c8d067f01da1894a5438"}, {"playerId" : "Anna1",
//     "iconHash" : "97a9d330e236c8d067f01da1894a5438"}, {"playerId" : "Anna2",
//     "iconHash" : "97a9d330e236c8d067f01da1894a5438"}, {"playerId" : "Anna3",
//     "iconHash" : "97a9d330e236c8d067f01da1894a5438"}],'ghj');

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
        socket.broadcast.emit('playerLeave', allUsr[socket.id]);
        delete allUsr[socket.id];
    });
}
sock.getAllUsr = function () {
    return allUsr;
}
sock.updateUsr = function (type, sockId, playerId, data) {
    console.log('before allUsr', allUsr);
    switch (type) {
        case 'player':
            allUsr.player[sockId] = allUsr.player[sockId] || {};
            allUsr.player[sockId].id = playerId;
            break;
        case 'game':
            var oriGame = allUsr.player[sockId].game;
            if (oriGame) {
                delete allUsr.game[oriGame][sockId];
            }
            allUsr.player[sockId].game = data;
            allUsr.game = allUsr.game || {};
            allUsr.game[data] = allUsr.game[data] || {};
            allUsr.game[data][sockId] = true;
            break;
        case 'table':
            var oriTable = allUsr.player[sockId].table;
            if (oriGame) {
                delete allUsr.table[oriTable][sockId];
            }
            allUsr.player[sockId].table = data;
            allUsr.table[data] = allUsr.table[data] || {};
            allUsr.table[data][sockId] = true;
            break;
    }
    console.log('after allUsr', allUsr);
}
sock.updateAllUsr = function (newUsr) {
    allUsr = newUsr;
}
module.exports = sock;