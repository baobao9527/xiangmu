<@override name="view_title">车辆管理</@override>
<@override name="view_body">

<div id="toolbar" class="page_toolbar">
    <div class="searchArea ">
        车牌号:
        <input id="car_code" style="width: 80px;" type="text" class="txt01"/>
        车辆标识:
        <input type="text" style="width: 80px;" class="txt01" id="s_car_flag"/>
        车牌颜色:
        <input type="text" style="width: 80px;" class="txt01 " id="s_car_no_color"/>
        区域:
        <input type="text" style="width: 80px;" class="txt01 " id="s_province"/>
        <input type="text" style="width: 80px;" class="txt01 " id="s_city"
               data-options="valueField: 'id',textField: 'text',data:[{id:0,text:'请选择'}]"/>
        <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
           icon="icon-search" title="查询">查询
        </a>
    </div>
    <div class="toolbar_row">
        <a id="a_refresh" class="easyui-linkbutton" style="float:left;" plain="true"
           href="#"
           icon="icon-reload" title="重新加载">刷新
        </a>
        <div class='datagrid-btn-separator'></div>
        <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="#"
           icon="icon-add" title="新增汽车数据数据">新增
        </a>
        <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="#"
           icon="icon-pencil" title="编辑选中的汽车数据">编辑
        </a>
        <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true"
           href="#"
           icon="icon-delete3" title="删除选中的汽车数据">删除
        </a>
    <@shiro.hasPermission name="btn.car.invalid">
        <div class='datagrid-btn-separator'></div>
        <a id="a_add_invalid" class="easyui-linkbutton" style="float:left" plain="true"
           href="#"
           icon="icon-hourglass_add" title="失效数据管理">失效数据管理
        </a>
    </@shiro.hasPermission>
            <@shiro.hasPermission name="btn.car.terminal">
            <a id="a_add_terminal" class="easyui-linkbutton" style="float:left" plain="true"
               href="#"
               icon="icon-application_form_add" title="终端管理">终端管理
            </a>
            </@shiro.hasPermission>

    <@shiro.hasPermission name="btn.car.lookuser">
        <a id="a_agent_set" class="easyui-linkbutton" style="float:left" plain="true"
           href="#"
           icon="icon-application_form_add" title="设置查看用户">设置查看用户
        </a>

    </@shiro.hasPermission>
    </div>
</div>
<table id="list"></table>
</@override>

<@override name="view_scripts">
<script type="text/javascript">
    g.userType = ${userType!'0'};
    g.userId = ${(loginUser.id)!'0'};
    g.userName = '${(loginUser.username)!'0'}';
</script>
<script type="text/javascript"
        src="${ctx}/static/js/app/car/car.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>