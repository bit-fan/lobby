var Q = require('q');
var crypto = require('crypto');
var os = require('os');

var util = {
    md5: function (string) {
        return crypto.createHash('md5').update(string).digest('hex');
    },
    getIp: function () {
        var ip = [];
        var ifaces = os.networkInterfaces();
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    console.log(ifname + ':' + alias, iface.address);
                    ip.push(iface.address);
                } else {
                    // this interface has only one ipv4 adress
                    console.log(ifname, iface.address);
                    ip.push(iface.address);
                }
                ++alias;
            });
        });
        return ip;
    },
    shuffle: function (array) {
        var temp = [];
        while (array.length > 0) {
            temp.push(array.splice(Math.floor(Math.random() * array.length), 1));
        }
        return temp;
    }
}
util.generateToken = function (leng) {
    var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
        .split("");
    var token = "";
    for (i = 0; i < leng; i++) {
        token += abc[Math.floor(Math.random() * abc.length)];
    }
    return token; // Will return a leng bit "hash"
}

util.init = function () {
    Array.prototype.getKeyItem = function (key, val) {
        var result = [];
        this.forEach(item => {
            if (item && key && item[key] && item[key] == val) {
                result.push(item);
            }
        })
        return result;
    };
    Array.prototype.removeKeyItem = function (key, val) {
        return this.filter(item => {
            return !(item && key && item[key] && item[key] == val)
        })
    }
    Array.prototype.updateKeyItem = function (key, val, updateKey, updateVal) {
        return this.map(item => {
            if (item && item[key] && item[key] == val && updateKey) {
                item[updateKey] = updateVal;
            }
            return item;
        })
    }
}

module.exports = util;