/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.services;

import com.mo008.dtos.DeviceDataDto;

import goja.test.ModelTestCase;

import com.google.common.collect.Lists;

import com.alibaba.fastjson.JSON;

import org.junit.Test;

import java.util.List;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class DeviceDataServiceTest extends ModelTestCase{


    @Test
    public void testSaveData() throws Exception {
        String deviceData = "{\"afterDPF\":10,\"avgEngineSpeed\":0,\"curOn\":0,\"deviceId\":\"2016051608080\",\"engineLoad\":0,\"latitude\":\"0°0′0.00″\",\"longitude\":\"0°0′0.00″\",\"mileage\":4294967295,\"noxDeep\":0,\"obd\":0,\"pressure\":857,\"proDPF\":0,\"reportTime\":\"2016-09-03 08:45:15\",\"speed\":0,\"torque\":0}";
        DeviceDataDto deviceDataDto = JSON.parseObject(deviceData, DeviceDataDto.class);
        List<DeviceDataDto> deviceDataDtos = Lists.newArrayList(deviceDataDto);
        DeviceDataService.getInstance().saveData(deviceDataDtos);

    }
}