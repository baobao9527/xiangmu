var moduleGrid,
    url = {
        list : '',
        form: g.ctx +'static/views/sys/resource-form.html?v='+Math.random(),
        treechildren: g.ctx + 'sys/resource/treegrid',
        ressave: g.ctx + 'sys/resource/save',
        del: g.ctx + 'sys/resource/del',
        show: g.ctx + 'sys/resource/show',
        rolePermission: g.ctx + 'sys/role/permissions',
        userPermissionSave: g.ctx + 'sys/user/userPermissionSave',
        userPermission: g.ctx + 'sys/user/permissions',
        tree: g.ctx + 'sys/resource/navtree'
    };

$(function() {
    pageSizeControl.init({
        gridId: 'moduleGrid',
        gridType: 'treegrid'
    });
    moduleTree.init();
    autoResize({
        dataGrid: '#moduleGrid',
        gridType: 'treegrid',
        callback: grid.databind,
        height: 35,
        width: 230
    });
    $('#a_add').attr('onclick', 'ResourceCurd.add();');
    $('#a_edit').attr('onclick', 'ResourceCurd.edit();');
    $('#a_delete').attr('onclick', 'ResourceCurd.del();');
    $('#a_refresh').attr('onclick', 'ResourceCurd.refreash();');



    $(window).resize(function() {
        pageSizeControl.init({
            gridId: 'moduleGrid',
            gridType: 'treegrid'
        })
    })
});


