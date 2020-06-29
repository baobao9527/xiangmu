/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'car/status/list'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
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
        Status.searchData();
    });
    $('#a_refresh').on('click', function () {
        Status.refreash();
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
                title: '标题',
                field: 'title',
                width: 150
            }]],
            columns: [[{
                title: '车牌号',
                field: 'car_no',
                width: 150
            }, {
                title: '司机姓名',
                field: 'name',
                width: 150
            }, {
                title: '尾气过滤器状态',
                field: 'exhaust_status',
                width: 150,
                formatter: function (v) {
                    if (v == 1) {
                        return '<span style="color:green;">再生开始</span>';
                    } else if (v == 2) {
                        return '<span style="color:gold;">再生成功</span>';
                    } else {
                        return '<span style="color:red;">再生失败</span>';
                    }
                }
            }, {
                title: '汽车状态',
                field: 'car_status',
                width: 150,
                formatter: function (v) {
                    if (v == 1) {
                        return '<span style="color:green;">车辆启动</span>';
                    } else if (v == 2) {
                        return '<span style="color:gold;">车辆停止</span>';
                    } else {
                        return '<span style="color:red;">车辆熄火</span>';
                    }
                }
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

var Status = {
    refreash: function () {
        grid.reload();
    },
    searchData: function () {
        var carNo = $("#car_code").val();
        var startDate = $("#s_start_date").datebox("getValue") + ' 00:00:00';
        var endDate = $("#s_end_date").datebox("getValue") + " 23:59:59";
        $('#list').datagrid({
            url: url.list,
            queryParams: {
                's-mci.car_no-like': carNo,
                's-report_time-BETWEEN': startDate + '~' + endDate
            }
        });
    }
};
