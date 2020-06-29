/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.onlinemap;

import com.google.common.base.Strings;
import com.google.common.collect.Maps;

import com.jfinal.aop.Before;
import com.mo008.crdm.models.car.CarGps;
import com.mo008.crdm.models.car.CarInfo;
import com.mo008.interceptors.MapKeyInterceptor;
import com.xiaoleilu.hutool.date.DatePattern;
import com.xiaoleilu.hutool.date.DateUtil;

import org.joda.time.DateTime;

import java.util.Date;
import java.util.List;
import java.util.Map;

import goja.mvc.Controller;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
@SuppressWarnings("unused")
public class LocusmapController extends Controller {
    @Before(MapKeyInterceptor.class)
    public void index() {

    }

    /**
     * 提供列表数据
     */
    public void list() {
        renderEasyUIDataGrid("carGps.carLocus");
    }


    /**
     * 车辆轨迹查询接口
     */
    public void getcarlocus() {
        String startDate = getPara("start_date");
        String endDate = getPara("end_date");
        Date start;
        Date end;
        if (Strings.isNullOrEmpty(startDate) || Strings.isNullOrEmpty(endDate)) {
            start = DateTime.now().millisOfDay().withMinimumValue().toDate();
            end = DateTime.now().toDate();
        } else {
            start = DateUtil.parse(startDate, DatePattern.NORM_DATETIME_MINUTE_PATTERN);
            end = DateUtil.parse(endDate, DatePattern.NORM_DATETIME_MINUTE_PATTERN);
        }
        String carNo = getPara("car_no");
        if (Strings.isNullOrEmpty(carNo)) {
            renderAjaxFailure();
            return;
        }
        CarInfo carInfo = CarInfo.dao.findByCarNo(carNo);
        if (carInfo == null) {
            renderAjaxFailure();
            return;
        }
        int deviceId = carInfo.getDeviceId().intValue();
        List<CarGps> carGpses = CarGps.dao.findForLocus(start, end, deviceId);
        Map<String, Object> result = Maps.newHashMap();
        result.put("carGps", carGpses);
        result.put("carFlag", carInfo.getCarFlag());
        renderJson(result);
    }
}
