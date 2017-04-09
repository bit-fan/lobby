require(['js/init'], function (tool) {
    console.log('tool', tool);
    var skt = new mySocket(tool.io, tool.io(serverIp + ':80'));
    if (!skt) {
        skt = new mySocket(tool.io, tool.io(serverLocalIp + ':5728'));
    }
    skt.updateProfile({
        playerId: $().getCookie('playerId'),
        iconHash: $().getCookie('iconHash'),
    })
    console.log(tool.io, skt, serverIp);

    init();
    var gamesArr = [];
    var gameInfo = {};

    function init() {
        skt.send('getAllGames', '', function (lobby) {
            console.log('lobby', lobby);
            gamesArr = Object.keys(lobby);
            console.log('gamesArr', gamesArr);
            drawGamePanel(lobby, '');
        });
        listenTableUpdate();
    }

    function drawGamePanel(data, curLocationArr) {
        $('#gamesDiv');
        $.each(data, (function (gameType, json) {
            console.log(gameType, json);
            var groupPanel = $('<div>', {
                class: 'panel panel-default'
            });
            var panelHeading = $(
                '<div>',
                {
                    class: 'panel-heading panel-heading-sm collapsed',
                    'data-toggle': "collapse", 'data-parent': "#gamesDiv",
                    href: "#" + gameType
                }).tt(gameType);
            var panelContent = $('<div>', {
                id: gameType, class: 'panel-collapse collapse'
            })
            var panelBody = $('<div>', {
                class: 'panel-body'
            });

            $.each(json, function (i, v) {
                console.log(i, v);
                var img = $('<img>', {
                    src: v.img, width: 100, height: 150, gameId: v.id
                });
                var text = $('<label>', {}).tt(v.showLabel);
                var div = $('<div>');
                div.append(img).append(text);
                panelBody.append(div);
            })
            panelContent.append(panelBody);
            groupPanel.append(panelHeading).append(panelContent);
            $('#gamesDiv').append(groupPanel);

        }))
        $('#gamesDiv').on('click', "img", function () {
            console.log($(this));
            var gameId = $(this).attr('gameId');
            $().setCookie('selectGame', gameId, 1);
            skt.updateProfile({
                gameId: gameId
            })
            skt.send('joinGame', {gameId: gameId}, function (res) {
                console.log('res', res);
                gameInfo.maxNumPlayerInTable = res.maxPlayer;
                drawTablePanel();
            })
        })
    }

    function drawTablePanel() {
        // drawMyTableContent();
        getAllGameTable();
    }

    function getAllGameTable() {
        var sendData = {
            query: {
                gameId: $().getCookie('selectGame')
            }
        };
        console.log('sendallTables', sendData);
        skt.send('getQueryTables', sendData, function (allTables) {
            console.log('allTables', allTables);
            drawAllGameTable(allTables.sortKey('tableId', 1));
        })
    }

    function drawAllGameTable(data) {
        $('#allGameTable tbody').html('');
        var playerInTable = false;
        for (var i = 0, l = data.length; i < l; i++) {
            var $tr = $('#tableTr tr').copy();
            $tr.find('.tableIdTd').tt(data[i].tableId);
            $tr.find('.tableStatusTd').tt(data[i].tableStatus);
            // var playerIcons = [];
            var playerIn = null;

            for (var j = 0; j < gameInfo.maxNumPlayerInTable; j++) {
                var item = data[i].players[j] ? data[i].players[j] : {};
                // console.log('data[i].players[j]', data[i].players[j]);
                // data[i].players.forEach(item => {
                var name = item.playerId || '&nbsp;';

                var hash = item.iconHash;
                var isReady = item.isReady;
                var thisPlayerDiv = $('#tablePlayerTd').copy();
                var f = $(thisPlayerDiv).find('canvas')[0]
                $(f).attr('data-jdenticon-hash', hash);
                $(thisPlayerDiv).find('text').html(name);
                if (item.isReady) {
                    $(thisPlayerDiv).addClass('outShadowGreen')
                }
                if (name == $().getCookie('playerId')) {
                    console.log('item.isReady', item.isReady);
                    playerIn = item.isReady ? "Y" : "N";

                    playerInTable = true;
                }
                // console.log('$(thisPlayerDiv)', $(thisPlayerDiv), f);
                $tr.find('.tablePlayerTd').append(thisPlayerDiv);
            }
            if (playerIn) {
                $tr.find('button.tableJoin').addClass('collapse');
                $tr.addClass('keep');
                if (playerIn == 'N') {
                    $tr.find('.playerReady').removeClass('collapse');
                }
                else if (playerIn == 'Y') {
                    $tr.find('.playerNotReady').removeClass('collapse');
                }
            } else {
                $tr.find('button.tableLeave').addClass('collapse');
            }
            // console.log(i, $tr);
            $('#allGameTable tbody').append($tr);
        }
        if (playerInTable) {
            $('#allGameTable tbody tr button.tableJoin').addClass('collapse');
        }
        tool.jdenticon();
        var sendData = {
            query: {
                gameId: $().getCookie('selectGame')
            }
        };
        $('#allGameTable tbody').off('click')
        $('#allGameTable tbody').on('click', function () {
            var className = event.target.className.split(' ');
            var tr = $(event.target).closest('tr');
            var sendKey = '';
            var tableId = tr.eq(0).find('td.tableIdTd').text();
            var sendObj = {
                tableId: tableId, gameId: $().getCookie('selectGame')
            }
            if (className.indexOf('tableJoin') > -1) {
                sendKey = 'tableJoin';
            } else if (className.indexOf('tableLeave') > -1) {
                sendKey = 'tableLeave';
            } else if (className.indexOf('playerReady') > -1) {
                sendKey = 'playerReady';
                sendObj.ready = true;
            } else if (className.indexOf('playerNotReady') > -1) {
                sendKey = 'playerReady';
                sendObj.ready = false;
            } else
                return;
            console.log(this, event, className, tr, tableId, sendKey, sendObj);
            skt.send(sendKey, sendObj, function (retData) {
                console.log(sendKey, retData);
                getAllGameTable();
                if (retData.key == 'tableJoin') {
                    $().setCookie('tableId', retData.tableId, 1);
                } else if (retData.key == 'tableStart') {
                    startTable(retData.gameId, retData.tableId);
                }
            })
        });
    }

    function listenTableUpdate() {
        skt.on('updateTable', function (retData) {
            console.log('newTable', retData);
            if (retData.type == 'player' && retData.gameId == $().getCookie('selectGame')) {
                drawTablePanel();
            } else if (retData.type == 'tableStart' && retData.gameId == $().getCookie('selectGame') && retData.tableId == $().getCookie('tableId')) {
                //open table
                console.log('table starts');
                startTable(retData.gameId, retData.tableId);
            }
        })

    }

    function startTable(gameId, tableId) {
        console.log('tableStart', gameId, tableId);
        skt.send('startTable', {
            gameId: $().getCookie('selectGame'),
            tableId: $().getCookie('tableId')
        }, function (res) {
            var token = res.tableToken;
            console.log(token);
            $().setCookie('tableToken', res.tableToken, 1);
            $(location).attr('href', res.nextPage);
        })
    }

});
