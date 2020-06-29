package com.mo008.services;

import com.google.common.collect.Lists;

import com.alibaba.fastjson.JSON;
import com.mo008.crdm.models.device.Device;
import com.mo008.dtos.DeviceDataDto;
import com.xiaoleilu.hutool.util.CollectionUtil;

import org.apache.commons.lang3.StringUtils;
import org.redisson.Redisson;
import org.redisson.api.RBucket;
import org.redisson.api.RDeque;
import org.redisson.api.RKeys;
import org.redisson.api.RedissonClient;
import org.redisson.client.codec.StringCodec;
import org.redisson.config.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;

import goja.core.StringPool;

/**
 * <p> </p>
 *
 * @author Dark.Yang
 * @version 1.0
 * @since JDK 1.7
 */
public class RedisService {
    /**
     * RedisService's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(RedisService.class);

    private static final String REDIS_DEVICE    = "device:";
    private static final String DEVICE_MQ_DATAS = "device:mq:datas";
    private static final String DEVICE_STATUS   = "device:status:";

    private static RedissonClient redisson;


    /**
     * 私有构造函数,确保对象只能通过单例方法来调用.
     */
    private RedisService() {
    }

    /**
     * 获取单例对象,如果要调用该单例的使用,只能通过该方法获取.
     */
    public static RedisService getInstance() {
        return RedisServiceHolder.instance;
    }

    /**
     * 初始化Redis链接 服务
     *
     * @param redisHost redis ip host
     * @param redisPort redis 端口
     * @param redisDb   redis链接的数据库
     */
    public void init(String redisHost, int redisPort, int redisDb) {

        if (redisson != null) {
            LOGGER.error("redis 连接服务器已经初始化了！");
            return;
        }

        Config config = new Config();
        if (isLinux()) {
            config.setUseLinuxNativeEpoll(true);
        }
        final String redisAddress = String.format("redis://%s:%s", redisHost, redisPort);
        config.useSingleServer()
                .setConnectionPoolSize(80)
                .setAddress(redisAddress)
                .setDatabase(redisDb);

        redisson = Redisson.create(config);

        LOGGER.info("redis 服务连接成功");
    }

    /**
     * 获取所有设备在线状态
     *
     * @return 在线设备的设备编码列表
     */
    public List<String> onlineDeviceCodes() {
        final RKeys rKeys = redisson.getKeys();
        final Iterable<String> statusKeys = rKeys.getKeysByPattern(DEVICE_STATUS + StringPool.ASTERISK);
        if (CollectionUtil.isEmpty(statusKeys)) {
            return Collections.emptyList();
        }
        List<String> devices = Lists.newArrayList();
        for (String statusKey : statusKeys) {
            devices.add(StringUtils.replace(statusKey, DEVICE_STATUS, StringPool.EMPTY));
        }
        return devices;
    }


    /**
     * 获取所有的设备信息，并序列化数据为对象数据
     *
     * @return 所有Redis中的数据信息
     */
    List<DeviceDataDto> deviceDatas() {
        if (redisson == null) {
            return Collections.emptyList();
        }
        final RDeque<String> deviceMqDataDeque = redisson.getDeque(DEVICE_MQ_DATAS, StringCodec.INSTANCE);
        if (!deviceMqDataDeque.isExists()) {
            return Collections.emptyList();
        }
        if (deviceMqDataDeque.isEmpty()) {
            return Collections.emptyList();
        }
        int length = 1000;
        List<DeviceDataDto> dataDtoList = Lists.newArrayList();
        String deviceDataStr = deviceMqDataDeque.pollFirst();
        while (StringUtils.isNotEmpty(deviceDataStr)) {
            if (StringUtils.equals(DEVICE_MQ_DATAS, deviceDataStr)) {
                continue;
            }
            deviceDataStr = StringUtils.replace(StringUtils.substring(deviceDataStr, 1, StringUtils.length(deviceDataStr) - 1), "\\\"", "\"");
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("数据 {}", deviceDataStr);
            }
            DeviceDataDto deviceDataDto = JSON.parseObject(deviceDataStr, DeviceDataDto.class);
            dataDtoList.add(deviceDataDto);
            deviceDataStr = deviceMqDataDeque.pollFirst();

            if (dataDtoList.size() >= length) {
                return dataDtoList;
            }
        }
        return dataDtoList;
    }

    /**
     * 同步所有的设备授权码
     */
    public void syncAuthCode() {
        List<Device> deviceList = Device.dao.findByAll();
        // 同步写授权码
        for (Device device : deviceList) {
            final RBucket<Object> authCodeBucket = redisson.getBucket(REDIS_DEVICE + device.getDeviceCode(), StringCodec.INSTANCE);
            authCodeBucket.set(device.getAuthCode());
        }
    }

    /**
     * 判断当前运行系统是否为linux
     *
     * @return true 表示当前系统为linux
     */
    private static boolean isLinux() {

        final String osName = System.getProperty("os.name");
        final String os = StringUtils.lowerCase(osName);
        return StringUtils.contains(os, "linux");
    }

    /**
     * lazy 加载的内部类,用于实例化单例对象.
     */
    private static class RedisServiceHolder {
        static RedisService instance = new RedisService();
    }
}
