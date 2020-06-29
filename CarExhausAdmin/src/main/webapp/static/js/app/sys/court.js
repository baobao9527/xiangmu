var _courtlist,
    url = {
        list: g.ctx + 'sys/court/list',
        form: g.ctx + 'static/views/sys/sys-court-form.html',
        show: g.ctx + 'sys/court/show',
        del: g.ctx + 'sys/court/del',
        save: g.ctx + 'sys/court/save',
        heliaia_list:g.ctx + 'sys/heliaia/list',
        court_heliaiaform: g.ctx + 'static/views/sys/sys-court-heliaia-form.html',
        heliaia_form: g.ctx + 'static/views/sys/sys-heliaia-form.html',
        heliaia_show: g.ctx + 'sys/heliaia/show',
        heliaia_del: g.ctx + 'sys/heliaia/del',
        heliaia_save: g.ctx + 'sys/heliaia/save'
    };

$(function () {
    autoResize({dataGrid: '#list', gridType: 'datagrid', callback: grid.bind, height: 0, width: 0});

    $('#a_add').attr('onclick', 'CourtSys.add();');
    $('#a_edit').attr('onclick', 'CourtSys.edit();');
    $('#a_delete').attr('onclick', 'CourtSys.del();');
    $('#a_search').attr('onclick', 'CourtSys.searchData();');
    $('#a_refresh').attr('onclick', 'CourtSys.refreash();');
    $('#a_showheliaia').attr('onclick', 'CourtSys.showheliaia();');

});

var showHeliaiaList = {
    loadMsg: "正在加载数据，请稍等...",
    iconCls: 'icon icon-list',
    width: 660 - 22,
    height: 400,
    nowrap: false,
    rownumbers: false,
    striped: true,
    idField: 'id',
    singleSelect: false,
    border: false,
    checkOnSelect: true,
    frozenColumns: [[
        {field: 'ck', checkbox: true},
        {title: '法庭编号', field: 'code', width: 80}
    ]],
    columns: [[
        {title: '法庭主键', field: 'id', width: 20, hidden: true},
        {title: '法庭名称', field: 'name', width: 120},
        {title: '创建时间', field: 'create_time', width: 180},
        {title: '用途', field: 'use_txt', width: 234}
    ]],
    pagination: false,
    pageSize: 20,
    pageList: [20, 10, 30, 50],
    getSelectedRowIds: function () {
    var selecteds = CourtSys.showCourtHeliaiaGrid.datagrid('getSelections');
    var selectedIds = [];
    for (var i = 0; i < selecteds.length; i++) {
        selectedIds.push(selecteds[i].id);
    }
    return selectedIds;
    },
    getSelectedRow: function () {
        return CourtSys.showCourtHeliaiaGrid.datagrid('getSelected');
    },
    reload: function () {
        CourtSys.showCourtHeliaiaGrid.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
};


var grid = {
    bind: function (winSize) {
        _courtlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载法院维护数据，请稍等...",
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
                {title: '法院名称', field: 'name', width: 180}
            ]],
            columns: [[
                {title: '法院维护主键', field: 'id', width: 20, hidden: true},
                {title: '法院编号', field: 'code', width: 100},
                {title: '上级法院', field: 'parent_name', width: 180},
                {title: '法院领导', field: 'leader_name', width: 100},
                {title: '法院地址', field: 'address', width: 240},
                {title: '联系电话', field: 'mobile', width: 120}

            ]],
            pagination: true,
            pageSize: 20,
            pageList: [20, 10, 30, 50]
        });
    },
    getSelectedRow: function () {
        return _courtlist.datagrid('getSelected');
    },
    getSelectedRowIds: function () {
        var selecteds = _courtlist.datagrid('getSelections');
        var selectedIds = [];
        for (var i = 0; i < selecteds.length; i++) {
            selectedIds.push(selecteds[i].id);
        }
        return selectedIds;

    },
    reload: function () {
        _courtlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    },
    search: function () {
        var nameCourt = $('#nameCourt').val();
        var noCourt = $('#noCourt').val();
        var pams = {};
        pams['s-mc.name-like'] = nameCourt;
        pams['s-mc.code-like'] = noCourt;

        _courtlist.datagrid('clearSelections').datagrid('reload', pams);
    }

};

