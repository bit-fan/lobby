function mySocket(io, http) {
    this.io = io;
    this.socket = io.connect(http);
    this.profile = {};
}
mySocket.prototype.updateProfile = function (data) {
    this.profile = $.extend(true, this.profile, data);
}
mySocket.prototype.send = function (key, data, success, fail) {
    data = data || {};
    data.profile = this.profile;
    this.socket.emit(key, data);
    this.socket.once('_' + key, function (a) {
        console.log('heard', '_' + key, a);
        if (a.status == 200) {
            success ? success.call(this, a.data) : '';
        } else {
            fail ? fail.call(this, a) : '';
        }
    })
}
mySocket.prototype.on = function (key, func) {
    this.socket.off(key);
    this.socket.on(key, function (a) {
        func.call(this, a);
    })
}
mySocket.prototype.createGameSocket = function (gameId, tableId, funcObj) {
    var self = this;
    funcObj = funcObj || {};
    this.handleSucFunc = {};
    this.handleFailFunc = {};

    function generateToken(leng) {
        var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
            .split("");
        var token = "";
        for (i = 0; i < leng; i++) {
            token += abc[Math.floor(Math.random() * abc.length)];
        }
        return token; // Will return a leng bit "hash"
    }

    function res(res) {
        console.log('res', res);
        var funcIden = res.token;
        if (res.tableId != tableId) {
            return;
        }
        if (funcIden == 'brodcast') {
            self.handleSucFunc[res.key] ? self.handleSucFunc[res.key].call(this, res.data) : '';
        } else if (res.status == 200) {
            self.handleSucFunc[funcIden] ? self.handleSucFunc[funcIden].call(this, res.data) : '';
            delete self.handleSucFunc[funcIden];
        } else {
            self.handleFailFunc[funcIden] ? self.handleFailFunc[funcIden].call(this, res.data) : '';
            delete self.handleFailFunc[funcIden]
        }
    }

    self.socket.off(gameId + '_log');
    $('#gameSystemLogContent').html('');
    self.socket.on(gameId + '_log', function (logData) {
        console.log('key', logData);
        var newLine = $('<div>').addClass('logLine').html(JSON.stringify(logData));
        $('#gameSystemLogContent').append(newLine);
        if (funcObj[gameId + '_log']) {
            funcObj[gameId + '_log'].call(this, logData);

        }
    });

    self.socket.on('_' + gameId, res);
    var gameSkt = {
        send: function (key, data, success, fail) {
            var sendObj = this;
            var funcIden = generateToken(32);
            self.handleSucFunc[funcIden] = success;
            self.handleFailFunc[funcIden] = fail;
            var sendData = {
                gameKey: key,
                data: data,
                tableId: tableId,
                token: funcIden
            }
            sendData.data.profile = self.profile;
            console.log('sent', sendData);
            self.socket.emit(gameId, sendData);
        },
        listen: function (key, func) {
            self.handleSucFunc[key] = func;
        }

    }

    return gameSkt;
}