<@override name="view_title">设备终端列表</@override>
<@override name="view_body">
    <div id="toolbar" class="page_toolbar">
        <div class="toolbar_row">
            <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-reload" title="重新加载">刷新
            </a>

            <div class='datagrid-btn-separator'></div>


            <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-delete3" title="删除">删除
            </a>

        </div>
    </div>

    <table id="list"></table>
    <div id="win"></div>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/device/home.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>