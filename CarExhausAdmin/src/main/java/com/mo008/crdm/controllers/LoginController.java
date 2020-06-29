/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers;

import com.mo008.crdm.models.sys.User;

import goja.core.StringPool;
import goja.core.encry.EncodeKit;
import goja.mvc.Controller;
import goja.rapid.mvc.kits.Requests;
import goja.security.shiro.AppUser;
import goja.security.shiro.LoginActionKit;
import goja.security.shiro.Securitys;
import com.jfinal.aop.Before;
import com.jfinal.ext.interceptor.Restful;
import com.jfinal.render.CaptchaRender;
import com.mo008.interceptors.AppSettingInterceptor;

import com.google.common.base.Strings;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * <p> The url login Controller. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@Before(Restful.class)
public class LoginController extends Controller {
    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);


    /**
     * The index route. the url /login the view in index.ftl
     */
    @Before(AppSettingInterceptor.class)
    public void index() {
        if (Securitys.isLogin()) {
            removeCookie("login.error");
            redirect("/");
            return;
        }
        int error = getParaToInt("error", 0);
        if (error == 0) {
            removeCookie("login.error");
        }
        String name = getPara("username", StringPool.EMPTY);
        setAttr("username", name);
        render("../login.ftl");
    }


    public void save() {

        final String captcha = getPara("captcha");
        String username = getPara(FormAuthenticationFilter.DEFAULT_USERNAME_PARAM);
        if (Strings.isNullOrEmpty(captcha)) {
            setCookie("login.error", EncodeKit.urlEncode("请输入验证码!"), 5 * 60);
            redirect("/login?error=1&username=" + username);
            return;
        }
        final boolean isValid = CaptchaRender.validate(this, captcha);
        if (!isValid) {
            setCookie("login.error", EncodeKit.urlEncode("验证码输入错误!"), 5 * 60);
            redirect("/login?error=1&username=" + username);
            return;
        }

        String password = getPara(FormAuthenticationFilter.DEFAULT_PASSWORD_PARAM);
        if (Strings.isNullOrEmpty(username) || Strings.isNullOrEmpty(password)) {
            setCookie("login.error", EncodeKit.urlEncode("请输入用户名称或者密码!"), 5 * 60);
            redirect("/login?error=1&username=" + username);
            return;
        }
        try {
            LoginActionKit.login(username, password, false);
        } catch (UnknownAccountException e) {
            logger.error("用户不存在！", e);
            setCookie("login.error", EncodeKit.urlEncode("用户不存在"), 5 * 60);
            redirect("/login?error=3&username=" + username);
            return;
        } catch (AuthenticationException e) {
            logger.error("用户名或者密码错误！", e);
            setCookie("login.error", EncodeKit.urlEncode("用户名或者密码错误"), 5 * 60);
            redirect("/login?error=2&username=" + username);
            return;
        }

        // login success.
        AppUser appUser = Securitys.getLogin();
        User loginSucc = new User();
        loginSucc.set(StringPool.PK_COLUMN, appUser.getId());
        loginSucc.set("last_login_time", DateTime.now().toDate());
        loginSucc.set("last_login_ip", Requests.remoteIP(getRequest()));
        loginSucc.update();

        redirect("/");

    }
}