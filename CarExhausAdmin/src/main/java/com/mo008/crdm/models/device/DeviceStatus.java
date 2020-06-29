/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.device;

import goja.core.annotation.TableBind;
import com.jfinal.plugin.activerecord.Model;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_device_status")
public class DeviceStatus extends Model<DeviceStatus> {

    /**
     * The public dao.
     */
    public static final DeviceStatus dao = new DeviceStatus();


    private static final long serialVersionUID = 8570093048014648578L;
}