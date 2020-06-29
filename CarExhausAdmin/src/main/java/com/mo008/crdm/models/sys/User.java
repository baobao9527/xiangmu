/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;


import com.mo008.crdm.models.sys.base.BaseUser;

import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;

import java.util.List;

/**
 * <p> 用户模型. </p>
 *
 * @author sagyf yang
 * @version 1.0 2014-06-03 22:00
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_user")
public class User extends BaseUser<User> {

    /**
     * The public dao.
     */
    public static final User dao = new User();

    private static final long serialVersionUID = -8819350365727558809L;

    public User findByName(String username) {
        return findFirst(SqlKit.sql("sys.user.findByName"), username);
    }

    public User findInfoWithUserId(int userId) {
        return findFirst(SqlKit.sql("sys.user.findInfoWithUserId"), userId, userId);
    }


    public Optional<User> findByUserName(String userName, int userId) {
        String sql = SqlKit.sql("sys.user.findByUserName");
        List<Object> params = Lists.newArrayList();
        params.add(userName);
        if (userId > 0) {
            params.add(userId);
            sql = sql + " AND id != ?";
        }

        final User first = findFirst(sql, params.toArray());
        if (first == null) {
            return Optional.absent();
        } else {
            return Optional.of(first);
        }
    }


    public interface Type {
        int ADMIN = 1;

        int NORMAL = 2;

        int AGENTS = 3;
    }
}