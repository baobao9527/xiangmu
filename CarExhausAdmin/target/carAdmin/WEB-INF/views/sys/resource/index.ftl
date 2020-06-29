<@override name="view_title">资源管理</@override>
<@override name="view_body">

<div id="layout">
    <div region="west" iconCls="icon-chart_organisation" split="true" title="导航目录" style="width:220px;padding: 5px" collapsible="false">
        <ul id="moduleTree"></ul>
    </div>
    <div region="center" title="资源（菜单）列表" iconCls="icon-layout" style="padding: 2px; overflow: hidden">
        <div id="toolbar">
            <div class="clearfix toolbar_row">
                <a id="a_refresh" class="easyui-linkbutton" style="float:left"  plain="true" href="javascript:;" icon="icon-reload"  title="重新加载">刷新</a>
                <div class='datagrid-btn-separator'></div>
                <a id="a_add" class="easyui-linkbutton" style="float:left"  plain="true" href="javascript:;" icon="icon-tab_add"   title="新增模块（菜单）">新增</a>
                <a id="a_edit" class="easyui-linkbutton" style="float:left"  plain="true" href="javascript:;" icon="icon-tab_edit"   title="修改选中的模块（菜单）">修改</a>
                <a id="a_delete" class="easyui-linkbutton" style="float:left"  plain="true" href="javascript:;" icon="icon-tab_delete"   title="删除选中的模块（菜单）">删除</a>

            </div>
        </div>
        <table id="moduleGrid"></table>
    </div>
</div>

</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/resource.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>