var CourtSys = {

    isEdit: false,

    currentActive: null,

    window: null,

    showCourtHeliaiaGrid: null,

    showHeliaiaDialog: null,

    showHeliaiaList: showHeliaiaList,

    init: function () {
        var self = this;

        top.$('#coutr_name').focus();
        top.$('#staffTab').tabs({
            onSelect: function () {
                top.$('.validatebox-tip').remove();
            }
        });

        top.$('#parent').combobox({
            //required:true,
            //missingMessage:"请选择上级法院",
            url: g.ctx + 'sys/court/getcourts',
            method: 'get',
            valueField: 'id',
            textField: 'name',
            //editable: false,
            panelHeight: 'auto'
        });

        top.$('#leader').combobox({
            //required:true,
            url: g.ctx + 'sys/court/getleaders',
            method: 'get',
            valueField: 'id',
            textField: 'username',
            //editable: false,
            panelHeight: 'auto'
        });

        top.$('#code').focus();
        var row = grid.getSelectedRow();
        top.$('#cid').val(row.id);

    },


    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm () {
            CourtSys.init();
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
            width: 685,
            height: 460,
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

    showHeliaiaEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = showHeliaiaList.getSelectedRow();
        }

        function initForm () {
            CourtSys.init();
            var row = showHeliaiaList.getSelectedRow();
            if (isEdit) {
                $.ajaxjson(url.heliaia_show, {'id': row.id}, function (rst) {
                    if (rst.status == "OK") {
                        var data = rst.data;
                        top.$('#hiform').form('load', formatFormDataJson(data));
                    } else {
                        top.layer.msg('加载数据失败！');
                        self.window.dialog('close');
                    }
                });
            }
        }

        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 605,
            height: 300,
            href: url.heliaia_form + '?v=' + Math.random(),
            iconCls: isEdit ? 'icon-edit' : 'icon-add',
            onLoad: function () {
                initForm();
            },
            submit: function () {
                self.h_doSubmit();
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

    h_doSubmit: function () {

        var self = this;

        if (top.$('#hiform').form("validate")) {
            $.submitForm(top.$('#hiform'), url.heliaia_save, function (rst) {
                self.window.dialog('close');
                showHeliaiaList.reload();
                self.currentActive = null;
            });
        }
    },
    add: function () {
        this.showEditWindow();
        return false;
    },
    h_add: function () {
        this.showHeliaiaEditWindow();
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

    h_edit: function () {
        if (showHeliaiaList.getSelectedRowIds().length==1) {
            this.showHeliaiaEditWindow(true);
        } else if(showHeliaiaList.getSelectedRowIds().length>1){
            top.layer.msg('请选择单行数据修改。');
        }else {
            top.layer.msg('请选择要修改的行。');
        }
        return false;
    },

    del: function () {
        var  rowIds= grid.getSelectedRowIds();
        if (rowIds.length>=1) {
            layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": rowIds}, function (rst) {
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

    h_del: function () {
        var  rowIds= showHeliaiaList.getSelectedRowIds();
        if (rowIds.length>=1) {
            top.layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                top.layer.close(idx);
                $.ajaxjson(url.heliaia_del, {"id[]": rowIds}, function (rst) {
                    if (rst.status == 'OK') {
                        top.layer.msg('删除成功！');
                        showHeliaiaList.reload();
                    } else {
                        top.layer.msg('删除数据失败!')
                    }
                })
            });

        } else {
            top.layer.msg('请选择要删除的行。');
        }
        return false;
    },

    searchData: function () {
        grid.search();
    },

    refreash: function () {
        grid.reload();
    },
    h_refresh: function () {
        showHeliaiaList.reload();
    },

    showheliaia: function () {
        var self = this;

        this.selectedRecord = grid.getSelectedRow();
        if (!this.selectedRecord) {
            msg.warning('请选择要查看的行。');
            return;
        }

        function initCourtHeliaiaTableGrid() {
            var courtId = grid.getSelectedRow().id;
            top.$('#h_edit').bind('click', function () {
                self.h_edit();
            });
            top.$('#h_add').bind('click', function () {
                self.h_add();
            });
            top.$('#h_del').bind('click', function () {
                self.h_del();
            });

            self.showCourtHeliaiaGrid = top.$('#court_heliaia_grid');
            self.showCourtHeliaiaGrid.datagrid($.extend(self.showHeliaiaList, {
                width: 660 - 14,
                height: 297,
                toolbar: '#case_jurors_group_toolbar',
                url: url.heliaia_list + '?courtId=' + courtId
            }));
        }

        this.showHeliaiaDialog = top.$.hDialog({
            title: '法院法庭信息',
            width: 660,
            height: 400,
            boxPadding: 0,
            href: url.court_heliaiaform + '?v=' + Math.random(),
            iconCls: 'icon-add',
            onLoad: function () {
                initCourtHeliaiaTableGrid();
            },
            submit: function () {
                self.showHeliaiaDialog.dialog('close');
                return false;
            }
        });
    }
};
