/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.util;

import com.mo008.crdm.models.car.Fence;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.awt.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Created by BOGONm on 16/5/5.
 */
public class GpsUtil {

    private static final BigDecimal MULTIPLICAND = BigDecimal.valueOf(1000000);

    /**
     * 直接传入
     *
     * @param inX 经度
     * @param inY 纬度
     */
    public static Fence isPointInFence(Double inX, Double inY) {
        List<Fence> fences = Fence.dao.findAll();
        for (Fence fence : fences) {
            JSONArray jsonArray = JSON.parseArray(fence.getFenceInfo());
            int[] x = new int[jsonArray.size() + 1];
            int[] y = new int[jsonArray.size() + 1];
            for (int i = 0; i < jsonArray.size(); i++) {
                JSONObject fe = (JSONObject) jsonArray.get(i);
                x[i] = (BigDecimal.valueOf(fe.getDouble("lng")).multiply(MULTIPLICAND)).intValue();
                y[i] = (BigDecimal.valueOf(fe.getDouble("lat")).multiply(MULTIPLICAND)).intValue();
            }
            JSONObject tmp = (JSONObject) jsonArray.get(jsonArray.size()-1);
            x[x.length-1] = (BigDecimal.valueOf(tmp.getDouble("lng")).multiply(MULTIPLICAND)).intValue();
            y[y.length-1] = (BigDecimal.valueOf(tmp.getDouble("lat")).multiply(MULTIPLICAND)).intValue();
            Polygon p = new Polygon(x, y, x.length);
            boolean ok = p.contains(BigDecimal.valueOf(inX).multiply(MULTIPLICAND).intValue(), BigDecimal.valueOf(inY).multiply(MULTIPLICAND).intValue());
            if (ok) {
                return fence;
            }
        }
        return null;
    }
}
