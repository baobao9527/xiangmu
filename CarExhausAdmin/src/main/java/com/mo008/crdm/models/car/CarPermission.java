/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.car;

import com.mo008.crdm.models.car.base.BaseCarPermission;

import goja.core.annotation.TableBind;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;

import com.google.common.base.MoreObjects;
import com.google.common.collect.Lists;
import com.google.common.primitives.Ints;

import org.joda.time.DateTime;

import java.sql.SQLException;
import java.util.List;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_car_permission", pks = {"car_id", "user_id"})
public class CarPermission extends BaseCarPermission<CarPermission> {
    public static final CarPermission dao = new CarPermission();

    private static final long serialVersionUID = 5112379277621139642L;

    public boolean asignUsers(final int carId, List<String> userIdList) {
        final List<CarPermission> carPermissions = Lists.newArrayList();
        for (String userId : userIdList) {
            CarPermission _permission = new CarPermission();
            _permission.setCarId((long) carId);
            _permission.setUserId(MoreObjects.firstNonNull(Ints.tryParse(userId), 0));
            _permission.setCreateTime(DateTime.now().toDate());
            carPermissions.add(_permission);
        }


        return Db.tx(new IAtom() {
            @Override
            public boolean run() throws SQLException {
                final int update = Db.update("delete from mo_car_permission where car_id = ?", carId);
                return update >= 0 && Db.batch("insert into mo_car_permission (car_id, user_id, create_time) values (?,?,?)", "car_id, user_id, create_time", carPermissions, 100).length >= 0;
            }
        });
    }

    public List<CarPermission> findByCar(int carId) {
        return find("SELECT mcp.car_id, mcp.user_id, mcp.create_time, mu.name, mu.username FROM mo_car_permission mcp INNER JOIN mo_user mu ON mu.id= mcp.user_id WHERE mcp.car_id=? ORDER BY mcp.create_time DESC", carId);
    }
}
