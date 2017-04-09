var db = {}
db.init = function (mongoose) {
    db.lobby = mongoose.model('Lobby', mongoose.Schema({
        name: {
            type: String, unique: true, required: true
        },
        games: []
    }));

    db.chatLog = mongoose.model('ChatLog', mongoose.Schema({
        from: String,
        to: String,//'world' or gameId or tableId or playerId
        type: String,//'system','world','game','table' or 'player'
        content: String,
        createTime: {type: Date, 'default': Date.now}
    }));

    db.game = mongoose.model('Game', mongoose.Schema({
        name: String, tables: []
    }));

    db.table = mongoose.model('Table', mongoose.Schema({
        players: [{
            playerId: String,
            iconHash: String,
            isReady: Boolean
        }],
        entryToken: String,
        gameId: String,
        tableId: Number,
        tableStatus: String,
        minPlayer: Number,
        maxPlayer: Number,
        createdTime: {type: Date, 'default': Date.now}
    }));
    db.saboteurLog = mongoose.model('SaboteurLog', mongoose.Schema({
        tableId: {type: Number, unique: true, required: true, index: true},
        createdTime: {type: Date, 'default': Date.now},
        playerId: String,
        target: String,
        seatNo: Number,
        actionStr: String,
        actionKey: String,
    }));
    db.saboteur = mongoose.model('Saboteur', mongoose.Schema({
        players: [{
            _id: false,
            playerId: String,
            socketId: String,
            iconHash: String,
            seatNo: Number,
            isSab: Boolean,
            status: {
                L: Boolean,
                P: Boolean,
                W: Boolean
            }
        }],
        curTurn: Number,
        maxhand: Number,
        mapSize: {
            x0: Number,
            x1: Number,
            y0: Number,
            y1: Number,
        },
        cards: [{
            _id: false,
            cardId: String,
            serialNo: Number,
            cardType: String,
            img: String,
            where: String,//deck,hand,discard,map,removed,used
            info: {
                _id: false,
                player: Number,//if where==player
                x: Number,//if where==map
                y: Number,//if where==map
                isRotate: Boolean, //if where==map
                link: [],
                pass: [],
                revealed: Boolean
            }
        }],
        tableId: {type: Number, unique: true, required: true, index: true},
        tableStatus: String,
        createdTime: {type: Date, 'default': Date.now}
    }));

    db.player = mongoose.model('Player', mongoose.Schema({
        name: {
            type: String, unique: true, required: true
        },
        currentStatus: {
            gameId: String,
            tableId: Number,
            isReady: Boolean
        },
        socketId: String,
        iconHash: String,
        pic: String,
        score: Number,
        color: String,
        token: String,
        tokenTime: {type: Date},
        password: {type: String, required: true},
        createdTime: {type: Date, default: Date.now},
        loginTime: {type: Date},

        isLogin: Boolean
    }));
    return db;
}

module.exports = db;