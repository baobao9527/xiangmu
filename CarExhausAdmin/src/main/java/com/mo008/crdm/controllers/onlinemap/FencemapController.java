/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.onlinemap;

import com.google.common.collect.Lists;

import com.jfinal.aop.Before;
import com.mo008.crdm.models.car.Fence;
import com.mo008.crdm.models.sys.Role;
import com.mo008.interceptors.MapKeyInterceptor;
import com.mo008.services.UserService;

import org.joda.time.DateTime;

import java.util.List;

import goja.mvc.Controller;
import goja.security.shiro.Securitys;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
@SuppressWarnings("unused")
public class FencemapController extends Controller {
    @Before(MapKeyInterceptor.class)
    public void index() {

    }

    /**
     * 提供列表数据
     */
    public void list() {
        if (Securitys.isRole(Role.SUPER_ADMIN)) {
            renderEasyUIDataGrid("fence");
        } else {
            List<Object> params = Lists.newArrayList();
            params.add(UserService.getInstance().userId());
            renderEasyUIDataGrid("fence.rolelist", params);
        }
    }

    /**
     * 删除电子围栏
     */
    public void del() {
        String id = getPara("id");
        if (Fence.dao.findById(id).delete()) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }

    /**
     * 保存电子围栏
     */
    public void save() {
        Fence fence = getModel(Fence.class, "fence");
        fence.setUserId(UserService.getInstance().userId());
        fence.setCreateTime(DateTime.now().toDate());
        fence.setCreateDate(DateTime.now().toDate());
        if (fence.save()) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }

}
