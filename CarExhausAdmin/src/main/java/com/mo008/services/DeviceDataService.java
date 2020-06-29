/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.services;

import com.google.common.base.MoreObjects;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.ehcache.CacheKit;
import com.mo008.crdm.models.car.CarFailureCriteria;
import com.mo008.crdm.models.device.Device;
import com.mo008.crdm.models.device.DeviceData;
import com.mo008.crdm.models.device.DeviceWarning;
import com.mo008.dtos.DeviceDataDto;
import com.mo008.util.CoordinateTransformUtil;
import com.mo008.util.MapKit;
import com.mo008.util.SubmeterKit;
import com.xiaoleilu.hutool.date.DateUnit;
import com.xiaoleilu.hutool.date.DateUtil;
import com.xiaoleilu.hutool.util.CollectionUtil;
import com.xiaoleilu.hutool.util.NumberUtil;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import goja.core.db.Dao;

/**
 * <p> 数据处理服务包 </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
public class DeviceDataService {


    private static final Logger logger = LoggerFactory.getLogger(DeviceDataService.class);

    private DeviceDataService() {

    }

    public static DeviceDataService getInstance() {
        return DeviceDataHolder.instance;
    }

    public void deal() {
        if (logger.isDebugEnabled()) {
            logger.debug("开始接收Redis抽取数据包...");
        }


        List<DeviceDataDto> dataDtoList = RedisService.getInstance().deviceDatas();
        if (CollectionUtil.isNotEmpty(dataDtoList)) {
            try {
                saveData(dataDtoList);
            } catch (Exception e) {
                logger.error("数据发生错误!", e);
            }
        }

        if (logger.isDebugEnabled()) {
            logger.debug("完成接收Redis抽取数据包...");
        }

    }

    /**
     * 保存数据
     *
     * @param deviceDataDtos 设备数据，通过Redis MQ传递过来
     */
    @SuppressWarnings("Duplicates")
    void saveData(List<DeviceDataDto> deviceDataDtos) {
        if (logger.isDebugEnabled()) {
            logger.debug("deviceDataDtos is {} ", deviceDataDtos);
        }
        for (DeviceDataDto deviceDataDto : deviceDataDtos) {
            final String deviceSn = deviceDataDto.getDeviceId();
            // 找到设备
            Device device = Device.dao.findByDeviceId(deviceSn);
            if (device == null) {
                logger.warn("监控设备数据无法保存, 设备号 {} 无法找到设备信息!", deviceSn);
                continue;
            }

            final Number carId = device.getNumber("car_id");
            if (carId == null) {
                logger.error("设备号 {} 未关联车辆!", deviceSn);
                continue;
            }
            final Date reportTime = deviceDataDto.getReportTime();
            DeviceData deviceData = DeviceData.dao.findByDeviceId(device.getId());
            // 失效标准
            CarFailureCriteria carFailureCriteria = CarFailureCriteria.dao.findById(carId.intValue());

            final float speed = deviceDataDto.getSpeed();
            final int docBefore = MoreObjects.firstNonNull(deviceDataDto.getDocBefore(), 0);
            final int caAfter = MoreObjects.firstNonNull(deviceDataDto.getsCRAfter(), 0);
            final int pfBeforePressure = MoreObjects.firstNonNull(deviceDataDto.getdPFBeforePressure(), 0);
            final int dpfAfterPressure = MoreObjects.firstNonNull(deviceDataDto.getdPFAfterPressure(), 0);
            final int malfunction = MoreObjects.firstNonNull(deviceDataDto.getMalfunction(), 0);
            final long torque = MoreObjects.firstNonNull(deviceDataDto.getTorque(), 0L);
            final int noxDeep = MoreObjects.firstNonNull(deviceDataDto.getNoxDeep(), 0);
            final int pressure = MoreObjects.firstNonNull(deviceDataDto.getPressure(), 0);
            final long mileage = deviceDataDto.getMileage();
            //  因为设备一开始上来的时候也就是新设备出厂的时候,默认值就是ffffff 表示的最大值,也就是 4294967295,哪么其实就是 里程数为 0
            final BigDecimal afterKm = BigDecimal.valueOf(mileage == 4294967295L ? 0 : mileage);
            final BigDecimal pressureDecimal = BigDecimal.valueOf(pressure);
            final int ureaTemperature = MoreObjects.firstNonNull(deviceDataDto.getUreaTemperature(), 0);
            final BigDecimal ureaTemperatureDecimal = BigDecimal.valueOf(ureaTemperature);
            final int ureaLevel = MoreObjects.firstNonNull(deviceDataDto.getUreaLevel(), 0);
            final BigDecimal ureaLevelDecimal = BigDecimal.valueOf(ureaLevel);
            final int nox = MoreObjects.firstNonNull(deviceDataDto.getNox(), 0);
            final int pm = MoreObjects.firstNonNull(deviceDataDto.getPm(), 0);
            final BigDecimal speedDecimal = BigDecimal.valueOf(speed);
            final int afterDPF = MoreObjects.firstNonNull(deviceDataDto.getAfterDPF(), 0);
            final int proDpf = MoreObjects.firstNonNull(deviceDataDto.getProDPF(), 0);


            final String carNo = DeviceKafkaService.getInstance().sendKafka(deviceDataDto, device);
            if (deviceData == null) {
                deviceData = new DeviceData();
                deviceData.setAfterKm(afterKm);
                deviceData.setCuron(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getCurOn(), 0)));
                deviceData.setDpfBeforeTemperature(BigDecimal.valueOf(proDpf));
                deviceData.setDpfArterTemperature(BigDecimal.valueOf(afterDPF));
                deviceData.setEngineLoad(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getEngineLoad(), 0)));
                deviceData.setEngineSpeed(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getAvgEngineSpeed(), 0)));
                deviceData.setNox(BigDecimal.valueOf(nox));
                deviceData.setUreaPosition(ureaLevelDecimal);
                deviceData.setUreaTemperature(ureaTemperatureDecimal);
                deviceData.setObd(BigDecimal.valueOf(deviceDataDto.getObd()));
                deviceData.setPmValue(BigDecimal.valueOf(pm));
                deviceData.setSpeed(speedDecimal);
                // DOC前温
                deviceData.setTemperature1(BigDecimal.valueOf(docBefore));
                //SCR后温
                deviceData.setTemperature2(BigDecimal.valueOf(caAfter));
                //DPF前压力
                deviceData.setTemperature3(BigDecimal.valueOf(pfBeforePressure));
                //DPF后压力
                deviceData.setTemperature4(BigDecimal.valueOf(dpfAfterPressure));
                //故障码
                deviceData.setCode(BigDecimal.valueOf(malfunction));
                deviceData.setTorque(BigDecimal.valueOf(torque));
                deviceData.setNoValue(BigDecimal.valueOf(noxDeep));
                deviceData.setPressure(pressureDecimal);
                deviceData.setReportTime(MoreObjects.firstNonNull(deviceDataDto.getReportTime(), reportTime));

                if (carFailureCriteria != null) {
                    deviceData.setFlagMileage(compare(afterKm, carFailureCriteria.getMinMileage(), carFailureCriteria.getMaxMileage()));
                    deviceData.setFlagSpeed(compare(BigDecimal.valueOf(deviceDataDto.getRealTimeSpeed()), carFailureCriteria.getMinSpeed(), carFailureCriteria.getMaxSpeed()));
                    deviceData.setPressureFlag(compare(BigDecimal.valueOf(deviceDataDto.getPressure()), carFailureCriteria.getPressureMin(), carFailureCriteria.getPressureMax()));
                    deviceData.setPmValueFlag(compare(BigDecimal.valueOf(deviceDataDto.getPm()), carFailureCriteria.getPmValueMin(), carFailureCriteria.getPmValueMax()));
                    deviceData.setTemperature1Flag(compare(BigDecimal.valueOf(deviceDataDto.getDocBefore()), carFailureCriteria.getTemperature1Min(), carFailureCriteria.getTemperature1Max()));
                    deviceData.setTemperature2Flag(compare(BigDecimal.valueOf(deviceDataDto.getsCRAfter()), carFailureCriteria.getTemperature2Min(), carFailureCriteria.getTemperature2Max()));
                    deviceData.setTemperature3Flag(compare(BigDecimal.valueOf(deviceDataDto.getdPFBeforePressure()), carFailureCriteria.getTemperature3Min(), carFailureCriteria.getTemperature3Max()));
                    deviceData.setTemperature4Flag(compare(BigDecimal.valueOf(deviceDataDto.getdPFAfterPressure()), carFailureCriteria.getTemperature4Min(), carFailureCriteria.getTemperature4Max()));
                    deviceData.setUreaPositionFlag(compare(BigDecimal.valueOf(deviceDataDto.getUreaLevel()), carFailureCriteria.getUreaPositionMin(), carFailureCriteria.getUreaPositionMax()));
                    deviceData.setUreaTemperatureFlag(compare(BigDecimal.valueOf(deviceDataDto.getUreaTemperature()), carFailureCriteria.getUreaTemperatureMin(), carFailureCriteria.getUreaTemperatureMax()));
                } else {
                    deviceData.setFlagMileage(0);
                    deviceData.setFlagSpeed(0);
                    deviceData.setPressureFlag(0);
                    deviceData.setPmValueFlag(0);
                    deviceData.setTemperature1Flag(0);
                    deviceData.setTemperature2Flag(0);
                    deviceData.setTemperature3Flag(0);
                    deviceData.setTemperature4Flag(0);
                    deviceData.setUreaPositionFlag(0);
                    deviceData.setUreaTemperatureFlag(0);
                }
                deviceData.setDeviceId(device.getId().intValue());

            } else {
                deviceData.setAfterKm(afterKm);
                if (carFailureCriteria != null) {
                    deviceData.setFlagMileage(compare(afterKm, carFailureCriteria.getMinMileage(), carFailureCriteria.getMaxMileage()));
                } else {
                    deviceData.setFlagMileage(0);
                }
                deviceData.setCuron(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getCurOn(), 0)));
                deviceData.setDpfBeforeTemperature(BigDecimal.valueOf(proDpf));
                deviceData.setDpfArterTemperature(BigDecimal.valueOf(afterDPF));
                deviceData.setEngineLoad(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getEngineLoad(), 0)));
                deviceData.setEngineSpeed(BigDecimal.valueOf(MoreObjects.firstNonNull(deviceDataDto.getAvgEngineSpeed(), 0)));
                deviceData.setUreaPosition(ureaLevelDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setUreaPositionFlag(compare(ureaLevelDecimal, carFailureCriteria.getUreaPositionMin(), carFailureCriteria.getUreaPositionMax()));
                } else {
                    deviceData.setUreaPositionFlag(0);
                }
                deviceData.setUreaTemperature(ureaTemperatureDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setUreaTemperatureFlag(compare(ureaTemperatureDecimal, carFailureCriteria.getUreaTemperatureMin(), carFailureCriteria.getUreaTemperatureMax()));

                } else {
                    deviceData.setUreaTemperatureFlag(0);
                }
                deviceData.setNox(BigDecimal.valueOf(nox));
                deviceData.setPmValue(BigDecimal.valueOf(pm));
                if (carFailureCriteria != null) {
                    deviceData.setPmValueFlag(compare(BigDecimal.valueOf(pm), carFailureCriteria.getPmValueMin(), carFailureCriteria.getPmValueMax()));
                } else {
                    deviceData.setPmValueFlag(0);
                }
                deviceData.setSpeed(speedDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setFlagSpeed(compare(speedDecimal, carFailureCriteria.getMinSpeed(), carFailureCriteria.getMaxSpeed()));
                } else {
                    deviceData.setFlagSpeed(0);
                }
                // DOC前温
                deviceData.setTemperature1(BigDecimal.valueOf(docBefore));

                if (carFailureCriteria != null) {
                    deviceData.setTemperature1Flag(compare(BigDecimal.valueOf(deviceDataDto.getDocBefore()), carFailureCriteria.getTemperature1Min(), carFailureCriteria.getTemperature1Max()));
                } else {
                    deviceData.setTemperature1Flag(0);
                }
                //SCR后温
                deviceData.setTemperature2(BigDecimal.valueOf(caAfter));

                if (carFailureCriteria != null) {
                    deviceData.setTemperature2Flag(compare(BigDecimal.valueOf(deviceDataDto.getsCRAfter()), carFailureCriteria.getTemperature2Min(), carFailureCriteria.getTemperature2Max()));
                } else {
                    deviceData.setTemperature2Flag(0);
                }
                //DPF前压力
                deviceData.setTemperature3(BigDecimal.valueOf(pfBeforePressure));
                if (carFailureCriteria != null) {

                    final BigDecimal deviceDate = BigDecimal.valueOf(deviceDataDto.getdPFBeforePressure());
                    deviceData.setTemperature3Flag(compare(deviceDate, carFailureCriteria.getTemperature3Min(), carFailureCriteria.getTemperature3Max()));
                } else {
                    deviceData.setTemperature3Flag(0);
                }
                //DPF后压力
                deviceData.setTemperature4(BigDecimal.valueOf(dpfAfterPressure));

                if (carFailureCriteria != null) {
                    deviceData.setTemperature4Flag(compare(BigDecimal.valueOf(deviceDataDto.getdPFAfterPressure()), carFailureCriteria.getTemperature4Min(), carFailureCriteria.getTemperature4Max()));
                } else {
                    deviceData.setTemperature4Flag(0);
                }
                //故障码
                deviceData.setCode(BigDecimal.valueOf(malfunction));
                deviceData.setTorque(BigDecimal.valueOf(torque));
                deviceData.setNoValue(BigDecimal.valueOf(noxDeep));
                deviceData.setPressure(pressureDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setPressureFlag(compare(pressureDecimal, carFailureCriteria.getPressureMin(), carFailureCriteria.getPressureMax()));
                } else {
                    deviceData.setPressureFlag(0);
                }
                deviceData.setReportTime(MoreObjects.firstNonNull(deviceDataDto.getReportTime(), reportTime));

                deviceData.setDeviceId(device.getId().intValue());
            }

            final Record carGps = gpsCreateRecord(deviceDataDto, deviceData);

            final DeviceData oldDeviceData = DeviceData.dao.findByDeviceSn(deviceSn);

            final Record deviceDataHistory;
            final List<DeviceWarning> deviceWarnings;

            if (oldDeviceData != null) {
                deviceDataHistory = new Record();
                final String[] names = deviceData._getAttrNames();
                for (String name : names) {
                    if (StringUtils.equals(name, "id")) {
                        continue;
                    }
                    deviceDataHistory.set(name, oldDeviceData.get(name));
                }

                deviceWarnings = doWarningData(deviceDataHistory, carNo);
            } else {
                deviceDataHistory = null;

                deviceWarnings = Lists.newArrayListWithCapacity(1);
            }

            dbSave(reportTime, deviceData, carGps, deviceDataHistory, deviceWarnings);

            // 提取分钟GPS信息
            minuteGpsRecord(deviceDataDto, deviceData);


        }
    }

    /**
     * 比较数据
     *
     * @param deviceDate 设备数据
     * @param min        最小数据
     * @param max        最大数据
     * @return 比较结果
     */
    int compare(BigDecimal deviceDate, BigDecimal min, BigDecimal max) {
        if (deviceDate == null || min == null || max == null) {
            return 0;
        }
        if (deviceDate.compareTo(min) < 0) {
            return 2;
        } else if (deviceDate.compareTo(max) > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    private void dbSave(Date reportTime,
                        DeviceData deviceData,
                        Record carGps,
                        Record deviceDataHistory,
                        List<DeviceWarning> deviceWarnings) {
        final int year = DateUtil.year(reportTime);
        final String gpsTableName = SubmeterKit.submeterGpsTableName(year);
        final String deviceDataHistoreyTableName = SubmeterKit.submeterDataHistoryTableName(year);
        final DeviceData finalDeviceData = deviceData;
        final boolean saveDb = Db.tx(() -> {
            if (Db.save(gpsTableName, carGps)) {
                finalDeviceData.setGpsId(carGps.get("id"));
                if (deviceDataHistory != null) {
                    if (Db.save(deviceDataHistoreyTableName, deviceDataHistory)) {
                        if (!deviceWarnings.isEmpty()) {
                            final Long deviceDataId = deviceDataHistory.getNumber("id").longValue();
                            for (DeviceWarning deviceWarning : deviceWarnings) {
                                deviceWarning.setHistoryDataId(deviceDataId);
                                final boolean dbOK = Dao.isNew(deviceWarning) ? deviceWarning.save() : deviceWarning.update();
                                if (!dbOK) {
                                    return false;
                                }
                            }
                        }
                    }

                    return (Dao.isNew(finalDeviceData) ? finalDeviceData.save() : finalDeviceData.update());

                } else {
                    return (Dao.isNew(finalDeviceData) ? finalDeviceData.save() : finalDeviceData.update());
                }
            }
            return false;
        });
        if (logger.isDebugEnabled()) {
            logger.debug("数据保存 {} 数据为: {}  ", (saveDb ? "成功" : "失败"), finalDeviceData.toJson());
        }
    }

    /**
     * 按照分钟进行GPS数据提取
     *
     * @param deviceDataDto 设备上报数据
     * @param deviceData    设备数据
     */
    private void minuteGpsRecord(DeviceDataDto deviceDataDto, DeviceData deviceData) {
        final String cacheKey = "gps:minute";
        // 上一条记录的上报时间
        final Integer deviceId = deviceData.getDeviceId();
        final Date upReportTime = CacheKit.get(cacheKey, deviceId);
        final Date reportTime = deviceDataDto.getReportTime();
        // 是否为同一分钟
        boolean sameMinute = false;
        if (upReportTime == null) {
            CacheKit.put(cacheKey, deviceId, reportTime);
        } else {
            // 是否为同一分钟的数据
            final long minute = DateUtil.between(upReportTime, reportTime, DateUnit.MINUTE);
            // 如果相差为0 则表示为同一分钟数据，则忽略处理
            sameMinute = minute == 0;
        }
        if (sameMinute) {
            if (logger.isDebugEnabled()) {
                logger.debug("上报GPS数据与上一条数据的为同一分钟数据，自动忽略处理! ");
            }
        }
        // 不是同一分钟的数据，则记录到分钟GPS信息中
        final Record gpsRecord = gpsCreateRecord(deviceDataDto, deviceData);
        final String tableName = "mo_car_gps_time_" + DateUtil.year(reportTime);
        final boolean minuteSaveState = Db.save(tableName, gpsRecord);
        if (!minuteSaveState) {
            logger.error("GPS分钟数据存储失败，数据为:{} ", gpsRecord);
        }
    }

    /**
     * 生成GPS 记录Record
     *
     * @param deviceDataDto 数据传输DTO
     * @param deviceData    历史数据信息
     * @return GPS存储Record
     */
    private Record gpsCreateRecord(DeviceDataDto deviceDataDto, DeviceData deviceData) {
        final Date reportTime = deviceDataDto.getReportTime();
        final Record carGps = new Record();
        carGps.set("gps_longitude", String.valueOf(deviceDataDto.getLongitude()));
        carGps.set("gps_latitude", String.valueOf(deviceDataDto.getLatitude()));
        carGps.set("create_time", reportTime);
        carGps.set("device_id", deviceData.getDeviceId());
        carGps.set("timestamp", reportTime.getTime());

        if (!Strings.isNullOrEmpty(deviceDataDto.getLatitude()) && !Strings.isNullOrEmpty(deviceDataDto.getLongitude())) {
            carGps.set("baidu_longitude", 0.0d);
            carGps.set("baidu_latitude", 0.0d);
            // 如果设备地理位置存在的话
            final double[] points = MapKit.convertGPS(deviceDataDto);
            if (points.length >= 2) {
                final double point1 = points[0];
                final double point2 = points[1];
                final double[] baiduPoints = CoordinateTransformUtil.wgs84tobd09(point1, point2);
                if (baiduPoints.length > 0) {
                    // 保留小数点位数6位
                    final Double baiduLng = NumberUtil.round(baiduPoints[0], 6);
                    final Double baiduLat = NumberUtil.round(baiduPoints[1], 6);
                    carGps.set("baidu_latitude", baiduLat);
                    carGps.set("baidu_longitude", baiduLng);
                }
            }
        }
        return carGps;
    }

    /**
     * 数据预警处理
     *
     * @param deviceData 数据
     * @param carNo      车牌号
     * @return 预警数据
     */
    private List<DeviceWarning> doWarningData(Record deviceData, String carNo) {
        List<DeviceWarning> deviceWarnings = Lists.newArrayList();


        final BigDecimal pressure = deviceData.getBigDecimal("pressure");
        final Integer deviceId = deviceData.getInt("device_id");
        if (pressure.compareTo(BigDecimal.valueOf(60000)) >= 0) {
            DeviceWarning deviceWarning = DeviceWarning.dao.findByDeviceAndCategory(deviceId, 1);
            if (deviceWarning == null) {
                deviceWarning = new DeviceWarning();
            }
            deviceWarning.setCategory(1);
            deviceWarning.setContent(String.format("%s 压差传感器预警", carNo));
            deviceWarning.setWarningTime(DateTime.now().toDate());
            deviceWarning.setDeviceId(Long.valueOf(deviceId));
            deviceWarnings.add(deviceWarning);
        } else {
            DeviceWarning.dao.deleteByDeviceIdAndCategory(deviceId, 1);
        }

        if (pressure.compareTo(BigDecimal.valueOf(30000)) >= 0 && pressure.compareTo(BigDecimal.valueOf(60000)) < 0) {
            DeviceWarning deviceWarning = DeviceWarning.dao.findByDeviceAndCategory(deviceId, 4);
            if (deviceWarning == null) {
                deviceWarning = new DeviceWarning();
            }
            deviceWarning.setCategory(4);
            deviceWarning.setContent(String.format("%s 压差值预警", carNo));
            deviceWarning.setWarningTime(DateTime.now().toDate());
            deviceWarning.setDeviceId(Long.valueOf(deviceId));
            deviceWarnings.add(deviceWarning);
        } else {
            DeviceWarning.dao.deleteByDeviceIdAndCategory(deviceId, 4);
        }
        final BigDecimal dpfBeforeTemperature = deviceData.getBigDecimal("dpf_before_temperature");
        if (dpfBeforeTemperature.compareTo(BigDecimal.valueOf(3000)) >= 0) {
            DeviceWarning deviceWarning = DeviceWarning.dao.findByDeviceAndCategory(deviceId, 2);
            if (deviceWarning == null) {
                deviceWarning = new DeviceWarning();
            }
            deviceWarning.setCategory(2);
            deviceWarning.setContent(String.format("%s 温度传感器1预警", carNo));
            deviceWarning.setWarningTime(DateTime.now().toDate());
            deviceWarning.setDeviceId(Long.valueOf(deviceId));
            deviceWarnings.add(deviceWarning);
        } else {
            DeviceWarning.dao.deleteByDeviceIdAndCategory(deviceId, 2);
        }
        final BigDecimal dpfArterTemperature = deviceData.getBigDecimal("dpf_arter_temperature");

        if (dpfArterTemperature.compareTo(BigDecimal.valueOf(3000)) >= 0) {
            DeviceWarning deviceWarning = DeviceWarning.dao.findByDeviceAndCategory(deviceId, 3);
            if (deviceWarning == null) {
                deviceWarning = new DeviceWarning();
            }
            deviceWarning.setCategory(3);
            deviceWarning.setContent(String.format("%s 温度传感器2预警", carNo));
            deviceWarning.setWarningTime(DateTime.now().toDate());
            deviceWarning.setDeviceId(Long.valueOf(deviceId));
            deviceWarnings.add(deviceWarning);
        } else {
            DeviceWarning.dao.deleteByDeviceIdAndCategory(deviceId, 3);
        }

        return deviceWarnings;
    }

    private static class DeviceDataHolder {
        static DeviceDataService instance = new DeviceDataService();
    }
}
