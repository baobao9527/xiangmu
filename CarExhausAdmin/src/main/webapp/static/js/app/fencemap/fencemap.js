
/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

function CreateFenceButtonControl(openEvent, closeEvent){
    this.opened = false;
    this.openEvent = openEvent;
    this.closeEvent = closeEvent;
    this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
    this.defaultOffset = new BMap.Size(10, 10);
}

CreateFenceButtonControl.prototype = new BMap.Control();

CreateFenceButtonControl.prototype.initialize = function(map){
    var self = this;

    map.getContainer().appendChild($('<a id="createLinkButton" href="javascript:void(0);">新建栅栏</a>')[0]);

    this.buttonElement = $("#createLinkButton");
    this.buttonElement.linkbutton({
        iconCls: 'icon-add'
    });
    this.buttonElement.bind('click', function () {
        if (self.opened) {
            self.closeEvent();
        } else {
            self.openEvent();
        }
        self.opened = !self.opened;
        self.setStatus(self.opened);
    });

    return this.buttonElement[0];
};

CreateFenceButtonControl.prototype.setStatus = function (status) {
    if (this.opened = status) {
        this.buttonElement.find('.l-btn-text').text("取消创建");
        //this.buttonElement.linkbutton("select");
    } else {
        this.buttonElement.find('.l-btn-text').text("新建栅栏");
        //this.buttonElement.linkbutton("unselect");
    }
};



