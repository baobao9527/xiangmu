package com.mo008.dtos.easyui;

import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

/**
 * <p> </p>
 *
 * @author fmgu
 * @version 1.0
 * @since jdk1.8
 */
public class TreeDto<E> implements Serializable{
    private static final long serialVersionUID = 4084026286954076249L;

    private String id;
    private String parent;
    private String text;
    private String state;
    private String iconCls;
    private List<TreeDto> children= Lists.newArrayList();
    private E attributes;

    public TreeDto(String id, String text, String parent,String iconCls,String state) {
        this.id = id;
        this.text = text;
        this.parent=parent;
        this.state = state;
        this.iconCls=iconCls;
        this.attributes = null;
    }

    public TreeDto(String id,String text,String parent,String iconCls,String state,E attributes){
        this.id=id;
        this.text=text;
        this.parent=parent;
        this.iconCls=iconCls;
        this.state=state;
        this.attributes=attributes;
    }

    public String getIconCls() {
        return iconCls;
    }
    public String getId() {
        return id;
    }

    public String getParent() {
        return parent;
    }

    public String getText() {
        return text;
    }

    public String getState() {
        return state;
    }

    public E getAttributes() {
        return attributes;
    }


    public List<TreeDto> getChildren() {
        return children;
    }

    public void addChildren(TreeDto treeDto) {
        children.add(treeDto);
    }

    public void addAllChildren(List<TreeDto> treeDto) {
        children.addAll(treeDto);
    }
}
