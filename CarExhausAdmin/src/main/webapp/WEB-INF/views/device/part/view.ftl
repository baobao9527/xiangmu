<@override name="view_title">查看申请</@override>
<@override name="view_body">

<table class="grid">
    <tr>
        <td class="dark">申请编号</td>
        <td>
        ${(authbatch.code)!}
        </td>
        <td class="dark">申请人</td>
        <td>
        ${(authbatch.operator_name)!}
        </td>
    </tr>
    <tr>
        <td class="dark">申请数量</td>
        <td>
        ${(authbatch.devices)!}
        </td>
        <td class="dark">申请状态</td>
        <td>
            <#if authbatch.status==1>已创建
            <#elseif authbatch.status==2 >已生成
            <#else> 未知
            </#if>
        </td>
    </tr>
    <tr>
        <td class="dark">申请时间</td>
        <td colspan="3">
        ${(authbatch.dateline)!?string('yyyy-MM-dd HH:mm')}
        </td>
    </tr>
</table>

<div class="easyui-panel" title="设备信息" style="height:283px;"
     data-options="style:{marginTop: 10}" id="device_panel">
    <div id="deviceToolbar" class="clearfix toolbar_row">

        <a id="export_btn" class="easyui-linkbutton" style="float:left" plain="true"
           href="javascript:void(0);" icon="icon-application_double" title="导出设备到Excel">导出设备到Excel</a>
    </div>
    <table id="deviceGrid" toolbar="#deviceToolbar"></table>
</div>
</@override>

<@override name="view_scripts">
<script type="text/javascript">
    g.view_id = '${(authbatch.id)!'0'}'
</script>
</@override>
<@extends name="/base/main_view.ftl"></@extends>