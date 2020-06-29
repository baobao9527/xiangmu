<@override name="view_title">公告管理</@override>
<@override name="view_body">
<div id="toolbar" class="page_toolbar">
    <div class="toolbar_row">
        <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true"
           href="javascript:;"
           icon="icon-reload" title="重新加载">刷新
        </a>

        <div class='datagrid-btn-separator'></div>

        <@shiro.hasPermission name="notice.add"><a id="a_add" class="easyui-linkbutton"
                                                  style="float:left" plain="true"
                                                  href="javascript:;"
                                                  icon="icon-add" title="新增公告">新增
        </a></@shiro.hasPermission>

        <@shiro.hasPermission name="notice.edit"><a id="a_edit" class="easyui-linkbutton"
                                                  style="float:left" plain="true"
                                                  href="javascript:;"
                                                  icon="icon-pencil" title="编辑选中的公告">编辑
        </a></@shiro.hasPermission>
        <@shiro.hasPermission name="notice.look"><a id="a_look" class="easyui-linkbutton"
                                                 style="float:left" plain="true"
                                                 href="javascript:;"
                                                 icon="icon-zoom" title="查看选中的公告">查看
        </a></@shiro.hasPermission>
        <@shiro.hasPermission name="notice.del"><a id="a_delete" class="easyui-linkbutton"
                                                  style="float:left" plain="true"
                                                  href="javascript:;"
                                                  icon="icon-delete3" title="删除选中的公告">删除
        </a></@shiro.hasPermission>
    </div>
</div>

<table id="list"></table>
<div id="win"></div>

</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/info/notice.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>