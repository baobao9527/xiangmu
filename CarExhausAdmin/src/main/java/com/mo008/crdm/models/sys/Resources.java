/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys;

import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;

import com.mo008.crdm.models.sys.base.BaseResources;
import com.mo008.dtos.easyui.MenuDto;

import org.apache.commons.lang3.StringUtils;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

/**
 * <p> The database mo_resources Model. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
@TableBind(tableName = "mo_resources")
public class Resources extends BaseResources<Resources> {

  /**
   * The public dao.
   */
  public static final Resources dao = new Resources();

  private static final long serialVersionUID = 2165176305324430749L;

  /**
   * 菜单组
   */
  public static final String MENU_GROUP = "menu_group";
  /**
   * 菜单
   */
  public static final String MENU = "menu";
  /**
   * 动作组
   */
  public static final String ACTION_GROUP = "action_group";
  /**
   * 动作
   */
  public static final String ACTION = "action";

  /**
   * 查找某个角色的权限资源
   *
   * @param roleId 角色ID
   * @return 权限资源
   */
  public List<Resources> findByRole(int roleId) {
    return find(SqlKit.sql("sys.resources.findByRole"), roleId, true);
  }

  /**
   * 查找某个角色的权限资源
   *
   * @param roleId 角色ID
   * @return 权限资源
   */
  public List<Resources> findMenuByRole(int roleId) {
    return find(SqlKit.sql("sys.resources.findMenuByRole"), roleId, true, MENU_GROUP, MENU);
  }

  /**
   * 查找所有启用的菜单组或者操作组
   *
   * @return 菜单组或者操作组
   */
  public List<Resources> findGroup() {
    return find(SqlKit.sql("sys.resources.findGroup"), ACTION_GROUP, MENU_GROUP, 1);
  }

  public List<Resources> findByEnable() {

    return Resources.dao.find(SqlKit.sql("sys.resources.findByStatus"), 1);
  }

  public List<Resources> findAll() {

    return Resources.dao.find(SqlKit.sql("sys.resources.findAll"));
  }

  public List<MenuDto> parseTreeDto(List<Resources> resources) {

    if (resources == null || resources.isEmpty()) {
      return Collections.emptyList();
    }

    Multimap<Integer, Resources> parentGroup = Multimaps.index(
        resources,  input -> Objects.requireNonNull(input).getInt("parent"));

    List<MenuDto> menuDtos = Lists.newArrayList();
    final Map<Integer, Collection<Resources>> menuGroup = parentGroup.asMap();
    for (Resources resource : resources) {
      final String style = resource.getStr("style");
      if (StringUtils.equals(style, Resources.ACTION_GROUP) || StringUtils.equals(style,
          Resources.ACTION)) {
        continue;
      }

      final long chk = resource.getNumber("chk").longValue();
      if (chk == 0) {
        continue;
      }
      if (resource.getInt("parent") == 0) {
        // 第一级别
        final Integer dbId = resource.getInt("id");
        final String id = String.valueOf(dbId);
        MenuDto menuDto = new MenuDto<>(id, resource.getStr("name"), resource.getStr("path"),
                        resource.getStr("icon"), resource.getStr("show_name"), "closed", resource);
        Collection<Resources> children = menuGroup.get(dbId);
        if (children != null && !children.isEmpty()) {

          doTree(menuDto, menuGroup, children);
        }
        menuDtos.add(menuDto);
      }
    }
    return menuDtos;
  }

  private void doTree(final MenuDto menuDto, Map<Integer, Collection<Resources>> menuGroup,
      Collection<Resources> children) {
    for (Resources child : children) {
      final Integer childrenId = child.getInt("id");
      final MenuDto<Resources> childrenMenu = new MenuDto<Resources>(String.valueOf(childrenId),
          child.getStr("name"), child.getStr("path"),
          child.getStr("icon"), child.getStr("show_name"), "open", child);
      menuDto.addChildren(childrenMenu);
      final Collection<Resources> resources = menuGroup.get(childrenId);
      if (resources != null && !resources.isEmpty()) {
        doTree(childrenMenu, menuGroup, resources);
      }
    }
  }

  public List<Resources> findByParent(String resourceId) {
    return find(SqlKit.sql("sys.resources.findByParent"), resourceId);
  }

  public List<Resources> findByMenu() {
    return find(SqlKit.sql("sys.resources.findByMenu"), MENU_GROUP, MENU, true);
  }

  public List<Resources> findByUser(int user) {
    return Resources.dao.find(SqlKit.sql("sys.resources.findByUser"), user, true);
  }

  /**
   * 根据角色的id号，获得该角色所拥有的资源的id号
   *
   * @param roleid 角色ID
   * @return 该角色所拥有的资源的id号
   */
  public List<Integer> findResourceIdsByRole(int roleid) {
    List<Resources> roleResources =
        find(SqlKit.sql("sys.resources.resourceIdByRoleId"), roleid, true);
    List<Integer> resourceIds = Lists.newArrayList();
    for (Resources resource : roleResources) {
      int resourid = resource.getId();
      resourceIds.add(resourid);
    }
    return resourceIds;
  }

}