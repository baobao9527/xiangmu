/**
 * rdiframework-core.js
 * Copyright © RDIFramework.NET V2.9
 */

//页面公共方法
var pageMethod = {
    //绑定页面常用下拉框
    dictBind: function (categoryControl, categoryCode, type) {
        if (categoryControl == '' || categoryCode == '') {
            return false;
        }
        var element = categoryControl;
        if (type) {
            element = $('#' + element);
        } else {
            if (typeof element === 'string') {
                element = top.$('#' + element);
            }
        }
        element.combobox({
            data: top.__dicts[categoryCode],
            valueField: 'code',
            textField: 'name',
            editable: false,
            panelHeight: '240'
        });
        return false;
    },

    getDict: function (category, value) {
        var dicts = top.__dicts[category];
        if (dicts) {
            for (var i = 0; i < dicts.length; i++) {
                var dict = dicts[i];
                if (dict['code'] == value) {
                    if (value == 0) {
                        return '';
                    }
                    return dict['name'];
                }
            }
        }
        return '';
    },
    
    getDicts: function (category) {
        var dicts = top.__dicts[category];
        if (dicts) {
            return dicts;
        }
        return [];
    },
    formJson: function (uicontrol) {
        var o = {};
        var curform = top.$('#' + uicontrol);
        var query = '';
        if (curform) {
            query = curform.serializeArray();
            query = convertArray(query);
            o = JSON.stringify(query);
        }
        return o;
    },
    createParamJson: function (uicontrol, action, keyid) {
        var o = {};
        var curform = top.$('#' + uicontrol);
        var query = '';
        if (curform) {
            query = curform.serializeArray();
            query = convertArray(query);
            o.jsonEntity = JSON.stringify(query);
        }
        o.action = action;
        o.Id = keyid;
        return "json=" + JSON.stringify(o);
    },
    createUiParam: function (uiFormObj) {
        //var a = top.$('#' + uicontrol).serialize();
        var a = uiFormObj.serialize();
        var b = a.replace(/\+/g, " ");   // g表示对整个字符串中符合条件的都进行替换
        b = decodeURIComponent(b);  //对serialize后的内容进行解码
        return b;
    }
};

//页面大小自动调整（主要针对左右布局类型[如用户管理、员工管理等]）
//调用方法1：pageSizeControl.init({gridId:'staffGird',gridType:'datagrid'});
//调用方法2：pageSizeControl.init({gridId:'moduleGrid',gridType:'treegrid'});
var pageSizeControl = {
    init: function (param) {
        if (!param.size) {
            param.size = {
                width: $(window).width(),
                height: $(window).height()
            };
        }
        if (!param.gridType) {
            param.gridType = 'datagrid';
        }
        $('#layout').width(param.size.width - 4).height(param.size.height - 4).layout();
        var center = $('#layout').layout('panel', 'center');
        center.panel({
            onResize: function (w, h) {
                if (param.gridType == 'treegrid') {
                    $('#' + param.gridId)
                        .treegrid('resize', {
                            width: w - 6,
                            height: h - 36
                        });
                } else {
                    $('#' + param.gridId)
                        .datagrid('resize', {
                            width: w - 6,
                            height: h - 36
                        });
                }
            }
        });
    },
    resize: function (size) {
        init({size: size});
        $('#layout').layout('resize');
    }
};

