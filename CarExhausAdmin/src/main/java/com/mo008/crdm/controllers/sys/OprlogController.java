/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;

import com.mo008.services.UserService;

import goja.mvc.Controller;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * <p> The url sys/role Controller. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
public class OprlogController extends Controller {

    public void index() {

    }

    public void list() {
        int userid = UserService.getInstance().userId();
        List<Object> list = Lists.newArrayListWithCapacity(1);
        list.add(userid);
        renderEasyUIDataGrid("sys.oprlog", list);
    }

    public void show() {

    }
}