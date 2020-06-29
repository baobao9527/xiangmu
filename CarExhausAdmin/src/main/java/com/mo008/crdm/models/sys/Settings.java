/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;


import com.mo008.crdm.models.sys.base.BaseSettings;

import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

import java.util.List;

/**
 * <p> The database mo_settings Model. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_settings")
public class Settings extends BaseSettings<Settings> {

    /**
     * The public dao.
     */
    public static final Settings dao = new Settings();

    private static final long serialVersionUID = -3030948399884087649L;

    public List<Settings> findByItem(String item) {
        return find(SqlKit.sql("sys.settings.findByItem"), item);
    }

}