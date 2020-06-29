var _gridlist,
    _parentlist,
    url = {
        list: g.ctx + 'sys/dict/list',
        form: g.ctx + 'sys/dict/item',
        parentlist: g.ctx + 'sys/dict/parentlist',
        datalist: g.ctx + 'sys/dict/list',
        save: g.ctx + 'sys/dict/save',
        show: g.ctx + 'sys/dict/show',
        del: g.ctx + 'sys/dict/del',
        audit: g.ctx + 'sys/dict/audit',
        tree: g.ctx + 'sys/dict/tree'
    };

$(function () {
    $('#layout').width($(window).width() - 4).height($(window).height() - 4).layout();
    DictTree.init();
    autoResize({
        dataGrid: '#orgTree',
        gridType: 'treegrid',
        callback: grid.bind,
        height: 35,
        width: 230
    });
    $('#a_add').attr('onclick', 'Dict.add();');
    $('#a_edit').attr('onclick', 'Dict.edit();');
    $('#a_delete').attr('onclick', 'Dict.del();');
    $('#a_refresh').attr('onclick', 'Dict.refreash();');
    $('#a_on_off').attr('onclick', 'Dict.start();');
});

var grid = {
    bind: function (winSize) {
        _gridlist = $('#datalist').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载字典数据，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'id',//主键
            singleSelect: true, //单选
            border: false,
            onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            frozenColumns: [[
                {field: 'ck', checkbox: true},
                {title: '编号', field: 'code', width: 100}
            ]],
            columns: [[
                {title: '主键', field: 'id', width: 120, hidden: true},
                {title: '名称', field: 'name', width: 150},
                {title: '描述', field: 'description', width: 150},
                {
                    title: '启用', field: 'enabled', width: 100,
                    formatter: function (v, d, i) {
                        if (d.enabled) {
                            return '<span class="layui-badge layui-bg-blue">启用</span>';
                        } else {
                            return '<span class="layui-badge layui-bg-gray">禁用</span>';
                        }
                    }
                },
                {title: '排序', field: 'order_code', width: 100}
            ]],
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 30, 40]
        });
    },
    getSelectedRow: function () {
        return _gridlist.datagrid('getSelected');
    },
    reload: function (pid) {
        _gridlist.datagrid('clearSelections').datagrid('reload', {pid: pid});
    }
};

var Dict = {
    isEdit: false,
    currentActive: null,
    window: null,
    selectedRecord: null,
    init: function () {                   //显示排序
        top.$('#order_code').numberspinner({
            min: 0,
            max: 100,
            editable: true,
            value: 0
            
        });
    },
    showEditWindow: function (isEdit) {
        var self = this;
        
        function initForm() {
            Dict.init();
            if (isEdit) {
                var row = grid.getSelectedRow();
                
                if (Hamster.isEmpty(row)) {
                    msg.warning('请选择要编辑的字典');
                    return;
                }
                $.ajaxjson(url.show, {'id': row.id}, function (rst) {
                    if (rst.status == "OK") {
                        var data = rst.data;
                        top.$('#uiform').form('load', formatFormDataJson(data));
                    } else {
                        msg.ok('加载数据失败！');
                        self.window.dialog('close');
                    }
                });
            } else {
                var treeSelected = DictTree.selected();
                if (Hamster.isEmpty(treeSelected)) {
                    top.$("#dict_parent_id").val(0);
                } else {
                    top.$("#dict_parent_id").val(treeSelected.id);
                }
                
            }
        }
        
        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 400,
            height: 230,
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
                msg.ok('保存成功！');
                self.window.dialog('close');
                grid.reload(DictTree.selected().id);
                self.currentActive = null;
            });
        }
    },
    
    add: function () {
        this.showEditWindow();
        return false;
    },
    
    edit: function () {
        var row = grid.getSelectedRow();
        if (Hamster.isEmpty(row)) {
            msg.warning('请选择要编辑的字典');
            return;
        }
        if (row) {
            this.showEditWindow(true);
        } else {
            msg.warning('请选择要修改的行。');
        }
        return false;
    },
    start: function () {
        var row = grid.getSelectedRow();
        if (Hamster.isEmpty(row)) {
            msg.warning('请选择要启用或者禁用的字典');
            return;
        }
        if (row) {
            var message;
            console.log(row.enabled);
            if (row.enabled == 1) {
                message = '禁用';
            } else {
                message = '启用';
            }
            
            $.messager.confirm('温馨提示', '确定要' + message + '该字典吗？', function (data) {
                if (data) {
                    $.ajaxjson(url.audit, {"id": row.id}, function (rst) {
                        if (rst.status == 'OK') {
                            msg.ok(message + '成功！');
                            grid.reload(DictTree.selected().id);
                        } else {
                            msg.warning('操作失败!')
                        }
                    })
                } else {
                    return false
                }
            });
        } else {
            msg.warning('请选择要启用的字典!');
        }
        return false;
    },
    
    del: function () {
        var row = grid.getSelectedRow();
        if (row) {
            layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row.id}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload(DictTree.selected().id);
                    } else {
                        msg.warning('删除数据失败!')
                    }
                })
            });
            
        } else {
            msg.warning('请选择要删除的行。');
        }
        return false;
    },
    searchData: function () {
        search.go('list');
    },
    refreash: function () {
        var treeSelectd = DictTree.selected();
        if(Hamster.isEmpty(treeSelectd)){
            grid.reload(0);
        } else {
            grid.reload(treeSelectd.id);
        }
    }
};

var DictTree = {
    init: function () {
        $('#dictTree').tree({
            lines: true,
            url: url.tree,
            animate: true,
            onClick: function (node) {
                $(this).tree('toggle', node.target)
            },
            onSelect: function (node) {
                var selectedChildIds = DictTree.getSelectedChildIds(node);
                if (Hamster.isEmpty(selectedChildIds)) {
                    var parent =$('#moduleTree').tree('getParent',node.target);
                    top.layer.msg('您选择的为字典项数据，将查询字典组['+parent.text+']的数据显示!');
                    grid.reload(parent.id);
                } else {
                    grid.reload(node.id);
                }
            }
        })
    },
    selected: function () {
        return $('#dictTree').tree('getSelected')
    },
    getSelectedChildIds: function (node) {
        var children = $('#dictTree').tree('getLeafChildren', node.target);
        var ids = '';
        if (children) {
            for (var i = 0; i < children.length; i++) {
                ids += children[i].id + ','
            }
        }
        return ids
    },
    reLoad: function () {
        return $('#dictTree').tree('reload')
    }
};


