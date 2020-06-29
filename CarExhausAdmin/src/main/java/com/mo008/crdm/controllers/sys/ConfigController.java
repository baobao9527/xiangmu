/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;


import com.mo008.crdm.AppStartup;
import com.mo008.dtos.SysSettingDto;

import goja.mvc.Controller;
import com.jfinal.aop.Before;
import com.jfinal.ext.interceptor.Restful;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
@Before(Restful.class)
public class ConfigController extends Controller {

    private static final String DEFAULT_SYS_CONFIG =
            "var sys_config ={\"theme\":{\"title\":\"默认皮肤\",\"name\":\"default\",\"selected\":true},\"gridRows\":20,\"navType\":\"Accordion\"}";

    public void index() {

        SysSettingDto sysSettingDto = AppStartup.sysSettingDto;
        if (sysSettingDto == null) {
            renderJavascript(DEFAULT_SYS_CONFIG);
        } else {
            renderJavascript(
                    "var sys_config ={\"theme\":{\"title\":\"默认皮肤\",\"name\":\""
                            + sysSettingDto.getTheme()
                            + "\",\"selected\":true},\"gridRows\":20,\"navType\":\""
                            + sysSettingDto.getMenu()
                            + "\"}");
        }
    }
}
