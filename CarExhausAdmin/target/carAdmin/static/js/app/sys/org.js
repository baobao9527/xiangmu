var moduleGrid,
    url = {
        list: '',
        form: g.ctx + 'static/views/sys/org/sys-org-form.html?v=' + Math.random(),
        treechildren: g.ctx + 'sys/org/children',
        orgsave: g.ctx + 'sys/org/save',
        show: g.ctx + 'sys/org/show',
        del: g.ctx + 'sys/org/del',
        tree: g.ctx + 'sys/org/treesall',
        resourceSettingUrl: g.ctx + 'static/views/sys/org/resource-setting.html?v=' + Math.random,
        orgPermission: g.ctx + 'sys/org/permissions',
        resourcePermissionSave: g.ctx + 'sys/org/permissionsave',
        set_form: g.ctx + 'static/views/sys/org/sys-userSet-form.html',
        getUsers: g.ctx + 'sys/org/getEmps',
        getSelectedUsers: g.ctx + 'sys/org/getSelectedEmp'
    };
var setting = {
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        onClick: clickNode
    }
}
var orgZtree;
function clickNode(e1, e2, node){
    console.log(node);
    $('#moduleGrid').datagrid({
        url: url.treechildren,
        queryParams: {
            id: node.id
        }
    });
}
$(function () {
    Org.loadTree();
    grid.databind();
    autoLayoutResize($('#layout'), function (rightWidth, rightHeight) {
        moduleGrid.datagrid('resize', {width: rightWidth, height: rightHeight});
    });


    $('#a_add').attr('onclick', 'Org.add();');
    $('#a_edit').attr('onclick', 'Org.edit();');
    $('#a_delete').attr('onclick', 'Org.del();');
    $('#a_refresh').attr('onclick', 'Org.refreash();');
    $('#a_search').attr('onclick', 'Org.searchData();');
    $('#a_resourceSet').attr('onclick', 'Org.resourceSetting();');
    $('#a_set').attr('onclick', 'Org.setUser();');
});
var grid = {
    databind: function () {
        moduleGrid = $('#moduleGrid').datagrid({
            toolbar: '#toolbar',
            border: false,
            nowrap: false,
            rownumbers: true,
            loadMsg: '正在努力加载中....',
            resizable: true,
            collapsible: false,
            singleSelect: false, //单选
            onContextMenu: pageContextMenu.createdatagridContextMenu,
            idField: 'id',
            treeField: 'name',
            checkOnSelect: false,
            
            frozenColumns: [
                [{
                    field: 'ck',
                    checkbox: true
                }, {
                    title: '部门名称',
                    field: 'name',
                    width: 140
                }, {
                    title: '主键',
                    field: 'id',
                    width: 140,
                    hidden: true
                }]
            ],
            columns: [[
                {title: '部门编号', field: 'orgserial', width: 140},
                {title: '部门领导', field: 'managerempname', width: 140},
                {title: '创建时间', field: 'create_time', width: 140}
            ]],
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 30, 40]
        });
    },
    changereload: function () {
        moduleGrid.datagrid('loadData', []);
    },
    reload: function (treeNode) {
        if (treeNode) {
            var node = orgZtree.getSelectedNodes()[0];
            if (node !== '') {
                moduleGrid.datagrid({
                    url: url.treechildren,
                    queryParams: {
                        id: node.id
                    }
                })
            }
        }
    },
    selected: function () {
        return moduleGrid.datagrid('getSelected');
    },
    getSelectedRow: function () {
        return moduleGrid.datagrid('getSelected');
    },
    getSelectedRows: function () {
        return moduleGrid.datagrid('getSelections');
    }
};
var setTreeValue = function (id) {
    top.$('#txt_ParentId').combotree('setValue', id);
};
var Org = {

    isEdit: false,

    currentActive: null,

    window: null,

    selectedRecord: null,

    setUser: function () {

        var currentRole = grid.getSelectedRow();
        var currentRoles = grid.getSelectedRows();
        if (currentRoles.length == 1) {
            var __choiceGrid;
            var rDialog = top.$.hDialog({
                href: url.set_form, width: 600, height: 500, title: '部门用户设置', iconCls: 'icon-group_link',
                onLoad: function () {
                    top.$('#rlayout').layout();
                    top.$('#roleName').text(currentRole.name);
                    var dataOptions = {
                        width: 255,
                        height: 350,
                        iconCls: 'icon-users',
                        nowrap: false, //折行
                        rownumbers: true, //行号
                        striped: true, //隔行变色
                        idField: 'id', //主键
                        singleSelect: true, //单选
                        columns: [[
                            {title: '主键', field: 'id', hidden: true},
                            {title: '员工工号', field: 'code', width: 100},
                            {title: '员工姓名', field: 'username', width: 120}
                        ]],

                        pagination: false,
                        pageSize: 10,
                        pageList: [10, 20, 40, 50]

                    };

                    top.$('#allUsers').datagrid($.extend({}, dataOptions, {
                        url: url.getUsers + '?rows=99999&roleid=' + currentRole.id,
                        onDblClickRow: function (rowIndex, rowData) {
                            top.document.getElementById('aSelectUser').click();
                        }
                    }));


                    __choiceGrid = top.$('#selectedUser').datagrid($.extend({}, dataOptions, {
                        url: url.getSelectedUsers + '?rows=99999&organid=' + currentRole.id,
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
                                if (n.code == _row.code) {
                                    hasUserName = true;
                                }
                            });
                            if (!hasUserName) {
                                top.$('#selectedUser').datagrid('appendRow', _row);

                            } else {
                                top.layer.msg('员工已存在，请不要重复添加。');
                                return false;
                            }
                        } else {
                            top.layer.msg('请选择员工');
                        }
                        return false;
                    });
                    top.$('#aDeleteUser').click(function () {
                        var trow = top.$('#selectedUser').datagrid('getSelected');
                        if (trow) {
                            var rIndex = top.$('#selectedUser').datagrid('getRowIndex', trow);
                            top.$('#selectedUser').datagrid('deleteRow', rIndex).datagrid('unselectAll');

                        } else {
                            top.layer.msg('请选择员工');
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

                    //userIds:员工id号，currentRole.id:部门id号

                    $.ajaxjson(g.ctx + 'sys/org/employeeSave', {
                        'ids': userIds.join(','),
                        organId: currentRole.id
                    }, function (rst) {
                        if (rst.status == 'OK') {
                            top.layer.msg('部门员工设置成功');
                            rDialog.dialog('close');
                        } else {
                            top.layer.msg('部门员工设置失败');
                        }
                    });

                }
            });
        } else if (currentRoles.length < 1) {
            msg.warning('请选择一个部门！');
        } else if (currentRoles.length > 1) {
            msg.warning('部门员工设置仅对单条记录有效！');
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
            href: g.ctx + "static/views/sys/permissionBacthSetDialy.html?n=" + Math.random(),
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
                    url: g.ctx + 'sys/role/list',
                    nowrap: false,
                    rownumbers: true,
                    striped: true,
                    idField: 'id',
                    singleSelect: true,
                    frozenColumns: [
                        []
                    ],
                    columns: [
                        [{
                            title: '角色编码',
                            field: 'code',
                            width: 120,
                            align: 'left'
                        }, {
                            title: '角色名称',
                            field: 'name',
                            width: 150,
                            align: 'left'
                        }]
                    ],
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
                                if (node) moduelTree.tree("check", node.target);
                            }
                        });
                    }
                });
            },
            submit: function () {
                var allSelectModuledIds = permissionMgr.getUserSelectedModule();

                var dataMap = {roleid: top.$('#leftnav').datagrid('getSelected').id, permissions: allSelectModuledIds};
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

    refreash: function () {
        grid.reload(orgZtree.getSelectedNodes()[0]);
    },
    add: function () {
        var treeSelected = orgZtree.getSelectedNodes()[0];
        var row = treeSelected;
        var addDialog = top.$.hDialog({
            href: url.form,
            title: '添加组织机构',
            iconCls: 'icon-tab_add',
            width: 490,
            height: 300,
            onLoad: function () {
                if (treeSelected) {
                    setTimeout(function () {
                        setTreeValue(treeSelected.id)
                    }, 300);
                }
                var treeid;
                if (!row) {
                    treeid = 0;
                } else {
                    treeid = row.id;
                }
                top.$("#treeid").val(treeid);

                //给部门编码设置6位随机数
                var orgno = parseInt(Math.random() * (999999 - 100000 + 1) + 100000);
                top.$("#orgserial").val(orgno);

                top.$('#parent').combotree({
                    required: true,
                    missingMessage: "请输入部门名称",
                    url: g.ctx + 'sys/user/navtree',
                    valueField: 'id',
                    textField: 'name',
                    panelWidth: '280',
                    editable: false,
                    lines: true
                });


                top.$('#managerempname').combobox({
                    missingMessage: "请输入部门领导名字",
                    url: g.ctx + 'sys/org/getdeptleader',
                    valueField: 'id',
                    textField: 'username',
                    editable: false,
                    panelHeight: 'auto'
                });
            },
            submit: function () {
                var self = this;
                var $userform = top.$('#orgform');
                if ($userform.validate().form()) {
                    $.submitForm($userform, url.orgsave, function (rst) {
                        addDialog.dialog('close');
                        grid.reload(treeSelected);
                        orgTree.reLoad();
                        self.currentActive = null;
                    });
                }
            }
        });
        return false;
    },
    edit: function () {
        var rows = $('#moduleGrid').datagrid('getSelections');
        var selrow = $('#moduleGrid').datagrid('getSelected');
        if (rows.length == 1) {

            var editDailog = top.$.hDialog({
                href: url.form,
                title: '修改组织机构',
                iconCls: 'icon-tab_edit',
                width: 490,
                height: 300,
                onLoad: function () {
                    top.$('#parent').combotree({
                        required: true,
                        missingMessage: "请输入部门名称",
                        url: g.ctx + 'sys/user/navtree',
                        valueField: 'id',
                        textField: 'name',
                        panelWidth: '280',
                        editable: false,
                        lines: true
                    });

                    //top.$('#managerempname').combotree({
                    //    required: true,
                    //    missingMessage: "请输入部门领导名字",
                    //    url: g.ctx + 'sys/user/usernavtree',
                    //    valueField: 'id',
                    //    textField: 'name',
                    //    panelWidth: '280',
                    //    editable: false,
                    //    lines: true
                    //});

                    top.$('#managerempname').combobox({
                        missingMessage: "请输入部门领导名字",
                        url: g.ctx + 'sys/org/getdeptleader',
                        valueField: 'id',
                        textField: 'username',
                        editable: false,
                        panelHeight: 'auto'
                    });

                    $.ajaxjson(url.show, {'id': selrow.id}, function (rst) {
                        top.$('#orgform').form('load', formatFormDataJson(rst));
                    });
                },
                submit: function () {
                    var self = this;
                    var $userform = top.$('#orgform');
                    if ($userform.validate().form()) {
                        $.submitForm($userform, url.orgsave, function (rst) {
                            editDailog.dialog('close');
                            grid.reload(treeSelected);
                            self.currentActive = null;
                            orgTree.reLoad();
                        });
                    }

                    return false;
                }
            });
        } else if (rows.length > 1) {
            msg.warning("修改部门不能选择多行！");
        } else {
            msg.warning('请选择待修改组织!');
            return false;
        }

        return false;
    },
    del: function () {
        var treeSelected = orgTree.selected();
        //var row = treeSelected;

        var rows = $('#moduleGrid').datagrid('getSelections');
        var selrow = $('#moduleGrid').datagrid('getSelected');
        if (rows.length == 1) {

            var self = this;
            layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id": selrow.id}, function (rst) {
                    console.log(rst);
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload();
                        grid.reload(treeSelected);
                        self.currentActive = null;
                        orgTree.reLoad();
                    } else {
                        msg.warning(rst.message);
                    }
                });
            });
        } else if (rows.length > 1) {
            msg.warning('删除部门不能选择多行。');
        } else {
            msg.warning('请选择要删除的行。');
        }

        return false;
    },
    resourceSetting: function () {
        var roleGrid;
        var curRoleModuleIds = [];
        var setDialog = top.$.hDialog({
            title: '组织模块（菜单）权限批量设置',
            width: 670,
            height: 600,
            iconCls: 'icon-group_key',
            href: url.resourceSettingUrl,
            onLoad: function () {
                using('panel', function () {
                    top.$('#panelTarget').panel({
                        title: '模块（菜单）',
                        iconCls: 'icon-org',
                        height: $(window).height() - 3
                    });
                });
                roleGrid = top.$('#leftnav').tree({
                    lines: true,
                    url: url.tree,
                    animate: true,
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
                    onClick: function (node) {
                        $(this).tree('toggle', node.target);
                    },
                    onSelect: function (node) {
                        curRoleModuleIds = [];
                        $.ajaxtext(url.orgPermission, {id: node.id}, function (data) {
                            var moduelTree = top.$('#rightnav');
                            moduelTree.tree('uncheckedAll');
                            if (data == '' || data.toString() == '[object XMLDocument]') {
                                return;
                            }
                            curRoleModuleIds = data.split(',');
                            for (var i = 0; i < curRoleModuleIds.length; i++) {
                                var node = moduelTree.tree('find', curRoleModuleIds[i]);
                                if (node) moduelTree.tree("check", node.target);
                            }
                        });
                    }
                });
            },
            submit: function () {
                var allSelectModuledIds = permissionMgr.getUserSelectedModule();

                var dataMap = {org: top.$('#leftnav').tree('getSelected').id, permissions: allSelectModuledIds};
                $.ajaxjson(url.resourcePermissionSave, dataMap, function (d) {
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
    loadTree: function () {
        $.ajax({
            type: "get",
            sync: true,
            url: g.ctx + 'attendancemanage/scheduing/org',
            dataType: "json",
            success: function (data) {
                var treeSetting = Hamster.Object.clone(setting);
                orgZtree = $.fn.zTree.init($("#ztree_org"), treeSetting, data);
            }
        });
    },
    /**
     * 根据部门名查询部门
     */
    searchData: function () {
        var dn = $('#deptname').val();

        $('#moduleGrid').datagrid({
            url: g.ctx + 'sys/org/list',
            queryParams: {
                id: dn
            }
        });
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
