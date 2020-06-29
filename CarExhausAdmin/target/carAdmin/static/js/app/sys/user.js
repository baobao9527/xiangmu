var moduleGrid, url = {
    list: g.ctx + 'sys/user/list',
    formUrl: g.ctx + 'static/views/sys/user-form.html?v=' + Math.random(),
    passwordForm: g.ctx + 'static/views/sys/sys-setpass-form.html',
    usersave: g.ctx + 'sys/user/save',
    show: g.ctx + 'sys/user/show',
    updatepass: g.ctx + 'sys/user/updatepass',
    del: g.ctx + 'sys/user/del'
};

$(function () {

    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_add').on('click', SysUser.add);
    $('#a_edit').on('click', SysUser.edit);
    $('#a_delete').on('click', SysUser.del);
    $('#a_refresh').on('click', SysUser.refreash);
    $('#a_setpass').on('click', SysUser.setPassword);
    $('#a_roleSet').on('click', SysUser.roleUser);

    $('#s_user_type').combobox({
        valueField: 'id',
        textField: 'text',
        data: [{
            "id": 0,
            "text": "全部",
            selected: true
        }, {
            "id": 1,
            "text": "管理员"
        }, {
            "id": 3,
            "text": "代理商用户"
        }],
        onSelect: function (item) {
            if(item.id){

                $('#list').datagrid('load', {
                    's-type': item.id
                });
            } else {
                grid.reload();
            }
        }
    });
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
            treeField: 'name',
            border: false,
            selectOnCheck: true,
            checkOnSelect: true, // onDblClickRow: function (row) {
            //     document.getElementById('a_edit').click();
            // },
            frozenColumns: [[{
                field: "ck",
                checkbox: true
            }, {
                title: '登录账号',
                field: 'name',
                width: 140
            }, {
                title: '手机号码',
                field: 'phone',
                width: 160
            }, {
                title: '主键',
                field: 'id',
                width: 140,
                hidden: true
            }]],
            columns: [[{
                title: '真实姓名',
                field: 'username',
                width: 140
            }, {
                title: '出生年月',
                field: 'birthday',
                width: 140
            }, {
                title: '用户类型',
                field: 'type',
                width: 100,
                formatter: function (v, d, i) {
                    switch (v) {
                        case 1:
                            return '管理员';
                        case 2:
                            return '一般用户';
                        case 3:
                            return '代理商用户';
                        default:
                            return '未知用户'
                    }
                }
            }, {
                title: '性别',
                field: 'gender',
                width: 60,
                formatter: function (v, d, i) {
                    if (d.gender === 1) {
                        return '男';
                    } else {
                        return '女';
                    }
                }
            }, {
                title: '创建时间',
                field: 'create_time',
                width: 160,
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

var SysUser = {

    refreash: function () {
        grid.reload();
    },

    submitForm: function (dialog) {
        var $userform = top.$('#userform');
        if ($userform.validate().form()) {
            if (top.$('#reppassword')) {
                var reppass = top.$('#reppassword').val();
                var password = top.$('#password').val();

                if (reppass != password) {
                    top.layer.msg('两次密码输入不一致,无法保存');
                    return;
                }
            }

            $.submitForm($userform, url.usersave, function (rst) {
                dialog.dialog('close');
                grid.reload();
            });

        }
    },
    bindCtrl: function () {
        top.$('#name').focus();

        top.$('#type').combobox({
            valueField: 'id',
            textField: 'text',
            data: [{
                "id": 1,
                "text": "管理员"
            }, {
                "id": 3,
                "text": "代理商用户",
                "selected": true
            }]
        });

        top.$('#birthday').datebox({
            formatter: function (date) {
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            },
            arser: function (date) {
                return new Date(Date.parse(date.replace(/-/g, "/")));
            }
        });

        top.$('#userform').validate({});
    },
    add: function () {
        var addDialog = top.$.hDialog({
            href: url.formUrl,
            title: '添加用户',
            iconCls: 'icon-tab_add',
            width: 490,
            height: 365,
            onLoad: function () {
                SysUser.bindCtrl();

                top.$('#birthday').datebox({
                    formatter: function (date) {
                        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
                            date.getDate();
                    },
                    arser: function (date) {
                        return new Date(Date.parse(date.replace(/-/g, "/")));
                    }
                });
            },
            submit: function () {
                SysUser.submitForm(addDialog);
                return false;
            }
        });
        return false;
    },
    edit: function () {
        if (grid.getSelectedRow()) {

            var rows = grid.getSelectedRows();

            if (rows.length != 1) {
                top.layer.msg('无法同时对多个用户信息进行修改');
            } else {

                var row = grid.getSelectedRow();

                if (!row) {
                    top.layer.msg('请选择需要修改的用户信息');
                    return;
                }

                var editDailog = top.$.hDialog({
                    href: url.formUrl,
                    title: '修改用户',
                    iconCls: 'icon-tab_edit',
                    width: 490,
                    height: 340,
                    onLoad: function () {

                        SysUser.bindCtrl();

                        top.$('tr.pwd').remove();

                        $.ajaxjson(url.show, {'id': row.id}, function (rst) {

                            if (rst.status == "OK") {
                                var data = rst.data;
                                top.$('#userform').form('load', formatFormDataJson(data));

                            } else {
                                msg.ok('加载数据失败！');
                                editDailog.dialog('close');
                            }
                        });
                    },
                    submit: function () {
                        SysUser.submitForm(editDailog);
                        return false;
                    }
                });
            }
        } else {
            msg.warning('请选择要修改的行。');
            return false;
        }
        return false;
    },
    del: function () {
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
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
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
    },
    setPassword: function () {
        if (grid.getSelectedRow()) {
            var rows = grid.getSelectedRows();

            if (rows.length != 1) {
                top.layer.msg('设置密码不能选择多行。');
            } else {
                var passdialog = top.$.hDialog({
                    title: '重置密码',
                    width: 350,
                    height: 200,
                    href: url.passwordForm,
                    onLoad: function () {
                        var row = grid.getSelectedRow();
                        top.$("#id").val(row.id);
                        top.$("#name").val(row.name);
                    },
                    submit: function () {

                        if (top.$('#setpassform').form("validate")) {
                            var reppass = top.$('#reppass').val();
                            var password = top.$('#password').val();

                            if (reppass == password) {
                                $.submitForm(top.$('#setpassform'), url.updatepass, function (rst) {
                                    passdialog.dialog('close');
                                    grid.reload();
                                });
                            }
                        }
                        return false;
                    }
                });
            }
        } else {
            top.layer.msg("请选择要设置密码的用户");
        }
    }
};