var pageContextMenu = {
    createDataGridContextMenu: function (e, rowIndex, rowData) {
        e.preventDefault();
        var grid = $(this);
        /* grid本身 */
        var rowContextMenu = this.rowContextMenu;
        /* grid上的列头菜单对象 */
        grid.datagrid('unselectAll').datagrid('selectRow', rowIndex);
        if (!rowContextMenu) {
            var tmenu = $('<div style="width:100px;"></div>').appendTo('body');
            //var toolbar = grid.datagrid('getToolbar');
            //var dpanel = $(this).datagrid('getPanel');
            //var toolbar =
            // dpanel.children("div.datagrid-toolbar").children('div').children("a.easyui-linkbutton");
            var toolbar = $('.datagrid-toolbar .easyui-linkbutton');
            var filedHTML = $('<div iconCls="icon-columns"></div>');
            var span = $('<span>翻页控制</span>');
            var spdiv = $('<div></div>');
            for (var i = 0; i < toolbar.length; i++) {
                var btn = $(toolbar[i]).linkbutton('options');
                var btnElement = $(toolbar[i]).linkbutton();
                var c = $(btnElement).attr("onclick");
                $("<div data-options=iconCls:'" + btn.iconCls + "',disabled:" + btn.disabled +
                    " fire='" + c + "',/>").html(btn.text).appendTo(tmenu);
                //$('<div data-options=iconCls:"' + btn.iconCls + '",onclick:' +
                // $(btnElement).attr("onclick") + ',disabled:' + btn.disabled +
                // '/>').html(btn.text).appendTo(tmenu);
            }
            spdiv.append('<div iconCls="pagination-first">首页</div>');
            spdiv.append('<div iconCls="pagination-prev">上一页</div>');
            spdiv.append('<div iconCls="pagination-next">下一页</div>');
            spdiv.append('<div iconCls="pagination-last">末页</div>');
            span.appendTo(filedHTML);
            spdiv.appendTo(filedHTML);
            filedHTML.appendTo(tmenu);
            rowContextMenu = this.rowContextMenu = tmenu.menu({
                onClick: function (item) {
                    var fire = $(item.target)
                        .attr('fire');
                    if (fire) {
                        new Function(fire)(); //eval(fire);
                                              //  eval
                                              // 也是可行的;
                    }
                    var pager = grid.datagrid('getPager')
                                    .pagination('options'); //拿到pager
                    var pagination = $(item.target)
                        .attr('iconCls');
                    var pageNum = 0;
                    var page = pager.total / pager.pageSize; //总行书
                                                             // /
                                                             // 每页显示行数
                                                             // =
                                                             //  总页数
                    page = Math.ceil(page);
                    if (pagination == 'pagination-first') {
                        pageNum = 1;
                    }
                    if (pagination == 'pagination-prev') {
                        pageNum = pager.pageNumber - 1;
                    }
                    if (pagination == 'pagination-next') {
                        pageNum = pager.pageNumber + 1;
                    }
                    if (pagination == 'pagination-last') {
                        pageNum = page;
                    }
                    grid.datagrid('getPager')
                        .pagination('select', pageNum);
                }
            });
        } else {

        }
        rowContextMenu.menu('show', {
            left: e.pageX,
            top: e.pageY
        });

        var itemFirst = rowContextMenu.menu('findItem', '首页');
        var itemPrev = rowContextMenu.menu('findItem', '上一页');
        var itemNext = rowContextMenu.menu('findItem', '下一页');
        var itemLast = rowContextMenu.menu('findItem', '末页');
        rowContextMenu.menu('disableItem', itemFirst.target);
        rowContextMenu.menu('disableItem', itemPrev.target);
        rowContextMenu.menu('disableItem', itemNext.target);
        rowContextMenu.menu('disableItem', itemLast.target);
        var pager = grid.datagrid('getPager').pagination('options'); //拿到pager
        if (pager) {
            var page = pager.total / pager.pageSize; //总行书 / 每页显示行数 =  总页数
            //if(page < 1){    //如果页数小于0  
            //那么页数 = 1 page = 1;    
            //}
            page = Math.ceil(page);
            if (page < 1) {
                page = page + 1;
            }
            if (1 < pager.pageNumber && pager.pageNumber < page) {
                rowContextMenu.menu('enableItem', itemFirst.target);
                rowContextMenu.menu('enableItem', itemPrev.target);
                rowContextMenu.menu('enableItem', itemNext.target);
                rowContextMenu.menu('enableItem', itemLast.target);
            }
            if (page == pager.pageNumber && pager.pageNumber != 1) {
                rowContextMenu.menu('enableItem', itemFirst.target);
                rowContextMenu.menu('enableItem', itemPrev.target);
            }
            if (pager.pageNumber == 1 && page != 1) {
                rowContextMenu.menu('enableItem', itemNext.target);
                rowContextMenu.menu('enableItem', itemLast.target);
            }
        }
    },
    createTreeGridContextMenu: function (e, row) {
        e.preventDefault();
        var grid = $(this);
        /* grid本身 */
        var rowContextMenu = this.rowContextMenu;
        /* grid上的列头菜单对象 */
        //grid.treegrid('unselectAll').treegrid('selectRow', rowIndex);

        grid.treegrid('unselectAll');
        var n = grid.treegrid('find', row.Id);
        if (n) {
            grid.treegrid('select', n.Id);
        }

        if (!rowContextMenu) {
            var tmenu = $('<div style="width:100px;"></div>').appendTo('body');
            //var toolbar = grid.datagrid('getToolbar');
            //var dpanel = $(this).datagrid('getPanel');
            //var toolbar = dpanel.children("div.datagrid-toolbar").children("a.easyui-linkbutton");
            var toolbar = $('.datagrid-toolbar .easyui-linkbutton');
            var filedHTML = $('<div iconCls="icon-columns"></div>');
            var span = $('<span>翻页控制</span>');
            var spdiv = $('<div></div>');
            for (var i = 0; i < toolbar.length; i++) {
                var btn = $(toolbar[i]).linkbutton('options');
                var btnElement = $(toolbar[i]).linkbutton();
                var c = $(btnElement).attr("onclick");
                $("<div data-options=iconCls:'" + btn.iconCls + "',disabled:" + btn.disabled +
                    " fire='" + c + "',/>").html(btn.text).appendTo(tmenu);
                //$('<div
                // data-options=iconCls:"'+btn.iconCls+'",onclick:'+$(btnElement).attr("onclick")+',disabled:'+btn.disabled+'/>').html(btn.text).appendTo(tmenu);
            }
            spdiv.append('<div iconCls="pagination-first">首页</div>');
            spdiv.append('<div iconCls="pagination-prev">上一页</div>');
            spdiv.append('<div iconCls="pagination-next">下一页</div>');
            spdiv.append('<div iconCls="pagination-last">末页</div>');
            span.appendTo(filedHTML);
            spdiv.appendTo(filedHTML);
            filedHTML.appendTo(tmenu);
            rowContextMenu = this.rowContextMenu = tmenu.menu({
                onClick: function (item) {
                    var fire = $(item.target)
                        .attr('fire');
                    if (fire) {
                        new Function(fire)();   //eval(fire);
                                                //  eval
                                                // 也是可行的;
                    }
                    var pager = grid.treegrid('getPager')
                                    .pagination('options');    //拿到pager
                    var pagination = $(item.target)
                        .attr('iconCls');
                    var pageNum = 0;
                    var page = pager.total / pager.pageSize;    //总行书 / 每页显示行数 =  总页数
                    page = Math.ceil(page);
                    if (pagination == 'pagination-first') {
                        pageNum = 1;
                    }
                    if (pagination == 'pagination-prev') {
                        pageNum = pager.pageNumber - 1;
                    }
                    if (pagination == 'pagination-next') {
                        pageNum = pager.pageNumber + 1;
                    }
                    if (pagination == 'pagination-last') {
                        pageNum = page;
                    }
                    grid.treegrid('getPager')
                        .pagination('select', pageNum);
                }
            });
        } else {

        }
        rowContextMenu.menu('show', {
            left: e.pageX,
            top: e.pageY
        });

        var itemFirst = rowContextMenu.menu('findItem', '首页');
        var itemPrev = rowContextMenu.menu('findItem', '上一页');
        var itemNext = rowContextMenu.menu('findItem', '下一页');
        var itemLast = rowContextMenu.menu('findItem', '末页');
        rowContextMenu.menu('disableItem', itemFirst.target);
        rowContextMenu.menu('disableItem', itemPrev.target);
        rowContextMenu.menu('disableItem', itemNext.target);
        rowContextMenu.menu('disableItem', itemLast.target);
        var pager = grid.treegrid('getPager').pagination('options');    //拿到pager
        if (pager) {
            var page = pager.total / pager.pageSize;    //总行书 / 每页显示行数 =  总页数
            //if(page < 1){    //如果页数小于0  
            //那么页数 = 1 page = 1;    
            //}
            page = Math.ceil(page);
            if (page < 1) {
                page = page + 1;
            }
            if (1 < pager.pageNumber && pager.pageNumber < page) {
                rowContextMenu.menu('enableItem', itemFirst.target);
                rowContextMenu.menu('enableItem', itemPrev.target);
                rowContextMenu.menu('enableItem', itemNext.target);
                rowContextMenu.menu('enableItem', itemLast.target);
            }
            if (page == pager.pageNumber && pager.pageNumber != 1) {
                rowContextMenu.menu('enableItem', itemFirst.target);
                rowContextMenu.menu('enableItem', itemPrev.target);
            }
            if (pager.pageNumber == 1 && page != 1) {
                rowContextMenu.menu('enableItem', itemNext.target);
                rowContextMenu.menu('enableItem', itemLast.target);
            }
        }
    }
};

