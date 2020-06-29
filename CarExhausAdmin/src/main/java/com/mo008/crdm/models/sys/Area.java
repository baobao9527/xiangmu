/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;


import com.mo008.crdm.models.sys.base.BaseArea;

import goja.core.annotation.TableBind;
import goja.core.kits.lang.Strs;
import goja.core.sqlinxml.SqlKit;

import java.util.List;

/**
 * <p> The database mo_area Model. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_area")
public class Area extends BaseArea<Area> {

    /**
     * The public dao.
     */
    public static final Area dao = new Area();

    private static final long serialVersionUID = 6367165260117426694L;

    public List<Area> findByLevel(int level) {
        return find(SqlKit.sql("info.area.findByLevel"), level);
    }

    public List<Area> findByparent(int parent) {
        return find(SqlKit.sql("info.area.findByParent"), parent);
    }

    public List<Area> findBySn(String sn) {
        return findByCache("sys.areas.sn", sn, SqlKit.sql("info.area.findBySn"), Strs.rlike(sn));
    }

    public List<Area> findByparentSn(String sn) {
        return findByCache("sys.areas.parentsn",sn,SqlKit.sql("info.area.findByParentSn"),sn);
    }
}