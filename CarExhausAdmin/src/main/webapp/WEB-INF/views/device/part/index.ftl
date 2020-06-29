<@override name="view_title">设备申请</@override>
<@override name="view_body">
    <div id="toolbar" class="page_toolbar">
        <div class="toolbar_row">
            <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-reload" title="重新加载">刷新
            </a>

            <a id="a_import_btn" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-disk_upload" title="导入设备清单">导入申请设备清单</a>

            <div class='datagrid-btn-separator'></div>

            <a id="a_device_view" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-list" title="查看申请设备">查看申请设备</a>
            <a id="a_export_btn" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
               icon="icon-export" title="导出申请单">导出申请单</a>
        </div>
    </div>

    <table id="list"></table>
    <div id="win"></div>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/device/part.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>