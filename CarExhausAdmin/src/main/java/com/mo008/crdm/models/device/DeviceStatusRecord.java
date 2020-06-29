/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.device;

import com.mo008.crdm.models.device.base.BaseDeviceStatusRecord;

import goja.core.annotation.TableBind;

/**
 * Created by BOGOMm on 16/4/29.
 */
@TableBind( tableName = "mo_device_status_record")
public class DeviceStatusRecord extends BaseDeviceStatusRecord<DeviceStatusRecord> {
    public static DeviceStatusRecord dao = new DeviceStatusRecord();
}
