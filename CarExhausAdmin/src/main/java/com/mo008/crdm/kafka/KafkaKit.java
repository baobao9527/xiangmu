/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. haiyi Inc.
 * CarExhausAdmin All rights reserved.
 */

package com.mo008.crdm.kafka;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;

/**
 * <p> </p>
 *
 * <pre> Created: 2018-12-31 20:34  </pre>
 * <pre> Project: CarExhausAdmin  </pre>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.7
 */
public class KafkaKit {


    static final ConcurrentHashMap<String, Producer>              PRODUCER_MAP = new ConcurrentHashMap<>();

    private static final Logger logger = LoggerFactory.getLogger(KafkaKit.class);

    static void addProducer(String name,
                            String servers,
                            String keySerializer,
                            String valueSerializer) {
        logger.info("添加生产者：{}", name);
        if (PRODUCER_MAP.containsKey(name)) {
            logger.error("{}已存在!", name);
        } else {
            Properties prop = new Properties();
            prop.put("bootstrap.servers", servers);
            prop.put("key.serializer", keySerializer);
            prop.put("value.serializer", valueSerializer);
            Producer<String, String> producer = new KafkaProducer<>(prop);
            PRODUCER_MAP.put(name, producer);
        }
    }

    public static Future send(String producerName,
                              ProducerRecord record) {
        return PRODUCER_MAP.get(producerName).send(record);
    }


    public Producer getProducer(String name) {
        return PRODUCER_MAP.get(name);
    }

}
