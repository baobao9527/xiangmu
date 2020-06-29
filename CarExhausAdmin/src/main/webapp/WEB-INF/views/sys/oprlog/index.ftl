<@override name="view_title">操作历史</@override>
<@override name="view_body">

<div id="toolbar" >

    <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
       icon="icon-reload" title="重新加载">刷新
    </a>

    <div class='datagrid-btn-separator'></div>
    开始日期：<input type="text"  name="log.start_time" class="txt01 easyui-validatebox"
                id="start_time"/>
    结束日期：<input type="text"  name="log.end_time" class="txt01 easyui-validatebox"
                id="end_time"/>

    <a id="a_search" class="easyui-linkbutton" style="" plain="true" href="javascript:;"
       icon="icon-search" title="查询数据">查询</a>

</div>

<table id="list"></table>
<div id="win"></div>



</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/oprlog.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>