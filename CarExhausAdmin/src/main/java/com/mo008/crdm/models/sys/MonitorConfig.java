/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;

import goja.core.annotation.TableBind;
import com.jfinal.plugin.activerecord.Model;

/**
 * <p>
 * 监控配置表
 * </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_monitor_config", pks = "user_id")
public class MonitorConfig extends Model<MonitorConfig> {

    /**
     * The public dao.
     */
    public static final MonitorConfig dao = new MonitorConfig();


    private static final long serialVersionUID = -8475801162707479093L;
}