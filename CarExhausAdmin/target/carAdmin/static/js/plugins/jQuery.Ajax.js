$.ajaxjson = function (url, dataMap, fnSuccess) {
    $.ajax({
        type: "POST",
        url: url,
        data: dataMap,
        dataType: "json",
        beforeSend: function () {
            top.$.hLoading.show();
        },
        complete: function () {
            top.$.hLoading.hide();
        },
        success: fnSuccess
    });
};

$.ajaxGet = function (url, dataMap, fnSuccess) {
    $.ajax({
        type: "GET",
        url: url,
        data: dataMap,
        dataType: "json",
        beforeSend: function () {
            top.$.hLoading.show();
        },
        complete: function () {
            top.$.hLoading.hide();
        },
        success: fnSuccess
    });
};

$.submitForm = function ($form, url, fnSuccess) {
    var options = {
        beforeSubmit: function (formData, jqForm, options) {
            top.$.hLoading.show();
        },
        success: function (rst, statusText) {
            top.$.hLoading.hide();
            if (rst.status == 'OK') {
                fnSuccess(rst.data, rst)
            } else {
                MessageOrRedirect(rst);
            }
        },
        url: url,
        type: 'POST',
        dataType: 'json',
        clearForm: true,
        timeout: 5000
    };
    $form.ajaxSubmit(options);
    return false;
};

$.ajaxtext = function (url, dataMap, fnSuccess) {
    $.ajax({
        type: "POST",
        url: url,
        data: dataMap,
        beforeSend: function () {
            top.$.hLoading.show();
        },
        complete: function () {
            top.$.hLoading.hide();
        },
        success: fnSuccess
    });
};

function autoResize(options) {
    var defaults = {
        width: 6,
        height: 119,
        gridType: 'jqgrid'
    };
    options = $.extend(defaults, options);

    // 第一次调用
    var wsize = getWidthAndHeigh();
    if ($.isFunction(options.callback)) {
        options.callback(wsize);
    }

    // 窗口大小改变的时候
    $(window).resize(function () {
        var size = getWidthAndHeigh(true);
        switch (options.gridType) {
            case "datagrid":
                $(options.dataGrid).datagrid('resize', {width: size.width, height: size.height});
                break;
            case "treegrid":
                $(options.dataGrid).treegrid('resize', {width: size.width, height: size.height});
                break;
            case "jqgrid":
                $(options.dataGrid).jqGrid('setGridHeight', size.height).jqGrid('setGridWidth', wsize.width);
                break;
        }
    });

    // 获取iframe大小
    function getWidthAndHeigh(resize) {
        var windowHeight = 0;
        var widowWidth = 0;
        if (typeof (window.innerHeight) == 'number') {
            windowHeight = window.innerHeight;
            widowWidth = window.innerWidth;
        }
        else {
            if (document.documentElement && document.documentElement.clientHeight) {
                windowHeight = document.documentElement.clientHeight;
                widowWidth = document.documentElement.clientWidth;
            }
            else {
                if (document.body && document.body.clientHeight) {
                    windowHeight = document.body.clientHeight;
                    widowWidth = document.body.clientWidth;
                }
            }
        }

        widowWidth -= options.width;
        windowHeight -= options.height;
        return {width: widowWidth, height: windowHeight};
    }
}

var windowResizeTimeout = null;

function autoLayoutResize(layoutElement, callback) {

    function getWidthAndHeigh() {
        var windowHeight = 0;
        var widowWidth = 0;
        if (typeof (window.innerHeight) == 'number') {
            windowHeight = window.innerHeight;
            widowWidth = window.innerWidth;
        }
        else {
            if (document.documentElement && document.documentElement.clientHeight) {
                windowHeight = document.documentElement.clientHeight;
                widowWidth = document.documentElement.clientWidth;
            }
            else {
                if (document.body && document.body.clientHeight) {
                    windowHeight = document.body.clientHeight;
                    widowWidth = document.body.clientWidth;
                }
            }
        }
        return {width: widowWidth, height: windowHeight};
    }

    function onWindowResize() {
        clearTimeout(windowResizeTimeout);
        windowResizeTimeout = setTimeout(function () {
            var size = getWidthAndHeigh(true);
            $(document.body).height(size.height);
            var height = size.height - 10;
            var width = size.width - 10;
            layoutElement.parent().height(height);

            layoutElement.layout('resize', {
                width: width,
                height: height
            });

            var centerPanel = layoutElement.layout('panel', 'center');
            centerPanel.css('overflow', 'hidden');
            var centerPanelOption = centerPanel.panel('options');
            if (centerPanelOption.title) {
                height -= 28;
            }

            var panel = layoutElement.layout('panel', 'west');
            width -= (panel.outerWidth() + 5);

            var rightPanel = layoutElement.layout('panel', 'east');
            if (rightPanel.length > 0) {
                width -= (rightPanel.outerWidth() + 5);
            }

            callback(width, height);
        }, 10);
    }

    layoutElement.layout({
        border: false,
        fit: true
    });

    //layoutElement.layout('panel', 'west').panel({
    //    onResize: function (width, height) {
    //        onWindowResize();
    //    }
    //});

    onWindowResize();
    $(window).resize(function () {
        onWindowResize();
    });

}


function _StringFormatInline() {
    var txt = this;
    for (var i = 0; i < arguments.length; i++) {
        var exp = new RegExp('\\{' + (i) + '\\}', 'gm');
        txt = txt.replace(exp, arguments[i]);
    }
    return txt;
}

function _StringFormatStatic() {
    for (var i = 1; i < arguments.length; i++) {
        var exp = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        arguments[0] = arguments[0].replace(exp, arguments[i]);
    }
    return arguments[0];
}

if (!String.prototype.format) {
    String.prototype.format = _StringFormatInline;
}

if (!String.format) {
    String.format = _StringFormatStatic;
}

//主要是推荐这个函数。它将jquery系列化后的值转为name:value的形式。
function convertArray(o) {
    var v = {};
    for (var i in o) {
        if (typeof (v[o[i].name]) == 'undefined')
            v[o[i].name] = o[i].value;
        else
            v[o[i].name] += "," + o[i].value;
    }
    return v;
}

/*
 随机字符串
 length : 字符串长度
 */
function randomString(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var size = length || 8;
    var i = 1;
    var ret = "";
    while (i <= size) {
        var max = chars.length - 1;
        var num = Math.floor(Math.random() * max);
        var temp = chars.substr(num, 1);
        ret += temp;
        i++;
    }
    return ret;
}


function MessageOrRedirect(d) {
    if (d) {
        if (d.status == "FORBIDDEN")
            top.$.hLoading.show({
                type: 'hits',
                msg: d.message,
                onAfterHide: function () {
                    top.location.href = g.ctx + "/login";
                },
                timeout: 1000
            });

        else {
            top.$.messager.alert('系统提示', d.message, 'warning');
        }
    }
}