/********
 接收地址栏参数
 **********/
function GetQuery(key) {
    var search = location.search.slice(1); //得到get方式提交的查询字符串
    var arr = search.split("&");
    for (var i = 0; i < arr.length; i++) {
        var ar = arr[i].split("=");
        if (ar[0] == key) {
            if (unescape(ar[1]) == 'undefined') {
                return "";
            } else {
                return unescape(ar[1]);
            }
        }
    }
    return "";
}

/* 
 请求Ajax 带返回值
 */
function getAjax(url, postData, callBack) {
    $.ajax({
        type: 'post',
        dataType: "text",
        url: RootPath() + url,
        data: postData,
        cache: false,
        async: false,
        success: function (data) {
            callBack(data);
            //Loading(false);
        },
        error: function (data) {
            alert("error:" + JSON.stringify(data));
            Loading(false);
        }
    });
}
function AjaxJson(url, postData, callBack) {
    $.ajax({
        url: RootPath() + url,
        type: "post",
        data: postData,
        dataType: "json",
        async: false,
        success: function (data) {
            if (data.Code == "-1") {
                Loading(false);
                alertDialog(data.Message, -1);
            } else {
                Loading(false);
                callBack(data);
            }
        },
        error: function (data) {
            Loading(false);
            alertDialog(data.responseText, -1);
        }
    });
}
/*
 刷新当前页面
 */
