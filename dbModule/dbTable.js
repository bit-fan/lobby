var db = require('../Server/schema');
var Q = require('q');
var util = require('../util/util');
var app = require('../app');
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
        console.log(queryObj);
        return db.table.find(queryObj);
    }
}
module.exports = {socket: dbTable, dbFunc: dbFunc};