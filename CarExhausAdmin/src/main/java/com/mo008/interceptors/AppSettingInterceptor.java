package com.mo008.interceptors;

import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.mo008.crdm.AppStartup;
import com.mo008.dtos.SysSettingDto;

/**
 * <p> </p>
 *
 * <p> Created At 2018-02-03 19:34  </p>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.8
 */
public class AppSettingInterceptor implements com.jfinal.aop.Interceptor {
    @Override
    public void intercept(Invocation inv) {

        inv.invoke();

        final Controller invController = inv.getController();
        final SysSettingDto sysSettingDto = AppStartup.sysSettingDto;
        invController.setAttr("sysconfig", sysSettingDto);
    }
}
