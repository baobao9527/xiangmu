/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.util;

import com.mo008.dtos.DeviceDataDto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p> GPS位置转换工具 </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class MapKit {
    /**
     * MapKit's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(MapKit.class);

    public static double[] convertGPS(DeviceDataDto deviceDataDto) {
        try {
            return convertGPS(deviceDataDto.getLongitude(), deviceDataDto.getLatitude());
        } catch (Exception e) {
            LOGGER.error("地址位置转换失败! {} ", deviceDataDto, e);
            return new double[]{0, 0};
        }
    }

    /**
     * 经纬度度分秒转带小数点的度
     */
    static double[] convertGPS(String lng, String lat) {

        lng = lng.replaceAll("N", "");
        lng = lng.replaceAll("S", "");
        lng = lng.replaceAll("E", "");
        lng = lng.replaceAll("W", "");

        lat = lat.replaceAll("N", "");
        lat = lat.replaceAll("S", "");
        lat = lat.replaceAll("E", "");
        lat = lat.replaceAll("W", "");

        double lngD = 0;
        String[] fs = lng.split("°");
        lngD = convertGeo(fs, lngD);

        double latD = 0;
        fs = lat.split("°");
        latD = convertGeo(fs, latD);

        return new double[]{lngD, latD};
    }

    private static double convertGeo(String[] fs, double latD) {
        if (fs.length > 0) {
            latD = Double.parseDouble(fs[0]);
        }

        fs = fs[1].split("′");
        if (fs.length > 0) {
            double fen = Double.parseDouble(fs[0]);
            fen = fen / 60;
            latD += fen;
        }

        fs = fs[1].split("″");
        if (fs.length > 0) {
            double mi = Double.parseDouble(fs[0]);
            mi = mi / (60 * 60);
            latD += mi;
        }
        return latD;
    }
}
