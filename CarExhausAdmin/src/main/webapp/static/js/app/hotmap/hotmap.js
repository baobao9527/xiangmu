/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var Map = {

    init: function (point) {
        this.map = new BMap.Map("map", {enableMapClick: false});
        this.map.centerAndZoom(point, 15);
        this.map.enableScrollWheelZoom();
        this.map.addEventListener(Hamster.EventType.RESIZE,
            Hamster.bind(this.afterMapMoveend, this));
        this.map.addControl(new BMap.NavigationControl({
            // 靠左上角位置
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            // LARGE类型
            type: BMAP_NAVIGATION_CONTROL_LARGE,
            // 启用显示定位
            enableGeolocation: true
        }));

        var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_RIGHT});// 左上角，添加比例尺
        this.map.addControl(top_left_control);

        this.map.addEventListener(Hamster.EventType.RESIZE, Hamster.bind(this.afterMapMoveend, this));
        this.map.addEventListener('moveend', Hamster.bind(this.afterMapMoveend, this));
        this.map.addEventListener('zoomend', Hamster.bind(this.afterMapMoveend, this));
        /*var tool = new BMapLib.DistanceTool(this.map, {lineStroke : 2});
        //tool.open();
        this.map.addEventListener("load",function(){
            tool.open();  //开启鼠标测距
            //myDis.close();  //关闭鼠标测距大
        });*/

        this.distanceTool();

        return this.map;
    },

    /**
     * 给地图增加测距工具
     */
    distanceTool: function(){
        var tool = new BMapLib.DistanceTool(this.map, {lineStroke : 2});
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
            }
            // 添加DOM元素到地图中
            map.getContainer().appendChild(div);
            // 将DOM元素返回
            return div;
        }
        // 创建控件
        var myZoomCtrl = new ZoomControl();
        // 添加到地图当中
        this.map.addControl(myZoomCtrl);


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
            }
            // 添加DOM元素到地图中
            map.getContainer().appendChild(div);
            // 将DOM元素返回
            return div;
        }
        // 创建控件
        var myPrintCtrl = new PrintControl();
        // 添加到地图当中
        this.map.addControl(myPrintCtrl);
    },

    //地图拖拽后获取地图范围,后台请求数据重新绘制热点
    afterMapMoveend: function () {
        var self = this;
        var bounds = this.map.getBounds();
        var northEast = bounds.getNorthEast();
        var southWest = bounds.getSouthWest();
        if (Hamster.isEmpty(northEast) || Hamster.isEmpty(southWest)) {
            return;
        }
        this.val = {
            zoom: this.map.getZoom(),
            swlat: southWest.lat,
            nelat: northEast.lat,
            swlng: southWest.lng,
            nelng: northEast.lng
        };
        this.getHotPoints(this.val, function (points) {
            self.changeHotOverlay(points);
        });
    },

    changeHotOverlay: function (points) {
        if (this.hotMapOverlay) {
            this.hotMapOverlay.hide();
            this.map.removeOverlay(this.hotMapOverlay);
            this.hotMapOverlay = null;
        }
        this.hotMapOverlay = new BMapLib.HeatmapOverlay({"radius": 10});
        this.map.addOverlay(this.hotMapOverlay);

        this.hotMapOverlay.setDataSet({
            data: points,
            max: 100
        });
        this.hotMapOverlay.show();
    },

    getHotPoints: function (val, callback) {
        $.ajax({
            url: g.ctx + 'onlinemap/hotmap/getdata',
            data:{swlat:val.swlat,swlng:val.swlng,nelat:val.nelat,nelng:val.nelng},
            success: function (data) {
                if (!Hamster.isEmpty(data)) {
                    callback(data);
                }
            }
        });
    }
};

(function () {

    function isSupportCanvas() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    if (!isSupportCanvas()) {
        alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
    }

    var point = new BMap.Point(117.288914, 31.867849);
    Map.init(point);

    var windowResizeTimeout;
    var win = Hamster.getWin();
    win.resize(function () {
        if (windowResizeTimeout) {
            clearTimeout(windowResizeTimeout);
        }
        windowResizeTimeout = setTimeout(function () {
            $('#map').width(win.width()).height(win.height());
        }, 10);
    });
    win.trigger(Hamster.EventType.RESIZE)

})();

//@ sourceURL=hotmap.js