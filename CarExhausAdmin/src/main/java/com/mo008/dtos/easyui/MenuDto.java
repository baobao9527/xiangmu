package com.mo008.dtos.easyui;

import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class MenuDto<E> implements Serializable {
    private static final long serialVersionUID = 4084026286954076248L;
    private final String id;
    private final String text;
    private final String navigateUrl;
    private  String iconCls;
    private final String fullName;
    private  String state;

    private final E attributes;

    private final List<MenuDto> children = Lists.newArrayList();


    public MenuDto(String id, String text, String navigateUrl, String iconCss, String fullName, String state) {
        this.id = id;
        this.text = text;
        this.navigateUrl = navigateUrl;
        this.iconCls = iconCss;
        this.fullName = fullName;
        this.state = state;
        this.attributes = null;
    }

    public MenuDto(String id, String text, String navigateUrl, String iconCss, String fullName, String state, E attributes) {
        this.id = id;
        this.text = text;
        this.navigateUrl = navigateUrl;
        this.iconCls = iconCss;
        this.fullName = fullName;
        this.state = state;
        this.attributes = attributes;
    }

    public void setIconCls(String iconCls) {
        this.iconCls = iconCls;
    }

    public void setState(String state) {
        this.state = state;
    }

    public E getAttributes() {
        return attributes;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public String getNavigateUrl() {
        return navigateUrl;
    }

    public String getIconCls() {
        return iconCls;
    }

    public String getFullName() {
        return fullName;
    }

    public String getState() {
        return state;
    }

    public List<MenuDto> getChildren() {
        return children;
    }

    public void addChildren(MenuDto menuDto) {
        children.add(menuDto);
    }

    public void addAllChildren(List<MenuDto> menuDto) {
        children.addAll(menuDto);
    }
}
