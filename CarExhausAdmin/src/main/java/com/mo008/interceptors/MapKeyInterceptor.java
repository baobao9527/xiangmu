package com.mo008.interceptors;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.mo008.Constants;
import com.mo008.crdm.AppStartup;
import com.mo008.dtos.SysSettingDto;

import org.apache.commons.lang3.StringUtils;

/**
 * <p> </p>
 *
 * <p> Created At 2018-02-03 20:50  </p>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.8
 */
public class MapKeyInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {

        inv.invoke();

        final Controller invController = inv.getController();
        final SysSettingDto sysSettingDto = AppStartup.sysSettingDto;
        String key;
        if (sysSettingDto == null) {
            key = Constants.DEFAULT_MAP_KEY;
        } else {
            key = sysSettingDto.getMapKey();
            if (StringUtils.isEmpty(key)) {
                key = Constants.DEFAULT_MAP_KEY;
            }
        }
        invController.setAttr("mapkey", key);
    }
}
