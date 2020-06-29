<@override name="view_title">供应商车辆</@override>
<@override name="view_body">
    <div id="toolbar" class="page_toolbar">
        <div class="toolbar_row">
            <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="#"
               icon="icon-reload" title="重新加载">刷新
            </a>

            <a id="a_import_btn" class="easyui-linkbutton" style="float:left" plain="true" href="#"
               icon="icon-disk_upload" title="导入供应商车辆">导入供应商车辆</a>

            <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true"
               href="#"
               icon="icon-delete3" title="删除供应商">删除
            </a>
        </div>
    </div>

    <table id="list"></table>
    <div id="win"></div>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/supplier.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>