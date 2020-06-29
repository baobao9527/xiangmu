/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'info/notice/list',
    form: g.ctx + 'static/views/info/notice-form.html',
    show: g.ctx + 'info/notice/show',
    del: g.ctx + 'info/notice/del',
    save: g.ctx + 'info/notice/save',
    publish: g.ctx + 'info/notice/publish'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_add').on('click', function () {
        SysNotice.add();
    });
    $('#a_edit').on('click', function () {
        SysNotice.edit();
    });
    $('#a_delete').on('click', function () {
        SysNotice.del();
    });
    $('#a_look').on('click', function () {
        SysNotice.look();
    });
    $('#a_search').on('click', function () {
        SysNotice.searchData();
    });
    $('#a_refresh').on('click', function () {
        SysNotice.refreash();
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
                title: '主键',
                field: 'id',
                width: 150,
                hidden: true
            }, {
                title: '概要',
                field: 'summary',
                width: 150
            }, {
                title: '发布时间',
                field: 'publish_time',
                width: 150
            }, {
                title: '创建时间',
                field: 'create_time',
                width: 150
            }, {
                title: '发布人',
                field: 'publisher',
                width: 150
            }, {
                title: '状态',
                field: 'status',
                width: 150,
                formatter: function (v, d, i) {
                    if (d.status === 1) {
                        return '已发布';
                    } else {
                        return '未发布';
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

var SysNotice = {
    isEdit: false,
    currentActive: null,
    window: null,
    selectedRecord: null,
    showEditWindow: function (isEdit, look) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }
        var contentEditor;

        function initForm() {
            var row = grid.getSelectedRow();

            if (isEdit) {
                $.ajaxjson(url.show, {'id': row.id}, function (rst) {

                    if (rst.status == "OK") {
                        var data = rst.data;
                        if (look) {
                            top.$(':input').attr("disabled", "disabled");
                        }
                        top.$('#noticeform').form('load', formatFormDataJson(data));
                    } else {
                        msg.ok('加载数据失败！');
                        self.window.dialog('close');
                    }
                });
            }
            top.$('#name').focus();
        }

        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 780,
            height: 510,
            href: url.form + '?v=' + Math.random(),
            iconCls: isEdit ? 'icon-edit' : 'icon-add',
            onLoad: function () {
                initForm();
            },
            submit: function () {
                if (top.$('#noticeform').form("validate")) {
                    $.submitForm(top.$('#noticeform'), url.save, function (rst) {
                        self.window.dialog('close');
                        msg.ok('操作成功！');
                        grid.reload();
                        self.currentActive = null;
                    });
                }
                return false;
            }
        });
    },

    add: function () {
        this.showEditWindow();
        return false;
    },

    edit: function () {
        if (grid.getSelectedRow()) {
            var row = grid.getSelectedRows();
            var row_ids = new Array(row.length);

            if (row) {
                for (var i = 0; i < row.length; i++) {
                    row_ids[i] = row[i].id;
                }
                if (row_ids.length != 1) {
                    msg.warning('修改不能选择多行。');
                } else {
                    this.showEditWindow(true);
                }
            }
        } else {
            msg.warning('请选择要修改的行。');
        }
        return false;
    },

    del: function () {
        if (grid.getSelectedRow()) {
            var row = grid.getSelectedRows();
            var row_ids = new Array(row.length);

            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].id;
            }
            layer.confirm('您确认要删除这些公告么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload();
                    } else {
                        msg.warning('删除公告失败!');
                    }
                });
            });
        } else {
            msg.warning("请选择你要删除的行");
        }
        return false;

    },
    look: function () {
        if (grid.getSelectedRow()) {
            var row = grid.getSelectedRows();
            var row_ids = new Array(row.length);

            if (row) {
                for (var i = 0; i < row.length; i++) {
                    row_ids[i] = row[i].id;
                }
                if (row_ids.length != 1) {
                    msg.warning('修改不能选择多行。');
                } else {
                    this.showEditWindow(true, true);
                }
            }
        } else {
            msg.warning('请选择要查看的行。');
        }
        return false;
    },
    refreash: function () {
        grid.reload();
    }
};
