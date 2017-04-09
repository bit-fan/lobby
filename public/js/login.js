require(['js/init'], function (tool) {
    console.log('tool', tool);
    var skt = new mySocket(tool.io, tool.io(serverIp + ':80'));
    if(!skt){
        skt = new mySocket(tool.io, tool.io(serverLocalIp + ':5728'));
    }
    console.log(tool.io, skt, serverIp);
    // skt.send('login', 23445, function(data) {
    // console.log(data);
    // })

    $('#checkValidPlayerName').on('click', function () {
        var name = $('#signUpID').val();
        skt.send('checkPlayerName', name, function (res) {
            console.log('res', res);
        })
    })
    $('#submitSignUp').on('click', function () {
        var name = $('#signUpID').val();
        var pass = $('#signUpPassword').val();
        console.log(name, pass);
        skt.send('createPlayer', {
            name: name, password: pass
        }, function (res) {
            console.log('res', res);
        })
    })
    $('#submitSignIn').on('click', function () {
        var name = $('#signInID').val();
        var pass = $('#signInPassword').val();
        console.log(name, pass);
        skt.send('signInPlayer', {
            name: name, password: pass
        }, function (res) {
            console.log('res', res);
            $().setCookie('token', res.token, 1);
            $().setCookie('playerId', name, 1);
            $().setCookie('iconHash', res.iconHash, 1);
            $(location).attr('href', res.nextPage);
        })
    })

});
