/**
 * http://usejsdoc.org/
 */
var generalConst = require('../Server/const/general');
var allGamesObj = require('../Server/const/games').allGames;
var gameConst = require('../Server/const/games').gameConst
var db = require('../Server/schema');

var func = {};
function resetGameTable(gameId) {
    for (var i = 0; i < generalConst.maxTableInRoom; i++) {
        db.table.update({
            tableId: i, gameId: gameId
        }, {
            players: [],
            tableStatus: "open",
            entryToken: '',
            minPlayer: gameConst[gameId] ? gameConst[gameId].min : 0,
            maxPlayer: gameConst[gameId] ? gameConst[gameId].max : 0,
        }, {
            upsert: true
        }).then()
    }
}
func.initDB = function () {
    for (var i in allGamesObj) {
        console.log('i', i);
        allGamesObj[i].forEach(function (gameObj) {
            resetGameTable(gameObj.id);
        })
    }
}
module.exports = func;