var _gridlist,
    url = {
        list: g.ctx + 'sys/oprlog/list'

    };

$(function () {
    autoResize({dataGrid: '#list', gridType: 'datagrid', callback: grid.bind, height: 0, width: 0});
    $('#a_search').attr('onclick', 'OprlogSys.searchData();');
    $('#a_refresh').attr('onclick', 'OprlogSys.refresh();');

    $('#start_time').datebox({
        editable: false,
        formatter: function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        },
        arser: function (date) {
            return new Date(Date.parse(date.replace(/-/g, "/")));
        }
    });
    $('#end_time').datebox({
        editable: false,
        formatter: function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        },
        arser: function (date) {
            return new Date(Date.parse(date.replace(/-/g, "/")));
        }
    });
});


var grid = {
    bind: function (winSize) {
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载操作日志信息，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'log_id',//主键
            border:false,
            onRowContextMenu: pageContextMenu.createDataGridContextMenu,

            columns: [[
                {title: '操作人', field: 'name', width: 120 },
                {title: '主键', field: 'log_id', width: 120, hidden: true},
                {title: '操作时间', field: 'create_time', width: 190},
                {title: '操作类型', field: 'opr_type', width: 190},
                {title: '操作内容', field: 'opr_content', width: 190},
                {title: 'IP地址', field: 'login_ip', width: 190}

            ]],
            pagination: true,
            pageSize: 20,
            pageList: [20, 10, 30, 50]
        });
    },

    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    },
    search: function () {
        var start = $('#start_time').datebox('getValue');
        var end = $('#end_time').datebox('getValue');
        var time = 'date-' + start + '~' + end;
        _gridlist.datagrid('reload', {'s-msl.create_time-between':time});
    }
};

var OprlogSys = {


    searchData: function () {
        grid.search();
    },
    refresh: function () {
        grid.reload();
    }
};
