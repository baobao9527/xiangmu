/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. haiyi Inc.
 * CarExhausAdmin All rights reserved.
 */

package com.mo008.crdm.kafka;

import com.jfinal.plugin.IPlugin;

import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.producer.Producer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

import goja.core.annotation.PluginBind;
import goja.core.app.GojaConfig;

/**
 * <p> </p>
 *
 * <pre> Created: 2018-12-31 20:38  </pre>
 * <pre> Project: CarExhausAdmin  </pre>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.7
 */
@PluginBind
public class KafkaPlugin implements IPlugin {

    private static final Logger logger = LoggerFactory.getLogger(KafkaPlugin.class);


    @Override
    public boolean start() {

        final String topic = GojaConfig.getProperty("kafka.topic");
        if (StringUtils.isEmpty(topic)) {
            logger.error("kafka的订阅主题为空!");
            return false;
        }
        final String server = GojaConfig.getProperty("kafka.server");
        if (StringUtils.isEmpty(server)) {
            logger.error("kafka的地址为空!");
            return false;
        }
        final String keySerializer = GojaConfig.getProperty("kafka.key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        final String valueSerializer = GojaConfig.getProperty("kafka.value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        KafkaKit.addProducer(topic, server, keySerializer, valueSerializer);

        return true;
    }

    @Override
    public boolean stop() {
        logger.info("销毁所有生产者和消费者开始");
        for (Map.Entry<String, Producer> entry : KafkaKit.PRODUCER_MAP.entrySet()) {
            entry.getValue().close();
        }
        logger.info("销毁所有生产者和消费者结束");
        return true;
    }
}
