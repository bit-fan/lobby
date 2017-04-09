/**
 * http://usejsdoc.org/
 */
(function () {
    define(
        ['../util/jQueryUtil', '../util/mySocket', '../lib/socket.io.min', '../lib/jdenticon-1.4.0.min', '../util/chat'],
        function (jU, mySoc, io, jdenticon, chat) {

            $('body').ttRefresh();

            return {
                skt: mySoc,
                io: io,
                j$: jU,
                jdenticon: jdenticon,
                chat: chat
            }
        })
})()