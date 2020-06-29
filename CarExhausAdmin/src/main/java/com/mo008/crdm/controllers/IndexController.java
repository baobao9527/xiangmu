/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers;

import com.google.common.base.MoreObjects;

import com.jfinal.aop.Before;
import com.jfinal.core.ActionKey;
import com.jfinal.ext.interceptor.GET;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.ehcache.CacheKit;
import com.mo008.Constants;
import com.mo008.crdm.models.info.Notice;
import com.mo008.crdm.models.sys.Resources;
import com.mo008.crdm.models.sys.User;
import com.mo008.dtos.easyui.MenuDto;
import com.mo008.interceptors.AppSettingInterceptor;

import java.util.List;

import goja.mvc.Controller;
import goja.security.shiro.AppUser;
import goja.security.shiro.Securitys;


/**
 * <p> Default index Controller. </p>
 */
public class IndexController extends Controller {

    @ActionKey("/")
    @Before(AppSettingInterceptor.class)
    public void index() {

        if (!Securitys.isLogin()) {
            redirect("/login");
            return;
        }


        // 获取登录人的资源权限
        final AppUser<User> login = Securitys.getLogin();

        List<MenuDto> menuDtos = CacheKit.get(Constants.CACHE_MENUS, login.getId());
        if (menuDtos == null || menuDtos.isEmpty()) {
            final Boolean superAdmin = login.getType() == User.Type.ADMIN;
            List<Resources> resources;
            if (superAdmin) {
                resources = Resources.dao.findByMenu();
            } else {
                resources = Resources.dao.findByUser(login.getId());
            }
            menuDtos = Resources.dao.parseTreeDto(resources);
            CacheKit.put(Constants.CACHE_MENUS, login.getId(), menuDtos);
        }
        setAttr("sysmenus", JsonKit.toJson(menuDtos));
        Long warings = Db.queryLong(" SELECT  count(1) as i  from mo_device_warning t");
        if (warings == null) {
            setAttr("countError", 0);
        } else {
            setAttr("countError", warings);
        }


        render("../index.ftl");
    }


    @ActionKey("/warning")
    @Before(GET.class)
    public void warning() {
        Long warings = Db.queryLong(" SELECT  count(1) as i  from mo_device_warning t");
        renderAjaxSuccess(MoreObjects.firstNonNull(warings, 0L));
    }


    @ActionKey("/dashboard")
    public void dashboard() {
        int userId = Securitys.getLogin().getId();
        final User user = User.dao.findInfoWithUserId(userId);
        setAttr("user", user);

        final List<Notice> notices = Notice.dao.findByHome(userId);
        setAttr("notices", notices);

    }


    @ActionKey("/logout")
    public void logout() {
        if (Securitys.isLogin()) {
            CacheKit.remove(Constants.CACHE_MENUS, Securitys.getLogin().getId());
            Securitys.logout();
        }
        redirect("/login");
    }


    @ActionKey("/changepwd")
    public void changepwd() {
        int userId = Securitys.getLogin().getId();
        String oldPwd = getPara("oldPassword");
        String newPwd = getPara("newPassword");

    }
}