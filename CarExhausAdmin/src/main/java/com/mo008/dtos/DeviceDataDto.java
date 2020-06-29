/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.dtos;

import com.google.common.base.MoreObjects;

import com.alibaba.fastjson.annotation.JSONField;

import java.io.Serializable;
import java.util.Date;

/**
 * <p> 设备上报数据DTO </p>
 *
 * GPS信息	0x0001	16	经度6字节 纬度6字节 速度2字节 有效位1字节 0表示无效，1表示有效 预留1字节
 *
 * 排气管压差	0x0002	4	范围[0，FFFF]pa,正常范围为[0，40000],超过40kpa为非正常压差，无法采集到压差时返回0XFFFFFFFF
 *
 * DPF前温	0x0003	2	范围 (-50，1000)度，无法采集到温度时返回0x7fff
 *
 * DPF后温	0x0004	2	范围 (-50，1000)度，无法采集到温度时返回0x7fff
 *
 * 发动机平均转速	0x0005	2	范围[0,10000],无法采集到平均转速时返回0x7fff
 *
 * 汽车总里程(OBD)	0x000A	4	无符号32位整型，汽车行驶里程
 *
 * 后处理采集里程	0x000B	4	无符号32位整型,后处理加装后的里程
 *
 * 扭矩	0x000C	4	无符号32位整型
 *
 * NOX浓度	0x000D	1	无符号8位整型
 *
 * 瞬时油耗	0x000E	2	百公里油耗*100 取整
 *
 * 发动机负荷	0x000F	1	百分比：90表示90%
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class DeviceDataDto implements Serializable {


    private static final long serialVersionUID = -1570652029349206651L;

    /**
     * 经度(度分秒)
     */
    private String longitude;

    /**
     * 纬度(度分秒)
     */
    private String latitude;

    /**
     * 速度
     */
    private float speed;

    /**
     * 排气管压差
     */
    private int pressure;

    /**
     * DPF前温
     */
    private int proDPF;

    /**
     * DPF后温
     */
    private int afterDPF;

    /**
     * 发动机平均转速
     */
    private int avgEngineSpeed;

    /**
     * 汽车总里程(OBD)
     */
    private long obd;

    /**
     * 后处理采集里程
     */
    private long mileage;

    /**
     * 扭矩
     */
    private long torque;

    /**
     * NOX浓度
     */
    private int noxDeep;

    /**
     * 瞬时油耗
     */
    private int curOn;

    /**
     * 发动机负荷
     */
    private int engineLoad;


    /**
     * 设备ID
     */
    private String deviceId;

    /**
     * 车牌信息
     */
    private Integer platNumber;
    /**
     * 实时车速
     */
    private Integer realTimeSpeed;
    /**
     * DOC前温
     */
    private Integer docBefore;
    /**
     * SCR后温
     */
    private Integer sCRAfter;
    /**
     * DPF前压力
     */
    private Integer dPFBeforePressure;
    /**
     * DPF后压力
     */
    private Integer dPFAfterPressure;
    /**
     * 尿素液位
     */
    private Integer ureaLevel;
    /**
     * 尿素温度
     */
    private Integer ureaTemperature;
    /**
     * PM净化量
     */
    private Integer pm;
    /**
     * Nox净化量
     */
    private Integer nox;
    /**
     * 故障码
     */
    private Integer malfunction;

    /**
     * 上报时间
     */
    @JSONField(format="yyyy-MM-dd HH:mm:ss")
    private Date reportTime;


    public Date getReportTime() {
        return reportTime;
    }

    public void setReportTime(Date reportTime) {
        this.reportTime = reportTime;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public float getSpeed() {
        return speed;
    }

    public void setSpeed(float speed) {
        this.speed = speed;
    }

    public int getPressure() {
        return pressure;
    }

    public void setPressure(int pressure) {
        this.pressure = pressure;
    }

    public int getProDPF() {
        return proDPF;
    }

    public void setProDPF(int proDPF) {
        this.proDPF = proDPF;
    }

    public int getAfterDPF() {
        return afterDPF;
    }

    public void setAfterDPF(int afterDPF) {
        this.afterDPF = afterDPF;
    }

    public int getAvgEngineSpeed() {
        return avgEngineSpeed;
    }

    public void setAvgEngineSpeed(int avgEngineSpeed) {
        this.avgEngineSpeed = avgEngineSpeed;
    }

    public long getObd() {
        return obd;
    }

    public void setObd(long obd) {
        this.obd = obd;
    }

    public long getMileage() {
        return mileage;
    }

    public void setMileage(long mileage) {
        this.mileage = mileage;
    }

    public long getTorque() {
        return torque;
    }

    public void setTorque(long torque) {
        this.torque = torque;
    }

    public int getNoxDeep() {
        return noxDeep;
    }

    public void setNoxDeep(int noxDeep) {
        this.noxDeep = noxDeep;
    }

    public int getCurOn() {
        return curOn;
    }

    public void setCurOn(int curOn) {
        this.curOn = curOn;
    }

    public int getEngineLoad() {
        return engineLoad;
    }

    public void setEngineLoad(int engineLoad) {
        this.engineLoad = engineLoad;
    }

    public Integer getPlatNumber() {
        return platNumber;
    }

    public void setPlatNumber(Integer platNumber) {
        this.platNumber = platNumber;
    }

    public Integer getRealTimeSpeed() {
        return realTimeSpeed;
    }

    public void setRealTimeSpeed(Integer realTimeSpeed) {
        this.realTimeSpeed = realTimeSpeed;
    }

    public Integer getDocBefore() {
        return docBefore;
    }

    public void setDocBefore(Integer docBefore) {
        this.docBefore = docBefore;
    }

    public Integer getsCRAfter() {
        return sCRAfter;
    }

    public void setsCRAfter(Integer sCRAfter) {
        this.sCRAfter = sCRAfter;
    }

    public Integer getdPFBeforePressure() {
        return dPFBeforePressure;
    }

    public void setdPFBeforePressure(Integer dPFBeforePressure) {
        this.dPFBeforePressure = dPFBeforePressure;
    }

    public Integer getdPFAfterPressure() {
        return dPFAfterPressure;
    }

    public void setdPFAfterPressure(Integer dPFAfterPressure) {
        this.dPFAfterPressure = dPFAfterPressure;
    }

    public Integer getUreaLevel() {
        return ureaLevel;
    }

    public void setUreaLevel(Integer ureaLevel) {
        this.ureaLevel = ureaLevel;
    }

    public Integer getUreaTemperature() {
        return ureaTemperature;
    }

    public void setUreaTemperature(Integer ureaTemperature) {
        this.ureaTemperature = ureaTemperature;
    }

    public Integer getPm() {
        return pm;
    }

    public void setPm(Integer pm) {
        this.pm = pm;
    }

    public Integer getNox() {
        return nox;
    }

    public void setNox(Integer nox) {
        this.nox = nox;
    }

    public Integer getMalfunction() {
        return malfunction;
    }

    public void setMalfunction(Integer malfunction) {
        this.malfunction = malfunction;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("longitude", longitude)
                .add("latitude", latitude)
                .add("speed", speed)
                .add("pressure", pressure)
                .add("proDPF", proDPF)
                .add("afterDPF", afterDPF)
                .add("avgEngineSpeed", avgEngineSpeed)
                .add("obd", obd)
                .add("mileage", mileage)
                .add("torque", torque)
                .add("noxDeep", noxDeep)
                .add("curOn", curOn)
                .add("engineLoad", engineLoad)
                .add("deviceId", deviceId)
                .add("platNumber", platNumber)
                .add("realTimeSpeed", realTimeSpeed)
                .add("docBefore", docBefore)
                .add("sCRAfter", sCRAfter)
                .add("dPFBeforePressure", dPFBeforePressure)
                .add("dPFAfterPressure", dPFAfterPressure)
                .add("ureaLevel", ureaLevel)
                .add("ureaTemperature", ureaTemperature)
                .add("pm", pm)
                .add("nox", nox)
                .add("malfunction", malfunction)
                .toString();
    }
}
