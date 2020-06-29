/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'fence/record/list'
};

$(function () {
    $('#s_start_date').datebox({
        formatter: function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        },
        arser: function (date) {
            return new Date(Date.parse(date.replace(/-/g, "/")));
        }
    });
    $('#s_end_date').datebox({
        formatter: function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        },
        arser: function (date) {
            return new Date(Date.parse(date.replace(/-/g, "/")));
        }
    });
    $('#a_search').on('click', function () {
        var name = $("#s_name").val();
        var startDate = $("#s_start_date").datebox("getValue") + ' 00:00:00';
        var endDate = $("#s_end_date").datebox("getValue") + " 23:59:59";
        var pams = new Object();
        pams['s-mf.name-LIKE'] = name;
        pams['s-mfr.in_time-BETWEEN'] = startDate + "~" + endDate;
        _gridlist.datagrid('clearSelections').datagrid('reload', pams);
    });
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
    $('#a_refresh').on('click', function () {
        Record.refreash();
    });
});

var grid = {
    bind: function (winSize) {
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载数据，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'id',//主键
            singleSelect: false, //单选
            border: false,
            onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            frozenColumns: [[{
                field: 'ck',
                checkbox: true
            }, {
                title: '车牌号',
                field: 'car_no',
                width: 150
            }]],
            columns: [[{
                title: '触发围栏',
                field: 'name',
                width: 150,
                hidden: true
            }, {
                title: '触发时间',
                field: 'in_time',
                width: 150
            }, {
                title: '离开时间',
                field: 'leavel_time',
                width: 150
            }]],
            pagination: true,
            pageSize: 20,
            pageList: [20, 10, 30, 50]
        });
    },
    getSelectedRows: function () {
        return _gridlist.datagrid('getSelections');
    },
    getSelectedRow: function () {
        return _gridlist.datagrid('getSelected');
    },
    getSelectedRowIds: function () {
        var selecteds = _gridlist.datagrid('getSelections');
        var selectedIds = [];
        for (var i = 0; i < selecteds.length; i++) {
            selectedIds.push(selecteds[i].id);
        }
        return selectedIds;

    },
    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
};

var Record = {
    isEdit: false,
    currentActive: null,
    window: null,
    selectedRecord: null,
    refreash: function () {
        grid.reload();
    }
};
