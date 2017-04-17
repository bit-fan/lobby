var express = require('express');
var router = express.Router();
var dbPlayer = require('./../dbModule/dbPlayer');
var dbTable = require('./../dbModule/dbTable');
var dbLobby = require('./../dbModule/lobby');
var Q = require('q');
var app = require('../lobby');
// var player = require('../bin/util/player');
var util = require('./../Server/util/util');
var db = require('./../Server/schema');

/* GET home page. */
function getIp(req) {
    var ip = '';
    if (req) {
        var ip = req.app.get('publicIp');
    } else {
        ip = util.getIp()[0];
    }
    return ip.toString('utf8')
}
router.get('/', function (req, res, next) {
    console.log('cookie', req.cookies);
    var reqCookie = req.cookies;
    // res.cookie('testCookie', '123', {
    // maxAge : 900000,
    // httpOnly : true
    // });
    res.render('login', {
        title: 'Please Login', serverIP: getIp(req), serverLocalIp: getIp()
    });
});
router.get('/lobby', function (req, res, next) {
    var cook = req.cookies;
    console.log('cook', cook)
    if (cook.playerId && cook.token) {
        dbPlayer.dbFunc.getPlayer({
            name: cook.playerId, token: cook.token
        }).then(function (data) {
            console.log('found', data);
            console.log(new Date(data[0].tokenTime).getTime(), new Date().getTime());
            if (new Date(data[0].tokenTime).getTime() >= new Date().getTime()) {
                res.cookie('serverIp', getIp(req), {
                    maxAge: 900000, httpOnly: true
                });
                res.cookie('serverLocalIp', getIp(), {
                    maxAge: 900000, httpOnly: true
                });
                res.render('lobby', {
                    title: 'Lobby'
                });
            }
        })
    }

});
router.get('/playGame', function (req, res, next) {
    console.log(req.param, req.cookies);
    var cookies = req.cookies;
    dbTable.dbFunc.getQueryOneTable({
        gameId: cookies.selectGame,
        entryToken: cookies.tableToken,
        tableId: cookies.tableId
    }).then(
        table => {
            console.log('table', table);
            if (table) {
                res.render('./game/' + cookies.selectGame, {
                    title: cookies.selectGame
                });
            }
        }
    );
})
//test sab
router.get('/saboteur', function (req, res, next) {
    console.log(req.param, req.cookies);
    var cookies = req.cookies;
    var playerArr = [{
        playerId: cookies.playerId,
        iconHash: cookies.iconHash
    }, {playerId: 'test1', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test2', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test3', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test4', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test5', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test6', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test7', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test8', iconHash: util.md5(Date.now().toString())}
        , {playerId: 'test9', iconHash: util.md5(Date.now().toString())}]
    db.table.findOneAndUpdate({gameId: 'saboteur', tableId: cookies.tableId}, {
        players: playerArr
    }, {new: true}).then(
        () => {
            Q.resolve(dbLobby.dbFunc.setupTable('saboteur', cookies.tableId, util.generateToken()))
                .then(
                    game => {
                        console.log('game', game);
                        res.render('./game/saboteur', {
                            title: 'saboteur'
                        });
                    }
                );
        })
})
//test sab


module.exports = router;
