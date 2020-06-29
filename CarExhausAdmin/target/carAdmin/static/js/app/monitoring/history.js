/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'monitoring/history/list',
    export: g.ctx + 'monitoring/history/export'
  }

$(function () {
  pageMethod.dictBind('s_car_model', 'YIIBFH', 1)
  pageMethod.dictBind('s_no_qualified', 'FNZYSX', 1)
  $('#s_start_date').datebox({
    formatter: function (date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    },
    arser: function (date) {
      return new Date(Date.parse(date.replace(/-/g, '/')))
    }
  })
  $('#s_end_date').datebox({
    formatter: function (date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    },
    arser: function (date) {
      return new Date(Date.parse(date.replace(/-/g, '/')))
    }
  })
  $('#s_province').combobox({
    url: g.ctx + 'common/provice',
    valueField: 'sn',
    textField: 'name',
    onChange: function (newValue) {
      $('#s_city').combobox({
        url: g.ctx + 'common/area?sn=' + newValue,
        valueField: 'sn',
        textField: 'name'
      })
    }
  })
  autoResize({
    dataGrid: '#list',
    gridType: 'datagrid',
    callback: grid.bind,
    height: 0,
    width: 0
  })
  $('#a_refresh').attr('onclick', 'deviceData.refreash();')
  $('#a_search').attr('onclick', 'deviceData.searchData();')
  $('#a_export').attr('onclick', 'deviceData.exportData();')
})

