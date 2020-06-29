/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers;

import com.mo008.crdm.models.sys.Area;
import com.mo008.crdm.models.sys.Dict;
import com.mo008.services.DeviceDataExcelParse;

import goja.core.StringPool;
import goja.mvc.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.ehcache.CacheKit;
import com.jfinal.upload.UploadFile;

import com.google.common.base.Function;
import com.google.common.base.MoreObjects;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimaps;

import java.io.File;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;


/**
 * <p> The url common Controller. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
public class CommonController extends Controller {

    /**
     * The index route. the url /common the view in index.ftl
     */
    public void index() {
    }


    public void dict() {
        final String category = getPara("category");
        if (!Strings.isNullOrEmpty(category)) {
            List<Dict> dicts = Dict.dao.findByCategory(category);
            renderJson(dicts);
        } else {
            renderJson(Collections.EMPTY_LIST);
        }
    }

    public void provice() {
        Area area = new Area();
        area.put("sn", "");
        area.put("name", "全部");
        List<Area> areas = Area.dao.findByLevel(1);
        areas.add(0, area);
        renderJson(areas);
    }

    public void area() {
        String sn = getPara("sn");
        if (!Strings.isNullOrEmpty(sn)) {
            renderJson(Area.dao.findByparentSn(sn));
        }
    }


    public void data(){
        final UploadFile uploadFile = getFile();
        if(uploadFile != null){
            File file = uploadFile.getFile();
            DeviceDataExcelParse.importDataByExcel(file);
        }
        renderText("ok");
    }


    public void dictjs() {

        String dictJson = CacheKit.get("jsdicts", "jsdicts");
        if (Strings.isNullOrEmpty(dictJson)) {

            final List<Dict> dicts = Dict.dao.findAll();
            if (dicts == null || dicts.isEmpty()) {
                renderJavascript("var __dicts=[]");
                return;
            }
            final ImmutableListMultimap<Integer, Dict> parent = Multimaps.index(dicts, new Function<Dict, Integer>() {
                @Override
                public Integer apply(Dict input) {
                    return MoreObjects.firstNonNull(input.getInt("parent"), 0);
                }
            });
            final ImmutableMap<Integer, Collection<Dict>> integerCollectionImmutableMap = parent.asMap();

            final Collection<Dict> parentDicts = integerCollectionImmutableMap.get(0);
            final Map<Integer, String> parentCode = Maps.newHashMap();
            for (Dict parentDict : parentDicts) {
                parentCode.put(parentDict.getInt(StringPool.PK_COLUMN), parentDict.getStr("code"));
            }

            Map<String, Collection<Dict>> jsDicts = Maps.newHashMap();
            for (Integer parentId : integerCollectionImmutableMap.keySet()) {
                if (parentId == 0) {
                    continue;
                }
                Collection<Dict> dictCollection = integerCollectionImmutableMap.get(parentId);
                final List<Dict> dictArrays = Lists.newArrayList(new Dict().set("code", "").set("name", "请选择..."));
                dictArrays.addAll(dictCollection);
                String code = parentCode.get(parentId);
                jsDicts.put(code, dictArrays);
            }

            dictJson = JsonKit.toJson(jsDicts);
            CacheKit.put("jsdicts", "jsdicts", dictJson);
        }
        renderJavascript("var __dicts=" + dictJson);
    }
}