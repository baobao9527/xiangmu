var _gridlist, url = {
    list: g.ctx + 'sys/role/list',
    form: g.ctx + 'static/views/sys/sys-role-form.html',
    permissonForm: g.ctx + 'static/views/sys/permissionBacthSetDialy.html',
    show: g.ctx + 'sys/role/show',
    save: g.ctx + 'sys/role/save',
    del: g.ctx + 'sys/role/del',
    rolePermissionSave: g.ctx + 'sys/role/rolePermissionSave',
    rolePermission: g.ctx + 'sys/role/permissions',
    getUsers: g.ctx + 'sys/role/getUsers',
    getSelectedUsers: g.ctx + 'sys/role/getSelectedUsers',
    set_form: g.ctx + 'static/views/sys/sys-roleSet-form.html'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_add').on('click', RoleSys.add);
    $('#a_edit').on('click', RoleSys.edit);
    $('#a_delete').on('click', RoleSys.del);
    $('#a_refresh').on('click', RoleSys.refreash);
    $('#a_search').on('click', RoleSys.searchData);
    $('#a_roleSet').on('click', RoleSys.roleUser);
    $('#a_setrolemodulepermission').on('click', RoleSys.roleModulePermissionBatchSet);

});

var grid = {
    bind: function (winSize) {
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            // title: "角色管理",
            loadMsg: "正在加载角色管理信息，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'id',//主键

            singleSelect: false,
            selectOnCheck: true,
            checkOnSelect: true,
            border: false,

            onRowContextMenu: pageContextMenu.createDataGridContextMenu, /*onDblClickRow: function (rowIndex, rowData) {
             document.getElementById('a_edit').click();
             },*/
            frozenColumns: [[{
                field: 'ck',
                checkbox: true
            }, {
                title: '编号',
                field: 'code',
                width: 150
            }]],
            columns: [[{
                title: '主键',
                field: 'id',
                width: 120,
                hidden: true
            }, {
                title: '名称',
                field: 'name',
                width: 120
            }, {
                title: '创建人',
                field: 'create_user',
                width: 120
            }, {
                title: '描述',
                field: 'description',
                width: 400
            }

            ]],
            pagination: true,
            pageSize: 20,
            pageList: [10, 20, 30, 50]
        });
    },

    getSelectedRows: function () {
        return _gridlist.datagrid('getSelections');
    },
    getSelectedRow: function () {
        return _gridlist.datagrid('getSelected');
    },
    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
    /*search: function () {
     _gridlist.datagrid('clearSelections').datagrid('reload', {'s-mj.name-like':$('#name').val()});
     }*/
};

