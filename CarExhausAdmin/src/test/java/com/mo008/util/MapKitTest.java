/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.util;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

import java.util.Arrays;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class MapKitTest {
    @Test
    public void convertGPS() throws Exception {
        final double[] doubles = MapKit.convertGPS("117°9′35″", " 31°51′42″");
        System.out.println("doubles = " + Arrays.toString(doubles));
    }


    @Test
    public void testBB() throws Exception {
        String deviceDate = "\"{\\\"afterDPF\\\":80,\\\"avgEngineSpeed\\\":0,\\\"curOn\\\":0,\\\"deviceId\\\":\\\"2016051608066\\\",\\\"engineLoad\\\":0,\\\"latitude\\\":\\\"34°43′0.120″\\\",\\\"longitude\\\":\\\"111°3′14.400″\\\",\\\"mileage\\\":55308,\\\"noxDeep\\\":0,\\\"obd\\\":0,\\\"pressure\\\":0,\\\"proDPF\\\":90,\\\"reportTime\\\":\\\"2016-06-30 19:20:39\\\",\\\"speed\\\":2,\\\"torque\\\":0}\"";


        deviceDate = StringUtils.replace(StringUtils.substring(deviceDate, 1, StringUtils.length(deviceDate) - 1), "\\\"", "\"");

        System.out.println("deviceDate = " + deviceDate);


    }

    @Test
    public void testConvert() {
        final double[] doubles = CoordinateTransformUtil.gcj02towgs84(117.257158,31.829614);
        System.out.println("doubles = " + Arrays.toString(doubles));
    }
}