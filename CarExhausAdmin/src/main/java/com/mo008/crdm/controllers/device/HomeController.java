/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.device;

import com.mo008.crdm.models.device.Device;
import com.mo008.crdm.models.sys.Role;
import com.mo008.services.UserService;

import goja.mvc.Controller;
import goja.security.shiro.Securitys;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * <p> 设备管理</p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class HomeController extends Controller {

    /**
     * The index route.
     */
    public void index() {
    }

    public void list() {
        final List<Object> params = Lists.newArrayList();
        if (Securitys.isRole(Role.SUPER_ADMIN)) {

            // 平台管理员 可以查看所有的设备批次
            params.add(false);
            renderEasyUIDataGrid("device.admin",params);
        } else {
            // 只能看到自己的创建的设备批次
            params.add(UserService.getInstance().userId());
            params.add(false);
            renderEasyUIDataGrid("device", params);
        }
    }


    /**
     * 获取所有可以绑定的设备
     */
    public void bindlist(){
        final List<Object> params = Lists.newArrayList();
        if (Securitys.isRole(Role.SUPER_ADMIN)) {

            // 平台管理员 可以查看所有的设备批次
            params.add(false);
            renderEasyUIDataGrid("device.bind.admin",params);
        } else {
            // 只能看到自己的创建的设备批次
            params.add(UserService.getInstance().userId());
            params.add(false);
            renderEasyUIDataGrid("device.bind", params);
        }
    }


    public void coutErrorNum(){


       // }
      //return "" ;
    }



    public void listWarning() {
//        final List<Object> params = Lists.newArrayList();
//        params.add(false);
        renderEasyUIDataGrid("device.warningSql");
//        if (Securitys.isRole(Role.SUPER_ADMIN)) {
//            // 平台管理员 可以查看所有的设备批次
//            params.add(false);
//            renderEasyUIDataGrid("device.admin",params);
//        } else {
//            // 只能看到自己的创建的设备批次
//            params.add(UserService.getInstance().userId());
//            params.add(false);
//            renderEasyUIDataGrid("device", params);
//        }
    }



    public void delete() {
        final String[] ids = getParaValues("id[]");

        boolean runStatus = Device.dao.changeByDeleteStatus(ids);
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("删除数据失败");
        }
    }
}