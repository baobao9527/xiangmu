/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */
$(function () {
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
    
    /**
     *
     * @author BOGON
     * @version 1.0
     */
    var pieOption = echarts.init(document.getElementById('pie'));
    var histogramOption = echarts.init(document.getElementById('histogram'));
    carType.search(pieOption, histogramOption, '');
    $("#a_search").bind('click', function () {
        var areaProvince = $("#s_province").combobox("getValue");
        var areaCity = $("#s_city").combobox("getValue");
        var areaSn;
        if (areaCity) {
            areaSn = areaCity;
            carType.search(pieOption, histogramOption, areaSn, 2);
        } else {
            areaSn = areaProvince;
            carType.search(pieOption, histogramOption, areaSn, 1);
        }
    });

    $("#a_export").bind('click', function(){
        var img1 = pieOption.getDataURL({
            type:'png',
            pixelRatio: 1,
            backgroundColor: '#fff'
        });
        $("#img1").val(img1);
        var img2 = histogramOption.getDataURL({
            type:'png',
            pixelRatio: 1,
            backgroundColor: '#fff'
        });
        $("#img2").val(img2);

        $("#f_export").submit();
    });
});
var carType = {
    search: function (pieOption, histogramOption, areaSn, type) {
        var url;
        if (areaSn) {
            url = g.ctx + 'statistics/enginetype/data?code=' + areaSn + '&type=' + type;
        } else {
            url = g.ctx + 'statistics/enginetype/data';
        }
        $.ajax({
            url: url,
            success: function (data) {
                console.log(data);
                var names = [];
                var values = [];
                var sDatas = Hamster.Array.map(data, function (record) {
                    record.value = record.c;
                    var itemStyle = {'normal': {'color': 'aaa'}};
                    itemStyle.normal.color = carType.drawColor(record.name);
                    record.itemStyle = itemStyle;
                    var label = {'normal': {'textStyle': {'color': '#050505'}}};
                    record.label = label;
                    return record;
                });
                
                for (var i = 0; i < sDatas.length; i++) {
                    names[i] = sDatas[i].name;
                    values[i] = sDatas[i].c;
                }
                if (sDatas.length == 0) {
                    names.push("");
                    values.push(0);
                    var tt = {
                        value: 0,
                        label: ""
                    };
                    sDatas.push(tt)
                }
                var histogram = {
                    /*toolbox:{
                        show:true,
                        feature:{
                            show:true,
                            saveAsImage:{
                                backgroundColor:'#fff'
                            }
                        }
                    },*/
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        top: '20',
                        left: 'left',
                        data: names,
                        bottom: '20'
                    },
                    xAxis: {
                        type: 'category',
                        data: names
                    },
                    yAxis: {
                        type: 'value',
                        name: '安装数量'
                    },
                    series: [{
                        name: '安装数量',
                        type: 'bar',
                        data: sDatas
                    }]
                };
                var pie = {
                    /*toolbox:{
                        show:true,
                        feature:{
                            show:true,
                            saveAsImage:{
                                backgroundColor:'#fff'
                            }
                        }
                    },*/
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        top: '20',
                        left: 'left',
                        data: names
                    },
                    series: [{
                        name: '安装数量',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: sDatas
                    }]
                };
                pieOption.setOption(pie);
                histogramOption.setOption(histogram);
            }
        });
    },
    drawColor: function (name) {
        switch (name) {
            case '1L':
                return colors.A;
            case '2L':
                return colors.B;
            case '3L':
                return colors.C;
            case '4L':
                return colors.D;
            case '5L':
                return colors.E;
            case '6L':
                return colors.F;
            case '7L':
                return colors.G;
            case '8L':
                return colors.H;
        }
    }
}
