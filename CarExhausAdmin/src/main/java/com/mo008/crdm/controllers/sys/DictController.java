/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;


import com.mo008.crdm.models.sys.Dict;

import goja.core.StringPool;
import goja.core.db.Dao;
import goja.mvc.Controller;
import goja.rapid.mvc.easyui.EuiDataGrid;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.mo008.dtos.easyui.MenuDto;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class DictController extends Controller {

    public void index() {
    }

    public void list() {
        int pid = getParaToInt("pid",0);

        if(pid==0){
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
        }else{
            List<Object> params = Lists.newArrayList();
            params.add(pid);
            renderEasyUIDataGrid("sys.dict",params);
        }

    }

    public void findCategory(){
        String code = getPara("code");

        if(StringUtils.isBlank(code)){
            renderJson("");
        }else{
            renderJson(Dict.dao.findByCategory(code));
        }
    }


    public void save() {

        final Dict dict = getModel(Dict.class);

        final boolean runStatus;
        if (Dao.isNew(dict)) {
            runStatus = dict.save();
            if (runStatus) {
                dict.set("enabled",1);
            }
        } else {
            runStatus =  dict.update();
        }
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("保存失败");
        }
    }
    public void del() {
        final String[] ids = getParaValues("id[]");
        boolean isOk =
                Db.tx(new IAtom() {
                    @Override
                    public boolean run() throws SQLException {
                        for (String id : ids) {
                            List<Dict> dicts = Dict.dao.findByParent(Integer.parseInt(id));
                            if(dicts!=null&&dicts.size()>0){
                                return false;
                            }
                            if (!Dict.dao.deleteById(id)) {
                                return false;
                            }
                        }
                        return true;
                    }

                });
        if(isOk ){
            renderAjaxSuccess();
        }else{
            renderAjaxFailure();
        }
    }
    public void show() {
        int id = getParaToInt("id");
        final Dict dict = Dict.dao.findById(id);
        Map<String, Object> datas = Maps.newHashMap();
        datas.put("dict", dict);
        renderAjaxSuccess(datas);
    }

    public void audit() {
        int id = getParaToInt("id");
        final Dict dict = Dict.dao.findById(id);
        if(dict.getBoolean("enabled")){
            dict.set("enabled",0);
        }else{
            dict.set("enabled",1);
        }

        if (dict.update()) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("保存失败");
        }
    }

    /**
     * 字典树
     */
    public void tree(){

        final List<Dict> dicts = Dict.dao.findAll();
        MenuDto mainMenu =
                new MenuDto("0", "系统字典", StringPool.EMPTY, "icon-application_view_list", "系统字典", "open");
        List<MenuDto> menuDtos = Dict.convertTree(dicts);
        mainMenu.addAllChildren(menuDtos);
        renderJson(Lists.newArrayList(mainMenu));
    }


    /**
     * 获取所有的字典分类
     */
    public void parentlist(){
        List<Dict> dicts = Dict.dao.findParent();
        Dict dict = new Dict();
        dict.set("name","请选择").set("id",0).set("parent",0);
        dicts.add(0,dict);
        renderJson(dicts);
    }

    public void item(){
        setAttr("code", RandomStringUtils.randomAlphabetic(6).toUpperCase());
    }

}
