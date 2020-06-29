/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;


import com.mo008.crdm.models.sys.base.BaseRole;

import goja.core.StringPool;
import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;
import com.jfinal.plugin.activerecord.Db;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;

import java.util.List;

/**
 * <p> The database mo_role Model. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_role")
public class Role extends BaseRole<Role> {

    /**
     * The public dao.
     */
    public static final Role dao = new Role();


    /**
     * 超级管理员标记
     */
    public static final String SUPER_ADMIN = "__superadmin";

    private static final long serialVersionUID = -4200593597319929477L;


    /**
     * 查询用户角色
     *
     * @param userName 用户名称
     * @return 所属角色
     */
    public Role findByUsername(String userName) {
        return findFirst(SqlKit.sql("sys.role.findByUsername"), userName);
    }

    public boolean setPermission(List<String> permission) {
        final int roleId = this.getInt(StringPool.PK_COLUMN);
        final int update = Db.update(SqlKit.sql("sys.resources.deleteByRole"), roleId);
        if (update >= 0) {
            String sql = SqlKit.sql("sys.role.permission");
            Object[][] params = new Object[permission.size()][2];
            for (int i = 0; i < permission.size(); i++) {
                String s = permission.get(i);
                Object[] permissionParam = new Object[2];
                permissionParam[0] = roleId;
                permissionParam[1] = s;
                params[i] = permissionParam;
            }
            try {
                Db.batch(sql, params, 120);
                return true;
            } catch (Exception e) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * 获得所有属于该角色的用户的id
     */
    public List<Integer> getUseridByRoleId(int roleid) {
        List<User> users = User.dao.find(SqlKit.sql("sys.role.findusersidbyroleid"), roleid);
        List<Integer> uids = Lists.newArrayList();
        for (User user : users) {
            uids.add(user.getNumber("id").intValue());
        }
        return uids;
    }

    /**
     * 根据角色的id获得所有属于该角色的用户
     */
    public List<Integer> getAllUserListByRoreId(int roleId) {
        return Db.query(SqlKit.sql("sys.role.userlistbyroleid"), roleId);
    }

    /**
     * 通过用户id获取权限名称
     */
    public String findRoleNameByUserId(int userId) {
        return findFirst(SqlKit.sql("roleuser.findRoleNameByUserId"), userId).getStr("code");
    }

    /**
     * 通过code 查询用户id
     */
    public Role findByCode(String code) {
        return findFirst(SqlKit.sql("roleuser.findByCode"), code);
    }


}