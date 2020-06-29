/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

/**
 *
 * @author sog
 * @version 1.0
 */
var moduleGrid, url = {
    list: g.ctx + 'device/home/list',
    del: g.ctx + 'device/home/delete'
}, elements = {
    gridId: '#list'
};

$(function () {

    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_delete').on('click', function(){
        if (grid.getSelectedRow()) {

            var rows = grid.getSelectedRows();
            var row_ids = new Array(rows.length);

            for (var i = 0; i < rows.length; i++) {
                row_ids[i] = rows[i].id;
            }

            top.layer.confirm('您确认要删除这些数据么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                top.layer.close(idx);
                $.ajaxjson(g.ctx + 'device/home/delete', {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        top.layer.msg('删除成功！');
                        grid.reload();
                    } else {
                        top.layer.msg('删除数据失败!');
                    }
                });
            });
        }

        return false;
    })

});

var grid = {
    bind: function (winSize) {
        moduleGrid = $('#list').datagrid({
            toolbar: '#toolbar',
            url: url.list,
            nowrap: false,
            rownumbers: true,
            loadMsg: '正在努力加载中....',
            resizable: true,
            collapsible: false,
            singleSelect: false, //单选
            width: winSize.width,
            height: winSize.height,
            onContextMenu: pageContextMenu.createTreeGridContextMenu,
            idField: 'id',
            border: false,
            sortName: 'dateline',
            sortOrder: 'desc',
            selectOnCheck: true,
            checkOnSelect: true, // onDblClickRow: function (row) {
            //     document.getElementById('a_edit').click();
            // },
            frozenColumns: [[{
                field: "ck",
                checkbox: true
            }, {
                title: '设备ID',
                field: 'device_code',
                width: 150
            }, {
                title: '主键',
                field: 'id',
                hidden: true
            }]],
            columns: [[{
                title: '申请号',
                field: 'code',
                width: 140
            }, {
                title: '创建时间',
                field: 'dateline',
                width: 160
            }, {
                title: '状态',
                field: 'status',
                width: 60,
                formatter: function (v, d, i) {
                    return v ? '已创建' : '已生成';
                }
            }, {
                title: '操作人',
                field: 'username',
                width: 140,
                align: 'center'
            }]],
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 30, 40]
        })
    },
    reload: function () {
        moduleGrid.datagrid('clearSelections').datagrid('reload', {filter: ''});
    },
    getSelectedRow: function () {
        return moduleGrid.datagrid('getSelected');
    },
    getSelectedRows: function () {
        return moduleGrid.datagrid('getSelections');
    }
};


