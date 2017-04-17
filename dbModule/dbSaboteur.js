var db = require('../Server/schema');
var Q = require('q');
var util = require('../Server/util/util');
var app = require('../lobby');
var generalConst = require('../Server/const/general');
var constSab = require('../Server/const/saboteur');
// var sock = require('../Util/SocketHandler');
var dbChatLog = require('../dbModule/dbChatLog');

var dbFunc = {
    initTable: function (tableId, players, token) {
        //shuffle deck,iden,set endCard,seating
        var numPlayer = players.length;
        var idenArr = [];
        var seatNo = [];

        var newTable = {
            players: [],
            curTurn: 0,
            maxhand: constSab.maxHand[numPlayer],
            mapSize: {
                x0: -1,
                x1: 9,
                y0: -3,
                y1: 3,
            },
            cards: [],
            tableId: tableId,
            tableStatus: 'started'
        }
        for (var i = 0; i < numPlayer + 1; i++) {
            if (i < constSab.numSab[numPlayer]) {
                idenArr.push(true)
            } else {
                idenArr.push(false)
            }
            seatNo.push(i + 1);
        }
        seatNo.pop();
        console.log(idenArr, seatNo);
        newTable.players = players.map(item => {
            var iden = idenArr.splice(Date.now() % idenArr.length, 1)[0];
            var seat = seatNo.splice(Date.now() % seatNo.length, 1)[0];
            var newP = {
                playerId: item.playerId,
                iconHash: item.iconHash,
                isSab: iden,
                seatNo: seat,
                status: {W: true, L: true, P: true}
            };
            return newP;
        })
        //init deck
        constSab.deck.forEach(card => {
            var cardObj = {
                cardId: card.cardId,
                img: card.img,
                cardType: card.cardType,
                where: "deck",
                info: {}
            }
            if (card.cardType == 'map') {
                cardObj.info.link = card.link;
                cardObj.info.pass = card.pass;
            }
            for (var count = 0; count < card.count; count++) {
                var temp = JSON.parse(JSON.stringify(cardObj));
                temp.serialNo = newTable.cards.length + 1;
                newTable.cards.push(temp);
            }
        })
        //init position
        var goalYArr = [-2, 0, 2];
        constSab.misc.forEach(card => {
            var cardObj = {
                cardId: card.cardId,
                cardType: card.cardType,
                img: card.img,
                where: "map",
                info: {}
            }
            if (card.cardType == 'start') {
                var temp = Object.assign({}, cardObj);
                temp.info = {
                    x: 0, y: 0,
                    link: [1, 1, 1, 1]
                }
                newTable.cards.push(temp);
            } else if (card.cardType == 'goal') {
                var temp = Object.assign({}, cardObj);
                var th = Date.now() % goalYArr.length;
                var y = goalYArr.splice(th, 1)[0];
                temp.info = {
                    x: 8, y: y,
                    revealed: false
                }
                newTable.cards.push(temp);
            }
        })

        // init player hands
        for (var numCard = 0; numCard < newTable.maxhand; numCard++) {
            for (var player = 0; player < newTable.players.length; player++) {
                // console.log('a new one');
                var a = dbFunc.playerGetCard(newTable.players[player].seatNo, newTable.cards);
                if (a.newCard) {
                    newTable.cards = a.deck;
                } else {
                    //no new card;
                }

            }
        }
        newTable.cards.forEach(card => {
            // if (card.where == 'hand') {
            console.log(card.cardId, card.serialNo, card.info.player, card.where);
            // }
        })
        // console.log('newTable.cards', newTable.cards);
        function save(newTable) {
            console.log('db', db.saboteur);
            if (!db.saboteur) {
                return setTimeout(function () {
                    save(newTable)
                }, 1000);
            }
            var a = new db.saboteur(newTable);
            return a.save().then(function (data) {
                console.log('new saboteur', data);
                return data;
            }, err => {
                console.log('create err', err);
            })
        };

        return save(newTable);

    },

    getTable: function (tableId) {
        return db.saboteur.findOne({tableId: tableId})
    },
    updateTable: function (tableId, newData) {
        return db.saboteur.findOneAndUpdate({tableId: tableId}, newData).exec();
    },
    getCardFromDeck: function (deck) {
        var availDeck = deck.filter(item => {
            return item.where == 'deck';
        });
        if (availDeck && availDeck.length > 1) {
            var rand = Math.floor(Math.random() * availDeck.length);
            return availDeck[rand];
        } else return null;
    },
    playerGetCard: function (seatNo, deck) {
        var startLine = Math.floor(Date.now() + Math.random() * deck.length) % deck.length;
        var found = false, test = (startLine + 1) % deck.length;
        var foundNum = null;
        while (!found && test != startLine) {
            // console.log('teststartLine', test, startLine);
            if (deck[test].where == 'deck') {
                // console.log('before', deck[test]);
                if (!deck[test].info.player) {
                    deck[test].info.player = seatNo;
                } else {
                    // console.log('');
                }
                deck[test].where = 'hand';
                foundNum = deck[test].serialNo;
                // console.log('found', deck[test].cardId, deck[test].serialNo, seatNo);
                // console.log('after', deck[test - 1], deck[test], deck[test + 1]);
                found = true;
            } else {
                test = (test + 1) % deck.length
            }
        }
        return {
            deck: deck, newCard: foundNum
        }
    },
    getSeatNoById: function (players, playerId) {
        var num = null;
        if (players) {
            players.forEach(item => {
                if (item.playerId == playerId) {
                    num = item.seatNo;
                }
            })
        }
        return num;
    }

    ,
    getPlayerObjBySeatNo: function (players, seatNo) {
        var resultArr = players.filter(player => {
            return player.seatNo == seatNo;
        })
        if (resultArr && resultArr.length == 1) return resultArr[0];
        return null;
    }
    ,
    getPlayerObjByPlayerId: function (players, playerId) {
        var resultArr = players.filter(player => {
            return player.playerId == playerId;
        })
        if (resultArr && resultArr.length == 1) return resultArr[0];
        return null;
    }
    ,

    getReversePass: function (pass) {
        return [pass[0], pass[1], pass[4], pass[5], pass[2], pass[3]]
    }
    ,
    getReverseLink: function (link) {
        return [link[2], link[3], link[0], link[1]]
    }
    ,
    generateMap: function (deck) {
        var mapObj = {};
        deck.cards.forEach(node => {
            if (node.where == 'map') {
                var newNode = {
                    link: node.info.isRotate ? dbFunc.getReverseLink(node.info.link) : node.info.link,
                    pass: node.info.isRotate ? dbFunc.getReversePass(node.info.pass) : node.info.pass,
                    x: node.info.x,
                    y: node.info.y,
                    type: node.cardType
                }
                var key = newNode.x + '$' + newNode.y;
                mapObj[key] = newNode;
            }
        })
        return mapObj;
    }
    ,
    getCardBySerialNo: function (num, deck) {
        if (!deck) return null;
        var result = deck.getKeyItem('serialNo', num);
        return result ? result[0] : null;
    }
    ,
    getMapCardSerialNoByMatrix: function (deck, x, y) {
        var resultArr = deck.filter(card => {
            return (card.cardType == 'map' && card.info.where == 'map' && card.info.x == x && card.info.y == y)
        })
        if (resultArr && resultArr.length == 1) return resultArr[0];
        return null;
    }
    ,

    checkNewPathValid: function (newCard, isRotate, map, x, y) {
        if (newCard.cardType != 'map')return false;
        var newCardInfo = {
            link: isRotate ? dbFunc.getReverseLink(newCard.info.link) : newCard.info.link,
            x: x,
            y: y
        }

        function getmatrixKey(x, y) {
            return x + '$' + y
        }

        function checkLink(newLink, map, key, direction) {
            console.log('newLink, map, key, direction', newLink, map, key, direction);
            var node = map[key];
            if (!node) {
                return true
            }
            return newLink == node.link[direction];
        }

        var rightOK = checkLink(newCardInfo.link[0], map, getmatrixKey(x + 1, y), 2);
        var topOK = checkLink(newCardInfo.link[1], map, getmatrixKey(x, y - 1), 3);
        var leftOK = checkLink(newCardInfo.link[2], map, getmatrixKey(x - 1, y), 0);
        var bottomOK = checkLink(newCardInfo.link[3], map, getmatrixKey(x, y + 1), 1);
        return rightOK && topOK && leftOK && bottomOK;
    }
    ,
    /// UPDATE several actions
    addPathCard: function (socket, profile, serialNo, isRotate, targetX, targetY) {
        var tableId = profile.tableId;
        return dbFunc.getTable(tableId).then(tableData => {
            if (tableData) {
                var mapObj = dbFunc.generateMap(tableData);
                var cardObj = dbFunc.getCardBySerialNo(serialNo, tableData.cards);
                if (dbFunc.checkNewPathValid(cardObj, isRotate, mapObj, targetX, targetY)) {
                    return db.saboteur.update({tableId: tableId, 'cards.serialNo': serialNo}, {
                        'cards.$.where': 'map',
                        'cards.$.info.x': targetX,
                        'cards.$.info.y': targetY,
                        'cards.$.info.isRotate': isRotate
                    }).then(done => {
                        return dbFunc.logAction(socket, tableData, tableId, profile.playerId, 'path', targetX + '#' + targetY, null)
                    })
                } else return Q.reject('table not found');
            }
        })
    }
    ,
    playRockFallCard: function (socket, profile, serialNo, targetX, targetY) {
        var tableId = profile.tableId;
        return dbFunc.getTable(tableId).then(tableData => {
            if (tableData) {
                var mapObj = dbFunc.generateMap(tableData.cards);
                var cardObj = dbFunc.getCardBySerialNo(serialNo, tableData.cards);
                var mapCard = dbFunc.getMapCardSerialNoByMatrix(mapObj, targetX, targetY);
                if (cardObj.cardId == 'rockFall' && mapCard) {
                    return db.saboteur.update({tableId: tableId, 'cards.serialNo': serialNo}, {
                        'cards.$.where': 'used',
                        'cards.$.info.isRotate': isRotate
                    }).then(() => {
                        return db.saboteur.update({tableId: tableId, 'cards.serialNo': mapCard.serialNo}, {
                            'cards.$.where': 'removed'
                        })
                    }).then(done => {
                        return dbFunc.logAction(socket, tableData, tableId, profile.playerId, 'rockFall', targetX + '#' + targetY, null)
                    })
                } else return Q.reject('table not found');
            }
        })
    }
    ,
    playToolCard: function (socket, profile, serialNo, targetPlayerId, whichTool) {
        var tableId = profile.tableId;
        return dbFunc.getTable(tableId).then(tableData => {
            if (tableData) {
                var cardObj = dbFunc.getCardBySerialNo(serialNo, tableData.cards);
                var targetPlayer = dbFunc.getPlayerObjByPlayerId(tableData.players, targetPlayerId)
                if (!cardObj || !cardObj.cardType != 'func' || !targetPlayer) return Q.reject('kkk');
                var toAdd = (cardObj.cardId.indexOf('_') > -1) ? true : false;
                if (toAdd && (targetPlayer.status[whichTool] || cardObj.cardId.indexOf(whichTool) == -1)) {
                    return Q.reject('staus invalid');
                }
                if (!toAdd && (!targetPlayer.status[whichTool] || cardObj.cardId.indexOf(whichTool) == -1)) {
                    return Q.reject('staus invalid');
                }
                return db.saboteur.update({tableId: tableId, 'cards.serialNo': serialNo}, {
                    'cards.$.where': 'used',
                }).then(() => {
                    var keyStr = 'players.$.status' + whichTool;
                    var updateData = {};
                    updateData[keyStr] = toAdd;
                    return db.saboteur.update({tableId: tableId, 'players.playerId': targetPlayerId}, updateData)
                }).then(done => {
                    return dbFunc.logAction(socket, tableData, tableId, profile.playerId, toAdd ? 'repairTool' : 'breakTool', whichTool, targetPlayerId)
                })
            }
        })
    }
    ,
    playRevealCard: function (socket, profile, serialNo, y) {
        var tableId = profile.tableId;
        return dbFunc.getTable(tableId).then(tableData => {
            if (tableData || (y !== -2 && y !== 0 && y !== 2)) {
                var mapObj = dbFunc.generateMap(tableData.cards);
                var cardObj = dbFunc.getCardBySerialNo(serialNo, tableData.cards);
                var mapCard = dbFunc.getMapCardSerialNoByMatrix(mapObj, 8, y);
                if (!cardObj || !cardObj.cardId != 'reveal') return Q.reject('kkk');
                return db.saboteur.update({tableId: tableId, 'cards.serialNo': serialNo}, {
                    'cards.$.where': 'used',
                }).then(done => {
                    let position = (y == -2) ? 'top' : (y == 0 ? 'middle' : 'bottom');
                    return dbFunc.logAction(socket, tableData, tableId, profile.playerId, 'reveal', position, null)
                })
            } else return Q.reject();
        })
    }
    ,
    playerDiscardCard: function (socket, profile, serialNo) {
        var tableId = profile.tableId;
        return dbFunc.getTable(tableId).then(tableData => {
            if (tableData) {
                return db.saboteur.update({tableId: tableId, 'cards.serialNo': serialNo}, {
                    'cards.$.where': 'discard',
                }).then(done => {
                    return dbFunc.logAction(socket, tableData, tableId, profile.playerId, 'discard', null, null)
                })
            } else return Q.reject();
        })
    }
    ,
    logAction: function (socket, tableData, tableId, playerId, actionKey, actionStr, target) {
        var newSeatNo = (tableData.curTurn + 1) % tableData.players.length;
        var cardObj = dbFunc.getCardFromDeck(tableData.cards);
        var prom = null;
        var logObj = {
            tableId: tableId,
            playerId: playerId,
            target: target,
            actionKey: actionKey,
            actionStr: actionStr
        };
        if (cardObj) {
            prom = db.saboteur.update({
                tableId: tableId,
                'cards.serialNo': cardObj.serialNo
            }, {
                'cards.$.where': 'player',
                'cards.$.info.player': newSeatNo,
                curTurn: newSeatNo,
            })
        } else {
            prom = db.saboteur.update({
                tableId: tableId
            }, {
                curTurn: newSeatNo,
            })
        }

        return Q.resolve(prom).then(ok => {
            var newRecord = new db.saboteurLog(logObj);
            return newRecord.save()
        })
            .then(function (data) {
                dbChatLog.broadcast('saboteur_log', logObj, socket, tableData.players.map(item => {
                    return item.socketId
                }));
                return data;
            }, err => {
                console.log('create err', err);
            })
    }
    ,
    checkCompletePath: function (map) {
        var pathArr = [{
            x: 0, y: 0, pass: [true, true, true, true, true, true], entry: [true, true, true, true]
        }];
        var result = []
        while (pathArr.length > 0) {
            var node = pathArr.pop();

            if (node.type == 'goal') {
                result.push(node);
            } else {
                var addTop = node.entry[0] && node.pass[3];
                addTop = addTop || (node.entry[2] && node.pass[2]);
                addTop = addTop || (node.entry[3] && node.pass[1]);

                var addLeft = node.entry[0] && node.pass[0];
                addLeft = addLeft || (node.entry[1] && node.pass[2]);
                addLeft = addLeft || (node.entry[3] && node.pass[5]);

                var addBottom = node.entry[0] && node.pass[4];
                addBottom = addBottom || (node.entry[1] && node.pass[1]);
                addBottom = addBottom || (node.entry[2] && node.pass[5]);

                var addRight = node.entry[1] && node.pass[3];
                addRight = addRight || (node.entry[2] && node.pass[0]);
                addRight = addRight || (node.entry[3] && node.pass[4]);

                if (addTop) {
                    var key = x + '$' + (node.y - 1);
                    pathArr.push({
                        x: node.x,
                        y: node.y - 1,
                        pass: map[key].pass,
                        type: map[key].type,
                        entry: [0, 0, 0, true]
                    })
                }

                if (addLeft) {
                    var key = x - 1 + '$' + y;
                    pathArr.push({
                        x: node.x - 1,
                        y: node.y,
                        pass: map[key].pass,
                        type: map[key].type,
                        entry: [true, 0, 0, 0]
                    })
                }
                if (addBottom) {
                    var key = x + '$' + (y + 1);
                    pathArr.push({
                        x: node.x,
                        y: node.y + 1,
                        pass: map[key].pass,
                        type: map[key].type,
                        entry: [0, true, 0, 0]
                    })
                }
                if (addRight) {
                    var key = x + 1 + '$' + y;
                    pathArr.push({
                        x: node.x + 1,
                        y: node.y,
                        pass: map[key].pass,
                        type: map[key].type,
                        entry: [0, 0, true, 0]
                    })
                }
            }
        }
    }
}
var dbSaboteur = {
    playerAction: function (reqData, socket) {
        console.log('reqData', reqData);
        var actionType = reqData.actionType;
        switch (actionType) {
            case 'addPath':
                return dbFunc.getTable(reqData.profile.tableId).then(tableData => {
                    var map = dbFunc.generateMap(tableData);
                    var cardObj = dbFunc.getCardBySerialNo(reqData.cardSerialNo, tableData.cards);
                    var isValid = dbFunc.checkNewPathValid(cardObj, reqData.isRotate, map, reqData.targetX, reqData.targetY);
                    if (isValid) {
                        return dbFunc.addPathCard(socket, reqData.profile, reqData.cardSerialNo, reqData.isRotate, reqData.targetX, reqData.targetY)
                    }
                })
                break;
            case 'rockFall':
                return dbFunc.playRockFallCard(socket, reqData.profile, reqData.serialNo, reqData.targetX, reqData.targetY)
                break;
            case 'tool':
                return dbFunc.playToolCard(socket, reqData.profile, reqData.cardSerialNo, reqData.targetPlayerId, reqData.whichTool)
            case 'reveal':
                return dbFunc.playRevealCard(socket, reqData.profile, reqData.serialNo, reqData.targetY)
                break;
            case 'discard':
                return dbFunc.playerDiscardCard(socket, reqData.profile, reqData.serialNo);
                break;
        }
        return {data: 'haha'};
    },
    getFoundationInfo: function (reqData, socket) {
        return dbFunc.getTable(reqData.profile.tableId).then(fullTable => {
            return db.saboteur.update({
                tableId: reqData.profile.tableId,
                'players.playerId': reqData.profile.playerId
            }, {
                'players.$.socketId': reqData.profile.socketId,
            }).then(done => {
                return constSab;
            })
        })

    },
    getPlayHandData: function (reqData) {
        return dbFunc.getTable(reqData.profile.tableId).then(fullTable => {
            var cards = fullTable.cards.filter(item => {
                var valid = false;
                if (item.where == 'hand') {
                    console.log(item.info, item.info.player, dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId));
                    if (item.info.player == dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId)) {
                        valid = true;
                    }
                }
                return valid
            }).map(card => {
                return {
                    cardId: card.cardId,
                    cardType: card.type,
                    serialNo: card.serialNo,
                }
            })
            return {handCards: cards, newCard: fullTable.newCard};
        })
    },
    getCurrentTableInfo: function (reqData) {
        return dbFunc.getTable(reqData.profile.tableId).then(fullTable => {
            var currentTable = {
                players: fullTable.players.map(item => {
                    return {
                        playerId: item.playerId,
                        seatNo: item.seatNo,
                        status: item.status
                    };
                }),
                curTurn: dbFunc.getPlayerObjBySeatNo(fullTable.players, fullTable.curTurn) || {},
                tableId: fullTable.tableId,
                numCardsinDeck: fullTable.cards.filter(item => {
                    return item.where == 'deck'
                }).length,
                cards: fullTable.cards.filter(item => {
                    var valid = false;
                    if (item.where == 'map') {
                        valid = true;
                    } else if (item.where == 'hand') {
                        console.log(item.info, item.info.player, dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId));
                        if (item.info.player == dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId)) {
                            valid = true;
                        }
                    }
                    return valid
                }).map(card => {
                    if (card.cardType == 'goal' && card.info.revealed == false) {
                        return {
                            cardId: 'goalBack',
                            cardType: card.type,
                            where: 'map',
                            info: {
                                x: card.info.x,//if where==map
                                y: card.info.y,//if where==map
                            }
                        }
                    } else {
                        return {
                            cardId: card.cardId,
                            cardType: card.type,
                            where: card.where,//deck,hand,discard,map,removed,used
                            serialNo: card.serialNo,
                            info: {
                                x: card.info.x,//if where==map
                                y: card.info.y,//if where==map
                                link: card.info.link,
                                pass: card.info.pass,
                                isRotate: card.info.isRotate, //if where==map
                            }
                        }
                    }
                })
            };
            return currentTable;
        });
    },
    getTableInfoForPlayer: function (reqData) {
        return dbFunc.getTable(reqData.profile.tableId).then(fullTable => {
            var publicTable = {
                players: fullTable.players.map(item => {
                    return {
                        playerId: item.playerId,
                        iconHash: item.iconHash,
                        seatNo: item.seatNo,
                        status: item.status
                    };
                }),
                curTurn: dbFunc.getPlayerObjBySeatNo(fullTable.players, fullTable.curTurn) || {},
                maxhand: fullTable.maxhand,
                mapSize: fullTable.mapSize,
                tableId: fullTable.tableId,
                tableStatus: fullTable.tableStatus,
                createdTime: fullTable.createdTime,
                numCardsinDeck: fullTable.cards.filter(item => {
                    return item.where == 'deck'
                }).length,
                cards: fullTable.cards.filter(item => {
                    var valid = false;
                    if (item.where == 'map') {
                        valid = true;
                    } else if (item.where == 'hand') {
                        console.log(item.info, item.info.player, dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId));
                        if (item.info.player == dbFunc.getSeatNoById(fullTable.players, reqData.profile.playerId)) {
                            valid = true;
                        }
                    }
                    return valid
                }).map(card => {
                    if (card.cardType == 'goal' && card.info.revealed == false) {
                        return {
                            cardId: 'goalBack',
                            cardType: card.type,
                            where: 'map',
                            info: {
                                x: card.info.x,//if where==map
                                y: card.info.y,//if where==map
                            }
                        }
                    } else {
                        return {
                            cardId: card.cardId,
                            cardType: card.type,
                            where: card.where,//deck,hand,discard,map,removed,used
                            serialNo: card.serialNo,
                            info: {
                                x: card.info.x,//if where==map
                                y: card.info.y,//if where==map
                                link: card.info.link,
                                pass: card.info.pass,
                                isRotate: card.info.isRotate, //if where==map
                            }
                        }
                    }
                })
            };
            return publicTable;
        });
    },
    getFullTableInfo: function () {

    },
    getLog: function (reqData, socket) {
        var from = new Date(reqData.from);
        var tableId = reqData.profile.tableId;
        return db.saboteurLog.find({
            tableId: tableId,
            createdTime: {
                $gte: from
            }
        })
    }
}
module.exports = {socket: dbSaboteur, dbFunc: dbFunc};