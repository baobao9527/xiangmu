<@override name="view_title">汽车安装类型统计</@override>
<@override name="view_body">

<style>
    .panel-tool-close {
        display: none !important;
    }
</style>
<div class="searchArea ">
    区域:
    <input type="text" style="width:100px;" class="txt01 easyui-combobox" id="s_province"/>
    <input type="text" style="width:100px;" class="txt01 easyui-combobox" id="s_city"
           data-options="valueField: 'id',
        textField: 'text',data:[{
    id:0,
        text:'请选择'
        }]"/>
    <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
       icon="icon-search"
       title="查询">查询
    </a>
    <a id="a_export" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
       icon="icon-export"
       title="导出">导出
    </a>
</div>
<h1 style="text-align: center;">系统工作情况统计</h1>
<div style="padding:2px; margin:0px;">
    <div id="pie" style="width: 48%;height:400px; float: left;border: 1px solid gainsboro;"></div>
    <div id="histogram"
         style="width: 48%;height:400px;float: left;border: 1px solid gainsboro;"></div>
</div>

<form id="f_export" action="${ctx}/statistics/enginetype/export" method="post" target="_blank">
    <input type="hidden" id="filename" name="filename" value="系统工作情况统计"/>
    <input type="hidden" id="img1" name="img"/>
    <input type="hidden" id="img2" name="img"/>
</form>


</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
<script type="text/javascript" src="${ctx}/static/js/echarts.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/color.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/statistics/syswork.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>