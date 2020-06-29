/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm;

import com.mo008.crdm.models.sys.Resources;
import com.mo008.crdm.models.sys.User;

import goja.security.shiro.AppUser;
import goja.security.shiro.LoginUser;
import goja.security.shiro.SecurityUserData;
import goja.security.shiro.UserAuth;

import com.google.common.collect.Lists;

import org.apache.shiro.authc.UnknownAccountException;

import java.util.List;


/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class AppSecruityRealm implements SecurityUserData<User> {
    @Override
    public UserAuth auth(AppUser<User> principal) {
        List<String> roles = Lists.newArrayList();
        List<String> permissions = Lists.newArrayList();
        User dbUser = User.dao.findById(principal.getId());
        boolean superAdmin = dbUser.getSuperAdmin();
        if (superAdmin) {
            List<Resources> resources = Resources.dao.findByEnable();
            for (Resources resource : resources) {
                permissions.add(resource.getCode());
            }
        } else {
            List<Resources> resources = Resources.dao.findByUser(principal.getId());
            for (Resources resource : resources) {
                permissions.add(resource.getCode());
            }
        }
        return new UserAuth(roles, permissions);
    }

    @Override
    public LoginUser<User> user(String loginName) {
        // 调用操作数据库的方法查询user信息
        User user = User.dao.findByName(loginName);
        if (user != null) {
            AppUser<User> shiroEmployee = new AppUser<User>(
                    user.getId(),
                    user.getName(),
                    user.getUsername(),
                    user.getType(),
                    user.getDefaultFlag() ? 0 : 1,
                    user
            );
            return new LoginUser<User>(shiroEmployee, user.getPassword(), user.getSalt());
        } else {
            throw new UnknownAccountException("无法找到对应的用户");
        }
    }
}