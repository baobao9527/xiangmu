/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'repair/afterservice/list',
    form: g.ctx + 'static/views/repair/form.html',
    show: g.ctx + 'repair/afterservice/show',
    del: g.ctx + 'repair/afterservice/del',
    save: g.ctx + 'repair/afterservice/save',
    selectcar: g.ctx + 'static/views/repair/selectcar.html',
    carlist: g.ctx + 'car/home/list',
    ok: g.ctx + 'repair/afterservice/ok'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
    $('#a_refresh').attr('onclick', 'repair.refreash();');
    $('#a_add').attr('onclick', 'repair.add();');
    $('#a_edit').attr('onclick', 'repair.edit();');
    $('#a_delete').attr('onclick', 'repair.del();');
    $('#a_search').attr('onclick', 'repair.searchData();');
    $('#a_ok').attr('onclick', 'repair.ok();');

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
                title: '车牌号码',
                field: 'car_no',
                width: 80
            }]],
            columns: [[{
                title: '车牌颜色',
                field: 'car_no_color',
                width: 120,
                formatter: function (v) {
                    return pageMethod.getDict('RHJYQO', v);
                }
            }, {
                title: '车辆标识',
                field: 'car_flag',
                width: 150,
                formatter: function (v) {
                    return pageMethod.getDict('YIIBFH', v);
                }
            }, {
                title: '喷油方式',
                field: 'engine_gass_type',
                width: 60,
                formatter: function (v) {
                    return pageMethod.getDict('LVQOJO', v);
                }
            }, {
                title: '故障现象',
                field: 'breakdown_info',
                width: 120
            }, {
                title: '出现时间',
                field: 'breakdown_time',
                width: 150
            }, {
                title: '维修时间',
                field: 'fix_time',
                width: 150
            }, {
                title: '维修地点',
                field: 'fix_location',
                width: 80
            }, {
                title: '维修人员',
                field: 'fixer',
                width: 150
            }, {
                title: '故障原因',
                field: 'breakdown_reson',
                width: 150
            }, {
                title: '解决方案',
                field: 'solution',
                width: 150
            }, {
                title: '故障是否排除',
                field: 'ok_flag',
                width: 150,
                formatter: function (v) {
                    if (v == 0) {
                        return '<span style="color: red;">未解决</span>';
                    } else {
                        return '<span style="color:green;">已解决</span>';
                    }

                }
            },

                {
                    title: '备注',
                    field: 'remark',
                    width: 150
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

var repair = {

    isEdit: false,

    currentActive: null,

    window: null,

    educationWindow: null,

    selectedRecord: null,

    init: function () {

        top.$('#area_province').combobox({
            url: g.ctx + "common/provice",
            valueField: 'sn',
            textField: 'name',
            onChange: function (newValue) {
                top.$('#area_city').combobox({
                    url: g.ctx + "common/area?sn=" + newValue,
                    valueField: 'sn',
                    textField: 'name'
                });
            }
        });
    },
    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm() {
            var row = grid.getSelectedRow();
            var self = this;
            repair.init();
            if (isEdit) {
                top.$('#title').focus();
                $.ajaxjson(url.show, {'id': row.id}, function (rst) {

                    if (rst.status == "OK") {
                        var data = rst.data;
                        top.$('#repair').form('load', formatFormDataJson(data));
                        top.$('#car_info').val(data.car.car_no);
                    } else {
                        msg.ok('加载数据失败！');
                        self.window.dialog('close');
                    }
                });
            }
        }

        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 550,
            height: 630,
            href: url.form + '?v=' + Math.random(),
            iconCls: isEdit ? 'icon-edit' : 'icon-add',
            onLoad: function () {
                initForm();
                top.$('#breakdown_time').datebox({
                    required: true
                });
                top.$('#fix_time').datebox({
                    required: true
                });
                top.$('#a_add_car').bind('click', function () {
                    self.addCarInfo = top.$.hDialog({
                        title: "选择车辆信息",
                        width: 550,
                        height: 330,
                        href: url.selectcar + '?v=' + Math.random(),
                        iconCls: isEdit ? 'icon-edit' : 'icon-add',
                        onLoad: function () {
                            top.$('#carDataGrid').datagrid({
                                url: url.carlist,
                                singleSelect: true,
                                width: 500,
                                height: 210,
                                nowrap: false,
                                rownumbers: true,
                                loadMsg: '正在努力加载中....',
                                resizable: true,
                                collapsible: false,
                                idField: 'id',
                                border: false,
                                method: 'get',
                                columns: [[{
                                    title: '主键',
                                    field: 'id',
                                    hidden: true
                                }, {
                                    title: '车牌号码',
                                    field: 'car_no',
                                    width: 80
                                }, {
                                    title: '车牌颜色',
                                    field: 'car_no_color',
                                    width: 120,
                                    formatter: function (v) {
                                        return pageMethod.getDict('RHJYQO', v);
                                    }
                                }, {
                                    title: '喷油方式',
                                    field: 'engine_gass_type',
                                    width: 60,
                                    formatter: function (v) {
                                        return pageMethod.getDict('LVQOJO', v);
                                    }
                                }, {
                                    title: '车辆标识',
                                    field: 'car_flag',
                                    width: 150,
                                    formatter: function (v) {
                                        return pageMethod.getDict('YIIBFH', v);
                                    }
                                }]],
                                pagination: true,
                                pageSize: 10,
                                pageList: [10, 20, 50, 100]
                            });
                            top.$("#a_a_search")
                               .bind('click', function () {
                                   var carNo = $("#car_code")
                                       .val();
                                   top.$('#carDataGrid')
                                      .datagrid({
                                          url: url.carlist,
                                          queryParams: {
                                              's-ci.car_no-like': carNo
                                          }
                                      });
                               });
                        },
                        submit: function () {
                            if (top.$('#carDataGrid')
                                   .datagrid('getSelected')) {
                                var carId = top.$('#carDataGrid')
                                               .datagrid('getSelected').id;
                                var carNo = top.$('#carDataGrid')
                                               .datagrid('getSelected').car_no;
                                top.$("#car_id")
                                   .val(carId);
                                top.$("#car_info")
                                   .val(carNo);
                                self.addCarInfo.dialog('close');
                                return false;
                            } else {
                                top.layer.msg('未选中车辆', {
                                    //offset: 'rb',
                                    shift: 2,
                                    icon: 0
                                });
                                return false;
                            }
                        }
                    });
                });
            },
            submit: function () {
                self.doSubmit();
                return false;
            }
        });
    },

    doSubmit: function () {
        var self = this;
        if (top.$('#repair').form("validate")) {
            $.submitForm(top.$('#repair'), url.save, function (rst) {
                msg.ok('操作成功!');
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
            layer.confirm('您确认要删除车辆维修信息么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        grid.reload();
                    } else {
                        msg.warning('删除删除车辆维修失败!');
                    }
                });
            });
        } else {
            msg.warning("请选择你要删除的行");
        }
        return false;

    },
    ok: function () {
        if (grid.getSelectedRow()) {
            var row = grid.getSelectedRows();
            var row_ids = new Array(row.length);

            for (var i = 0; i < row.length; i++) {
                row_ids[i] = row[i].id;
            }
            layer.confirm('您确认问题已解决么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.ok, {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('操作成功！');
                        grid.reload();
                    } else {
                        msg.warning('确认问题已解决失败!');
                    }
                });
            });
        } else {
            msg.warning("请选择你要确认问题已解决的行");
        }
        return false;

    },
    searchData: function () {
        var carNo = $("#car_code").val();
        var driverCompay = $("#s_driver_company").val();
        var fixer = $("#s_fixer").val();
        var fixLocation = $("#s_fix_location").val();
        $('#list').datagrid({
            url: url.list,
            queryParams: {
                's-ci.car_no-like': carNo,
                's-md.work_unit-like': driverCompay,
                's-mfr.fixer-like': fixer,
                's-mfr.fix_location-like': fixLocation
            }
        });
    },
    refreash: function () {
        grid.reload();
    }
};
