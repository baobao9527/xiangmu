/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.onlinemap;

import com.google.common.base.Strings;

import com.jfinal.aop.Before;
import com.mo008.crdm.models.car.CarGps;
import com.mo008.interceptors.MapKeyInterceptor;

import goja.mvc.Controller;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
@SuppressWarnings("unused")
public class LocateController extends Controller {
    @Before(MapKeyInterceptor.class)
    public void index() {

    }

    /**
     * 提供列表数据
     */
    public void list() {
        String carNo = getPara("car_no");
        if (!Strings.isNullOrEmpty(carNo)) {
            CarGps carGps = CarGps.dao.findByCarNo(carNo);
            if (carGps != null) {
                renderAjaxSuccess(carGps);
            } else {
                renderAjaxFailure();
            }
        } else {
            renderAjaxFailure();
        }
    }

}
