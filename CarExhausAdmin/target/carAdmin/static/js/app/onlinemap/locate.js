/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var url = {
  list: g.ctx + 'onlinemap/locate/list'
}

$(function () {
  var win = Hamster.getWin()
  win.resize(function () {
    if (windowResizeTimeout) {
      clearTimeout(windowResizeTimeout)
    }
    windowResizeTimeout = setTimeout(function () {
      $('#map').width(win.width()).height(win.height() - 32)
    }, 10)
  })
  win.trigger(Hamster.EventType.RESIZE)

  map.init()

  $('#a_search').on('click', function () {
    var carNo = $('#car_code').val()
    $.ajax({
      url: url.list,
      data: {car_no: carNo},
      success: function (data) {
        if (data.status == 'OK') {
          var rowData = data.data
          map.pointTo(rowData.baidu_longitude, rowData.baidu_latitude, rowData)
        } else {
          layer.alert('未查询到车辆信息！', {
            title: '警告：'
          })
        }
      }
    })
  })
})

var map = {

  carInfoBubbleTpl: new Hamster.tpl.Template({localTarget: 'Car_Info_Bubble'}),

  init: function () {
    this.map = new BMap.Map('map', {enableMapClick: false})
    this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
    this.map.addControl(new BMap.MapTypeControl({
            // 靠左上角位置
      anchor: BMAP_ANCHOR_BOTTOM_RIGHT, // LARGE类型
      type: BMAP_NAVIGATION_CONTROL_LARGE, // 启用显示定位
      enableGeolocation: true
    }))
    this.map.enableScrollWheelZoom(true)
    this.map.enableContinuousZoom()
    this.map.addControl(new BMap.NavigationControl({
            // 靠左上角位置
      anchor: BMAP_ANCHOR_TOP_RIGHT, // LARGE类型
      type: BMAP_NAVIGATION_CONTROL_LARGE, // 启用显示定位
      enableGeolocation: true
    }))

    var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_RIGHT})// 左上角，添加比例尺
    this.map.addControl(top_left_control)

    this.distanceTool()

    return this.map
  },

    /**
     * 给地图增加测距工具
     */
  distanceTool: function () {
    var tool = new BMapLib.DistanceTool(this.map, {lineStroke: 2})
        // 定义一个控件类,即function
    function ZoomControl () {
            // 默认停靠位置和偏移量
      this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT
      this.defaultOffset = new BMap.Size(10, 10)
    }

        // 通过JavaScript的prototype属性继承于BMap.Control
    ZoomControl.prototype = new BMap.Control()

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    ZoomControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
      var div = document.createElement('div')
            // 添加文字说明
      div.appendChild(document.createTextNode('测距'))
            // 设置样式
      div.style.cursor = 'pointer'
      div.style.border = '1px solid gray'
      div.style.backgroundColor = 'white'
            // 绑定事件,点击一次放大两级
      div.onclick = function (e) {
        tool.open()
      }
            // 添加DOM元素到地图中
      map.getContainer().appendChild(div)
            // 将DOM元素返回
      return div
    }
        // 创建控件
    var myZoomCtrl = new ZoomControl()
        // 添加到地图当中
    this.map.addControl(myZoomCtrl)

        // 定义一个控件类,即function
    function PrintControl () {
            // 默认停靠位置和偏移量
      this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT
      this.defaultOffset = new BMap.Size(40, 10)
    }

        // 通过JavaScript的prototype属性继承于BMap.Control
    PrintControl.prototype = new BMap.Control()

        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    PrintControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
      var div = document.createElement('div')
            // 添加文字说明
      div.appendChild(document.createTextNode('打印'))
            // 设置样式
      div.style.cursor = 'pointer'
      div.style.border = '1px solid gray'
      div.style.backgroundColor = 'white'
            // 绑定事件,点击一次放大两级
      div.onclick = function (e) {
        window.print()
      }
            // 添加DOM元素到地图中
      map.getContainer().appendChild(div)
            // 将DOM元素返回
      return div
    }
        // 创建控件
    var myPrintCtrl = new PrintControl()
        // 添加到地图当中
    this.map.addControl(myPrintCtrl)
  },

  pointTo: function (lng, lat, data) {
    var self = this
    if (this.currentMarker) {
      this.map.removeOverlay(this.currentMarker)
    }
    this.currentPoint = new BMap.Point(lng, lat)
    this.map.centerAndZoom(this.currentPoint, 17)

    this.currentMarker = new App.Location.Overlay(this.currentPoint, data, {
      applyData: function (record) {
        return {
          car_no: record.car_no,
          type: record.car_flag
        }
      },
      getTooltipContent: function (content) {
        $.ajax({
          url: g.ctx + 'car/home/monitoring',
          data: {car_no: this.data.car_no},
          success: function (record) {
            if (record.status == 'OK') {
              record = record.data
              var speedValue = record['speed']
              if (speedValue) {
                if (!record['online']) {
                  record['speed'] = 0.00
                }
              }
              var pressureValue = record['pressure']
              if (pressureValue) {
                record['pressure'] = Number.parseFloat(pressureValue / 1000).toFixed(2)
              }

              var datas = []
              var deviceDatas = pageMethod.getDicts('DEVICE_DATA_MAP')
              Hamster.Array.forEach(deviceDatas, function (val) {
                if (!Hamster.isEmpty(val.code)) {
                  datas.push({'title': val.name, val: record[val.code]})
                }
              })

              content.html(self.carInfoBubbleTpl.apply({datas: datas, info: record}))
            } else {

            }
          }
        })
      }
    })
    this.map.addOverlay(this.currentMarker)
  }
}
