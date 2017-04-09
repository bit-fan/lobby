(function () {
    define(['../util/userLang'], function (langObj) {
        console.log(langObj);
        var curChoice = 1;
        var ju = {};
        $.fn.setLang = function (opt) {
            curChoice = opt == 0 ? 0 : 1;
            $('body').ttRefresh();
        }
        $.fn.tt = function (text) {
            var str = (langObj[text] && langObj[text][curChoice]) ? langObj[text][curChoice] : text;
            $(this).attr('tt', text).text(str);
            return this;
        }

        $.fn.ttRefresh = function () {
            $(this).find("[tt]").each(function (a) {
                var text = $(this).attr('tt');
                var str = (langObj[text] && langObj[text][curChoice]) ? langObj[text][curChoice] : text;
                $(this).text(str);
            })
        }
        $.fn.readyOn = function (args) {
            var dom = $(this);
            if (!dom) {
                return setTimeout($.fn.readyOn(args), 100);
            } else {
                $(dom).off(args);
                $(dom).on(args);
            }
        }
        $.fn.setCookie = function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        $.fn.getCookie = function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
        $.fn.copy = function () {
            return $(this).clone().removeAttr('id').removeClass('collapse');
        }

        Array.prototype.sortKey = function (key, order) {
            order = (order == 1) ? 1 : -1;
            return this.sort(function (a, b) {
                if (!a || !b)
                    return 0;
                if (a[key] > b[key])
                    return order;
                if (a[key] < b[key])
                    return -order;
                return 0;

            })
        }
        return ju;
    });
})()