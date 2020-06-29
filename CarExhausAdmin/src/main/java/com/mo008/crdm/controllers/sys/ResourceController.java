/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;


import com.mo008.crdm.models.sys.Resources;
import com.mo008.dtos.easyui.MenuDto;

import goja.core.StringPool;
import goja.core.db.Dao;
import goja.mvc.Controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;

/**
 * <p> The url sys/resource Controller. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
public class ResourceController extends Controller {

    /**
     * The index route. the url /sys/resource the view in index.ftl
     */
    public void index() {
    }

    public void navtree() {
        final List<Resources> resources = Resources.dao.findAll();
        MenuDto mainMenu =
                new MenuDto("0", "系统菜单", StringPool.EMPTY, "icon-application_view_list", "系统菜单", "open");
        List<MenuDto> menuDtos = Resources.dao.parseTreeDto(resources);
        mainMenu.addAllChildren(menuDtos);
        renderJson(Lists.newArrayList(mainMenu));
    }

    public void del() {
        final boolean delOK = Resources.dao.deleteById(getPara("id"));
        if (delOK) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }

    public void treegrid() {
        String resourceId = getPara("id");
        List<Resources> childrens = Resources.dao.findByParent(resourceId);
        renderJson(childrens);
    }

    public void show() {
        Resources resources = Resources.dao.findById(getPara("id"));
        Map<String, Resources> resourcesMap = Maps.newHashMap();
        resourcesMap.put("resource", resources);
        renderAjaxSuccess(resourcesMap);
    }

    public void save() {
        Resources resources = getModel(Resources.class, "resource");
        if (Dao.isNew(resources)) {
            if (resources.save()) {
                renderAjaxSuccess();
            } else {
                renderAjaxFailure();
            }
        } else {
            if (resources.update()) {
                renderAjaxSuccess();
            } else {
                renderAjaxFailure();
            }
        }
    }
}