var RoleSys = {

    isEdit: false,

    currentActive: null,

    window: null,

    selectedRecord: null,

    userDTOption: {
        width: 255,
        height: 350,
        iconCls: 'icon-users',
        nowrap: false, //折行
        rownumbers: true, //行号
        striped: true, //隔行变色
        idField: 'id', //主键
        singleSelect: true, //单选
        columns: [[{
            title: '',
            field: 'id',
            hidden: true
        }, {
            title: '登录名',
            field: 'name',
            width: 100
        }, {
            title: '用户名',
            field: 'username',
            width: 120
        }]],

        pagination: false,
        pageSize: 10,
        pageList: [10, 20, 40, 50]

    },

    roleUser: function () {

        var currentRole = grid.getSelectedRow();
        var currentRoles = grid.getSelectedRows();
        if (currentRoles.length == 1) {
            var __choiceGrid;
            var rDialog = top.$.hDialog({
                href: url.set_form + '?v=' + new Date().getTime(),
                width: 600,
                height: 500,
                title: '角色用户关联',
                iconCls: 'icon-group_link',
                onLoad: function () {
                    top.$('#rlayout').layout();
                    top.$('#roleName').text(currentRole.name);

                    top.$('#allUsers').datagrid($.extend({}, RoleSys.userDTOption, {
                        url: url.getUsers + '?rows=99999&roleid=' + currentRole.id,
                        onDblClickRow: function (rowIndex, rowData) {
                            top.document.getElementById('aSelectUser').click();
                        }
                    }));

                    __choiceGrid =
                        top.$('#selectedUser').datagrid($.extend({}, RoleSys.userDTOption, {
                            url: url.getSelectedUsers + '?rows=99999&roleid=' + currentRole.id,
                            pagination: false,
                            onDblClickRow: function (rowIndex, rowData) {
                                top.document.getElementById('aDeleteUser').click();
                            }
                        }));
                    top.$('#aSelectUser').click(function () {
                        var _row = top.$('#allUsers').datagrid('getSelected');
                        if (_row) {
                            var hasUserName = false;
                            var users = top.$('#selectedUser').datagrid('getRows');
                            $.each(users, function (i, n) {
                                if (n.name == _row.name) {
                                    hasUserName = true;
                                }
                            });
                            if (!hasUserName) {
                                top.$('#selectedUser').datagrid('appendRow', _row);

                            } else {
                                top.layer.msg('用户已存在，请不要重复添加。');
                                return false;
                            }
                        } else {
                            top.layer.msg('请选择用户');
                        }
                        return false;
                    });
                    top.$('#aDeleteUser').click(function () {
                        var trow = top.$('#selectedUser').datagrid('getSelected');
                        if (trow) {
                            var rIndex = top.$('#selectedUser').datagrid('getRowIndex', trow);
                            top.$('#selectedUser').datagrid('deleteRow', rIndex)
                               .datagrid('unselectAll');

                        } else {
                            top.layer.msg('请选择用户');
                        }
                    });
                },
                submit: function () {
                    var userRows = __choiceGrid.datagrid('getRows');
                    var userIds = [];
                    for (var index = 0; index < userRows.length; index++) {
                        var rowId = userRows[index]['id'];
                        userIds.push(rowId);
                    }

                    $.ajaxjson(g.ctx + 'sys/role/userRoleSave', {
                        'ids': userIds.join(','),
                        roleId: currentRole.id
                    }, function (rst) {
                        if (rst.status == 'OK') {
                            top.layer.msg('角色用户设置成功');
                            rDialog.dialog('close');
                        } else {
                            top.layer.msg('角色用户设置失败');
                        }
                    });

                }
            });
        } else if (currentRoles.length < 1) {
            top.layer.msg('请选择一个角色！');
        } else if (currentRoles.length > 1) {
            top.layer.msg('角色设置仅对单条记录有效！');
        }
        return false;
    },

    roleModulePermissionBatchSet: function () {
        var roleGrid;
        var curRoleModuleIds = [];
        var setDialog = top.$.hDialog({
            title: '角色模块（菜单）权限批量设置',
            width: 670,
            height: 600,
            iconCls: 'icon-group_key',
            href: url.permissonForm + "?n=" + new Date().getTime(),
            onLoad: function () {
                using('panel', function () {
                    top.$('#panelTarget').panel({
                        title: '模块（菜单）',
                        iconCls: 'icon-org',
                        height: $(window).height() - 3
                    });
                });
                roleGrid = top.$('#leftnav').datagrid({
                    title: '所有角色',
                    url: g.ctx + 'sys/role/list?roleres=' + 1,
                    nowrap: false,
                    rownumbers: true,
                    striped: true,
                    idField: 'id',
                    singleSelect: true,
                    frozenColumns: [[]],
                    columns: [[{
                        title: '角色编码',
                        field: 'code',
                        width: 120,
                        align: 'left'
                    }, {
                        title: '角色名称',
                        field: 'name',
                        width: 150,
                        align: 'left'
                    }]],
                    onLoadSuccess: function (data) {
                        top.$('#rightnav').hLoading();
                        var resourceTree = top.$('#rightnav').tree({
                            cascadeCheck: false,
                            checkbox: true,
                            lines: true,
                            url: g.ctx + 'sys/resource/navtree',
                            onSelect: function (node) {
                                top.$('#rightnav').tree('getChildren', node.target);
                            },
                            onCheck: function (node, checked) {
                                if (checked) {
                                    var parentNode = resourceTree.tree('getParent', node.target);
                                    if (parentNode != null) {
                                        resourceTree.tree('check', parentNode.target);
                                    }
                                } else {
                                    var childNode = resourceTree.tree('getChildren', node.target);
                                    if (childNode.length > 0) {
                                        for (var i = 0; i < childNode.length; i++) {
                                            resourceTree.tree('uncheck', childNode[i].target);
                                        }
                                    }
                                }
                            },
                            onLoadSuccess: function (node, data) {
                                //top.$('#rightnav').hLoading.hide()
                            }
                        });
                        top.$('#leftnav').datagrid('selectRow', 0);
                    },
                    onSelect: function (rowIndex, rowData) {
                        curRoleModuleIds = [];
                        $.ajaxtext(url.rolePermission, {id: rowData.id}, function (data) {
                            var moduelTree = top.$('#rightnav');
                            moduelTree.tree('uncheckedAll');
                            if (data == '' || data.toString() == '[object XMLDocument]') {
                                return;
                            }
                            curRoleModuleIds = data.split(',');
                            for (var i = 0; i < curRoleModuleIds.length; i++) {
                                var node = moduelTree.tree('find', curRoleModuleIds[i]);
                                if (node) {
                                    moduelTree.tree("check", node.target);
                                }
                            }
                        });
                    }
                });
            },
            submit: function () {
                var allSelectModuledIds = permissionMgr.getUserSelectedModule();
                //alert(top.$('#leftnav').datagrid('getSelected').id); //角色的id
                //alert(allSelectModuledIds);   //资源的id

                var dataMap = {
                    roleid: top.$('#leftnav').datagrid('getSelected').id,
                    permissions: allSelectModuledIds
                };
                $.ajaxjson(url.rolePermissionSave, dataMap, function (d) {
                    if (d.status == 'OK') {
                        setDialog.dialog('close');
                        msg.ok('设置成功！');
                    } else {
                        msg.ok('设置失败！');
                    }
                });
            }
        });
        return false;
    },

    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm() {

            var row = grid.getSelectedRow();
            if (isEdit) {
                $.ajaxjson(url.show, {'id': row.id}, function (rst) {
                    if (rst.status == "OK") {
                        var data = rst.data;
                        top.$('#uiform').form('load', formatFormDataJson(data));
                    } else {
                        msg.ok('加载数据失败！');
                        self.window.dialog('close');
                    }
                });

            }
        }

        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 285,
            height: 360,
            href: url.form + '?v=' + Math.random(),
            iconCls: isEdit ? 'icon-edit' : 'icon-add',
            onLoad: function () {
                initForm();
            },
            submit: function () {
                self.doSubmit();
                return false;
            }
        });
    },

    doSubmit: function () {
        var self = this;
        if (top.$('#uiform').form("validate")) {
            $.submitForm(top.$('#uiform'), url.save, function (rst) {
                self.window.dialog('close');
                grid.reload();
                self.currentActive = null;
            });
        }
    },

    add: function () {
        RoleSys.showEditWindow();
        return false;
    },

    edit: function () {
        if (grid.getSelectedRows().length > 1) {
            top.layer.msg('修改只对单条记录有效！');
        } else if (grid.getSelectedRows().length == 1) {
            RoleSys.showEditWindow(true);
        } else {
            top.layer.msg('请选择要修改的行。');
        }
        return false;
    },

    del: function () {

        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);
        //console.log(row.length);
        if (row.length >= 1) {
            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].id;
            }
            layer.confirm('您确认要删除这些数据么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload();
                    } else {
                        top.layer.msg('删除数据失败!');
                    }
                });
            });

        } else {
            top.layer.msg('请选择要删除的行。');
        }
        return false;

    },

    enable: function () {
        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);
        console.log(row.length);
        if (row.length >= 1) {
            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].smstpl_id;
            }
            $.ajaxjson(url.enable, {'id[]': row_ids}, function (rst) {
                if (rst.status == "OK") {
                    grid.reload();
                } else {
                    msg.ok('操作失败！');
                }
            });
        } else {
            top.layer.msg('请选择要更改的行。');
        }
    },
    disable: function () {
        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);

        if (row.length >= 1) {
            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].smstpl_id;
            }
            $.ajaxjson(url.disable, {'id[]': row_ids}, function (rst) {
                if (rst.status == "OK") {
                    grid.reload();
                } else {
                    msg.ok('操作失败！');
                }
            });
        } else {
            top.layer.msg('请选择要更改的行。');
        }
    },

    searchData: function () {
        grid.search();
    },
    refresh: function () {
        grid.reload();
    }
};

var permissionMgr = {
    getUserSelectedModule: function () {
        var nodes = top.$('#rightnav').tree('getChecked');
        if (nodes.length > 0) {
            var dwg = [];
            for (var i = 0; i < nodes.length; i++) {
                dwg.push(nodes[i].id);
            }
            return dwg.join(',');
        } else {
            return "";
        }
    }
};
