/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers;

import goja.mvc.Controller;
import com.jfinal.render.CaptchaRender;

/**
 * <p>
 * The url  Controller.
 * </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
public class CaptchaController extends Controller {

    /**
     * The index route.
     * the url /captcha
     * the view in index.ftl
     */
    public void index() {
        final CaptchaRender captchaBuilder = new CaptchaRender();
        render(captchaBuilder);
    }
}