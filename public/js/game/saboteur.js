require(['js/init'], function (tool) {
    console.log('tool', tool);
    var serverIp = $().getCookie('serverIp');
    var serverLocalIp = $().getCookie('serverLocalIp');

    var skt = null;//new mySocket(tool.io, tool.io(serverIp + ':80'));
    if (!skt) {
        skt = new mySocket(tool.io, tool.io(serverLocalIp + ':5728'));
    }

    setupGame();
    function setupGame() {
        if (!skt.socket.connected) {
            return setTimeout(function () {
                setupGame()
            }, 100);
        }
        $().setCookie('socketId', skt.socket.id, 1);
        skt.updateProfile({
            playerId: $().getCookie('playerId'),
            iconHash: $().getCookie('iconHash'),
            tableId: $().getCookie('tableId'),
            socketId: $().getCookie('socketId'),
        })
        tool.chat.setup(skt.socket, {
            playerId: $().getCookie('playerId'),
            tableId: $().getCookie('tableId'),
            gameId: 'saboteur'
        });
        init();

    }


    ///// init some parameters
    var funcObj = {
        'saboteur_log': function (actionData) {
            console.log('actionData', actionData);
            getTableInfoForPlayer();
            switch (actionData.actionKey) {
                case 'addPath':
                    gameData.sound.addPath[0].play();
                    break;
                case 'rockFall':
                    gameData.sound.rockFall[0].play();
                    break;
                case 'reveal':
                    gameData.sound.reveal[0].play();
                    break;
                case 'repairTool':
                    gameData.sound.addPath[0].play();
                    break;
                case 'breakTool':
                    if (actionData.actionStr == 'pick') {
                        gameData.sound.breakPick[0].play();
                    } else if (actionData.actionStr == 'lantern') {
                        gameData.sound.breakLantern[0].play();
                    } else if (actionData.actionStr == 'wagon') {
                        gameData.sound.breakWagon[0].play();
                    }
                    break;
                case 'discard':
                    gameData.sound.addPath[0].play();
                    break;

            }
        }
    }
    var gameSkt = skt.createGameSocket('saboteur', $().getCookie('tableId'), funcObj);
    var fondationData = {cardInfo: {}};
    var gameData = {
        map: {}, currentAction: {}, curTurn: null, isCardRotate: {},
        sound: {
            addPath: $('<audio>', {src: 'src/sound/saboteur/addPath.mp3'}),
            breakLantern: $('<audio>', {src: 'src/sound/saboteur/breakLantern.mp3'}),
            breakPick: $('<audio>', {src: 'src/sound/saboteur/breakPick.mp3'}),
            breakWagon: $('<audio>', {src: 'src/sound/saboteur/breakWagon.mp3'}),
            repairTool: $('<audio>', {src: 'src/sound/saboteur/repairTool.mp3'}),
            reveal: $('<audio>', {src: 'src/sound/saboteur/reveal.mp3'}),
            rockFall: $('<audio>', {src: 'src/sound/saboteur/rockFall.mp3'}),
            discard: $('<audio>', {src: 'src/sound/saboteur/discard.mp3'}),
            // $(au)[0].play();
        }
    };
    const imgPrefix = 'src/img/saboteur/';


    function init() {
        getFoundationData(getTableInfoForPlayer);
        $('#gamePanel').on('click', 'img.idenIcon', function (event) {
            if (gameData.currentAction.choosingOtherPlayer) {
                return true;
            }
            var player = $(this).attr('playerId');
            console.log(player);
            if (player && fondationData && player != $().getCookie('playerId')) {
                fondationData.players[player].guessSab = fondationData.players[player].guessSab || 0;
                fondationData.players[player].guessSab = (fondationData.players[player].guessSab + 1) % 3
                drawPlayer(fondationData.players[player]);
            }
        })
        //listen server update
        // gameSkt.listen('saboteur_log', function (actionData) {
        //     console.log('actionData', actionData);
        //     getTableInfoForPlayer();
        //     switch (actionData.actionKey) {
        //         case 'addPath':
        //             gameData.sound.addPath[0].play();
        //             break;
        //         case 'rockFall':
        //             gameData.sound.rockFall[0].play();
        //             break;
        //         case 'reveal':
        //             gameData.sound.reveal[0].play();
        //             break;
        //         case 'repairTool':
        //             gameData.sound.addPath[0].play();
        //             break;
        //         case 'breakTool':
        //             if (actionData.actionStr == 'pick') {
        //                 gameData.sound.breakPick[0].play();
        //             } else if (actionData.actionStr == 'lantern') {
        //                 gameData.sound.breakLantern[0].play();
        //             } else if (actionData.actionStr == 'wagon') {
        //                 gameData.sound.breakWagon[0].play();
        //             }
        //             break;
        //         case 'discard':
        //             gameData.sound.addPath[0].play();
        //             break;
        //
        //     }
        // });

        //player confirm and submit action
        $('#gamePanel').on('click', '#submitActionBtn', function () {
            $().removeClass('boxShadowAniRed boxShadowAniGreen');
            sendPlayerAction(gameData.actionData.type, gameData.actionData, function (res) {
                $('#submitActionBtn').addClass('collapse');
                $('#discardBtn').addClass('collapse');
                $('rotateBtn').addClass('collapse');
                getTableInfoForPlayer();
            })
        })

        //discard
        $('#myhand').off('click', '#discardBtn');
        $('#myhand').on('click', '#discardBtn', function (event) {
            gameData.actionData.type = 'discard';
            return true;
        })

        //show card preview
        $('#gamePanel').on('click', '[cardId]', function () {
            var cardId = $(this).attr('cardId');
            if (fondationData.cardInfo && fondationData.cardInfo[cardId]) {
                $('#cardPreview').removeClass('collapse');
                $('#cardPreview').attr('src', imgPrefix + fondationData.cardInfo[cardId].img).stop().fadeIn(0).delay(1000).fadeOut(300);
            }

            return true;
        })
        //choose my action card
        $('#myCards').on('click', '.myCard', function (event) {
            // if (gameData.currentAction.choosingSrcCard) {
            var cardId = $(this).attr('cardId');

            $('#myCards').find('.boxShadowAniRed').removeClass('boxShadowAniRed');
            $(this).addClass('boxShadowAniRed')
            console.log('cardId', cardId, fondationData.cardInfo[cardId]);
            var cardInfo = fondationData.cardInfo[cardId] || {};
            var serialNo = $(this).attr('serialNo');
            if (cardInfo.cardType == 'map') {
                var linkArr = gameData.isCardRotate[serialNo] ? getRotateLinkArr(cardInfo.link) : cardInfo.link;
                var passArr = gameData.isCardRotate[serialNo] ? getRotatePassArr(cardInfo.pass) : cardInfo.pass;
                if (linkArr && passArr) {
                    if (linkArr[0] == linkArr[2] && linkArr[1] == linkArr[3] &&
                        passArr[2] == passArr[4] && passArr[3] == passArr[5]) {
                        $('#rotateBtn').addClass('collapse');
                    } else {
                        $('#rotateBtn').removeClass('collapse');
                    }
                }
            } else {
                $('#rotateBtn').addClass('collapse');
            }

            $('#discardBtn').removeClass('collapse');

            gameData.actionData = {cardSerialNo: serialNo, cardId: cardId, cardInfo: cardInfo};
            if (cardId == 'Reveal') {
                gameData.currentAction = {choosingGoalCard: true};
            } else if (cardId == 'RockFall') {
                gameData.currentAction = {chooingPathCard: true};
            } else if (cardInfo.cardType == 'func' && cardId.indexOf('_') > -1) {
                gameData.currentAction = {choosingOtherPlayer: true, tool: cardId[0]};
            } else if (cardInfo.cardType == 'func' && cardId.indexOf('_') == -1) {
                gameData.currentAction = {choosingTool: true, availableTool: cardId};
            } else if (cardInfo.cardType == 'map') {
                gameData.actionData.isRotate = gameData.isCardRotate[serialNo] || false;
                gameData.currentAction = {chooingEmptyPath: true, linkArr: linkArr};
            } else {
                return true
            }
            return true;
            // }
        })
        //rockfall
        $('#desktop').on('click', '.pathCard', function (event) {
            if (gameData.currentAction.chooingPathCard) {
                var cardId = $(this).attr('cardId');
                console.log($(this).attr('keyStr'));
                var matrix = $(this).attr('keyStr').split('#');
                var targetX = parseInt(matrix[0]) + gameData.mapSize.x0 + 1;
                var targetY = parseInt(matrix[1]) + gameData.mapSize.y0 + 1;
                console.log(targetX, targetY);
                $('#submitActionBtn').removeClass('collapse');
                gameData.actionData.type = 'rockFall';
                gameData.actionData.targetX = targetX;
                gameData.actionData.targetY = targetY;
                $(this).addClass('boxShadowAniGreen');
            }
            return true;
        })
        //addpath
        $('#desktop').on('click', '.emptyPath', function (event) {
            if (gameData.currentAction.chooingEmptyPath) {
                console.log($(this).attr('keyStr'));
                var matrix = $(this).attr('keyStr').split('#');
                var x = parseInt(matrix[0]);
                var y = parseInt(matrix[1]);
                var valid = checkValidPath({
                    x: x,
                    y: y,
                    link: gameData.currentAction.linkArr
                }, gameData.map);
                console.log(x, y, valid);
                $('#desktop').find('.boxShadowAniGreen').removeClass('boxShadowAniGreen');
                $('#desktop').find('.boxShadowAniRed').removeClass('boxShadowAniRed');
                if (valid) {
                    $('#submitActionBtn').removeClass('collapse');
                    gameData.actionData.type = 'addPath';
                    gameData.actionData.targetX = x;
                    gameData.actionData.targetY = y;
                    gameData.actionData.isRotate = gameData.actionData.isRotate || false;
                    $(this).addClass('boxShadowAniGreen');
                } else {
                    $('#submitActionBtn').addClass('collapse');
                    $(this).addClass('boxShadowAniRed')
                }
            }
            return true;
        })
        //repair tool
        $('#gamePanel').on('click', '.otherPlayer .playerStatusIcon', function (event) {
            if (gameData.currentAction.choosingTool) {
                var tool = '';
                if ($(this).hasClass('W')) {
                    tool = 'W'
                } else if ($(this).hasClass('L')) {
                    tool = 'L'
                } else if ($(this).hasClass('P')) {
                    tool = 'P'
                }
                var playerId = $(this).closest('[playerId]').attr('playerId');
                console.log('tool', tool);
                if (gameData.currentAction.availableTool.indexOf(tool) == -1) {
                    console.log('cannot repair this tool');
                } else {
                    $('#submitActionBtn').removeClass('collapse');
                    gameData.actionData.type = 'tool';
                    gameData.actionData.wichTool = tool;
                    gameData.actionData.targetPlayerId = playerId;
                    $(this).addClass('boxShadowAniGreen');
                }
            }
            return true;
        })
        //break tool
        $('#gamePanel').on('click', '.otherPlayer', function (event) {
            if (gameData.currentAction.choosingOtherPlayer) {
                var playerId = $(this).find('img.idenIcon').attr('playerId');
                var playerObj = fondationData.players[playerId];
                if (playerObj && playerObj.status[gameData.currentAction.tool]) {
                    console.log('invalid');
                } else {
                    $('#submitActionBtn').removeClass('collapse');
                    gameData.actionData.type = 'tool';
                    gameData.actionData.targetPlayerId = playerId;
                    $(this).addClass('boxShadowAniGreen');
                }
            }
            return true;
        })
        //reveal
        $('#gamePanel').on('click', '[cardId^=goal]', function (event) {
            if (gameData.currentAction.choosingGoalCard) {
                var cardId = $(this).attr('cardId');
                if (cardId == 'goalBack') {
                    var matrix = $(this).attr('keyStr').split('#');
                    var y = parseInt(matrix[1]) + gameData.mapSize.y0 + 1;
                    $('#submitActionBtn').removeClass('collapse');
                    gameData.actionData.type = 'reveal';
                    gameData.actionData.targetX = 8;
                    gameData.actionData.targetY = y;
                    $(this).addClass('boxShadowAniGreen');
                }
            }
            return true;
        })
        //rotate card
        $('#gamePanel').on('click', '#rotateBtn', function () {
            if (!gameData.actionData.cardSerialNo) return;
            console.log('[serialNo=' + gameData.actionData.cardSerialNo + ']');
            console.log($('#myCards').find('[serialNo=' + gameData.actionData.cardSerialNo + ']'));
            $('#myCards').find('[serialNo=' + gameData.actionData.cardSerialNo + ']').toggleClass('rotate180');
            gameData.isCardRotate[gameData.actionData.cardSerialNo] = !gameData.isCardRotate[gameData.actionData.cardSerialNo];
            gameData.currentAction.linkArr = getRotateLinkArr(gameData.currentAction.linkArr);
            gameData.actionData.isRotate = !gameData.actionData.isRotate;
        });
    }

    function getRotateLinkArr(arr) {
        if (arr && arr.length == 4) {
            return [arr[2], arr[3], arr[0], arr[1]]
        } else return [];
    }

    function getRotatePassArr(arr) {
        if (arr && arr.length == 6) {
            return [arr[0], arr[1], arr[4], arr[5], arr[2], arr[3]]
        } else return [];
    }

    function getFoundationData(callback) {
        gameSkt.send('getFoundationInfo', {}, function (res) {
            console.log('getFoundationInfo', res);
            res.deck.forEach(item => {
                fondationData.cardInfo[item.cardId] = item;
            })
            res.misc.forEach(item => {
                fondationData.cardInfo[item.cardId] = item;
            })
            res.other.forEach(item => {
                fondationData.cardInfo[item.cardId] = item;
            })
            fondationData.maxHand = res.maxHand;
            fondationData.numSab = res.numSab;
            callback.call(this);
        });
    }

    function getCommonTableData() {
        gameSkt.send('getCommonTableData', {}, function (res) {
            gameData.map = [];
            gameData.curTurn = res.curTurn;
            if (res.curTurn == $().getCookie('playerId')) {
                getPlayHandData();
            }
            res.cards.forEach(item => {
                if (item.where == 'map') {
                    var keyStr = item.info.x + '#' + item.info.y;
                    gameData.map[keyStr] = item;
                } else if (item.where == 'hand') {
                    gameData.myHand.push(item);
                }
            })
            drawMap();
        })
    }

    function getPlayHandData() {
        gameSkt.send('getPlayHandData', {}, function (res) {
            gameData.myHand = res.handCards.map(item => {
                return item;
            })
            gameData.newCard = res.newCard;
        });
    }

    function getTableInfoForPlayer() {
        gameSkt.send('getTableInfoForPlayer', {}, function (res) {
            console.log('getTableInfoForPlayer', res);
            gameData.mapSize = res.mapSize;
            gameData.myHand = [];
            gameData.map = [];
            gameData.curTurn = res.curTurn;
            res.cards.forEach(item => {
                if (item.where == 'map') {
                    var keyStr = item.info.x + '#' + item.info.y;
                    gameData.map[keyStr] = item;
                } else if (item.where == 'hand') {
                    gameData.myHand.push(item);
                }
            })
            drawMap();
            $('#gameTile').html('Saboteur in table ' + res.tableId);
            fondationData.players = {};
            var playerPositionOffset = 0;
            res.players.forEach(item => {
                fondationData.players[item.playerId] = item;
                if (item.playerId == $().getCookie('playerId')) {
                    playerPositionOffset = item.seatNo - 1;
                }
            });
            for (var player in fondationData.players) {
                fondationData.players[player].UIseatNo =
                    (fondationData.players[player].seatNo - playerPositionOffset + res.players.length) % res.players.length;
                drawPlayer(fondationData.players[player]);
            }
        });
    }

    function drawMap() {
        if (!gameData || !gameData.mapSize || !gameData.map) {
            return
        }
        var mapDom = $('#desktop');
        $(mapDom).html('');
        // var numRow = gameData.mapSize.y1 - gameData.mapSize.y0 + 1;
        // var numCol = gameData.mapSize.x1 - gameData.mapSize.x0 + 1;
        var cardWidth = Math.floor($('#desktop').innerWidth() / (gameData.mapSize.x1 - gameData.mapSize.x0 + 1)) - 1;
        var cardHeight = Math.floor(cardWidth * 1.2) - 1;//$('#desktop').height() / numRow;
        fondationData.cardWidth = cardWidth;
        fondationData.cardHeight = cardHeight;

        for (var i = gameData.mapSize.y0; i <= gameData.mapSize.y1; i++) {
            for (var j = gameData.mapSize.x0; j <= gameData.mapSize.x1; j++) {
                var keyStr = j + '#' + i;
                var cardId = gameData.map[keyStr] && gameData.map[keyStr].cardId;
                var newDiv = $('<span>', {
                    width: cardWidth,
                    height: cardHeight
                });
                if (cardId) {
                    var src = imgPrefix + fondationData.cardInfo[cardId].img;
                    var newCard = $('<img>', {
                        width: cardWidth,
                        height: cardHeight,
                        src: src,
                        class: 'vTop'
                    }).attr('cardId', cardId).attr('keyStr', keyStr).addClass('pathCard');
                    newCard.toggleClass('rotate180', gameData.map[keyStr].info.isRotate);
                    $(newDiv).append(newCard)
                } else {
                    var empty = $('<div>', {
                        width: cardWidth,
                        height: cardHeight,
                        class: 'inlineBlk'
                    }).addClass('emptyPath').attr('keyStr', keyStr)
                    //.text(i + '#' + j);
                    $(newDiv).append(empty)
                }
                $(mapDom).append(newDiv);
            }
            $(mapDom).append('<br>');
        }
    }

    function drawPlayer(data) {
        console.log('playerData', data);
        var seatNum = data.UIseatNo;

        var box = $('.otherPlayer[seatNo="' + seatNum + '"]').attr('playerId', data.playerId);
        var div = $('#playerHorDiv').copy();
        div.find('.playerIcon').attr('data-jdenticon-hash', data.iconHash);
        var idenSrcStr = '';
        if (data.guessSab == 1) {
            idenSrcStr = fondationData.cardInfo['idSab'].img;
        } else if (data.guessSab == 2) {
            idenSrcStr = fondationData.cardInfo['idDigger'].img;
        } else {
            idenSrcStr = fondationData.cardInfo['idBack'].img;
        }
        // console.log('fondationData', fondationData);
        div.find('img.idenIcon')
            .attr('src', imgPrefix + idenSrcStr)
            .attr('playerId', data.playerId)
            .css('width', fondationData.cardWidth)
            .css('height', fondationData.cardHeight)
        div.find('.playerIcon').attr('data-jdenticon-hash', data.iconHash);
        div.find('.playerId').html(data.playerId);

        var classWagon = data.status.W ? '' : 'fillBlack';
        var classPick = data.status.P ? '' : 'fillBlack';
        var classLantern = data.status.L ? '' : 'fillBlack';
        div.find('img.W').attr('src', imgPrefix + fondationData.cardInfo.wagonIcon.img).addClass(classWagon);
        div.find('img.P').attr('src', imgPrefix + fondationData.cardInfo.pickIcon.img).addClass(classPick);
        div.find('img.L').attr('src', imgPrefix + fondationData.cardInfo.lanternIcon.img).addClass(classLantern);
        box.html('').append(div);
        tool.jdenticon();

        if (seatNum == 1) {
            //draw cards
            $('#myCards').html('');
            console.log('myHand', gameData.myHand);
            gameData.myHand.forEach(card => {
                var cardImg = $('<img>', {src: imgPrefix + fondationData.cardInfo[card.cardId].img})
                    .width(fondationData.cardWidth)
                    .height(fondationData.cardHeight)
                    .addClass('myCard margin-right-5')
                    .attr('serialNo', card.serialNo)
                    .toggleClass('rotate180', gameData.isCardRotate[card.serialNo] || false)
                    .attr('cardId', card.cardId);
                $('#myCards').append(cardImg);
            })
        }
    }

    //example checkValidPath({link:[4],x,y},,gameData.map)
    function checkValidPath(newCardObj, mapObj) {
        var currrentMatr = newCardObj.x + '#' + newCardObj.y;
        var isBoundary = false;
        if (!checkLink(0, -1) || !checkLink(0, 1) || !checkLink(-1, 0) || !checkLink(1, 0)) {
            return false;
        } else return isBoundary;
        function checkLink(x, y) {
            var cardKey = getMatrixKey(currrentMatr, x, y);
            if (mapObj[cardKey]) {
                isBoundary = true;
                if (x == 0 && y == -1) {
                    return newCardObj.link[1] == mapObj[cardKey].info.link[3]
                } else if (x == 0 && y == 1) {
                    return newCardObj.link[3] == mapObj[cardKey].info.link[1]
                } else if (x == 1 && y == 0) {
                    return newCardObj.link[0] == mapObj[cardKey].info.link[2]
                } else if (x == -1 && y == 0) {
                    return newCardObj.link[2] == mapObj[cardKey].info.link[0]
                }
            } else return true;
        }
    }


    function getMatrixKey(current, x, y) {
        if (!current)return null;
        var origin = current.split('#');
        var newX = parseInt(origin[0]) + x;
        var newY = parseInt(origin[1]) + y;
        return newX + '#' + newY;
    }

    function sendPlayerAction(actionType, data, callback) {
        if (!actionType || !data) {
            return;
        }
        var sendObj;
        switch (actionType) {
            case 'addPath':
                sendObj = {
                    cardSerialNo: data.cardSerialNo,
                    targetX: data.targetX,
                    targetY: data.targetY,
                    isRotate: data.isRotate
                };
                break;
            case 'reveal':
                sendObj = {
                    cardSerialNo: data.cardSerialNo,
                    targetY: data.targetY
                };
                break;
            case 'rockFall':
                sendObj = {
                    cardSerialNo: data.cardSerialNo,
                    targetX: data.targetX,
                    targetY: data.targetY
                };
                break;
            case 'tool':
                sendObj = {
                    cardSerialNo: data.cardSerialNo,
                    targetPlayerId: data.targetPlayerId,
                    whichTool: data.wichTool
                };
                break;
            case 'discard':
                sendObj = {
                    cardSerialNo: data.cardSerialNo
                };
                break;
        }
        sendObj.actionType = actionType;
        gameSkt.send('playerAction', sendObj, function (res) {
            callback.call(this, res);
        })
    }
});
