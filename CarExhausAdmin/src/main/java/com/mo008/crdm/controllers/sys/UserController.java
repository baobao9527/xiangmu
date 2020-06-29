/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;

import com.mo008.crdm.models.sys.User;

import goja.core.Func;
import goja.core.StringPool;
import goja.core.db.Dao;
import goja.core.encry.DigestsKit;
import goja.core.encry.EncodeKit;
import goja.core.sqlinxml.SqlKit;
import goja.mvc.Controller;
import goja.security.shiro.Securitys;
import com.jfinal.plugin.activerecord.Db;

import com.google.common.base.Optional;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Map;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class UserController extends Controller {

    public void index() {
    }
    /**
     * 禁用状态的切换
     */
    public void changeStatus() {
        String id = getPara("id", null);
        final User user = User.dao.findById(id);
        int ss = user.get("status", 0);
        if (ss == 1) {
            user.set("status", 2);
        } else {
            user.set("status", 1);
        }

        if (user.update()) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("保存失败");
        }
    }

    public void list() {
        renderEasyUIDataGrid("sys.user");
    }


    /**
     * 系统所有的代理商
     */
    public void agents() {
        List<Object> params = Lists.newArrayList();
        params.add(User.Type.AGENTS);
        renderEasyUIDataGrid("sys.user.agents", params);
    }
    /**
     * 修改与新增用户
     */
    public void save() {

        final User user = getModel(User.class);
        final boolean runStatus;
        if (Dao.isNew(user)) {

            user.setCreateTime(DateTime.now().toDate());
            String password = user.getPassword();
            user.setStatus(1); // 1 正常

            if (!Strings.isNullOrEmpty(password)) {
                byte[] salt = DigestsKit.generateSalt(EncodeKit.SALT_SIZE);
                user.setSalt(EncodeKit.encodeHex(salt));
                byte[] hashPassword = DigestsKit.sha1(password.getBytes(), salt, EncodeKit.HASH_INTERATIONS);
                user.setPassword(EncodeKit.encodeHex(hashPassword));
            } else {
                renderAjaxFailure("请输入用户密码");
                return;
            }

            runStatus = user.save();
        } else {
            runStatus = user.update();
        }

        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("保存失败");
        }
    }


    /**
     * 删除用户
     */
    public void del() {
        final String[] ids = getParaValues("id[]");
        boolean runStatus = Dao.deleteByIds(ids, User.class);
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("删除数据失败");
        }
    }

    /**
     * 显示修改数据
     */
    public void show() {
        int id = getParaToInt("id");
        final User user = User.dao.findById(id);
        user.set("password", null);

        Map<String, Object> datas = Maps.newHashMap();
        datas.put("user", user);

        renderAjaxSuccess(datas);
    }

    /**
     * 设置密码
     */
    public void updatepass() {

        boolean runStatus = false;
        String password = getPara("password");
        String renewPwd = getPara("confirmpassword");
        if (Strings.isNullOrEmpty(password)) {
            renderAjaxFailure("请输入新密码!");
            return;
        }

        if (!StringUtils.equals(password, renewPwd)) {
            renderAjaxFailure("请确认两次密码输入正确");
            return;
        }

        int uid = getParaToInt("user.id");
        User user = User.dao.findById(uid);

        if(user != null){
            byte[] salt = DigestsKit.generateSalt(EncodeKit.SALT_SIZE);
            user.setSalt(EncodeKit.encodeHex(salt));
            byte[] hashPassword = DigestsKit.sha1(password.getBytes(), salt, EncodeKit.HASH_INTERATIONS);
            user.setPassword(EncodeKit.encodeHex(hashPassword));
            runStatus = user.update();
        }


        if (runStatus) {
            renderAjaxSuccess(1);
        } else {
            renderAjaxFailure("更改失败");
        }
    }

    /**
     * 显示用户名字
     */
    public void getusername() {
        int id = Securitys.getLogin().getId();
        User user = User.dao.findById(id);
        Map<String, Object> datas = Maps.newHashMap();
        datas.put("user", user);
        renderJson(datas);
    }

    /**
     * 根据用户的id设置禁启用该用户
     */
    public void setUseUser() {
        String userid = getPara("id");
        User user = User.dao.findById(userid);

        int status = user.getNumber("status").intValue();
        if (status == 0) {
            user.set("status", 1);
        } else {
            user.set("status", 0);
        }
        boolean flag = user.update();

        if (flag) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("设置用户失败");
        }
    }

    public void permissions() {
        int userId = getParaToInt("userid", 0);
        if (userId > 0) {
            List<String> permissions = Db.query(SqlKit.sql("sys.resources.findByUserId"), userId);
            renderText(Func.COMMA_JOINER.join(permissions));
        } else {
            renderText(StringPool.EMPTY);
        }
    }

    public void userPermissionSave() {
        int userid = getParaToInt("userid", 0);
        String resourceIds = getPara("grantIds");
        if (userid > 0 && !Strings.isNullOrEmpty(resourceIds)) {
            final List<String> resourceIDList = Func.COMMA_SPLITTER.splitToList(resourceIds);
            // todo
        } else {
            renderAjaxFailure();
        }
    }



    /**
     * 检查用户名是否已经被使用
     */
    public void usernameExists() {
        final int userId = getParaToInt(0, 0);

        String userName = getPara("checkstr");

        if (Strings.isNullOrEmpty(userName)) {
            renderAjaxFailure();
        } else {
            final Optional<User> userOpt = User.dao.findByUserName(userName, userId);
            if (userOpt.isPresent()) {
                renderAjaxFailure();
            } else {
                renderAjaxSuccess();
            }
        }
    }


}
