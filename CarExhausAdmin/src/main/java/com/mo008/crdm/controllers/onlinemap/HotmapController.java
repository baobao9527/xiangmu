/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.onlinemap;

import com.jfinal.aop.Before;
import com.jfinal.plugin.activerecord.Record;
import com.mo008.crdm.models.car.CarGps;
import com.mo008.interceptors.MapKeyInterceptor;

import java.util.List;

import goja.mvc.Controller;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
@SuppressWarnings("unused")
public class HotmapController extends Controller {
    @Before(MapKeyInterceptor.class)
    public void index() {

    }

    /**
     * 提供列表数据
     */
    public void list() {
        renderEasyUIDataGrid("carGps");
    }

    /**
     * 获取车辆热图
     */
    public void getdata() {
        String a = getPara("swlat");
        String b = getPara("swlng");
        String c = getPara("nelat");
        String d = getPara("nelng");

        List<Record> records = CarGps.dao.findforhotmapSlave(a, b, c, d);
        renderJson(records);


    }

}