/**
 * @return {boolean}
 */
function Replace() {
    location.reload();
    return false;
}
/*
 href跳转页面
 */
/**
 * @return {boolean}
 */
function Urlhref(url) {
    location.href = url;
    return false;
}
/*
 iframe同步连接
 */
function iframe_src(iframe, src) {
    Loading(true);
    $("#" + iframe).attr('src', RootPath() + src);
    $("#" + iframe).load(function () {
        Loading(false);
    });
}
/*
 grid表格扩展Begin
 */

/**获取表格选择行
 **/
function GetJqGridRowIndx(jgrid) {
    return $(jgrid).jqGrid('getGridParam', 'selrow');
}
/**获取JqGrid表格列值
 jgrid：ID，code：列字段
 **/
function GetJqGridRowValue(jgrid, code) {
    var KeyValue = "";
    var selectedRowIds = $(jgrid).jqGrid("getGridParam", "selarrrow");
    if (selectedRowIds != "") {
        var len = selectedRowIds.length;
        for (var i = 0; i < len; i++) {
            var rowData = $(jgrid).jqGrid('getRowData', selectedRowIds[i]);
            KeyValue += rowData[code] + ",";
        }
        KeyValue = KeyValue.substr(0, KeyValue.length - 1);
    } else {
        var rowData = $(jgrid).jqGrid('getRowData', $(jgrid).jqGrid('getGridParam', 'selrow'));
        KeyValue = rowData[code];
    }
    return KeyValue;
}
/**获取JqGrid表格列值
 jgrid：ID，RowIndx:行ID,code：列字段
 **/
function GetJqGridValue(jgrid, RowIndx, code) {
    var rowData = $(jgrid).jqGrid('getRowData', RowIndx);
    return rowData[code];
}

/**grid表格扩展end**/

/**
 格式化时间显示方式、用法:format="yyyy-MM-dd hh:mm:ss";
 */
