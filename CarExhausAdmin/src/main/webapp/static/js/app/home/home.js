/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'car/home/list',
    form: g.ctx + 'static/views/car/form.html',
    invalid: g.ctx + 'static/views/car/invalid.html',
    show: g.ctx + 'car/home/show',
    del: g.ctx + 'car/home/del',
    save: g.ctx + 'car/home/save',
    invalidsave: g.ctx + 'car/home/invalidsave',
    terminallist: g.ctx + 'device/home/listWarning',
    terminal: g.ctx + 'static/views/car/homeError.html',
    saveTerminal: g.ctx + 'car/home/saveterminal'
};

$(function () {
    pageMethod.dictBind('s_car_flag', 'YIIBFH', 1);
    pageMethod.dictBind('s_car_no_color', 'RHJYQO', 1);
    $('#s_province').combobox({
        url: g.ctx + "common/provice",
        valueField: 'sn',
        textField: 'name',
        onChange: function (newValue) {
            $('#s_city').combobox({
                url: g.ctx + "common/area?sn=" + newValue,
                valueField: 'sn',
                textField: 'name'
            });
        }
    });
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
    $('#a_refresh').attr('onclick', 'CarInfo.refreash();');
    $('#a_add').attr('onclick', 'CarInfo.add();');
    $('#a_edit').attr('onclick', 'CarInfo.edit();');
    $('#a_delete').attr('onclick', 'CarInfo.del();');
    $('#a_search').attr('onclick', 'CarInfo.searchData();');
    $('#a_add_invalid').attr('onclick', 'CarInfo.invalidSetting();');
    $('#syserr').attr('onclick', 'CarInfo.syserr();');

    var $aAgentSet = $('#a_agent_set');
    if ($aAgentSet.length) {
        $aAgentSet.on('click', function () {

            var getSelectedRows = grid.getSelectedRows();
            if (!getSelectedRows) {
                top.$.messager.alert('温馨提示', '请先选择车辆！', 'warning');
                return;
            }
            if (getSelectedRows.length > 1) {
                top.$.messager.alert('温馨提示', '设置查看用户只能够选择单个车辆！', 'warning');
                return;
            }

            var carId = getSelectedRows[0].id;

            var choiceAgentDialog = top.$.hDialog({
                title: '选择代理商',
                width: 580,
                height: 440,
                href: g.ctx + 'static/views/car/agent.html?v=' + Math.random(),
                iconCls: 'icon-search',
                onLoad: function () {
                    top.$('#agentDataGrid').datagrid({
                        url: g.ctx + 'car/home/agents',
                        singleSelect: false,
                        width: 560,
                        height: 360,
                        nowrap: false,
                        rownumbers: true,
                        loadMsg: '正在努力加载中....',
                        resizable: true,
                        collapsible: false,
                        idField: 'id',
                        border: false,
                        method: 'post',
                        rowStyler: function (index, row) {
                            if (row.assign) {
                                if (row.assign > 0) {
                                    row['check'] = true;
                                    return 'background-color:pink;color:blue;font-weight:bold;';
                                }
                            }
                        },
                        onLoadSuccess: function (data) {
                            var rowData = data.rows;
                            $.each(rowData, function (index, value) {
                                if (value.assign && value.assign > 0) {
                                    top.$("#agentDataGrid").datagrid("selectRow", index);
                                }
                            });
                        },
                        queryParams: {'car': carId},
                        columns: [[{
                            field: 'ck',
                            checkbox: true
                        }, {
                            title: '主键',
                            field: 'id',
                            hidden: true
                        }, {
                            title: '登录账号',
                            field: 'name',
                            width: 140
                        }, {
                            title: '真实姓名',
                            field: 'username',
                            width: 140
                        }, {
                            title: '手机号码',
                            field: 'phone',
                            width: 160
                        }, {
                            title: '出生年月',
                            field: 'birthday',
                            width: 140
                        }, {
                            title: '性别',
                            field: 'gender',
                            width: 60,
                            formatter: function (v, d, i) {
                                if (v === 1) {
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
                        pageList: [10, 20, 50, 100]
                    });
                    top.$("#a_agent_choice").click(function () {
                        var agentName = $.trim($("#txt_agent_name").val());
                        var phone = $.trim($("#txt_phone").val());
                        top.$('#agentDataGrid').datagrid(('load'), {
                            's-mu.username-like': agentName,
                            's-mu.phone-like': phone
                        });
                    });
                },
                submit: function () {
                    var selectAgentRow = top.$('#agentDataGrid').datagrid('getSelections');
                    if (selectAgentRow) {
                        var ids = [];
                        for (var i = 0; i < selectAgentRow.length; i++) {
                            ids.push(selectAgentRow[i].id);
                        }

                        $.ajaxjson(g.ctx + 'car/home/assign', {
                            car: carId,
                            users: ids.join(',')
                        }, function (rst) {
                            if (rst.status == 'OK') {
                                top.$.messager.alert('温馨提示', '设置成功！', 'warning', function(){
                                    choiceAgentDialog.dialog('close');
                                });
                            } else {
                                top.$.messager.alert('温馨提示', rst.message, 'warning');
                            }
                        });

                    } else {
                        top.$.messager.alert('温馨提示', '请先选择一个代理商用户！', 'warning');
                    }
                    return false;
                }
            });

            return false;
        })
    }

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
                "title": "",
                "colspan": 3
            }, {
                "title": "发动机参数",
                "colspan": 4
            }, {
                "title": "监控数据失效标准",
                "colspan": 18
            }, {
                "title": "初始排放参数",
                "colspan": 6
            }, {
                "title": "",
                "colspan": 3
            }], [{
                title: '车牌颜色',
                field: 'car_no_color',
                width: 120,
                formatter: function (v) {
                    return pageMethod.getDict('RHJYQO', v);
                }
            }, {
                title: "设备号",
                field: 'device_code',
                width: 120
            }, {
                title: '日期',
                field: 'create_date',
                width: 120
            }, {
                title: '时间',
                field: 'create_time',
                width: 150
            }, {
                title: '型号',
                field: 'engine_model',
                width: 80
            }, {
                title: '功率',
                field: 'engine_power',
                width: 80
            }, {
                title: '排量',
                field: 'engine_discharge_value',
                width: 80
            }, {
                title: '喷油方式',
                field: 'engine_gass_type',
                width: 60,
                formatter: function (v) {
                    return pageMethod.getDict('LVQOJO', v);
                }
            }, {
                title: 'DOC前温最大',
                field: 'temperature_1_max',
                width: 150
            }, {
                title: 'DOC前温最小',
                field: 'temperature_1_min',
                width: 150
            }, {
                title: 'SCR后温最大',
                field: 'temperature_2_max',
                width: 150
            }, {
                title: 'SCR后温最小',
                field: 'temperature_2_min',
                width: 150
            }, {
                title: 'DPF前压力最大',
                field: 'temperature_3_max',
                width: 150
            }, {
                title: 'DPF前压力最小',
                field: 'temperature_3_min',
                width: 150
            }, {
                title: 'DPF后压力最大',
                field: 'temperature_4_max',
                width: 150
            }, {
                title: 'DPF后压力最小',
                field: 'temperature_4_min',
                width: 150
            }, {
                title: '最大压差(Pa)',
                field: 'pressure_max',
                width: 150
            }, {
                title: '最小压差(Pa)',
                field: 'pressure_min',
                width: 150
            }, {
                title: '最大尿素温度(℃)',
                field: 'urea_temperature_max',
                width: 150
            }, {
                title: '最小尿素温度(℃)',
                field: 'urea_temperature_min',
                width: 150
            }, {
                title: '最高尿素液位(%)',
                field: 'urea_position_max',
                width: 150
            }, {
                title: '最低尿素液位(%)',
                field: 'urea_position_min',
                width: 150
            }, {
                title: '最大车速(km/h)',
                field: 'max_speed',
                width: 150
            }, {
                title: '最小车速(km/h)',
                field: 'min_speed',
                width: 150
            }, {
                title: '最大里程(km)',
                field: 'max_mileage',
                width: 150
            }, {
                title: '最小里程(km)',
                field: 'min_mileage',
                width: 150
            }, {
                    title: '烟度平均值（自有加速）',
                    field: 'inital_smoke_value',
                    width: 150
                }, {
                    title: '轮边功率',
                    field: 'wheel_power',
                    width: 150
                }, {
                    title: '烟度平均值(加载减速80%)',
                    field: 'inital_smoke_80_value',
                    width: 150
                }, {
                    title: '烟度平均值(加载减速90%)',
                    field: 'inital_smoke_90_value',
                    width: 150
                }, {
                    title: '初始氮氧值',
                    field: 'inital_h2_o2_value',
                    width: 150
                }, {
                    title: '原车排放标准',
                    field: 'car_discharge_standard',
                    width: 150
                }, {
                    title: '车辆标识',
                    field: 'car_flag',
                    width: 150,
                    formatter: function (v) {
                        return pageMethod.getDict('YIIBFH', v);
                    }
                }, {
                    title: '代理商',
                    field: 'oper',
                    width: 150
                }, {
                    title: '终端生产厂商',
                    field: 'terminal',
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

var CarInfo = {

    isEdit: false,

    currentActive: null,

    window: null,

    educationWindow: null,

    selectedRecord: null,

    init: function () {

        pageMethod.dictBind('display_flag', 'JNISTP');
        pageMethod.dictBind('engine_gass_type', 'LVQOJO');
        pageMethod.dictBind('car_flag', 'YIIBFH');
        pageMethod.dictBind('car_no_color', 'RHJYQO');
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

        if(g.userType == 1){
            // 选择代理商
            top.$('#a_agent_choice').click(function () {

            });
        } else {
            if(g.userType == 3){
                top.$('#hid_agent').val(g.userId);
                top.$('#agentName').val(g.userName);
            }
            top.$('#a_agent_choice').remove();
        }
    },
    showEditWindow: function (isEdit) {
        var self = this;
        if (this.isEdit = isEdit) {
            this.currentActive = grid.getSelectedRow();
        }

        function initForm() {
            var row = grid.getSelectedRow();

            CarInfo.init();
            if (isEdit) {
                top.$('#title').focus();
                $.ajaxjson(url.show, {'id': row.id}, function (rst) {

                    if (rst.status == "OK") {
                        var data = rst.data;
                        if (data.provice) {
                            top.$('#area_province').combobox("setValue", data.provice);
                        }
                        if (data.provice && data.city) {
                            top.$('#area_city').combobox({
                                url: g.ctx + "common/area?sn=" + data.provice,
                                valueField: 'sn',
                                textField: 'name'
                            });
                            top.$('#area_city').combobox("setValue", data.city);
                        }
                        top.$('#carForm').form('load', formatFormDataJson(data));

                        top.$('#agentName').val(data.agentName);
                    } else {
                        top.$.messager.alert('温馨提示', '加载数据失败！', 'warning');
                        self.window.dialog('close');
                    }
                });
            }
        }

        this.window = top.$.hDialog({
            title: isEdit ? "修改" : '添加',
            width: 880,
            height: 640,
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
        if (top.$('#car_no_color').combobox('getValue') == "") {
            top.layer.alert('请选中车牌颜色！', {
                title: "警告："
            });
            return;
        }
        if (top.$('#car_flag').combobox('getValue') == "") {
            top.layer.alert('请选中车辆标识！', {
                title: "警告："
            });
            return;
        }
        if (top.$('#engine_gass_type').combobox('getValue') == "") {
            top.layer.alert('请选中油喷类型！', {
                title: "警告："
            });
            return;
        }
        // if (top.$('#display_flag').combobox('getValue') == "") {
        //     top.layer.alert('前段显示标识！', {
        //         title: "警告："
        //     });
        //     return;
        // }

        if (top.$('#carForm').form("validate")) {
            $.submitForm(top.$('#carForm'), url.save, function (rst) {
                top.$.messager.alert('温馨提示', '操作成功！', 'info');
                self.window.dialog('close');
                grid.reload();
                self.currentActive = null;
            });
        }
    },
    doInvalidSubmit: function () {
        var self = this;
        if (top.$('#invalidForm').form("validate")) {
            $.submitForm(top.$('#invalidForm'), url.invalidsave, function (rst) {
                top.$.messager.alert('温馨提示', '操作成功！', 'info');
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

                    top.$.messager.alert('温馨提示', '修改不能选择多行！', 'warning');
                } else {
                    this.showEditWindow(true);
                }
            }
        } else {
            top.$.messager.alert('温馨提示', '请选择要修改的行！', 'warning');
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
            layer.confirm('您确认要删除车辆信息么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id[]": row_ids}, function (rst) {
                    if (rst.status == 'OK') {
                        top.$.messager.alert('温馨提示', '删除车辆成功！', 'info');
                        grid.reload();
                    } else {
                        top.$.messager.alert('温馨提示', '删除车辆失败！', 'warning');
                    }
                });
            });
        } else {
            top.$.messager.alert('温馨提示', '请选择你要删除的行！', 'warning');
        }
        return false;

    },
    invalidSetting: function () {

        var self = this;
        if (grid.getSelectedRow()) {
            var row = grid.getSelectedRows();
            if (row) {
                function initForm() {
                    var row = grid.getSelectedRow();
                    top.$("#car_id").val(row.id);
                }

                this.window = top.$.hDialog({
                    title: "监控失效项管理",
                    width: 850,
                    height: 470,
                    href: url.invalid + '?v=' + Math.random(),
                    iconCls: 'icon-edit',
                    onLoad: function () {
                        initForm();
                    },
                    submit: function () {
                        self.doInvalidSubmit();
                        return false;
                    }
                });
            }
        } else {

            top.$.messager.alert('温馨提示', '请选择要管理监控失效标准的车！', 'warning');
        }
    },   syserr: function () {
        var self = this;
     //   if (grid.getSelectedRow()) {
          //  var row = grid.getSelectedRows();
           // if (row) {

                this.window = top.$.hDialog({
                    title: "预警信息",
                    width: 550,
                    height: 500,
                    href: url.terminal + '?v=' + Math.random(),
                    iconCls: 'icon-edit',
                    onLoad: function () {
                        top.$('#deviceGrid').datagrid({
                            url: url.terminallist,
                            singleSelect: true,
                            width: top.$('#device_panel')
                                .panel()
                                .width(),
                            height: 350,
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
                            },  {
                                title: '预警类型',
                                field: 'category',
                                width: 160,
                                formatter: function (v) {
                                    if (v == 1) {
                                        return '<span style="color:red;">-压差传感器预警</span>';
                                    } else if (v == 2) {
                                        return '<span style="color:red;">温度传感器1预警</span>';
                                    }  else if (v == 3) {
                                        return '<span style="color:red;">温度传感器2预警</span>';
                                    } else if (v == 4) {
                                        return '<span style="color:red;">压差值预警</span>';
                                    }
                                }
                            },  {
                                title: '预警时间',
                                field: 'warning_time',
                                width: 160
                            }, {
                                title: '预警内容',
                                field: 'content',
                                width: 160
                            }]],
                            pagination: true,
                            pageSize: 10,
                            pageList: [10, 20, 50, 100]
                       });
                 }


                });
            //}
      //  } else {

          //  top.$.messager.alert('温馨提示', '请选择要管理终端的车！', 'warning');
  //  }
    },

    searchData: function () {
        var carNo = $("#car_code").val();
        var carNoColor = $("#s_car_no_color").combobox("getValue");
        var carFlag = $("#s_car_flag").combobox("getValue");
        var areaProvince = $("#s_province").combobox("getValue");
        var areaCity = $("#s_city").combobox("getValue");
        var areaSn;
        if (areaCity) {
            areaSn = areaCity;
        } else {
            areaSn = areaProvince;
        }
        $('#list').datagrid({
            url: url.list,
            queryParams: {
                's-ci.car_no-like': carNo,
                's-ci.car_no_color-eq': carNoColor,
                's-ci.car_flag-eq': carFlag,
                's-ci.area_sn-eq': areaSn
            }
        });
    },
    saveTerminal: function (carId, deviceId) {
        var self = this;

        $.ajaxjson(url.saveTerminal, {
            "carId": carId,
            "deviceId": deviceId
        }, function (rst) {
            console.log(rst);
            if (rst.status == 'OK') {

                top.$.messager.alert('温馨提示', '操作成功！', 'info');
                self.window.dialog('close');
                grid.reload();
                self.currentActive = null;
            } else {
                top.$.messager.alert('温馨提示', rst.message, 'warning');
            }
        });
    },
    refreash: function () {
        grid.reload();
    }
};
