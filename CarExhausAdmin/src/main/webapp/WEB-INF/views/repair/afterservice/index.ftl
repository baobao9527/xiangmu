<@override name="view_title">用户中心</@override>
<@override name="view_body">

<div id="toolbar" class="page_toolbar">
    <div class="searchArea ">
        车牌号:
        <input name="s_car_no" id="s_car_no" style="width:100px;"  type="text" class="txt01"/>
        维修地点:
        <input name="s_fix_location" id="s_fix_location" style="width:100px;" type="text" class="txt01"/>
        维修人员:
        <input name="s_fixer" id="s_fixer" style="width:100px;" type="text" class="txt01"/>
        司机所属公司:
        <input name="s_driver_company" id="s_driver_company" style="width:100px;"  type="text" class="txt01"/>
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
        <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
           icon="icon-add" title="新增汽车维修数据">新增
        </a>
        <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
           icon="icon-pencil" title="编辑选中的汽车维修数据">编辑
        </a>
        <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true"
           href="javascript:;"
           icon="icon-delete3" title="删除选中的汽车维修数据">删除
        </a>
        <div class='datagrid-btn-separator'></div>
        <a id="a_ok" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
           icon="icon-add" title="问题已经解决">问题已经解决
        </a>
    </div>
</div>
<table id="list"></table>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/repair/fixrecord.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>