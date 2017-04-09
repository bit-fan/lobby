var db = require('../Server/schema');
var Q = require('q');
var util = require('../util/util');
var app = require('../app');
var generalConst = require('../Server/const/general');
var dbFunc = {
    getPlayer: function (query) {
        console.log('query', query);
        return db.player.find(query);
    },
    getPlayerSocketId: function (playerId) {
        return db.player.find({playerId: playerId}).then(
            player => {
                if (player) {
                    return player.socketId
                } else return null
            }
        );
    }
}
var socket = {
    login: function (a) {
        console.log('log', a);
    },

    checkPlayerName: function (a) {
        return db.player.find({
            name: a
        }).then(function (data) {
            console.log(data);
            return data;
        })
    },

    createPlayer: function (obj) {
        console.log('createPlayer', obj);
        obj.iconHash = util.md5(obj.name);
        var a = new db.player(obj);
        return a.save().then(function (data) {
            console.log('new doc', data);
            return data;
        })
    },

    signInPlayer: function (obj, socket) {
        var token = util.generateToken(32);
        return db.player.findOne({
            name: obj.name, password: obj.password
        }).then(function (player) {
            console.log('found', player);
            if (player) {
                return db.player.findOneAndUpdate({
                    _id: player._id
                }, {
                    token: token, isLogin: true, loginTime: new Date(),
                    tokenTime: new Date(new Date().getTime() + generalConst.playerTokenExpireTime),
                    iconHash: util.md5(obj.name),
                    socketId: socket.id
                }, {new: true}).then(function (player) {
                    console.log('player', player);
                    return {nextPage: '/lobby', token: token, iconHash: player.iconHash};
                })
            }
        })

    }

}
module.exports = {socket: socket, dbFunc: dbFunc};