formatDate = function (v, format) {
    if (!v) {
        return "";
    }
    var d = v;
    if (typeof v === 'string') {
        if (v.indexOf("/Date(") > -1) {
            d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
        } else {
            d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));
        } //.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
    }
    var o = {
        "M+": d.getMonth() + 1,  //month
        "d+": d.getDate(),       //day
        "h+": d.getHours(),      //hour
        "m+": d.getMinutes(),    //minute
        "s+": d.getSeconds(),    //second
        "q+": Math.floor((d.getMonth() + 3) / 3),  //quarter
        "S": d.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format =
                format.replace(RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
/**
 当前时间
 */
function CurrentTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}
/*
 自动获取页面控件值
 */
function GetWebControls(element) {
    var reVal = "";
    $(element).find('input,select,textarea').each(function (r) {
        var id = $(this).attr('id');
        var value = $(this).val();
        var type = $(this).attr('type');
        switch (type) {
            case "checkbox":
                if ($(this).attr("checked")) {
                    reVal += '"' + id + '"' + ':' + '"1",';
                } else {
                    reVal += '"' + id + '"' + ':' + '"0",';
                }
                break;
            default:
                if (value == "") {
                    value = "&nbsp;";
                }
                reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",';
                break;
        }
    });
    reVal = reVal.substr(0, reVal.length - 1);
    return jQuery.parseJSON('{' + reVal + '}');
}
/*
 自动给控件赋值
 */
function SetWebControls(data) {
    for (var key in data) {
        var id = $('#' + key);
        var value = $.trim(data[key]).replace("&nbsp;", "");
        var type = id.attr('type');
        switch (type) {
            case "checkbox":
                if (value == 1) {
                    id.attr("checked", 'checked');
                } else {
                    id.removeAttr("checked");
                }
                $('input').customInput();
                break;
            default:
                id.val(value);
                break;
        }
    }
}
/*
 自动给控件赋值、对Lable
 */
function SetWebLable(data) {
    for (var key in data) {
        var id = $('#' + key);
        var value = $.trim(data[key]).replace("&nbsp;", "");
        id.text(value);
    }
}
/**
 * 获取搜索条件：返回JSON
 * var parameter = GetParameterJson("搜索区域table的ID");
 */
function GetParameterJson(tableId) {
    var parameter = "";
    $("#" + tableId + " tr").find('td').find('input,select').each(function () {
        var pk_id = $(this).attr('id');
        var pk_value = $("#" + pk_id).val();
        parameter += '"' + pk_id + '"' + ':' + '"' + $.trim(pk_value) + '",';
    });
    parameter = parameter.substr(0, parameter.length - 1);
    return '{' + parameter + '}';
}
/**
 * 获取动态table：键、值，返回JSON
 * var GetTableData = GetTableDataJson("table的ID");
 */
function GetTableDataJson(tableId) {
    var item_Key_Value = "";
    var index = 1;
    var trjson = "";
    if ($(tableId + " tbody tr").length > 0) {
        $(tableId + " tbody tr").each(function () {
            var tdjson = "";
            $(this).find('td').find('input,select,textarea').each(function () {
                var pk_id = $(this).attr('id');
                var pk_value = "";
                if ($("#" + pk_id).attr('type') == "checkbox") {
                    if ($("#" + pk_id).attr("checked")) {
                        pk_value = "1";
                    } else {
                        pk_value = "0";
                    }
                } else {
                    pk_value = $("#" + pk_id).val();
                }
                var array = new Array();
                array = pk_id.split("➩"); //字符分割
                tdjson += '"' + array[0] + '"' + ':' + '"' + $.trim(pk_value) + '",';
            });
            tdjson = tdjson.substr(0, tdjson.length - 1);
            trjson += '{' + tdjson + '},';
        });
    } else {
        $(tableId + " tr").each(function () {
            var tdjson = "";
            $(this).find('td').find('input,select,textarea').each(function () {
                var pk_id = $(this).attr('id');
                var pk_value = "";
                if ($("#" + pk_id).attr('type') == "checkbox") {
                    if ($("#" + pk_id).attr("checked")) {
                        pk_value = "1";
                    } else {
                        pk_value = "0";
                    }
                } else {
                    pk_value = $("#" + pk_id).val();
                }
                var array = new Array();
                array = pk_id.split("➩"); //字符分割
                tdjson += '"' + array[0] + '"' + ':' + '"' + $.trim(pk_value) + '",';
            });
            tdjson = tdjson.substr(0, tdjson.length - 1);
            trjson += '{' + tdjson + '},';
        });
    }
    trjson = trjson.substr(0, trjson.length - 1);
    if (trjson == '{}') {
        trjson = "";
    }
    return '[' + trjson + ']';
}
/**
 获取选中复选框值
 值：1,2,3,4
 **/
function CheckboxValue() {
    var reVal = '';
    $('[type = checkbox]').each(function () {
        if ($(this).attr("checked")) {
            reVal += $(this).val() + ",";
        }
    });
    reVal = reVal.substr(0, reVal.length - 1);
    return reVal;
}
/**
 文本框只允许输入数字
 **/
function IsNumber(obj) {
    $("#" + obj).bind("contextmenu", function () {
        return false;
    });
    $("#" + obj).css('ime-mode', 'disabled');
    $("#" + obj).keypress(function (e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });
}
/**
 只能输入数字和小数点
 **/
function IsMoney(obj) {
    $("#" + obj).bind("contextmenu", function () {
        return false;
    });
    $("#" + obj).css('ime-mode', 'disabled');
    $("#" + obj).bind("keydown", function (e) {
        var key = window.event ? e.keyCode : e.which;
        if (isFullStop(key)) {
            return $(this).val().indexOf('.') < 0;
        }
        return (isSpecialKey(key)) || ((isNumber(key) && !e.shiftKey));
    });
    function isNumber(key) {
        return key >= 48 && key <= 57;
    }

    function isSpecialKey(key) {
        return key == 8 || key == 46 || (key >= 37 && key <= 40) || key == 35 || key == 36 ||
            key == 9 || key == 13;
    }

    function isFullStop(key) {
        return key == 190 || key == 110;
    }
}
/**
 * 金额格式(保留2位小数)后格式化成金额形式
 */
function FormatCurrency(num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = "0" + cents;
    }
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num =
            num.substring(0, num.length - (4 * i + 3)) + '' +
            num.substring(num.length - (4 * i + 3));
    }
    return (((sign) ? '' : '-') + num + '.' + cents);
}
//保留两位小数    
//功能：将浮点数四舍五入，取小数点后2位   
function ToDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return 0;
    }
    f = Math.round(x * 100) / 100;
    return f;
}
/**
 查找数组中是否存在某个值
 arr:数组
 val:对象值
 **/
