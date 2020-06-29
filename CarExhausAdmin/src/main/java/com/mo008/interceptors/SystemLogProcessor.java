/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.interceptors;

import com.jfinal.core.Controller;
import com.mo008.crdm.models.sys.SecurityLog;
import com.mo008.services.UserService;
import com.xiaoleilu.hutool.util.CollectionUtil;

import org.apache.commons.lang3.StringUtils;

import java.util.Map;
import java.util.Set;

import goja.core.StringPool;
import goja.rapid.mvc.interceptor.syslog.LogProcessor;
import goja.rapid.mvc.interceptor.syslog.SysLog;
import goja.security.shiro.AppUser;
import goja.security.shiro.Securitys;

/**
 * <p> . </p>
 *
 * @author walter yang
 * @version 1.0 2013-12-12 3:45
 * @since JDK 1.5
 */
public class SystemLogProcessor implements LogProcessor {
    @Override
    public void process(SysLog sysLog) {

        SecurityLog operLog = new SecurityLog();
        operLog.setOprContent("内容:" + sysLog.getMessage());
        operLog.setUser(UserService.getInstance().userId());
        operLog.setUsername(sysLog.getUser());
        operLog.setLoginIp(sysLog.getIp());
        operLog.setCreateTime(sysLog.getCreateTime());
        operLog.save();
    }

    @Override
    public String getUsername(Controller c) {
        AppUser user = Securitys.getLogin();
        if (user != null) {
            return user.name;
        }
        return null;
    }

    @Override
    public String formatMessage(String title, Map<String, String> params) {
        if (StringUtils.isEmpty(title)) {
            return StringPool.EMPTY;
        }
        if (CollectionUtil.isEmpty(params)) {
            return title;
        }

        String result = title;
        Set<Map.Entry<String, String>> entrySet = params.entrySet();
        for (Map.Entry<String, String> entry : entrySet) {
            String key = entry.getKey();
            String value = entry.getValue();
            result = StringUtils.replace(result, StringPool.LEFT_BRACE + key + StringPool.RIGHT_BRACE, value);
        }
        return result;
    }
}
