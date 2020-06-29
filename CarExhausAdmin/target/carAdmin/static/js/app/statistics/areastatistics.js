/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */
$(function () {
    var pieOption = echarts.init(document.getElementById('pie'));
    var histogramOption = echarts.init(document.getElementById('histogram'));
    $('#s_province').combobox({
        url: g.ctx + "common/provice",
        valueField: 'sn',
        textField: 'name'
    });
    areaSearch.search(pieOption, histogramOption, '');
    $("#a_search").bind('click', function () {
        var areaProvince = $("#s_province").combobox("getValue");
        areaSearch.search(pieOption, histogramOption, areaProvince);
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
var areaSearch = {
    search: function (pieOption, histogramOption, areaSn) {
        var url = g.ctx + 'statistics/areastatistics/data';
        $.ajax({
            url: url,
            data:{sn:areaSn},
            success: function (data) {
                var names = [];
                var values = [];
                var sDatas = Hamster.Array.map(data, function (record, idx) {
                    record.value = record.c;
                    var itemStyle = {'normal': {'color': 'aaa'}};
                    itemStyle.normal.color = areaSearch.drawColor(idx);
                    record.itemStyle = itemStyle;
                    return record;
                });
                if (!sDatas) {
                    names.push("");
                    values.push(0);
                }
                for (var i = 0; i < sDatas.length; i++) {
                    var _record = sDatas[i];
                    names[i] = _record.name;
                    values[i] = _record.c;
                }

                var histogram = {
                    tooltip: {},
                    xAxis: {
                        data: names
                    },
                    yAxis: {},
                    series: [{
                        name: '车辆数量',
                        type: 'bar',
                        data: sDatas
                    }]
                };
                var pie = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    series: [{
                        name: names,
                        type: 'pie',
                        radius: '55%',
                        data: sDatas
                    }]
                };
                pieOption.setOption(pie);
                histogramOption.setOption(histogram);
            }
        });
    },
    drawColor: function (_index) {
        switch (_index) {
            case 1:
                return colors.A;
            case 2:
                return colors.B;
            case 3:
                return colors.C;
            case 4:
                return colors.D;
            case 5:
                return colors.E;
            case 6:
                return colors.F;
            case 7:
                return colors.G;
            case 8:
                return colors.H;
            case 9:
                return colors.I;
            case 10:
                return colors.J;
            case 11:
                return colors.K;
            case 12:
                return colors.L;
            default:
                return colors.M;
        }
    }
};
