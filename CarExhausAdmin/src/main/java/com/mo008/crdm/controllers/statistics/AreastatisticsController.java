/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.statistics;

import com.mo008.crdm.models.car.CarInfo;

import goja.mvc.Controller;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
public class AreastatisticsController extends Controller {

    /**
     * The index route.
     */
    public void index() {
    }

    public void data(){
        String sn = getPara("sn");
        renderJson(CarInfo.dao.findForArea(sn));
    }
}