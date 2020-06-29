/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.car;


import com.mo008.crdm.models.car.base.BaseCarInfo;
import com.mo008.crdm.models.sys.User;
import com.mo008.services.UserService;

import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

import com.google.common.base.Strings;

import java.util.List;

/**
 * Generated by JFinal.
 */
@TableBind(tableName = "mo_car_info")
public class CarInfo extends BaseCarInfo<CarInfo> {
    public static final CarInfo dao = new CarInfo();
    private static final long serialVersionUID = 5534163722089466880L;

    /**
     * 通过区域code查询统计
     *
     * @param code 区域的code
     * @param type 1:按照省,2:按照市
     * @return
     */
    public List<CarInfo> findByCarType(String code, int type) {
        String groupBy = "GROUP BY car_flag";
        final int userType = UserService.getInstance().userType();
        if (!Strings.isNullOrEmpty(code)) {


            switch (userType) {
                case User.Type.ADMIN:
                    if (type == 1) {

                        return find(SqlKit.sql("car.findByCarType") + " AND mi.area_sn like ? " + groupBy, code + "%");
                    } else {
                        return find(SqlKit.sql("car.findByCarType") + " AND mi.area_sn = ? " + groupBy, code);
                    }
                case User.Type.AGENTS: {
                    if (type == 1) {

                        return find(SqlKit.sql("car.findByCarType") + " AND exists (select 1 from mo_car_permission mcp where mcp.car_id = mi.id and mcp.user_id = ?)  AND mi.area_sn like ? " + groupBy, UserService.getInstance().userId(), code + "%");
                    } else {
                        return find(SqlKit.sql("car.findByCarType") + " AND exists (select 1 from mo_car_permission mcp where mcp.car_id = mi.id and mcp.user_id = ?)  AND mi.area_sn = ? " + groupBy, UserService.getInstance().userId(), code);
                    }
                }
                case User.Type.NORMAL: {
//					final List<Object> params = Lists.newArrayList();
//					params.add(UserService.getInstance().userId());
//					renderEasyUIDataGrid("car.normal", params);
                    break;
                }

                default:
                    //	renderJson(EuiDataGrid.EMPTY_DATAGRID);
                    break;
            }
            return null;
        } else {

            if (userType == User.Type.ADMIN) {
                return find(SqlKit.sql("car.findByCarType") + groupBy);
            } else if (userType == User.Type.AGENTS) {
                return find(SqlKit.sql("car.findByCarType") + " AND exists (select 1 from mo_car_permission mcp where mcp.car_id = mi.id and mcp.user_id = ?)  " + groupBy, UserService.getInstance().userId());
            }

        }
        return null;
    }


    /**
     * 通过区域code查询统计
     *
     * @param code 区域的code
     * @param type 1:按照省,2:按照市
     * @return
     */
    public List<CarInfo> findByDischarge(String code, int type) {
        final int userType = UserService.getInstance().userType();

        if (userType == User.Type.ADMIN) {
            if (!Strings.isNullOrEmpty(code)) {
                if (type == 1) {

                    return find(SqlKit.sql("car.findByDischarge").replace("1=1", "area_sn like ? "), code + "%");
                } else {
                    return find(SqlKit.sql("car.findByDischarge").replace("1=1", "area_sn = ? "), code);
                }

            } else {
                return find(SqlKit.sql("car.findByDischarge"));
            }

        } else if (userType == User.Type.AGENTS) {
            if (!Strings.isNullOrEmpty(code)) {
                if (type == 1) {

                    return find(SqlKit.sql("car.findByDischarge").replace("1=1", "area_sn like ? and  exists (select 1 from mo_car_permission mcp where mcp.car_id = mo_car_info.id and mcp.user_id = ?)"), code + "%", UserService.getInstance().userId());
                } else {
                    return find(SqlKit.sql("car.findByDischarge").replace("1=1", "area_sn = ?  and exists (select 1 from mo_car_permission mcp where mcp.car_id = mo_car_info.id and mcp.user_id = ?)"), code, UserService.getInstance().userId());
                }

            } else {
                return find(SqlKit.sql("car.findByDischarge").replace("1=1", "exists (select 1 from mo_car_permission mcp where mcp.car_id = mo_car_info.id and mcp.user_id = ?)"), UserService.getInstance().userId());
            }
        }
        return null;
    }


    /**
     * 按照城市查询统计
     *
     * @param sn
     * @return
     */
    public List<CarInfo> findForArea(String sn) {
        final int userType = UserService.getInstance().userType();
        if (userType == User.Type.ADMIN) {
            if (Strings.isNullOrEmpty(sn)) {
                return find(SqlKit.sql("car.findForProvice"));
            } else {
                return find(SqlKit.sql("car.findForArea"), sn + "%");
            }


        } else if ((userType == User.Type.AGENTS)) {
            int userId = UserService.getInstance().userId();


            if (Strings.isNullOrEmpty(sn)) {
                return find(SqlKit.sql("car.findForProvice").replace("1=1", " exists (select 1 from mo_car_permission mcp where mcp.car_id = mi.id and mcp.user_id = ?)"), userId);
            } else {
                return find(SqlKit.sql("car.findForArea").replace("1=1", " exists (select 1 from mo_car_permission mcp where mcp.car_id = mi.id and mcp.user_id = ?)"), userId, sn + "%");
            }


        }
        return null;

    }

    /**
     * 通过车牌号查询车辆信息
     *
     * @param carNo
     * @return
     */
    public CarInfo findByCarNo(String carNo) {
        return findFirst(SqlKit.sql("car.findByCarNo"), carNo);
    }

    /**
     * 判断设备是不是已经绑定
     *
     * @param deviceId
     * @return 存在 ture
     */
    public boolean findByDeviceId(long deviceId, int cardId) {
        return findFirst(SqlKit.sql("car.findByDeviceId"), deviceId, cardId).getNumber("c").intValue() > 0;
    }
}