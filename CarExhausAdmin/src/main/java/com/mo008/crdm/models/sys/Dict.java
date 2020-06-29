/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;


import com.google.common.collect.Lists;

import com.mo008.crdm.models.sys.base.BaseDict;
import com.mo008.dtos.easyui.MenuDto;
import com.xiaoleilu.hutool.util.CollectionUtil;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import goja.core.StringPool;
import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

import static java.util.stream.Collectors.groupingBy;

/**
 * <p> The database mo_dict Model. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_dict")
public class Dict extends BaseDict<Dict> {

    /**
     * 支付方式
     */
    public static final String PAY_TYPE      = "pay_type";
    /**
     * 服务级别
     */
    public static final String SERVICE_LEVEL = "service_level";

    /**
     * The public dao.
     */
    public static final  Dict dao              = new Dict();
    private static final long serialVersionUID = -7562895054701087408L;

    public static List<MenuDto> convertTree(List<Dict> dicts) {
        if (CollectionUtil.isEmpty(dicts)) {
            return Collections.emptyList();
        }


        final Map<Integer, List<Dict>> menuGroup = dicts.stream().collect(groupingBy(BaseDict::getParent));

        List<MenuDto> menuDtos = Lists.newArrayList();
        for (Dict dict : dicts) {

            if (dict.getParent() == 0) {
                // 第一级别
                final Integer dbId = dict.getId();
                final String id = String.valueOf(dbId);
                final String dictName = dict.getName();
                MenuDto menuDto = new MenuDto<>(id, dictName, StringPool.EMPTY, "icon-application_view_columns", dictName, "closed", dict);
                List<Dict> children = menuGroup.get(dbId);
                if (CollectionUtil.isNotEmpty(children)) {
                    doTree(menuDto, menuGroup, children);
                } else {
                    menuDto.setState("open");
                }
                menuDtos.add(menuDto);
            }
        }
        return menuDtos;
    }

    public List<Dict> findByCategory(String category) {
        return find(SqlKit.sql("sys.dict.findByCategory"), category);
    }

    public Dict findByCategoryAndCode(String category, String code) {
        return findFirst(SqlKit.sql("sys.dict.findByCategoryAndCode"), category, code);
    }

    public List<Dict> findAll() {
        return findByCache("sys", "dicts", SqlKit.sql("sys.dict.findAll"));
    }

    /**
     * 找到所有的分类
     *
     * @return 分类list
     */
    public List<Dict> findParent() {
        return find(SqlKit.sql("sys.dict.findparent"));
    }

    /**
     * 通过父找到子集合
     */
    public List<Dict> findByParent(int pid) {
        return find(SqlKit.sql("sys.dict.findbyparent"), pid);
    }

    /**
     * 通过父code找到子集合
     */
    public List<Dict> findByParentCode(String pcode) {
        return find(SqlKit.sql("sys.dict.findByParentCode"), pcode);
    }

    /**
     * 组装字典项
     *
     * @return
     */
    public Map<String, Map<String, String>> findDicts() {
        Map<String, Map<String, String>> maps = new HashMap<String, Map<String, String>>();
        List<Dict> list = find("select * from mo_dict");
        for (Dict dict : list) {
            if (dict.getParent() == 0) {
                String group = dict.getCode();
                Map<String, String> item = new HashMap<String, String>();
                for (Dict sub : list) {
                    if (Objects.equals(sub.getParent(), dict.getId())) {
                        item.put(sub.getCode(), sub.getName());
                    }
                }
                maps.put(group, item);
            }
        }

        return maps;

    }

    private static void doTree(final MenuDto menuDto, Map<Integer, List<Dict>> menuGroup,
                               Collection<Dict> children) {
        for (Dict child : children) {
            final Integer dbId = child.getId();
            final String id = String.valueOf(dbId);
            final String dictName = child.getName();
            final MenuDto<Dict> childrenMenu = new MenuDto<>(id, dictName, StringPool.EMPTY, "icon-application_view_columns", dictName, "open", child);
            menuDto.addChildren(childrenMenu);
            final List<Dict> dicts = menuGroup.get(dbId);
            if (CollectionUtil.isNotEmpty(dicts)) {
                doTree(childrenMenu, menuGroup, dicts);
            }
        }
    }
}