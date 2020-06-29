/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */
$(function () {
    
    $('#s_start_date').datetimebox({
        showSeconds: false
    });
    $('#s_end_date').datetimebox({
        showSeconds: false
    });
    
    var dpfBeforePressure = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_3');
    var dpfAfterPressure = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_4');
    var dpfPressure = pageMethod.getDict('DEVICE_DATA_MAP', 'pressure');
    
    var dpfBeforeTemperature = pageMethod.getDict('DEVICE_DATA_MAP', 'dpf_before_temperature');
    var dpfAfterTemperature = pageMethod.getDict('DEVICE_DATA_MAP', 'dpf_arter_temperature');
    var docBeforeTemperature = pageMethod.getDict('DEVICE_DATA_MAP', 'temperature_1');
    
    var pieOption = echarts.init(document.getElementById('pie'));
    var perssureLineChart = echarts.init(document.getElementById('pressureLineChart'));
    
    //carType.search(pieOption, '');
    $("#a_search").bind('click', function () {
        var carNo = $("#s_car_no").val();
        var startDate = $("#s_start_date").datetimebox("getValue");
        var endDate = $("#s_end_date").datetimebox("getValue");
        
        if (!carNo) {
            msg.warning('请输入车牌号!');
            return;
        }
        
        if (!startDate) {
            msg.warning('请选择开始日期');
            return;
        }
        
        if (!endDate) {
            msg.warning('请选择结束日期');
            return;
        }
        var startMDate = moment(startDate, 'YYYY-M-D H:m');
        var endMDate = moment(endDate, 'YYYY-M-D H:m');
        
        if (endMDate.diff(startMDate) <= 0) {
            msg.warning('结束日期需要大于等于开始日期!');
            return;
        }
        
        /*if (endMDate.diff(startMDate, 'months') >= 1) {
            msg.warning('请查询1个月内的数据!');
            return;
        }*/
        
        if (endMDate._d.getFullYear() != startMDate._d.getFullYear()) {
            msg.warning('请查询同一年度内的数据!');
            return;
        }
        search(carNo, startDate, endDate);
    });
    
    $("#a_export").bind('click', function () {
        var img1 = pieOption.getDataURL({
            type: 'png',
            pixelRatio: 1,
            backgroundColor: '#fff'
        });
        $("#img1").val(img1);
        var perssureImage = perssureLineChart.getDataURL({
            type: 'png',
            pixelRatio: 1,
            backgroundColor: '#fff'
        });
        $("#perssureImage").val(perssureImage);
        
        $("#f_export").submit();
    });
    
    function search(carNo, startDate, endDate) {
        var url;
        url = g.ctx + 'statistics/temperature/data';
        $.ajax({
            type: 'post',
            data: {
                carNo: carNo,
                startDate: startDate,
                endDate: endDate
            },
            url: url,
            success: function (data) {
                //return;
                if (data == '' || data == null) {
                    layer.alert('暂无数据');
                    return;
                }
                
                var dateList = data.map(function (item) {
                    return item.xdate;
                });
                
                var dpfBeforeTemperatureList = data.map(function (item) {
                    return item.dpf_before_temperature;
                });
                
                var dpfAfterTemperatureList = data.map(function (item) {
                    return item.dpf_arter_temperature;
                });
                
                var docBeforeTemperatureList = data.map(function (item) {
                    return item.doc_before_temperature;
                });
                
                var temperatureOption = {
                    title: {
                        text: '温度统计趋势图'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: [dpfBeforeTemperature, dpfAfterTemperature, docBeforeTemperature]
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: dateList
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: dpfBeforeTemperature,
                            type: 'line',
                            areaStyle: {normal: {}},
                            data: dpfBeforeTemperatureList
                        },
                        {
                            name: dpfAfterTemperature,
                            type: 'line',
                            areaStyle: {normal: {}},
                            data: dpfAfterTemperatureList
                        },
                        {
                            name: docBeforeTemperature,
                            type: 'line',
                            areaStyle: {normal: {}},
                            data: docBeforeTemperatureList
                        }
                    ]
                };
                
                var dpfAfterPressureList = data.map(function (item) {
                    return item.dpf_after_pressure;
                });
                var dpfBeforePressureList = data.map(function (item) {
                    return item.dpf_before_pressure;
                });
                var dpfPressureList = data.map(function (item) {
                    return item.pressure;
                });
                
                var perssureLineChartOption = {
                    title: {
                        text: '压力统计趋势图'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: [dpfBeforePressure, dpfAfterPressure, dpfPressure]
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: dateList
                        }
                    ],
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            name: dpfBeforePressure,
                            type: 'line',
                            data: dpfBeforePressureList
                        },
                        {
                            name: dpfAfterPressure,
                            type: 'line',
                            data: dpfAfterPressureList
                        },
                        {
                            name: dpfPressure,
                            type: 'line',
                            data: dpfPressureList
                        }
                    ]
                };
                
                pieOption.setOption(temperatureOption);
                perssureLineChart.setOption(perssureLineChartOption);
            }
        });
    }
});
