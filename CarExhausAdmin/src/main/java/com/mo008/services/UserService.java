/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.services;

import com.mo008.crdm.models.sys.User;

import goja.security.shiro.AppUser;
import goja.security.shiro.Securitys;
import com.jfinal.plugin.activerecord.Model;


/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class UserService {

    public int userId() {
        return Securitys.getLogin().getId();
    }


    public int userType() {
        final AppUser<Model> loginUser = Securitys.getLogin();
        return loginUser.getType();
    }


    public boolean isAgent() {

        final AppUser<Model> loginUser = Securitys.getLogin();
        return loginUser.getType() == User.Type.AGENTS;
    }

    /**
     * 获取单例对象,如果要调用该单例的使用,只能通过该方法获取.
     */
    public static UserService getInstance() {
        return UserServiceHolder.instance;
    }

    /**
     * 私有构造函数,确保对象只能通过单例方法来调用.
     */
    private UserService() {
    }

    /**
     * lazy 加载的内部类,用于实例化单例对象.
     */
    private static class UserServiceHolder {
        static UserService instance = new UserService();
    }
}