var Map = {

    drawing: false,

    /* 多边形每个点的坐标数组 */
    paths: [],
    /* 预览线对象 */
    previewLine: null,
    /* 多边形对象 */
    range: null,
    /* 描点的图标覆盖物对象 */
    rangeMark: [],

    init: function () {
        this.map = new BMap.Map("map", {enableMapClick: false});
        this.map.centerAndZoom(new BMap.Point(106.818702, 35.390428), 5);
        this.map.enableScrollWheelZoom();
        this.map.enableContinuousZoom();
        this.map.addControl(new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_LARGE,
            enableGeolocation: true
        }));

        this.map.addEventListener("click", Hamster.bind(this._mapClick, this));
        this.map.addEventListener("dblclick", Hamster.bind(this._mapRightClick, this));

        this.initCustomControl();

        return this.map;
    },

    initCustomControl: function () {
        var self = this;
        this.createFenceButtonControl = new CreateFenceButtonControl(function () {
            self.openDraw();
            self.map.disableDoubleClickZoom();
        }, function () {
            self.clearFenceRange();
            self.closeDraw();
            self.map.enableDoubleClickZoom();
        });
        this.map.addControl(this.createFenceButtonControl);
    },

    //开启绘制电子围栏
    openDraw: function () {
        this.drawing = true;
        this.map.disableDoubleClickZoom();
        this.clearFenceRange();
        this.map.removeEventListener("mousemove");
        this.map.addEventListener("mousemove", Hamster.bind(this._mapMousemove, this));
    },

    //关闭绘制电子围栏
    closeDraw: function () {
        var self = this;
        this.drawing = false;

        if (this.range) {
            // 改变区域参数
            // 可编辑状态、边线变粗
            this.range.enableEditing();
            this.range.setStrokeColor("#da462e");
            this.range.setStrokeOpacity(0.8);
            this.range.setStrokeWeight(2);
        }
        // 改变鼠标游标状态
        this.map.removeEventListener("mousemove");
        this.map.addEventListener("mousemove", function() {
            self.map.setDefaultCursor("default");
        });
        this.map.addEventListener("mouseover", function() {
            self.map.setDefaultCursor("pointer");
        });
        this.map.addEventListener("mouseout", function() {
            self.map.setDefaultCursor("default");
        });

        for (var i = 0; i < this.rangeMark.length; i++) {
            if (this.rangeMark[i] != null) {
                this.map.removeOverlay(this.rangeMark[i]);
                this.rangeMark[i] = null;
            }
        }
        this.rangeMark = [];
    },


    _mapMousemove: function (e) {
        if (!this.drawing) {
            return;
        }
        // 游标变为十字架状态
        this.map.setDefaultCursor("crosshair");

        if (this.paths.length > 0) {
            var prepaths = [];
            for (var i = 0; i < this.paths.length; i++) {
                prepaths.push(this.paths[i]);
            }
            prepaths.push(e.point);

            if (this.previewLine == null) {
                this.previewLine = new BMap.Polyline(prepaths, {
                    enableEditing: false,
                    strokeColor: "#da462e",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                this.map.addOverlay(this.previewLine);
            } else {
                this.previewLine.setPath(prepaths);
            }
        }
    },

    _mapClick: function (e) {
        if (!this.drawing) {
            return;
        }

        this.paths.push(e.point);
        if (this.paths.length > 1) {
            // 3个点以上，生成预览多边形
            if (this.range == null) {
                this.range = new BMap.Polygon(this.paths, {
                    enableEditing: false,
                    fillColor: "#eeb5ac",
                    fillOpacity: 0.8,
                    strokeWeight: 0
                });
                this.map.addOverlay(this.range);
            } else {
                this.range.setPath(this.paths);
            }
        }

        // 描点
        var c = this.rangeMark.length;
        this.rangeMark[c] = new BMap.Marker(e.point, {
            enableClicking: false,
            icon: new BMap.Icon(g.ctx + "static/images/pin_circle.png", new BMap.Size(12, 12))
        });
        this.map.addOverlay(this.rangeMark[c]);
    },


    _mapRightClick: function (e) {
        if (!this.drawing) {
            return;
        }
        var self = this;
        if (this.paths.length > 2) {
            this.closeDraw();
            this.range.disableEditing();
            this.previewLine.disableEditing();
            setTimeout(function () {
                self._submitCreate();
            }, 100);
        } else {
            alert("最少选择3个点以上才能双击结束！");
        }
    },

    _submitCreate: function () {
        var self = this;

        function doSubmit (name) {
            $.ajax({
                url: g.ctx + 'onlinemap/fencemap/save',
                data: {
                    "fence.name": name,
                    "fence.fence_info": JSON.stringify(self.paths)
                },
                success: function (data) {
                    self.closeDraw();
                    self.clearFenceRange();
                    self.createFenceButtonControl.setStatus(false);
                    Grid.reload();
                }
            })
        }

        $.messager.prompt('温馨提示:', '确定要保存该电子栅栏吗? 请起个名字', function(r) {
            if (r == undefined) {
                self.closeDraw();
                self.clearFenceRange();
                self.createFenceButtonControl.setStatus(false);
            } else {
                doSubmit(r);
            }
            self.map.enableDoubleClickZoom();
        });
    },

    clearFenceRange: function () {
        if (this.range != null) {
            this.range.setPath(null);
        }
        for (var i = 0; i < this.rangeMark.length; i++) {
            if (this.rangeMark[i] != null) {
                this.map.removeOverlay(this.rangeMark[i]);
                this.rangeMark[i] = null;
            }
        }
        this.paths = [];
        this.rangeMark = [];
        if (this.previewLine != null) {
            this.map.removeOverlay(this.previewLine);
            this.previewLine = null;
        }
    },

    loadRangePolygon: function (arr, markerPosition) {

        this.paths = [];

        var maxLng = 0,  // 多边形轨迹点的最大经度
            maxLat = 0,  // 最大纬度
            minLng = 0,  // 最小经度
            minLat = 0;  // 最小纬度

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != null) {
                // 给多边形轨迹点数组（全局变量）赋值
                this.paths.push(arr[i]);

                if (i == 0) {
                    maxLng = this.getPointXY(arr[i])[0];
                    maxLat = this.getPointXY(arr[i])[1];
                    minLng = this.getPointXY(arr[i])[0];
                    minLat = this.getPointXY(arr[i])[1];
                } else {
                    maxLng = this.getPointXY(arr[i])[0] > maxLng ? this.getPointXY(arr[i])[0] : maxLng;
                    maxLat = this.getPointXY(arr[i])[1] > maxLat ? this.getPointXY(arr[i])[1] : maxLat;
                    minLng = this.getPointXY(arr[i])[0] < minLng ? this.getPointXY(arr[i])[0] : minLng;
                    minLat = this.getPointXY(arr[i])[1] < minLat ? this.getPointXY(arr[i])[1] : minLat;
                }
            }
        }


        if (this.range == null) {
            this.range = new BMap.Polygon(this.paths, {
                enableEditing: false,
                fillColor: "#eeb5ac",
                fillOpacity: 0.8,
                strokeWeight: 2
            });
            this.map.addOverlay(this.range);
        } else {
            this.range.setPath(this.paths);
            this.range.setStrokeColor("#da462e");
            this.range.setStrokeOpacity(0.8);
            this.range.setStrokeWeight(2);
        }

        this.range.disableEditing();

        // 给出最大经纬度、最少经纬度的四个角坐标，让地图切换到刚好能显示下多边形的这个视野
        var bound = [];
        bound.push(this.setPoint(minLng, maxLat));
        bound.push(this.setPoint(maxLng, minLat));
        this.map.setViewport(bound);

    },

    getPointXY: function (point) {
        return point != null ? [point.lng, point.lat] : null;
    },

    setPoint: function (lng, lat) {
        return new BMap.Point(lng, lat);
    }

};



