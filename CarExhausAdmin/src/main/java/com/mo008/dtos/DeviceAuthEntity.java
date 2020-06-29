/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.dtos;

import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecgframework.poi.excel.annotation.ExcelTarget;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
@ExcelTarget("deviceAuthEntity")
public class DeviceAuthEntity implements java.io.Serializable {
    private static final long serialVersionUID = -7529626010794809925L;


    /**
     * 主键
     */
    private long id;
    /**
     * 设备ID
     */
    @Excel(name = "设备ID", orderNum = "2", width = 60)
    private String deviceId;


    @Excel(name = "鉴权号", orderNum = "1", width = 60)
    private String authCode;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getAuthCode() {
        return authCode;
    }

    public void setAuthCode(String authCode) {
        this.authCode = authCode;
    }
}
