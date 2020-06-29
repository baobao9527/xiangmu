/*
 * Copyright © 2015-2017, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.dtos;

import com.google.common.base.MoreObjects;

import org.jeecgframework.poi.excel.annotation.Excel;

import java.io.Serializable;
import java.util.Date;

/**
 * <p> Excel对应实体类 </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class ExcelDeviceData implements Serializable {
    private static final long serialVersionUID = 7986716404338172766L;

    /**
     * 车牌号
     */

    @Excel(name = "车牌号码", orderNum = "1")
    private String carNo;

    /**
     * 车辆颜色
     */

    @Excel(name = "车牌颜色", orderNum = "2")
    private String carColor;

    /**
     * 上报时间
     */

    @Excel(name = "日期", format = "yyyy-MM-dd HH:mm:ss",orderNum = "3")
    private Date reportTime;


    /**
     * DPF前温
     */

    @Excel(name = "DPF前温（℃）", orderNum = "4")
    private int proDPF;

    /**
     * DPF后温
     */

    @Excel(name = "DPF后温（℃）", orderNum = "5")
    private int afterDPF;

    /**
     * DOC前温
     */

    @Excel(name = "DOC前温（℃）", orderNum = "6")
    private Integer docBefore;
    /**
     * SCR后温
     */

    @Excel(name = "SCR后温（℃）", orderNum = "7")
    private Integer sCRAfter;

    /**
     * DPF前压力
     */

    @Excel(name = "DPF前压力（pa）", orderNum = "8")
    private Integer dPFBeforePressure;
    /**
     * DPF后压力
     */

    @Excel(name = "DPF后压力（pa）", orderNum = "9")
    private Integer dPFAfterPressure;
    /**
     * 排气管压差
     */

    @Excel(name = "压差（pa）", orderNum = "10")
    private int     pressure;
    /**
     * 尿素温度
     */

    @Excel(name = "尿素温度（℃）", orderNum = "11")
    private Integer ureaTemperature;
    /**
     * 尿素液位
     */

    @Excel(name = "尿素液位（%）", orderNum = "12")
    private Integer ureaLevel;
    /**
     * 速度
     */

    @Excel(name = "车速（km/h）", orderNum = "13")
    private float   speed;

    /**
     * 后处理采集里程
     */

    @Excel(name = "里程（m）", orderNum = "15")
    private long mileage;

    /**
     * PM净化量
     */

    @Excel(name = "PM净化量（g）", orderNum = "16")
    private Integer pm;
    /**
     * No净化量
     */

    @Excel(name = "NO净化量（g）", orderNum = "17")
    private Integer nox;

    /**
     * 车辆标识
     */

    @Excel(name = "车辆标识", orderNum = "18")
    private String carFlag;

    /**
     * 生产厂商
     */

    @Excel(name = "生产厂商", orderNum = "19")
    private String carCompany;

    /**
     * 故障码
     */

    @Excel(name = "故障码", orderNum = "20")
    private Integer malfunction;

    /**
     * 经度(百度)
     */

    @Excel(name = "经度", orderNum = "21")
    private String longitude;

    /**
     * 纬度(百度)
     */

    @Excel(name = "纬度", orderNum = "22")
    private String latitude;

    /**
     * 系统状态
     */

    @Excel(name = "系统状态", orderNum = "23")
    private String systemStatus;

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("carNo", carNo)
                .add("carColor", carColor)
                .add("reportTime", reportTime)
                .add("proDPF", proDPF)
                .add("afterDPF", afterDPF)
                .add("docBefore", docBefore)
                .add("sCRAfter", sCRAfter)
                .add("dPFBeforePressure", dPFBeforePressure)
                .add("dPFAfterPressure", dPFAfterPressure)
                .add("pressure", pressure)
                .add("ureaTemperature", ureaTemperature)
                .add("ureaLevel", ureaLevel)
                .add("speed", speed)
                .add("mileage", mileage)
                .add("pm", pm)
                .add("nox", nox)
                .add("carFlag", carFlag)
                .add("carCompany", carCompany)
                .add("malfunction", malfunction)
                .add("longitude", longitude)
                .add("latitude", latitude)
                .add("systemStatus", systemStatus)
                .toString();
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

    public int getPressure() {
        return pressure;
    }

    public void setPressure(int pressure) {
        this.pressure = pressure;
    }

    public Integer getUreaTemperature() {
        return ureaTemperature;
    }

    public void setUreaTemperature(Integer ureaTemperature) {
        this.ureaTemperature = ureaTemperature;
    }

    public Integer getUreaLevel() {
        return ureaLevel;
    }

    public void setUreaLevel(Integer ureaLevel) {
        this.ureaLevel = ureaLevel;
    }

    public float getSpeed() {
        return speed;
    }

    public void setSpeed(float speed) {
        this.speed = speed;
    }



    public long getMileage() {
        return mileage;
    }

    public void setMileage(long mileage) {
        this.mileage = mileage;
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

    public String getCarFlag() {
        return carFlag;
    }

    public void setCarFlag(String carFlag) {
        this.carFlag = carFlag;
    }

    public String getCarCompany() {
        return carCompany;
    }

    public void setCarCompany(String carCompany) {
        this.carCompany = carCompany;
    }

    public Integer getMalfunction() {
        return malfunction;
    }

    public void setMalfunction(Integer malfunction) {
        this.malfunction = malfunction;
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

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }

    public String getCarNo() {
        return carNo;
    }

    public void setCarNo(String carNo) {
        this.carNo = carNo;
    }

    public String getCarColor() {
        return carColor;
    }

    public void setCarColor(String carColor) {
        this.carColor = carColor;
    }

    public Date getReportTime() {
        return reportTime;
    }

    public void setReportTime(Date reportTime) {
        this.reportTime = reportTime;
    }
}
