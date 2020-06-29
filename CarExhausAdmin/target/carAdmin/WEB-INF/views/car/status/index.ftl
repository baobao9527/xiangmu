<@override name="view_title">车辆历史状态查询</@override>
<@override name="view_body">
<div id="toolbar" class="page_toolbar">
    <div class="searchArea ">
        车牌号:
        <input name="name" id="car_code" style="" type="text" class="txt01"/>
        日期:
        <input name="s_start_date" id="s_start_date" style="width: 100px;" type="text" class="txt01"/>
        -
        <input name="s_end_date" id="s_end_date" style="width: 100px;" type="text" class="txt01"/>
        <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton" icon="icon-search"
           title="查询">查询
        </a>
    </div>
    <div class="toolbar_row">
        <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true"
           href="javascript:;"
           icon="icon-reload" title="重新加载">刷新
        </a>

        <div class='datagrid-btn-separator'></div>
    </div>
</div>

<table id="list"></table>
<div id="win"></div>

</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/car/status.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>