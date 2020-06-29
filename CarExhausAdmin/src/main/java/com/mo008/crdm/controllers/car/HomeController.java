/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.car;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.mo008.crdm.models.car.CarFailureCriteria;
import com.mo008.crdm.models.car.CarInfo;
import com.mo008.crdm.models.car.CarPermission;
import com.mo008.crdm.models.car.Driver;
import com.mo008.crdm.models.device.Device;
import com.mo008.crdm.models.device.DeviceData;
import com.mo008.crdm.models.supplier.Supplier;
import com.mo008.crdm.models.sys.User;
import com.mo008.services.RedisService;
import com.mo008.services.UserService;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.sql.SQLException;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import goja.core.Func;
import goja.core.db.Dao;
import goja.core.sqlinxml.SqlKit;
import goja.mvc.Controller;
import goja.rapid.mvc.easyui.EuiDataGrid;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class HomeController extends Controller {

    public void index() {
        final int userType = UserService.getInstance().userType();
        setAttr("userType", userType);
        User user = User.dao.findById(UserService.getInstance().userId());
        setAttr("loginUser", user);
    }

    /**
     * 获取汽车列表信息
     */
    public void list() {
        final int userType = UserService.getInstance().userType();
        switch (userType) {
            case User.Type.ADMIN:
                renderEasyUIDataGrid("car");
                break;
            case User.Type.AGENTS: {
                final List<Object> params = Lists.newArrayList();
                params.add(UserService.getInstance().userId());
                renderEasyUIDataGrid("car.agent", params);
                break;
            }
            case User.Type.NORMAL: {
                final List<Object> params = Lists.newArrayList();
                params.add(UserService.getInstance().userId());
                renderEasyUIDataGrid("car.normal", params);
                break;
            }

            default:
                renderJson(EuiDataGrid.EMPTY_DATAGRID);
                break;
        }

    }

    /**
     * 保存汽车信息和相关排放信息
     */
    public void save() {
        final CarInfo car = getModel(CarInfo.class, "car");
        final Driver driver = getModel(Driver.class, "driver");

        final String terminal = car.getTerminal();
        final String carNo = car.getCarNo();
        // 根据供应商和车牌号检查车辆是否允许添加
        boolean supplierCheck = Supplier.dao.checkCarNo(carNo, terminal);
        if (supplierCheck) {
            renderAjaxFailure("非常抱歉，您填写生产厂商(供应商)与车牌号无法找到系统映射，无法添加!");
            return;
        }

        String province = getPara("area_province");
        String city = getPara("area_city");
        if (Strings.isNullOrEmpty(city)) {
            car.setAreaSn(province);
        } else {
            car.setAreaSn(city);
        }

        boolean isOk;
        if (Dao.isNew(car)) {
            final Date createDate = DateTime.now().toDate();
            final int operator = UserService.getInstance().userId();

            driver.setCreateDate(createDate);
            driver.setCreateTime(createDate);
            car.setOperator(operator);
            car.setCreateDate(createDate);
            car.setCreateTime(createDate);


            final int userType = UserService.getInstance().userType();
            CarPermission carPermission = null;
            if (userType == User.Type.AGENTS) {
                carPermission = new CarPermission();
                carPermission.setCreateTime(createDate);
                carPermission.setUserId(operator);
            }

            final CarPermission finalCarPermission = carPermission;
            isOk = Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    if (driver.save()) {
                        car.setDriverId(driver.getId());
                        if (car.save()) {
                            if (finalCarPermission != null) {
                                finalCarPermission.setCarId(car.getId());
                                return finalCarPermission.save();
                            } else {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            });
        } else {
            isOk = Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    return driver.update() && car.update();
                }
            });
        }
        if (isOk) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }


    public void assign() {
        int carId = getParaToInt("car", 0);
        if (carId <= 0) {
            renderAjaxFailure("请选择车辆信息");
            return;
        }
        String userIds = getPara("users");
        if (Strings.isNullOrEmpty(userIds)) {
            renderAjaxFailure("请选择可以查看车辆的人员信息!");
        } else {
            List<String> userIdList = Func.COMMA_SPLITTER.splitToList(userIds);
            if (userIdList.isEmpty()) {
                renderAjaxFailure("请选择可以查看车辆的人员信息!");
            } else {
                // 先清除所有的
                boolean ok = CarPermission.dao.asignUsers(carId, userIdList);
                if (ok) {
                    renderAjaxSuccess();
                } else {
                    renderAjaxFailure("操作失败");
                }
            }
        }
    }


    public void agents() {
        int carId = getParaToInt("car", 0);
        if (carId <= 0) {
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }
        List<Object> params = Lists.newArrayList();
        params.add(carId);
        params.add(User.Type.AGENTS);

        renderEasyUIDataGrid("car.agents", params);

    }

    /**
     * 显示信息
     */
    public void show() {
        int id = getParaToInt("id", 0);
        if (id > 0) {
            CarInfo car = CarInfo.dao.findById(id);
            Driver driver = Driver.dao.findById(car.getNumber("driver_id").intValue());
            User agent = User.dao.findById(car.getAgent());
            Map<String, Object> resule = Maps.newHashMap();
            resule.put("driver", driver);
            resule.put("car", car);
            resule.put("agentName", agent == null ? "" : agent.getUsername());
            resule.put("provice", !Strings.isNullOrEmpty(car.getAreaSn()) ? car.getAreaSn().substring(0, 4) : "");
            if (!Strings.isNullOrEmpty(car.getAreaSn()) && car.getAreaSn().length() > 4) {
                resule.put("city", !Strings.isNullOrEmpty(car.getAreaSn()) ? car.getAreaSn() : "");
            }
            renderAjaxSuccess(resule);
        } else {
            renderAjaxFailure();
        }
    }

    /**
     * 删除汽车信息
     */
    public void del() {
        String[] ids = getParaValues("id[]");
        final List<Object> params = Lists.newArrayList();
        Collections.addAll(params, ids);
        String inSql = StringUtils.repeat("?", ",", ids.length);
        String delCar = SqlKit.sql("car.delCar");
        delCar = delCar + " AND id in (" + inSql + ")";
        String delFailure = SqlKit.sql("carFailureCriteria.deleteByCarId");
        delFailure = delFailure + " AND car_id in (" + inSql + ")";
        final String finalDelCar = delCar;
        final String finalDelFailure = delFailure;
        boolean isOk = Db.tx(new IAtom() {
            @Override
            public boolean run() throws SQLException {
                return Db.update(finalDelCar, params.toArray()) >= 0 && Db.update(finalDelFailure, params.toArray()) >= 0;
            }
        });
        if (isOk) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }

    /**
     * 保存监控失效标准信息
     */
    public void invalidsave() {
        int carId = getParaToInt("failure.car_id", 0);
        CarInfo carInfo = CarInfo.dao.findById(carId);
        if (carId > 0 && carInfo != null) {
            CarFailureCriteria carFailureCriteria = CarFailureCriteria.dao.findById(carId);
            if (carFailureCriteria != null) {
                carFailureCriteria.delete();
            }
            carFailureCriteria = getModel(CarFailureCriteria.class, "failure");
            if (carFailureCriteria.save()) {
                renderAjaxSuccess();
            } else {
                renderAjaxFailure();
            }
        } else {
            renderAjaxFailure();
        }
    }

    /**
     * 保存终端信息
     */
    public void saveterminal() {
        int carId = getParaToInt("carId", 0);
        long deviceId = getParaToLong("deviceId", 0L);
        CarInfo carInfo = CarInfo.dao.findById(carId);
        if (carInfo == null) {
            renderAjaxFailure("车辆信息不存在");
            return;
        }
        Device device = Device.dao.findById(deviceId);
        if (device == null) {
            renderAjaxFailure("设备信息不存在");
        }
        boolean isExist = CarInfo.dao.findByDeviceId(deviceId, carId);
        if (isExist) {
            renderAjaxFailure("设备已经被绑定!");
            return;
        }
        carInfo.setDeviceId(deviceId);
        if (carInfo.update()) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }


    /**
     * 查询车辆的最新监控数据接口
     */
    public void monitoring() {
        String carId = getPara("car_no");
        if (!Strings.isNullOrEmpty(carId)) {
            CarInfo carInfo = CarInfo.dao.findByCarNo(carId);
            if (carInfo != null) {
                DeviceData deviceData = DeviceData.dao.findByCarAndCurrent(carInfo.getId());
                final List<String> onlineDeviceCodes = RedisService.getInstance().onlineDeviceCodes();
                deviceData.put("online", onlineDeviceCodes.contains(deviceData.getStr("device_code")));
                renderAjaxSuccess(deviceData);
            } else {
                renderAjaxFailure();
            }
        } else {
            renderAjaxFailure();
        }

    }
}