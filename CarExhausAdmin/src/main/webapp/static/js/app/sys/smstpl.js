var _gridlist,
    url = {
        list: g.ctx + 'sys/smstpl/list',
        form: g.ctx + 'static/views/sys/sys-smstpl-form.html',
        show: g.ctx + 'sys/smstpl/show',
        save: g.ctx + 'sys/smstpl/save',
        del: g.ctx + 'sys/smstpl/del',
        enable: g.ctx + 'sys/smstpl/enable',
        disable: g.ctx + 'sys/smstpl/disable'
    };

$(function () {
    autoResize({dataGrid: '#list', gridType: 'datagrid', callback: grid.bind, height: 0, width: 0});
    $('#a_add').attr('onclick', 'SmstplSys.add();');
    $('#a_edit').attr('onclick', 'SmstplSys.edit();');
    $('#a_delete').attr('onclick', 'SmstplSys.del();');
    $('#a_search').attr('onclick', 'SmstplSys.searchData();');
    $('#a_refresh').attr('onclick', 'SmstplSys.refresh();');
    $('#a_enable').attr('onclick', 'SmstplSys.enable();');
    $('#a_disable').attr('onclick', 'SmstplSys.disable();');
});


var grid = {
    bind: function (winSize) {
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载短信模板信息，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            idField: 'smstpl_id',//主键


            singleSelect: false,
            selectOnCheck: true,
            checkOnSelect: true,

            border:false,
            onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            /*onDblClickRow: function (rowIndex, rowData) {
                document.getElementById('a_edit').click();
            },*/
            frozenColumns: [[
                {field: 'ck', checkbox: true},
                {title: '模板类型', field: 'type', width: 150,formatter:function(v,d,i){
                    return pageMethod.getDict("smstpl_type",v);
                }}
            ]],
            columns: [[
                {title: '主键', field: 'smstpl_id', width: 120, hidden: true},
                {title: '短信模板', field: 'content', width: 500},
                {title: '启用状态', field: 'status', width: 80,formatter:function(v,d,i){
                    console.log(v);
                    if(v){
                        return "启用";
                    }else{
                        return "禁用";
                    }
                }},
                {title: '所属法院', field: 'court_name', width: 190},
                {title: '创建时间', field: 'create_time', width: 190}

            ]],
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
    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    },
    /*search: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {'s-mj.name-like':$('#name').val()});
    }*/
};

var SmstplSys = {

    isEdit: false,

    currentActive: null,

    window: null,

    selectedRecord: null,


    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm() {

            top.$('a[data-type="var_txt"]').on('click', function(e){
                var $this = $(this);
                var tmp = $this.attr('data-txt');
                var smsContent = top.$("#smsContent").val();
                smsContent = smsContent + tmp;
                top.$("#smsContent").val(smsContent);
            });

            top.$('a[data-type="var_txt"]').each(function(){
                var $this = $(this);
                $this.css("color","#0C0002");
                $this.css("font-size","16px");
                $this.css("text-decoration","underline");
                $this.css("padding-right","10px");
            });
            //'type'是标签id，'smstpl_type'是数据库字典表 字段名称
            pageMethod.dictBind('type', 'smstpl_type');

            var row = grid.getSelectedRow();
            if (isEdit) {
                $.ajaxjson(url.show, {'id': row.smstpl_id}, function (rst) {
                    if (rst.status == "OK") {
                        var data = rst.data;
                        console.log(data);
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
        if (grid.getSelectedRows().length > 1) {
            msg.warning('修改只对单条记录有效！');
        } else if (grid.getSelectedRows().length == 1) {
            this.showEditWindow(true);
        } else {
            msg.warning('请选择要修改的行。');
        }
        return false;
    },

    del: function () {

        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);
        console.log(row.length);
        if (row.length>=1 ) {
            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].smstpl_id;
            }
            layer.confirm('您确认要删除这些数据么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
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

    enable: function () {
        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);
        console.log(row.length);
        if (row.length>=1 ) {
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
        }else{
            msg.warning('请选择要更改的行。');
        }
    },
    disable: function () {
        var row = grid.getSelectedRows();
        var row_ids = new Array(row.length);

        if (row.length>=1 ) {
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
        }else{
            msg.warning('请选择要更改的行。');
        }
    },

    searchData: function () {
        grid.search();
    },
    refresh: function () {
        grid.reload();
    }
};
