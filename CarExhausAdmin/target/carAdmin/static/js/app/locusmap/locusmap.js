/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var url = {
    list: g.ctx + 'onlinemap/locusmap/list'
};

var map;
var lushu;
var carImages = {
    A: 'icon_daba',
    B: 'icon_qinka',
    C: 'icon_zhongka',
    D: 'icon_shuilijiaobanche',
    E: 'icon_diaoche',
    F: 'icon_daoluqinsaoche',
    G: 'icon_xiaofangche',
    H: 'icon_chache',
    I: 'icon_wajueji',
    J: 'icon_tuituji',
    K: 'icon_yaluji',
    L: 'icon_fadianjizu',
    M: 'icon_tanpuji',
    N: 'icon_chuanbo'
};

$(function () {

    var win = Hamster.getWin();
    win.resize(function () {
        if (windowResizeTimeout) {
            clearTimeout(windowResizeTimeout);
        }
        windowResizeTimeout = setTimeout(function () {
            $('#map').width(win.width()).height(win.height() - 42);
        }, 10);
    });
    win.trigger(Hamster.EventType.RESIZE);

    map = new BMap.Map('map', {enableMapClick: false});
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 13);
    map.addControl(new BMap.NavigationControl({
        // 靠左上角位置
        anchor: BMAP_ANCHOR_TOP_RIGHT,
        // LARGE类型
        type: BMAP_NAVIGATION_CONTROL_LARGE,
        // 启用显示定位
        enableGeolocation: true
    }));

    var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_RIGHT});// 左上角，添加比例尺
    map.addControl(top_left_control);


    var tool = new BMapLib.DistanceTool(map, {lineStroke : 2});
    // 定义一个控件类,即function
    function ZoomControl(){
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMap.Size(10, 10);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    ZoomControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    ZoomControl.prototype.initialize = function(map){
        // 创建一个DOM元素
        var div = document.createElement("div");
        // 添加文字说明
        div.appendChild(document.createTextNode("测距"));
        // 设置样式
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        // 绑定事件,点击一次放大两级
        div.onclick = function(e){
            tool.open();
        };
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
    };
    // 创建控件
    var myZoomCtrl = new ZoomControl();
    // 添加到地图当中
    map.addControl(myZoomCtrl);


    // 定义一个控件类,即function
    function PrintControl(){
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMap.Size(40, 10);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    PrintControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    PrintControl.prototype.initialize = function(map){
        // 创建一个DOM元素
        var div = document.createElement("div");
        // 添加文字说明
        div.appendChild(document.createTextNode("打印"));
        // 设置样式
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        // 绑定事件,点击一次放大两级
        div.onclick = function(e){
            window.print();
        };
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
    };
    // 创建控件
    var myPrintCtrl = new PrintControl();
    // 添加到地图当中
    map.addControl(myPrintCtrl);

    $('#s_start_date').datetimebox({

        showSeconds:false
    });
    $('#s_end_date').datetimebox({
        showSeconds:false
    });

    $('#a_search').on('click', function () {
        var carNo = $("#car_code").val();
        var startDate = $("#s_start_date").datetimebox("getValue");
        var endDate = $("#s_end_date").datetimebox("getValue");

        if (Hamster.isEmpty(carNo) || Hamster.isEmpty(startDate) || Hamster.isEmpty(endDate)) {
            top.$.messager.alert('温馨提示' , '查询条件不完整!', 'warning');
            return;
        }
    
        var startMDate = moment(startDate, 'YYYY-M-D');
        var endMDate = moment(endDate, 'YYYY-M-D');
    
    
        if (endMDate.diff(startMDate) < 0) {
            msg.warning('结束日期需要大于开始日期!');
            return;
        }
    
        if (endMDate.diff(startMDate, 'months') >= 1) {
            msg.warning('请查询1个月内的轨迹数据!');
            return;
        }
    
        if (endMDate._d.getFullYear() != startMDate._d.getFullYear()) {
            msg.warning('请查询同一年度内的轨迹数据!');
            return;
        }
        $.ajax({
            url: g.ctx + "onlinemap/locusmap/getcarlocus",
            data: {car_no:carNo,start_date:startDate,end_date:endDate},
            success: function (data) {
                if(Hamster.isEmpty(data.carGps)){
                    msg.warning('无车辆轨迹信息');
                    return;
                }
                var points = Hamster.Array.map(data.carGps, function (record) {
                    return new BMap.Point(record.lng, record.lat)
                });
                if (!Hamster.isEmpty(points)) {
                    startDriving(points, carImages[data.carFlag]);
                }
            }
        });
    });
});

function createLushu(arrPois, icon) {
    lushu = new BMapLib.LuShu(map, arrPois, {
        //defaultContent: "从" + start + "到" + end,
        speed: 100,
        icon: new BMap.Icon(g.ctx + "static/images/car/"+ icon +".png", {
            width: 60,
            height: 60
        }, {anchor: new BMap.Size(60, 60)}),
        landmarkPois: []
    });
}

function startDriving(points, icon) {
    map.clearOverlays();
    lushu && lushu.stop();

    map.addOverlay(new BMap.Polyline(points, {strokeColor: '#111'}));
    map.setViewport(points);
    createLushu(points, icon);
    lushu.start();
}
