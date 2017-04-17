var db = require('../Server/schema');
var Q = require('q');
var util = require('../Server/util/util');
var app = require('../lobby');
var dbPlayer = require('../dbModule/dbPlayer');

var dbChatLog = {
    send: function (req, socket) {
        var newRecord = {
            from: req.profile.playerId,
            type: req.type,
            to: req.to,
            content: req.content
        }
        var a = new db.chatLog(newRecord);
        return a.save().then(function (data) {
            console.log('new chat', data);
            switch (req.type) {
                case 'world':
                    socket.broadcast.emit('newChat', {
                        gameId: reqData.gameId,
                        type: 'world',
                        from: req.profile.playerId,
                        content: req.content
                    });
                    break;
                case 'game':
                    socket.broadcast.room(req.to).emit('newChat', {
                        gameId: reqData.gameId,
                        type: 'game',
                        to: req.to,
                        from: req.profile.playerId,
                        content: req.content
                    });
                    break;
            }
            return data;
        })
    },
    broadcast: function (key, data, socket, socketIds) {
        socketIds.forEach(id => {
            (id == socket.id) ? socket.emit(key, data) : socket.broadcast.to(id).emit(key, data);
        })
        return true
    }
}
module.exports = dbChatLog;