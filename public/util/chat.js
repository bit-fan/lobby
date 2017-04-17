(function () {
    define([], function () {
        function addNewChat(gametype, addToDom, content) {

            var div = $('<div>').addClass('logLine').html(JSON.stringify(content));
            $(addToDom).append(div);
            var l = $(addToDom).children('.logLine').length;
            if (l > 100) {
                $(addToDom).find('.logLine').slice(0, 2);
            }
            $(addToDom).scrollTop($(addToDom).height());
        };
        var chat = {
            setup: function (socket, ids) {
                ids = ids || {};
                $('#chatLogDiv').height($(window).height());
                socket.off('worldChat');
                socket.on('worldChat', function (content) {
                    console.log('worldChat', content);
                    addNewChat('worldChat', '#worldChatContent', content);
                });
                if (ids.gameId) {
                    socket.off('gameChat');
                    socket.on('gameChat', function (content) {
                        console.log('gameChat', content);
                        addNewChat('gameChat', '#gameChatLogContent', content);
                    });
                }
                if (ids.tableId) {
                    socket.off('tableChat');
                    socket.on('tableChat', function (content) {
                        console.log('tableChat', content);
                        addNewChat('tableChat', '#tableChatLogContent', content);
                    });
                }
                if (ids.playerId) {
                    socket.off('privateChat');
                    socket.on('privateChat', function (content) {
                        console.log('privateChat', content);
                        addNewChat('privateChat', '#privateChatLogContent', content);
                    });
                }
            }
        };
        return chat;
    });
})()