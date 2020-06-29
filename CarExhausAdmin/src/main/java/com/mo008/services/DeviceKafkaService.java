/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2019. haiyi Inc.
 * CarExhausAdmin All rights reserved.
 */

package com.mo008.services;

import com.google.common.base.MoreObjects;

import com.mo008.crdm.kafka.KafkaKit;
import com.mo008.crdm.models.device.Device;
import com.mo008.dtos.DeviceDataDto;
import com.mo008.util.MapKit;
import com.xiaoleilu.hutool.date.DateUtil;
import com.xiaoleilu.hutool.util.StrUtil;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;

import goja.core.app.GojaConfig;

/**
 * <p> </p>
 *
 * <pre> Created: 2019-01-01 21:53  </pre>
 * <pre> Project: CarExhausAdmin  </pre>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.7
 */
public class DeviceKafkaService {

    /**
     * DeviceKafkaService's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceKafkaService.class);

    /**
     * 获取单例对象,如果要调用该单例的使用,只能通过该方法获取.
     */
    public static DeviceKafkaService getInstance() {
        return DeviceKafkaServiceHolder.instance;
    }


    private static final String KAFKA_MSG_FORMAT = ",1,1,1,102,{},{},{},{},{},{},{},{},{},{},{},卡车,{}";

    String sendKafka(DeviceDataDto deviceDataDto, Device device) {
        final String msgArea = GojaConfig.getProperty("kafka.msg.area");
        final float speed = deviceDataDto.getSpeed();
        final int malfunction = MoreObjects.firstNonNull(deviceDataDto.getMalfunction(), 0);
        final int pressure = MoreObjects.firstNonNull(deviceDataDto.getPressure(), 0);
        final int afterDPF = MoreObjects.firstNonNull(deviceDataDto.getAfterDPF(), 0);
        final int proDpf = MoreObjects.firstNonNull(deviceDataDto.getProDPF(), 0);
        final Date reportTime = deviceDataDto.getReportTime();

        final double[] points = MapKit.convertGPS(deviceDataDto);
        final String carNo = device.getStr("car_no");
        final String terminal = device.getStr("terminal");
        final String msgDate = DateUtil.format(reportTime, "yyyyMMddHHmmss");
        final String kakfaMsg = StrUtil.format(KAFKA_MSG_FORMAT,
                msgDate, proDpf, afterDPF, pressure, speed, points[0], points[1],
                malfunction, deviceDataDto.getObd(), carNo, msgArea, terminal
        );
        LOGGER.info(">>>> KAFKA 消息 ---> {}", kakfaMsg);
        KafkaKit.send(GojaConfig.getProperty("kafka.topic"), new ProducerRecord<>("iuv", kakfaMsg));
        return carNo;
    }
    /**
     * 私有构造函数,确保对象只能通过单例方法来调用.
     */
    private DeviceKafkaService() {
    }

    /**
     * lazy 加载的内部类,用于实例化单例对象.
     */
    private static class DeviceKafkaServiceHolder {
        static DeviceKafkaService instance = new DeviceKafkaService();
    }
}
