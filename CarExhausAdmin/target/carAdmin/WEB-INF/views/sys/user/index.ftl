<@override name="view_title">用户中心</@override>


<@override name="view_body">

<div id="toolbar" class="clearfix toolbar_row">
    <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-reload" title="重新加载">刷新</a>
    <div class='datagrid-btn-separator'></div>

    <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-user_add" title="添加用户">添加</a>

    <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-user_edit" title="修改用户">修改</a>

    <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-user_delete" title="删除用户">删除</a>

    <div class='datagrid-btn-separator'></div>

    <a id="a_setpass" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-user_key" title="设置选中用户密码">设置密码</a>


    <div class='datagrid-btn-separator'></div>
    用户类型:
    <input  id="s_user_type" style="width: 80px;"  type="text" class="txt01"/>

</div>
<table id="list"></table>
<div id="win"></div>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/user.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>