var grid = {
  bind: function (winSize) {
    var columns = []

    var dpfBeforeTemperatureText = pageMethod.getDict('DEVICE_DATA_MAP', 'dpf_before_temperature')
    if (!Hamster.isEmpty(dpfBeforeTemperatureText)) {
      columns.push({
        title: dpfBeforeTemperatureText,
        field: 'dpf_before_temperature',
        width: 80
      })
    }
    var temperature1Ttitle = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_1')
    if (!Hamster.isEmpty(temperature1Ttitle)) {
      columns.push({
        title: temperature1Ttitle,
        field: 'temperature_1',
        width: 80,
        formatter: function (v, r) {
          if (r.temperature_1_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var temperature2Ttitle = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_2')
    if (!Hamster.isEmpty(temperature2Ttitle)) {
      columns.push({
        title: temperature2Ttitle,
        field: 'temperature_2',
        width: 80,
        formatter: function (v, r) {
          if (r.temperature_2_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var temperature3Ttitle = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_3')
    if (!Hamster.isEmpty(temperature3Ttitle)) {
      columns.push({
        title: temperature3Ttitle,
        field: 'temperature_3',
        width: 80,
        formatter: function (v, r) {
          if (r.temperature_3_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var temperature4Ttitle = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_4')
    if (!Hamster.isEmpty(temperature4Ttitle)) {
      columns.push({
        title: temperature4Ttitle,
        field: 'temperature_4',
        width: 80,
        formatter: function (v, r) {
          if (r.temperature_4_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var pressureTtitle = pageMethod.getDict('DEVICE_DATA_MAP', 'pressure')
    if (!Hamster.isEmpty(pressureTtitle)) {
      columns.push({
        title: pressureTtitle,
        field: 'pressure',
        width: 150,
        formatter: function (v, r) {
          if (v) {
            v = Number.parseFloat(v / 1000).toFixed(2)
          }
          if (r.pressure_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var ureaTemperatureTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'urea_temperature')
    if (!Hamster.isEmpty(ureaTemperatureTitle)) {
      columns.push({
        title: ureaTemperatureTitle,
        field: 'urea_temperature',
        width: 150,
        formatter: function (v, r) {
          if (r.urea_temperature_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var ureaPositionTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'urea_position')
    if (!Hamster.isEmpty(ureaPositionTitle)) {
      columns.push({
        title: ureaPositionTitle,
        field: 'urea_position',
        width: 150,
        formatter: function (v, r) {
          if (r.urea_position_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var speedTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'speed')
    if (!Hamster.isEmpty(speedTitle)) {
      columns.push({
        title: speedTitle,
        field: 'speed',
        width: 150,
        formatter: function (v, r) {
          if (r.flag_speed == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var afterKmTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'after_km')
    if (!Hamster.isEmpty(afterKmTitle)) {
      columns.push({
        title: afterKmTitle,
        field: 'after_km',
        width: 150,
        formatter: function (v, r) {
          if (r.flag_mileage == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var obdTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'obd')
    if (!Hamster.isEmpty(obdTitle)) {
      columns.push({
        title: obdTitle,
        field: 'obd',
        width: 150
      })
    }
    var engine_speed = pageMethod.getDict('DEVICE_DATA_MAP', 'engine_speed')
    if (!Hamster.isEmpty(engine_speed)) {
      columns.push({
        title: engine_speed,
        field: 'engine_speed',
        width: 150
      })
    }
    var torque = pageMethod.getDict('DEVICE_DATA_MAP', 'torque')
    if (!Hamster.isEmpty(torque)) {
      columns.push({
        title: torque,
        field: 'torque',
        width: 150
      })
    }
    var nox = pageMethod.getDict('DEVICE_DATA_MAP', 'nox')
    if (!Hamster.isEmpty(nox)) {
      columns.push({
        title: nox,
        field: 'nox',
        width: 150
      })
    }
    var curon = pageMethod.getDict('DEVICE_DATA_MAP', 'curon')
    if (!Hamster.isEmpty(curon)) {
      columns.push({
        title: curon,
        field: 'curon',
        width: 150
      })
    }
    var engine_load = pageMethod.getDict('DEVICE_DATA_MAP', 'engine_load')
    if (!Hamster.isEmpty(engine_load)) {
      columns.push({
        title: engine_load,
        field: 'engine_load',
        width: 150
      })
    }
    var pmValueTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'pm_value')
    if (!Hamster.isEmpty(pmValueTitle)) {
      columns.push({
        title: pmValueTitle,
        field: 'pm_value',
        width: 150,
        formatter: function (v, r) {
          if (r.pm_value_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var noValueTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'no_value')
    if (!Hamster.isEmpty(noValueTitle)) {
      columns.push({
        title: noValueTitle,
        field: 'no_value',
        width: 150,
        formatter: function (v, r) {
          if (r.no_value_flag == 1) {
            return '<span style="color:red;">' + v + '</span>'
          } else {
            return '<span style="color:green;">' + v + '</span>'
          }
        }
      })
    }
    var dpf_arter_temperatureTitle = pageMethod.getDict('DEVICE_DATA_MAP', 'dpf_arter_temperature')
    if (!Hamster.isEmpty(dpf_arter_temperatureTitle)) {
      columns.push({
        title: dpf_arter_temperatureTitle,
        field: 'dpf_arter_temperature',
        width: 100,
        formatter: function (v, r) {
                    // --  针对惠州平台
                    // if (r.terminal == '艾可蓝') {
                    //     return '<span style="color:grey;">--</span>'
                    // }
          return '<span style="color:green;">' + v + '</span>'
        }
      })
    }

    columns.push({
      title: '车辆标识',
      field: 'car_flag',
      width: 150,
      formatter: function (v) {
        return pageMethod.getDict('YIIBFH', v)
      }
    }, {
      title: '生产厂商',
      field: 'terminal',
      width: 150
    }, {
      title: '故障码',
      field: 'errorcode',
      width: 150
    }, {
      title: '经度',
      field: 'baidu_longitude',
      width: 150
    }, {
      title: '纬度',
      field: 'baidu_latitude',
      width: 150
    })

    _gridlist = $('#list').datagrid({
      url: url.list,
      toolbar: '#toolbar',
      loadMsg: '正在加载数据，请稍等...',
      iconCls: 'icon icon-list',
      width: winSize.width,
      height: winSize.height,
      nowrap: false, // 折行
      rownumbers: true, // 行号
      striped: true, // 隔行变色
      idField: 'id', // 主键
      singleSelect: false, // 单选
      border: false,
      onRowContextMenu: pageContextMenu.createDataGridContextMenu,
      frozenColumns: [[{
        title: '车牌号码',
        field: 'car_no',
        width: 80
      }, {
        title: '车牌颜色',
        field: 'car_no_color',
        width: 120,
        formatter: function (v) {
          return pageMethod.getDict('RHJYQO', v)
        }
      }, {
        title: '车架号',
        field: 'car_framework_no',
        width: 160
      }, {
        title: '日期',
        field: 'report_time',
        width: 150
      }]],
      columns: [columns],
      pagination: true,
      pageSize: 20,
      pageList: [20, 10, 30, 50]
    })
  },
  getSelectedRows: function () {
    return _gridlist.datagrid('getSelections')
  },
  getSelectedRow: function () {
    return _gridlist.datagrid('getSelected')
  },
  getSelectedRowIds: function () {
    var selecteds = _gridlist.datagrid('getSelections')
    var selectedIds = []
    for (var i = 0; i < selecteds.length; i++) {
      selectedIds.push(selecteds[i].id)
    }
    return selectedIds
  },
  reload: function () {
    _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''})
  }
}

var deviceData = {

  isEdit: false,

  currentActive: null,

  window: null,

  educationWindow: null,

  selectedRecord: null,

  searchData: function () {
    var carNo = $('#s_car_no').val()
    var carModel = $('#s_car_model').combobox('getValue')
    var driverCompany = $('#s_driver_company').val()
    var noQualified = $('#s_no_qualified').combobox('getValue')
    var startDate = $('#s_start_date').datebox('getValue')
    var endDate = $('#s_end_date').datebox('getValue')
    var areaProvince = $('#s_province').combobox('getValue')
    var areaCity = $('#s_city').combobox('getValue')
    var areaSn = areaCity ? areaCity : areaProvince

    if (!carNo) {
      msg.warning('请输入车牌号!')
      return
    }

    if (!startDate) {
      msg.warning('请选择开始日期')
      return
    }

    if (!endDate) {
      msg.warning('请选择结束日期')
      return
    }

    var startMDate = moment(startDate, 'YYYY-M-D')
    var endMDate = moment(endDate, 'YYYY-M-D')

    if (endMDate.diff(startMDate) < 0) {
      msg.warning('结束日期需要大于开始日期!')
      return
    }

    if (endMDate.diff(startMDate, 'months') >= 1) {
      msg.warning('请查询1个月内的数据!')
      return
    }

    if (endMDate._d.getFullYear() != startMDate._d.getFullYear()) {
      msg.warning('请查询同一年度内的数据!')
      return
    }

    var threeYearAgo = moment().subtract(3, 'years')
    console.log('---threeYearAge:' + threeYearAgo.format('YYYY-MM-DD'))
    if (threeYearAgo.diff(startMDate) >= 0) {
      msg.warning('请查询3年内的数据!')
      return
    }

    $('#list').datagrid({
      url: url.list,
      queryParams: {
        'carNo': carNo,
        'carModel': carModel,
        'driverCompany': driverCompany,
        'noQualified': noQualified,
        'startDate': startDate,
        'endDate': endDate,
        'areaSn': areaSn
      }
    })
  },

  exportData: function () {
    var carNo = $('#s_car_no').val()
    var carModel = $('#s_car_model').combobox('getValue')
    var driverCompany = $('#s_driver_company').val()
    var noQualified = $('#s_no_qualified').combobox('getValue')
    var startDate = $('#s_start_date').datebox('getValue')
    var endDate = $('#s_end_date').datebox('getValue')
    var areaProvince = $('#s_province').combobox('getValue')
    var areaCity = $('#s_city').combobox('getValue')
    var areaSn = areaCity ? areaCity : areaProvince

    var total = _gridlist.datagrid('getData').total
    if (total && total > 10000) {
      msg.warning('不能导出超过1万条数据!')
      return
    }

    if (!carNo) {
      msg.warning('请输入车牌号!')
      return
    }

    if (!startDate) {
      msg.warning('请选择开始日期')
      return
    }

    if (!endDate) {
      msg.warning('请选择结束日期')
      return
    }

    var startMDate = moment(startDate, 'YYYY-M-D')
    var endMDate = moment(endDate, 'YYYY-M-D')

    if (endMDate.diff(startMDate) < 0) {
      msg.warning('结束日期需要大于开始日期!')
      return
    }

    if (endMDate.diff(startMDate, 'months') >= 1) {
      msg.warning('请查询1个月内的数据!')
      return
    }

    if (endMDate._d.getFullYear() != startMDate._d.getFullYear()) {
      msg.warning('请查询同一年度内的数据!')
      return
    }

    var threeYearAgo = moment().subtract(3, 'years')
    console.log('---threeYearAge:' + threeYearAgo.format('YYYY-MM-DD'))
    if (threeYearAgo.diff(startMDate) >= 0) {
      msg.warning('请查询3年内的数据!')
      return
    }

        /* $('#list').datagrid({
            url: url.list,
            queryParams: {
                'carNo': carNo,
                'carModel': carModel,
                'driverCompany': driverCompany,
                'noQualified': noQualified,
                'startDate': startDate,
                'endDate': endDate,
                'areaSn': areaSn
            }
        }); */
    var $formExport = $('#form_export')
    $formExport.attr('action', url.export)
    $('#f_carNo').val(carNo)
    $('#f_carModel').val(carModel)
    $('#f_driverCompany').val(driverCompany)
    $('#f_noQualified').val(noQualified)
    $('#f_startDate').val(startDate)
    $('#f_endDate').val(endDate)
    $('#f_areaSn').val(areaSn)
    $formExport.submit()
  },

  refreash: function () {
    grid.reload()
  }
}