var Grid = {

    init: function () {
        this.gridlist = _gridlist = $('#datalist').datagrid({
            url: g.ctx + 'onlinemap/fencemap/list',
            toolbar: '#toolbar',
            loadMsg: "正在加载字典数据，请稍等...",
            iconCls: 'icon icon-list',
            nowrap: false,
            rownumbers: false,
            striped: false,
            idField: 'id',
            singleSelect: true,
            border: false,
            columns: [[
                {title: '主键', field: 'id',hidden: true},
                {title: '名称', field: 'name', width: 292}
            ]],
            pagination: true,
            onSelect: function (index, row) {
                var points = Hamster.Array.map(JSON.parse(row.fence_info), function (point, i) {
                    return Map.setPoint(point.lng, point.lat);
                });
                Map.createFenceButtonControl.setStatus(false);
                Map.clearFenceRange();
                Map.loadRangePolygon(points);
            }
        });
    },
    getSelectedRow: function () {
        return _gridlist.datagrid('getSelected');
    },
    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {});
    }
};



(function () {
    var layoutElement = $('#layout');
    layoutElement.width($(window).width() - 4).height($(window).height() - 4).layout();

    autoLayoutResize(layoutElement, function (rightWidth, rightHeight) {
        $('#map').width(rightWidth + 5).height(rightHeight);
        if (!Map.map) {
            Map.init();
        }
        var westPanel = layoutElement.layout('panel', 'west');

        if (!Grid.gridlist) {
            Grid.init();
        }
        _gridlist.datagrid('resize', {
            width:westPanel.outerWidth() - 2,
            height:westPanel.outerHeight() - 2
        });
    });
    $('#a_delete').attr('onclick', 'fence.del();');
})();

var fence = {
    del:function(){
        if (Grid.getSelectedRow()) {
            var row = Grid.getSelectedRow();
            layer.confirm('您确认要删除电子围栏么?', {icon: 3, title: '提示'}, function (idx) {
                layer.close(idx);
                $.ajaxjson(g.ctx+"onlinemap/fencemap/del", {"id": row.id}, function (rst) {
                    if (rst.status == 'OK') {
                        msg.ok('删除成功！');
                        Grid.reload();
                        Map.clearFenceRange()
                    } else {
                        msg.warning('删除删除电子围栏失败!');
                    }
                });
            });
        } else {
            msg.warning("请选择你要删除的行");
        }
        return false;
    }
};