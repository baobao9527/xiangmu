package com.mo008.crdm.controllers.onlinemap;

import com.jfinal.aop.Before;
import com.mo008.crdm.models.car.CarGps;
import com.mo008.interceptors.MapKeyInterceptor;

import java.util.List;

import goja.mvc.Controller;

/**
 * <p> 全景地图控制器 </p>
 *
 * <p> Created At 2018-02-03 18:47  </p>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.8
 */
@SuppressWarnings("unused")
public class PanoramicController extends Controller{


    @Before(MapKeyInterceptor.class)
    public void index(){

    }


    /**
     * 全景图获取经纬度
     */
    public void getdata() {
        String swlat = getPara("swlat");
        String swLng = getPara("swlng");
        String neLat = getPara("nelat");
        String nelng = getPara("nelng");
        List<CarGps> data = CarGps.dao.findNewGPS(swlat,swLng,neLat,nelng);
        renderAjaxSuccess(data);
    }
}
