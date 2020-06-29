<@override name="view_title">字典维护</@override>
<@override name="view_body">
<div style="padding:2px; margin:0px;">
    <div id="layout" class="easyui-layout">
        <div region="west" iconCls="icon-chart_organisation" split="true" title="字典树" style="width:220px;"
             collapsible="false">
            <div id="dictTree"></div>
        </div>
        <div region="center" title="字典列表" iconCls="icon-list" style="overflow: hidden">
            <div id="toolbar" class="clearfix toolbar_row">
                <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-reload" title="重新加载">刷新</a>

                <div class='datagrid-btn-separator'></div>
                <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-add" title="新增字典信息">新增</a>
                <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-pencil" title="修改选中的字典数据">修改</a>
                <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-delete3" title="删除选中的字典信息">删除</a>
                <a id="a_on_off" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-accept" title="启用选中的字典数据">启用禁用</a>
            </div>
            <table id="datalist" toolbar="#toolbar"></table>
        </div>
    </div>
</div>

</@override>
<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/dict.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>

