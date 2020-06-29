<@override name="view_title">角色管理</@override>
<@override name="view_body">
<div class="clearfix toolbar_row" id="toolbar">
    <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-reload" title="重新加载">刷新
    </a>
    <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-add" title="新增角色">新增
    </a>
    <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-pencil" title="修改选中的角色">修改
    </a>
    <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-delete3" title="删除选中的角色">删除
    </a>
    <div class='datagrid-btn-separator'></div>
    <a id="a_setrolemodulepermission" class="easyui-linkbutton" style="float:left" plain="true"
       href="javascript:;" icon="icon-group_key" title="设置角色的模块（菜单）访问权限">角色资源权限</a>

    <div class='datagrid-btn-separator'></div>
    <a id="a_roleSet" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-user_edit" title="角色用户设置">角色用户设置
    </a>
</div>

<table id="list"></table>
<div id="win"></div>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/role.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>