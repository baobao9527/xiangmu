/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var Map = {

  carInfoBubbleTpl: new Hamster.tpl.Template({localTarget: 'Car_Info_Bubble'}),

  init: function (point) {
    this.map = new BMap.Map('map', {enableMapClick: false})
    this.map.centerAndZoom(point, 8)
    this.map.enableScrollWheelZoom()
    this.map.enableContinuousZoom()
    this.afterMapMoveend()
    this.map.addEventListener(Hamster.EventType.RESIZE, Hamster.bind(this.afterMapMoveend, this))
    this.map.addEventListener('moveend', Hamster.bind(this.afterMapMoveend, this))
    this.map.addControl(new BMap.CityListControl({
      anchor: BMAP_ANCHOR_TOP_LEFT,
      offset: new BMap.Size(10, 20)
    }))
    this.map.addControl(new BMap.NavigationControl({
      anchor: BMAP_ANCHOR_TOP_RIGHT,
      type: BMAP_NAVIGATION_CONTROL_LARGE,
      enableGeolocation: false
    }))
    return this.map
  },

    // 地图拖拽后获取地图范围,后台请求数据重新绘制热点
  afterMapMoveend: function () {
    var self = this
    var bounds = this.map.getBounds()
    var northEast = bounds.getNorthEast()
    var southWest = bounds.getSouthWest()
    if (Hamster.isEmpty(northEast) || Hamster.isEmpty(southWest)) {
      return
    }
    this.val = {
      zoom: this.map.getZoom(),
      swlat: southWest.lat,
      nelat: northEast.lat,
      swlng: southWest.lng,
      nelng: northEast.lng
    }
    this.getCarPoints(this.val, function (carPoints) {
      Hamster.Array.forEach(self.map.getOverlays(), function (item) {
        item.isCarMark && self.map.removeOverlay(item)
      })
      self.showCarPoint(carPoints)
    })
  },

    // 增加区域的中心坐标点
  addMark: function (point, data) {
    var self = this
    this.map.addOverlay(new App.Overlay(point, data, {
      applyData: function (record) {
        return {
          type: record.type,
          name: record.name
        }
      },
      bindEvents: function () {
        this.mark.bind(Hamster.EventType.CLICK, function () {
          self.showPointPWindow(data, point)
        })
      }
    }))
  },

  showPointPWindow: function (data, point) {
    var self = this
    var opts = {
      width: 300,
      height: 440,
      title: '车辆信息',
      enableMessage: false
    }
    $.ajax({
      url: g.ctx + 'car/home/monitoring',
      data: {car_no: data.name},
      success: function (record) {
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

        self.map.openInfoWindow(new BMap.InfoWindow(self.carInfoBubbleTpl.apply({datas: datas, info: record}), opts), point)
      }
    })
  },

  showCarPoint: function (carPoints) {
    Hamster.Array.forEach(carPoints, function (carPoint) {
      this.addMark(new BMap.Point(carPoint.lng, carPoint.lat), carPoint)
    }, this)
  },

  getCarPoints: function (val, callback) {
    $.ajax({
      url: g.ctx + 'onlinemap/panoramic/getdata',
      data: val,
      success: function (data) {
        var points = []
                // data里每条数据必须包含lng和lat字段
        var gps = data.data
        if (gps) {
          for (var i = 0; i < gps.length; i++) {
            points.push({
              lng: gps[i].baidu_longitude,
              lat: gps[i].baidu_latitude,
              name: gps[i].car_no,
              type: gps[i].car_flag
            })
          }
          callback(points)
        }
      }
    })
  }
};

(function () {
  var windowResizeTimeout
  var win = Hamster.getWin()
  win.resize(function () {
    if (windowResizeTimeout) {
      clearTimeout(windowResizeTimeout)
    }
    windowResizeTimeout = setTimeout(function () {
      $('#map').width(win.width()).height(win.height())
    }, 10)
  })
  win.trigger(Hamster.EventType.RESIZE)

  Map.init(new BMap.Point(117.288339, 31.857299))
})()

