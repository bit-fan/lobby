var db = require('../Server/schema');
var Q = require('q');
var util = require('../Server/util/util');
var app = require('../lobby');
var generalConst = require('../Server/const/general');
// var sock = require('../Util/SocketHandler');

var dbFunc = {
    getQueryOneTable: function (req) {
        return db.table.findOne(req);
    }
}
var dbTable = {
    getQueryTables: function (req) {
        var queryObj = {
            gameId: req.query.gameId
        }
        return db.table.find(queryObj);
    }
}
module.exports = {socket: dbTable, dbFunc: dbFunc};