/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.services;

import com.google.common.base.MoreObjects;
import com.google.common.primitives.Doubles;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.mo008.crdm.models.car.CarFailureCriteria;
import com.mo008.crdm.models.car.CarGps;
import com.mo008.crdm.models.device.Device;
import com.mo008.crdm.models.device.DeviceData;
import com.mo008.crdm.models.device.DeviceDataHistory;
import com.mo008.dtos.ExcelDeviceData;

import org.apache.commons.lang3.StringUtils;
import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import goja.core.db.Dao;

/**
 * <p>
 * 数据数据 Excel解析累
 * </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class DeviceDataExcelParse {

    private static final Logger logger = LoggerFactory.getLogger(DeviceDataExcelParse.class);


    public static void importDataByExcel(File excelFile) {
        ImportParams importParams = new ImportParams();
        importParams.setTitleRows(0);
        final List<ExcelDeviceData> deviceDatas = ExcelImportUtil.importExcel(excelFile, ExcelDeviceData.class, importParams);

        final DeviceDataService deviceDataService = DeviceDataService.getInstance();
        for (ExcelDeviceData excelDeviceData : deviceDatas) {
            Device device = Device.dao.findByCarNo(excelDeviceData.getCarNo());
            if (device == null) {

                logger.warn("监控设备数据无法保存, 车牌号 {} 无法找到设备信息!", excelDeviceData.getCarNo());
                continue;
            }


            DeviceData deviceData = DeviceData.dao.findByDeviceId(device.getId());

            Number carId = device.getNumber("car_id");
            CarFailureCriteria carFailureCriteria = CarFailureCriteria.dao.findById(carId.intValue()); // 失效标准

            final float speed = excelDeviceData.getSpeed();
            final Integer docBefore = MoreObjects.firstNonNull(excelDeviceData.getDocBefore(), 0);
            final Integer caAfter = MoreObjects.firstNonNull(excelDeviceData.getsCRAfter(), 0);
            final Integer pfBeforePressure = MoreObjects.firstNonNull(excelDeviceData.getdPFBeforePressure(), 0);
            final Integer dpfAfterPressure = MoreObjects.firstNonNull(excelDeviceData.getdPFAfterPressure(), 0);
            final Integer malfunction = MoreObjects.firstNonNull(excelDeviceData.getMalfunction(), 0);
            final Long torque = 0L;
            final Integer noxDeep = 0;
            final Integer pressure = MoreObjects.firstNonNull(excelDeviceData.getPressure(), 0);
            final long mileage = excelDeviceData.getMileage();
            //  因为设备一开始上来的时候也就是新设备出厂的时候,默认值就是ffffff 表示的最大值,也就是 4294967295,哪么其实就是 里程数为 0
            final BigDecimal afterKm = BigDecimal.valueOf(mileage == 4294967295L ? 0 : mileage);
//            final BigDecimal realTimeSpeedDecimal = BigDecimal.valueOf(realTimeSpeed);
            final Integer ureaTemperature = MoreObjects.firstNonNull(excelDeviceData.getUreaTemperature(), 0);
            final BigDecimal ureaTemperatureDecimal = BigDecimal.valueOf(ureaTemperature);
            final Integer ureaLevel = MoreObjects.firstNonNull(excelDeviceData.getUreaLevel(), 0);
            final BigDecimal ureaLevelDecimal = BigDecimal.valueOf(ureaLevel);
            final BigDecimal pressureDecimal = BigDecimal.valueOf(pressure);
            final Integer nox = MoreObjects.firstNonNull(excelDeviceData.getNox(), 0);
            final Integer pm = MoreObjects.firstNonNull(excelDeviceData.getPm(), 0);
            final BigDecimal speedDecimal = BigDecimal.valueOf(speed);
            final Date reportTime = MoreObjects.firstNonNull(excelDeviceData.getReportTime(), DateTime.now().toDate());
            if (deviceData == null) {
                deviceData = new DeviceData();
                deviceData.setAfterKm(afterKm);
                deviceData.setCuron(BigDecimal.ZERO);
                deviceData.setDpfBeforeTemperature(BigDecimal.valueOf(MoreObjects.firstNonNull(excelDeviceData.getProDPF(), 0)));
                deviceData.setDpfArterTemperature(BigDecimal.valueOf(MoreObjects.firstNonNull(excelDeviceData.getAfterDPF(), 0)));
                deviceData.setEngineLoad(BigDecimal.ZERO);
                deviceData.setEngineSpeed(BigDecimal.ZERO);
                deviceData.setNox(BigDecimal.valueOf(nox));
                deviceData.setUreaPosition(ureaLevelDecimal);
                deviceData.setUreaTemperature(ureaTemperatureDecimal);
                deviceData.setObd(BigDecimal.ZERO);
                deviceData.setPmValue(BigDecimal.valueOf(pm));
                deviceData.setSpeed(speedDecimal);
                deviceData.setTemperature1(BigDecimal.valueOf(docBefore));// DOC前温
                deviceData.setTemperature2(BigDecimal.valueOf(caAfter));//SCR后温
                deviceData.setTemperature3(BigDecimal.valueOf(pfBeforePressure));//DPF前压力
                deviceData.setTemperature4(BigDecimal.valueOf(dpfAfterPressure));//DPF后压力
                deviceData.setCode(BigDecimal.valueOf(malfunction));//故障码
                deviceData.setTorque(BigDecimal.valueOf(torque));
                deviceData.setNoValue(BigDecimal.valueOf(noxDeep));
                deviceData.setPressure(pressureDecimal);
                deviceData.setReportTime(reportTime);

                if (carFailureCriteria != null) {
                    deviceData.setFlagMileage(deviceDataService.compare(afterKm, carFailureCriteria.getMinMileage(), carFailureCriteria.getMaxMileage()));
                    deviceData.setFlagSpeed(0);
                    deviceData.setPressureFlag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getPressure()), carFailureCriteria.getPressureMin(), carFailureCriteria.getPressureMax()));
                    deviceData.setPmValueFlag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getPm()), carFailureCriteria.getPmValueMin(), carFailureCriteria.getPmValueMax()));
                    deviceData.setTemperature1Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getDocBefore()), carFailureCriteria.getTemperature1Min(), carFailureCriteria.getTemperature1Max()));
                    deviceData.setTemperature2Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getsCRAfter()), carFailureCriteria.getTemperature2Min(), carFailureCriteria.getTemperature2Max()));
                    deviceData.setTemperature3Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getdPFBeforePressure()), carFailureCriteria.getTemperature3Min(), carFailureCriteria.getTemperature3Max()));
                    deviceData.setTemperature4Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getdPFAfterPressure()), carFailureCriteria.getTemperature4Min(), carFailureCriteria.getTemperature4Max()));
                    deviceData.setUreaPositionFlag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getUreaLevel()), carFailureCriteria.getUreaPositionMin(), carFailureCriteria.getUreaPositionMax()));
                    deviceData.setUreaTemperatureFlag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getUreaTemperature()), carFailureCriteria.getUreaTemperatureMin(), carFailureCriteria.getUreaTemperatureMax()));
                } else {
                    deviceData.setDefaultValue();
                }


                deviceData.setDeviceId(device.getId().intValue());

            } else {
                deviceData.setAfterKm(afterKm);
                if (carFailureCriteria != null) {
                    deviceData.setFlagMileage(deviceDataService.compare(afterKm, carFailureCriteria.getMinMileage(), carFailureCriteria.getMaxMileage()));
                } else {
                    deviceData.setFlagMileage(0);
                }

                deviceData.setCuron(BigDecimal.ZERO);
                deviceData.setDpfBeforeTemperature(BigDecimal.valueOf(MoreObjects.firstNonNull(excelDeviceData.getProDPF(), 0)));
                deviceData.setDpfArterTemperature(BigDecimal.valueOf(MoreObjects.firstNonNull(excelDeviceData.getAfterDPF(), 0)));
                deviceData.setEngineLoad(BigDecimal.ZERO);
                deviceData.setEngineSpeed(BigDecimal.ZERO);
                deviceData.setUreaPosition(ureaLevelDecimal);

                if (carFailureCriteria != null) {

                    deviceData.setUreaPositionFlag(deviceDataService.compare(ureaLevelDecimal, carFailureCriteria.getUreaPositionMin(), carFailureCriteria.getUreaPositionMax()));
                } else {
                    deviceData.setUreaPositionFlag(0);
                }
                deviceData.setUreaTemperature(ureaTemperatureDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setUreaTemperatureFlag(deviceDataService.compare(ureaTemperatureDecimal, carFailureCriteria.getUreaTemperatureMin(), carFailureCriteria.getUreaTemperatureMax()));

                } else {
                    deviceData.setUreaTemperatureFlag(0);
                }
                deviceData.setNox(BigDecimal.valueOf(nox));
                deviceData.setPmValue(BigDecimal.valueOf(pm));
                if (carFailureCriteria != null) {
                    deviceData.setPmValueFlag(deviceDataService.compare(BigDecimal.valueOf(pm), carFailureCriteria.getPmValueMin(), carFailureCriteria.getPmValueMax()));
                } else {
                    deviceData.setPmValueFlag(0);
                }
                deviceData.setSpeed(speedDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setFlagSpeed(deviceDataService.compare(speedDecimal, carFailureCriteria.getMinSpeed(), carFailureCriteria.getMaxSpeed()));
                } else {
                    deviceData.setFlagSpeed(0);
                }
                deviceData.setTemperature1(BigDecimal.valueOf(docBefore));// DOC前温

                if (carFailureCriteria != null) {
                    deviceData.setTemperature1Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getDocBefore()), carFailureCriteria.getTemperature1Min(), carFailureCriteria.getTemperature1Max()));
                } else {
                    deviceData.setTemperature1Flag(0);
                }
                deviceData.setTemperature2(BigDecimal.valueOf(caAfter));//SCR后温

                if (carFailureCriteria != null) {
                    deviceData.setTemperature2Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getsCRAfter()), carFailureCriteria.getTemperature2Min(), carFailureCriteria.getTemperature2Max()));
                } else {
                    deviceData.setTemperature2Flag(0);
                }
                deviceData.setTemperature3(BigDecimal.valueOf(pfBeforePressure));//DPF前压力
                if (carFailureCriteria != null) {

                    deviceData.setTemperature3Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getdPFBeforePressure()), carFailureCriteria.getTemperature3Min(), carFailureCriteria.getTemperature3Max()));
                } else {
                    deviceData.setTemperature3Flag(0);
                }
                deviceData.setTemperature4(BigDecimal.valueOf(dpfAfterPressure));//DPF后压力

                if (carFailureCriteria != null) {
                    deviceData.setTemperature4Flag(deviceDataService.compare(BigDecimal.valueOf(excelDeviceData.getdPFAfterPressure()), carFailureCriteria.getTemperature4Min(), carFailureCriteria.getTemperature4Max()));
                } else {
                    deviceData.setTemperature4Flag(0);
                }
                deviceData.setCode(BigDecimal.valueOf(malfunction));//故障码
                deviceData.setTorque(BigDecimal.valueOf(torque));
                deviceData.setNoValue(BigDecimal.valueOf(noxDeep));
                deviceData.setPressure(pressureDecimal);

                if (carFailureCriteria != null) {
                    deviceData.setPressureFlag(deviceDataService.compare(pressureDecimal, carFailureCriteria.getPressureMin(), carFailureCriteria.getPressureMax()));
                } else {
                    deviceData.setPressureFlag(0);
                }
                deviceData.setReportTime(reportTime);

                deviceData.setDeviceId(device.getId().intValue());
            }


            final CarGps carGps = new CarGps();
            carGps.setGpsLongitude(String.valueOf(excelDeviceData.getLongitude()));
            carGps.setGpsLatitude(String.valueOf(excelDeviceData.getLatitude()));
            carGps.setCreateDate(reportTime);
            carGps.setDeviceId(deviceData.getDeviceId());
            carGps.setTimestamp(reportTime.getTime());
            carGps.setCreateTime(reportTime);
            carGps.setBaiduLatitude(Doubles.tryParse(excelDeviceData.getLatitude()));
            carGps.setBaiduLongitude(Doubles.tryParse(excelDeviceData.getLongitude()));

            final DeviceDataHistory deviceDataHistory;

            if (deviceData != null) {
                deviceDataHistory = new DeviceDataHistory();
                final String[] names = deviceData._getAttrNames();
                for (String name : names) {
                    if (StringUtils.equals(name, "id")) {
                        continue;
                    }
                    deviceDataHistory.set(name, deviceData.get(name));
                }

            } else {
                deviceDataHistory = null;

            }

            final DeviceData finalDeviceData = deviceData;
            final boolean saveDb = Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    if (carGps.save()) {
                        finalDeviceData.setGpsId(carGps.getId());
                        if (deviceDataHistory != null) {
                            return deviceDataHistory.save() && (Dao.isNew(finalDeviceData) ? finalDeviceData.save() : finalDeviceData.update());

                        } else {
                            return (Dao.isNew(finalDeviceData) ? finalDeviceData.save() : finalDeviceData.update());
                        }
                    }
                    return false;
                }
            });

            if (saveDb) {
                logger.info("数据 {} 保存成功 ", finalDeviceData.toJson());
            } else {
                logger.warn("数据 {} 保存失败 ", finalDeviceData.toJson());
            }
        }
    }
}
