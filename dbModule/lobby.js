/**
 * http://usejsdoc.org/
 */
var db = require('../Server/schema');
var Q = require('q');
var util = require('../Server/util/util');
var app = require('../lobby');
var sockFunc = require('../Server/util/socketHandler');
const allGameObj = require('../Server/const/games').allGames;
const gameConst = require('../Server/const/games').gameConst;
util.init();

var dbFunc = {
    checkTableReady: function (tableInfo) {
        var players = tableInfo.players;
        if (players.length < tableInfo.minPlayer || players.length > tableInfo.maxPlayer) {
            return false;
        }
        var allReady = true;
        players.forEach(player => {
            if (!player.isReady) {
                allReady = false;
            }
        })
        return allReady;
    },
    setupTable: function (gameId, tableId) {
        var token = util.generateToken(20);
        return db.table.findOneAndUpdate({gameId: gameId, tableId: tableId}, {
            entryToken: token,
            tableStatus: "starting"
        }, {new: true}).then(
            table => {
                var entryFuncString = './' + gameConst[gameId].entry;
                var module = require(entryFuncString);
                module.dbFunc.initTable(tableId, table.players, token);
            }
        )
    }
}
var socket = {
    getAllGames: function (req, socket) {
        var playerId = req.profile.playerId;
        return allGameObj;
    },
    getAllGame1s: function () {
        var token = util.generateToken(32);
        return db.player.findOne({
            name: obj.name, password: obj.password
        })
            .then(function (player) {
                console.log('found', player);
                return db.player.update({
                    _id: player._id
                }, {new: true})
                    .then(function (ok) {
                        console.log('ok', ok);
                        return {nextPage: '/lobby', token: ok.token};
                    })
            })

    },
    joinGame: function (req, socket) {
        console.log('req', req);
        var playerId = req.profile.playerId;
        // sockFunc.updateUsr('game', socket.id, playerId, req.gameId);
        return {
            gameId: req.gameId,
            minPlayer: gameConst[req.gameId].min,
            maxPlayer: gameConst[req.gameId].max
        };
    },
    tableJoin: function (reqData, socket) {
        var gameId = reqData.gameId;
        return db.table.findOne({
            gameId: reqData.gameId,
            tableId: reqData.tableId
        }).lean()
            .then(tableData => {
                console.log(tableData.players);
                var hasPlayer = tableData.players.getKeyItem('playerId', reqData.profile.playerId);
                var lengthValid = tableData.players.length < gameConst[gameId].max;
                if (hasPlayer.length == 0 && lengthValid) {
                    tableData.players.push({
                        'playerId': reqData.profile.playerId,
                        iconHash: reqData.profile.iconHash,
                        isReady: false,
                        socketId: socket.id,
                    });
                    console.log('update', tableData.players);
                    return db.table.update({
                        _id: tableData._id
                    }, {
                        players: tableData.players
                    }).then(result => {
                        console.log(result);
                        socket.broadcast.emit('updateTable', {
                            gameId: reqData.gameId,
                            type: 'player'
                        });
                        return {
                            playerId: reqData.profile.playerId,
                            tableId: reqData.tableId,
                            key: 'tableJoin'
                        };
                    })
                } else {
                    return "table not available";
                }

            })
    },
    tableLeave: function (reqData, socket) {
        var gameId = reqData.gameId;
        return db.table.findOne({
            gameId: reqData.gameId,
            tableId: reqData.tableId
        }).lean()
            .then(tableData => {
                var hasPlayer = tableData.players.getKeyItem('playerId', reqData.profile.playerId);
                if (hasPlayer.length == 1) {
                    tableData.players = tableData.players.removeKeyItem('playerId', reqData.profile.playerId);
                    tableData.players = tableData.players.map(item => {
                        item.isReady = false;
                        return item;
                    })
                    console.log('update', tableData.players);
                    return db.table.update({
                        _id: tableData._id
                    }, {
                        players: tableData.players
                    }).then(result => {
                        console.log(result);
                        socket.broadcast.emit('updateTable', {
                            gameId: reqData.gameId,
                            type: 'player'
                        });
                    })
                } else {
                    return "table not available";
                }

            })
    },
    playerReady: function (reqData, socket) {
        var gameId = reqData.gameId;
        return db.table.findOne({
            gameId: reqData.gameId,
            tableId: reqData.tableId,
            tableStatus: 'open'
        }).lean()
            .then(tableData => {
                if (tableData) {
                    tableData.players.updateKeyItem('playerId', reqData.profile.playerId, 'isReady', reqData.ready);
                    return db.table.findOneAndUpdate({
                        _id: tableData._id
                    }, {
                        players: tableData.players
                    }, {new: true})
                        .then(tableInfo => {
                            socket.broadcast.emit('updateTable', {
                                gameId: reqData.gameId,
                                type: 'player'
                            });
                            var result = dbFunc.checkTableReady(tableInfo);
                            if (result) {
                                return dbFunc.setupTable(reqData.gameId, reqData.tableId).then(() => {
                                    socket.broadcast.emit('updateTable', {
                                        gameId: reqData.gameId,
                                        tableId: reqData.tableId,
                                        type: 'tableStart'
                                    });
                                    return {
                                        playerId: reqData.profile.playerId,
                                        tableId: reqData.tableId,
                                        gameId: reqData.gameId,
                                        key: 'tableStart'
                                    };
                                });
                            } else {
                                return {key: 'playerReady'}
                            }
                        })
                }
            })
    },
    startTable: function (req, socket) {
        return db.table.findOne({
            gameId: req.gameId,
            tableId: req.tableId
        }).then(table => {
            var player = table.players.getKeyItem('playerId', req.profile.playerId);

            var playerId = req.profile.playerId;
            if (player.length == 1) {
                return {nextPage: '/playGame?entryToken=' + table.entryToken, tableToken: table.entryToken};
            }
        })
    }
}
module.exports = {socket: socket, dbFunc: dbFunc};