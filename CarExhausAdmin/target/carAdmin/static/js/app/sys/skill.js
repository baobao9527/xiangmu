var _skilllist,
    url = {
        list: g.ctx + 'sys/skill/list',
        form: g.ctx + 'static/views/sys/skill-form.html',
        show: g.ctx + 'sys/skill/show',
        del: g.ctx + 'sys/skill/del',
        save: g.ctx + 'sys/skill/save',
        status:g.ctx + 'sys/skill/status'
    };

$(function () {
    autoResize({dataGrid: '#list', gridType: 'datagrid', callback: grid.bind, height: 0, width: 0});
    $('#a_add').attr('onclick', 'SkillStat.add();');
    $('#a_edit').attr('onclick', 'SkillStat.edit();');
    $('#a_delete').attr('onclick', 'SkillStat.del();');
    $('#a_search').attr('onclick', 'SkillStat.searchData();');
    $('#a_refresh').attr('onclick', 'SkillStat.refreash();');
    $('#a_start').attr('onclick', 'SkillStat.start();');
    $('#a_stop').attr('onclick', 'SkillStat.stop();')
});

var grid = {
    bind: function (winSize) {
        _skilllist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载专业技能数据，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'id',//主键
            singleSelect: false, //多选
            border: false,
            onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            frozenColumns: [[
                {field: 'ck', checkbox: true},
                {title: '名称', field: 'name', width: 120, width: 180}
            ]],
            columns: [[
                {title: '技能主键', field: 'id', width: 20, hidden: true},
                {title: '描述', field: 'description', width: 300},
                {title: '创建时间', field: 'create_time', width: 200},
                {title: '启用', field: 'status', width: 50,
                    formatter: function (v, d, i) {
                        if (d.status) {
                            return '启用';
                        } else {
                            return '禁用';
                        }
                    }
                },
                {title: '排序', field: 'sort', width: 50}
            ]],
            pagination: true,
            pageSize: 20,
            pageList: [20, 10, 30, 50]
        });
    },
    getSelectedRow: function () {
        return _skilllist.datagrid('getSelected');
    },
    getSelectedRowIds: function () {
        var selecteds = _skilllist.datagrid('getSelections');
        var selectedIds = [];
        for (var i = 0; i < selecteds.length; i++) {
            selectedIds.push(selecteds[i].id);
        }
        return selectedIds;

    },
    reload: function () {
        _skilllist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
};

var SkillStat = {

    isEdit: false,

    currentActive: null,

    window: null,

    init: function () {
        var self = this;

        top.$('#skill_sort').numberspinner({
            min: 1,
            max: 100,
            editable: false,
            required:true,
            missingMessage:"请选择排序"
        });
        top.$('#skill_name').focus();
        top.$('#staffTab').tabs({
            onSelect: function () {
                top.$('.validatebox-tip').remove();
            }
        });
        
    },

    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm () {
            SkillStat.init();
            var row = grid.getSelectedRow();
            if (isEdit) {
                top.$('#skill_name').focus();
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
            width: 685,
            height: 300,
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
        this.showEditWindow();
        return false;
    },

    edit: function () {
        if (grid.getSelectedRowIds().length==1) {
            this.showEditWindow(true);
        } else if(grid.getSelectedRowIds().length>1){
            msg.warning('请选择单行数据修改。');
        }else {
            msg.warning('请选择要修改的行。');
        }
        return false;
    },

    start:function () {
        var row = grid.getSelectedRowIds();
        if (row.length>=1) {
            layer.confirm('您确认要启用这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.status, {"id[]": row,"stopflag":1}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('启用成功！');
                        grid.reload();
                    } else {
                        msg.warning('启用失败!')
                    }
                })
            });

        } else {
            msg.warning('请选择要启用的行。');
        }
        return false;
    },

    stop:function () {
        var row = grid.getSelectedRowIds();
        if (row.length>=1) {
            layer.confirm('您确认要禁用这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.status, {"id[]": row,"stopflag":0}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('禁用成功！');
                        grid.reload();
                    } else {
                        msg.warning('禁用失败!')
                    }
                })
            });

        } else {
            msg.warning('请选择要禁用的行。');
        }
        return false;
    },

    del: function () {
        var row = grid.getSelectedRowIds();
        if (row.length>=1) {
            layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload();
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
        var txtName = $('#txtName').val();

        $('#list').datagrid('load', {
            's-mis.name-like': txtName
        })
    },
    refreash: function () {
        grid.reload();
    }
};