var moduleTree = {
    init: function() {
        $('#moduleTree').tree({
            lines: true,
            url: url.tree,
            animate: true,
            onLoadSuccess: function(node, data) {
                if (data.length && data.length > 0) {
                    $('body').data('moduleData', data)
                }
            },
            onClick: function(node) {
                $(this).tree('toggle', node.target)
            },
            onSelect: function(node) {
                $('#moduleGrid').treegrid({
                    url: url.treechildren,
                    queryParams: {
                        id: node.id
                    }
                })
            }
        })
    },
    data: function(opr) {
        var d = JSON.stringify($('body').data('moduleData'));
        if (opr === '1') {
            d = '[{"id":0,"text":"请选择父级模块（菜单）"},' + d.substr(1)
        }
        return JSON.parse(d)
    },
    selected: function() {
        return $('#moduleTree').tree('getSelected')
    },
    getSelectedChildIds: function(node) {
        var children = $('#moduleTree').tree('getLeafChildren', node.target);
        var ids = '';
        if (children) {
            for (var i = 0; i < children.length; i++) {
                ids += children[i].id + ','
            }
        }
        return ids
    },
    reLoad: function() {
        return $('#moduleTree').tree('reload')
    }
};
var grid = {
    databind: function(winsize) {
        moduleGrid = $('#moduleGrid').treegrid({
            toolbar: '#toolbar',
            width: winsize.width,
            height: winsize.height,
            nowrap: false,
            rownumbers: true,
            loadMsg: '正在努力加载中....',
            resizable: true,
            collapsible: false,
            onContextMenu: pageContextMenu.createTreeGridContextMenu,
            idField: 'id',
            treeField: 'name',
            frozenColumns: [
                [{
                    title: '资源（菜单）名称',
                    field: 'name',
                    width: 200
                }, {
                    title: '资源标识',
                    field: 'code',
                    width: 130
                }]
            ],
            columns: [
                [{
                    title: 'id',
                    field: 'id',
                    hidden: true
                }, {
                    title: 'parent',
                    field: 'parent',
                    hidden: true
                }, {
                    title: '图标',
                    field: 'icon',
                    width: 130,
                    hidden: true
                }, {
                    title: '资源地址',
                    field: 'path',
                    width: 200
                }, {
                    title: '资源类型',
                    field: 'style',
                    width: 60,
                    align: 'center',
                    formatter: function(v, d, i) {
                        if (v == 'menu_group') {
                            return '<img src="'+ g.ctx +'static/images/winwebform.png" />'
                        } else if (v == 'menu') {
                            return '<img src="'+ g.ctx +'static/images/webform.png" />'
                        } else if (v == 'action_group') {
                            return '<img src="'+ g.ctx +'static/images/loginsj.png" />'
                        } else {
                            return '<img src="'+ g.ctx +'static/images/otherform.png" />'
                        }
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    width: 50,
                    align: 'center',
                    formatter: function(v, d, i) {
                        return '<img src="'+ g.ctx +'static/images/' + (v ? "checkmark.gif" : "checknomark.gif") + '" />'
                    }
                }, {
                    title: '排序',
                    field: 'sort',
                    width: 80,
                    align: 'right'
                }]
            ]
        })
    },
    reload: function(treeNode) {
        if (treeNode) {
            var node = moduleTree.selected();
            if (node !== '') {
                moduleGrid.treegrid({
                    url: url.treechildren,
                    queryParams: {
                        id: node.id
                    }
                })
            }
        }
    },
    selected: function() {
        return moduleGrid.treegrid('getSelected')
    }
};
var showIcon = function() {
    top.$('#selecticon').click(function() {
        var iconDialog = top.$.hDialog({
            iconCls: 'icon-application_view_icons',
            href: g.ctx + 'static/css/iconlist.htm?v=' + Math.random(),
            title: '选取图标',
            width: 800,
            height: 600,
            showBtns: false,
            onLoad: function() {
                top.$('#iconlist li').attr('style', 'float:left;border:1px solid #fff;margin:2px;width:16px;cursor:pointer').click(function() {
                    var iconCls = top.$(this).find('span').attr('class');
                    top.$('#txt_IconCss').val(iconCls.replace('icon ', ''));
                    top.$('#txt_IconUrl').val(top.$(this).attr('title'));
                    top.$('#smallIcon').attr('class', iconCls);
                    iconDialog.dialog('close')
                }).hover(function() {
                    top.$(this).css({
                        'border': '1px solid red'
                    })
                }, function() {
                    top.$(this).css({
                        'border': '1px solid #fff'
                    })
                });
            }
        })
    })
};

var setTreeValue = function(id) {
    top.$('#txt_ParentId').combotree('setValue', id)
};
var ResourceCurd = {
    refreash: function() {
        grid.reload(moduleTree.selected())
    },
    bindCtrl: function(navId) {
        var treeData = '';
        $.ajaxtext(url.tree, {}, function(data) {
            if (data) {
                treeData = JSON.stringify(data);
                treeData = '[{"id":0,"selected":true,"text":"请选择父级模块（菜单）"},' + treeData.substr(1, treeData.length - 1);
                top.$('#txt_ParentId').combotree({
                    data: JSON.parse(treeData),
                    valueField: 'id',
                    textField: 'text',
                    panelWidth: '280',
                    editable: false,
                    lines: true,
                    onSelect: function(item) {
                        var nodeId = top.$('#txt_ParentId').combotree('getValue');
                        if (item.id == navId) {
                            top.$('#txt_ParentId').combotree('setValue', nodeId);
                            top.$.messager.alert('警告提示', '上级模块不能与当前模块相同！', 'warning')
                        }
                    }
                }).combotree('setValue', 0)
            }
        });
        showIcon();
        top.$('#txt_Code').focus();
        top.$('#chk_Enabled').attr("checked", true);
        top.$('#uiform').validate({})
    },
    add: function() {
        var gridSelected = grid.selected(),
            treeSelected = moduleTree.selected();
        var row = grid.selected();
        if (!row) {
            row = treeSelected
        }
        var addDialog = top.$.hDialog({
            href: url.form,
            title: '添加模块（菜单）',
            iconCls: 'icon-tab_add',
            width: 490,
            height: 460,
            onLoad: function() {
                ResourceCurd.bindCtrl();
                top.$('#txt_Category').combobox({
                    data: [{'code':'menu_group',name:'菜单组'},{'code':'menu',name:'菜单'},{'code':'action_group',name:'元素组'},{'code':'action',name:'任何元素'}],
                    valueField: 'code',
                    textField: 'name',
                    editable: false,
                    panelHeight: 'auto'
                });
                top.$('#txt_Category').combobox('setValue', 'menu');
                if (treeSelected) {
                    setTimeout(function() {
                        setTreeValue(treeSelected.id)
                    }, 300);
                }
            },
            submit: function() {
                var $uiform = top.$('#uiform');
                if ($uiform.validate().form()) {
                    $.submitForm($uiform, url.ressave, function (rst) {
                        addDialog.dialog('close');
                        grid.reload();
                    });
                }
            }
        });
        return false
    },
    edit: function() {
        var originalParentId = '',
            gridSelected = grid.selected(),
            treeSelected = moduleTree.selected();
        var row = grid.selected();
        if (!row) {
            row = treeSelected
        }
        if (row) {
            var editDailog = top.$.hDialog({
                href: url.form,
                title: '修改模块（菜单）',
                iconCls: 'icon-tab_edit',
                width: 490,
                height: 460,
                onLoad: function() {
                    ResourceCurd.bindCtrl(row.id);
                    top.$('#txt_Category').combobox({
                        data: [{'code':'menu_group',name:'菜单组'},{'code':'menu',name:'菜单'},{'code':'action_group',name:'元素组'},{'code':'action',name:'任何元素'}],
                        valueField: 'code',
                        textField: 'name',
                        editable: false,
                        panelHeight: 'auto'
                    });
                    $.ajaxjson(url.show, {'id': row.id}, function (rst) {
                        if (rst.status == "OK") {
                            var data = rst.data;
                            top.$('#smallIcon').attr('class', 'icon ' + data.resource.icon);
                            top.$('#uiform').form('load', formatFormDataJson(data));

                        } else {
                            msg.ok('加载数据失败！');
                            editDailog.dialog('close');
                        }
                    });
                },
                submit: function() {
                    var vparentid = top.$('#txt_ParentId').combobox('getValue');
                    var $uiform = top.$('#uiform');
                    if ($uiform.validate().form()) {
                        var treeParentId = top.$('#txt_ParentId').combotree('tree');
                        var node = treeParentId.tree('getSelected');
                        if (node) {
                            var nodeParentId = treeParentId.tree('find', (row.Id || row.id));
                            var children = treeParentId.tree('getChildren', nodeParentId.target);
                            var nodeIds = '';
                            var isFind = 'false';
                            for (var index = 0; index < children.length; index++) {
                                if (children[index].id == node.id) {
                                    isFind = 'true';
                                    break
                                }
                            }
                            if (isFind == 'true') {
                                top.$.messager.alert('温馨提示', '请正确选择父节点元素，不能为当前节点的子节点!', 'warning');
                                return
                            }
                        }
                        var iconCss = top.$('#txt_IconCss').val();
                        var treeText = top.$('#txt_FullName').val();

                        $.submitForm($uiform, url.ressave, function (rst) {
                            var tmpTree = $('#moduleTree');

                            iconCss = iconCss ? iconCss : 'icon-note';
                            if (gridSelected) {
                                var curnode = tmpTree.tree('find', row.id);
                                tmpTree.tree('update', {
                                    target: curnode.target,
                                    text: treeText,
                                    iconCls: iconCss
                                });
                                if (vparentid != '0' && treeSelected.id !== vparentid) {
                                    tmpTree.tree('remove', tmpTree.tree('find', row.Id).target);
                                    tmpTree.tree('append', {
                                        parent: tmpTree.tree('find', vparentid).target,
                                        data: [{
                                            id: row.id,
                                            text: treeText,
                                            iconCls: iconCss
                                        }]
                                    })
                                }
                            } else {
                                tmpTree.tree('update', {
                                    target: treeSelected.target,
                                    text: treeText,
                                    iconCls: iconCss
                                });
                                if (vparentid != '0' && originalParentId !== vparentid) {
                                    if (treeSelected.id !== vparentid) {
                                        tmpTree.tree('remove', treeSelected.target);
                                        tmpTree.tree('append', {
                                            parent: tmpTree.tree('find', vparentid).target,
                                            data: [{
                                                id: row.id,
                                                text: treeText,
                                                iconCls: iconCss
                                            }]
                                        })
                                    }
                                }
                            }
                            grid.reload(treeSelected);
                            editDailog.dialog('close')
                        });
                    }
                }
            })
        } else {
            msg.warning('请选择待修改资源（菜单）!');
            return false
        }
        return false
    },
    del: function() {
        var row = grid.selected();
        var treeSelected = moduleTree.selected();
        if (row != null) {

            var childs = moduleTree.getSelectedChildIds($('#moduleTree').tree('find', row.id));
            if (childs && childs.length > 0) {
                $.messager.alert('警告提示', '当前模块有子模块数据，不能删除。<br> 请先删除子模块数据!', 'warning');
                return false
            }
            $.messager.confirm('询问提示', '确认要删除选中的模块（菜单）吗？', function(data) {
                if (data) {
                    $.ajaxjson(url.del, {id: row.id}, function(d) {
                        if (d.status == 'OK') {
                            msg.ok('删除成功');
                            var tmpTree = $('#moduleTree');
                            var curnode = tmpTree.tree('find', row.Id);
                            if (curnode) {
                                tmpTree.tree('remove', curnode.target)
                            }
                            grid.reload(treeSelected)
                        } else {
                            MessageOrRedirect(d)
                        }
                    })
                } else {
                    return false
                }
            })
        } else {
            msg.warning('请选择要删除的模块!');
            return false
        }
        return false
    }
    //userModulePermissionBatchSet: function () {
    //    var userGrid;
    //    var curUserModuleIds = [];
    //    var setDialog = top.$.hDialog({
    //        title: '用户模块（菜单）权限批量设置',
    //        width: 670,
    //        height: 600,
    //        iconCls: 'icon-user_key',
    //        href: g.ctx + "static/views/sys/permissionBacthSetDialy.html?n=" + Math.random(),
    //        onLoad: function () {
    //            using('panel', function () {
    //                top.$('#panelTarget').panel({
    //                    title: '模块（菜单）',
    //                    iconCls: 'icon-org',
    //                    height: $(window).height() - 3
    //                })
    //            });
    //            userGrid = top.$('#leftnav').datagrid({
    //                title: '所有用户',
    //                url: g.ctx + 'sys/user/list',
    //                nowrap: false,
    //                rownumbers: true,
    //                striped: true,
    //                idField: 'id',
    //                singleSelect: true,
    //                columns: [
    //                    [{
    //                        title: '登录名',
    //                        field: 'name',
    //                        width: 120,
    //                        align: 'left'
    //                    }, {
    //                        title: '用户名',
    //                        field: 'username',
    //                        width: 150,
    //                        align: 'left'
    //                    }]
    //                ],
    //                onLoadSuccess: function (data) {
    //                    top.$('#rightnav').hLoading();
    //                    top.$('#rightnav').tree({
    //                        cascadeCheck: false,
    //                        checkbox: true,
    //                        lines: true,
    //                        url: g.ctx + 'sys/resource/navtree',
    //                        onSelect: function (node) {
    //                            top.$('#rightnav').tree('getChildren', node.target)
    //                        },
    //                        onLoadSuccess: function (node, data) {
    //                            //top.$('#rightnav').hLoading.hide()
    //                        }
    //                    });
    //                    top.$('#leftnav').datagrid('selectRow', 0)
    //                },
    //                onSelect: function (rowIndex, rowData) {
    //                    curUserModuleIds = [];
    //                    $.ajaxtext(url.userPermission, {userid: rowData.id}, function (data) {
    //                        var moduelTree = top.$('#rightnav');
    //                        moduelTree.tree('uncheckedAll');
    //                        if (data == '' || data.toString() == '[object XMLDocument]') {
    //                            return
    //                        }
    //                        curUserModuleIds = data.split(',');
    //                        for (var i = 0; i < curUserModuleIds.length; i++) {
    //                            var node = moduelTree.tree('find', curUserModuleIds[i]);
    //                            if (node) moduelTree.tree("check", node.target)
    //                        }
    //                    })
    //                }
    //            })
    //        },
    //        submit: function () {
    //            var allSelectModuledIds = permissionMgr.getUserSelectedModule().split(',');
    //            var grantModuleIds = '';
    //            var revokeModuleIds = '';
    //            var flagRevoke = 0;
    //            var flagGrant = 0;
    //            while (flagRevoke < curUserModuleIds.length) {
    //                if ($.inArray(curUserModuleIds[flagRevoke], allSelectModuledIds) == -1) {
    //                    revokeModuleIds += curUserModuleIds[flagRevoke] + ',';
    //                }
    //                ++flagRevoke
    //            }
    //            while (flagGrant < allSelectModuledIds.length) {
    //                if ($.inArray(allSelectModuledIds[flagGrant], curUserModuleIds) == -1) {
    //                    grantModuleIds += allSelectModuledIds[flagGrant] + ',';
    //                }
    //                ++flagGrant
    //            }
    //            $.ajaxjson(url.userPermissionSave, {userid:top.$('#leftnav').datagrid('getSelected').id,grantIds: grantModuleIds, revokeIds: revokeModuleIds}, function (d) {
    //                if (d.Data > 0) {
    //                    msg.ok('设置成功！')
    //                } else {
    //                    alert(d.message)
    //                }
    //            })
    //        }
    //    });
    //    return false
    //},

};

var permissionMgr = {
    getUserSelectedModule: function() {
        var nodes = top.$('#rightnav').tree('getChecked');
        if (nodes.length > 0) {
            var dwg = [];
            for (var i = 0; i < nodes.length; i++) {
                dwg.push(nodes[i].id)
            }
            return dwg.join(',')
        } else {
            return ""
        }
    }
};