function ArrayExists(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            return true;
        }
    }
    return false;
}

/*打开网页 window.open
 /*url:          表示请求路径
 /*windowname:   定义页名称
 /*width:        宽度
 /*height:       高度
 ---------------------------------------------------*/
function OpenWindow(url, title, w, h) {
    var width = w;
    var height = h;
    var left = ($(window).width() - width) / 2;
    var top = ($(window).height() - height) / 2;
    window.open(RootPath() + url, title,
        'height=' + height + ', width=' + width + ', top=' + top + ', left=' + left +
        ', toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no, titlebar=yes, alwaysRaised=yes');
}

/*
 验证是否为空
 */
function IsNullOrEmpty(str) {
    var isOK = true;
    if (str == undefined || str == "" || str == 'null') {
        isOK = false;
    }
    return isOK;
}

function IsDelData(id) {
    var isOK = true;
    if (id == undefined || id == "" || id == 'null' || id == 'undefined') {
        isOK = false;
        tipDialog('您没有选中任何项,请您选中后再操作。', 4, 'warning');
    }
    return isOK;
}

function IsChecked(id) {
    var isOK = true;
    if (id == undefined || id == "" || id == 'null' || id == 'undefined') {
        isOK = false;
        tipDialog('您没有选中任何项,请您选中后再操作。', 4, 'warning');
    } else if (id.split(",").length > 1) {
        isOK = false;
        tipDialog('很抱歉,一次只能选择一条记录。', 4, 'warning');
    }
    return isOK;
}

/*绑定数据字典下拉框
 ControlId:控件ID
 Code:分类编码
 Memo:默认显示
 */
function BindDropItem(ControlId, CategoryCode, Memo) {
    $(ControlId).html("");
    if (IsNullOrEmpty(Memo)) {
        $(ControlId).append("<option value=''>" + Memo + "</option>");
    }
    getAjax('/Modules/handler/DataItemAdminHandler.ashx?action=GetCategory',
        {categorycode: CategoryCode}, function (data) {
            var itemjson = eval("(" + data + ")");
            $.each(itemjson, function (i) {
                $(ControlId).append(
                    $("<option></option>").val(itemjson[i].Code).html(itemjson[i].FullName));
            });
            Loading(false);
        });
}
/*绑定下拉框
 ControlId:控件ID
 Memo:默认显示
 */
function JsonBindDrop(ControlId, Memo, DataJson) {
    $(ControlId).html("");
    if (IsNullOrEmpty(Memo)) {
        $(ControlId).append("<option value=''>" + Memo + "</option>");
    }
    var DataJson = eval("(" + DataJson + ")");
    $.each(DataJson, function (i) {
        $(ControlId)
            .append($("<option></option>").val(DataJson[i].Code).html(DataJson[i].FullName));
    });
}

//=================动态菜单tab标签========================
//js获取网站根路径(站点及虚拟目录)
function RootPath() {
    var strFullPath = window.document.location.href;
    var strPath = window.document.location.pathname;
    var pos = strFullPath.indexOf(strPath);
    var prePath = strFullPath.substring(0, pos);
    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
    //return (prePath + postPath);如果发布IIS，有虚假目录用用这句
    return (prePath);
}