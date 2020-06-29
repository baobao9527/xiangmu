<@override name="view_title">汽车安装类型统计</@override>
<@override name="view_body">

<style>
    .panel-tool-close {
        display: none !important;
    }
</style>
<div class="searchArea ">
    车牌号:
    <input name="s_car_no" id="s_car_no" style="width: 120px;" type="text" class="txt01"/>
    日期:
    <input name="s_start_date" id="s_start_date" style="width: 140px;" type="text"
           class="txt01"/> - <input name="s_end_date" id="s_end_date" style="width: 140px;" type="text" class="txt01"/>
    <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
       icon="icon-search" title="查询">查询 </a>
    <a id="a_export" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
       icon="icon-export"
       title="导出">导出
    </a>
</div>
<h1 style="text-align: center;">车辆温度统计</h1>
<div style="padding:2px; margin:0;">
    <div id="pie" style="width: 49%;height:600px; float: left; border: 1px solid gainsboro;"></div>
    <div id="pressureLineChart" style="width: 49%; padding-left: 10px;height:600px; float: left; border: 1px solid gainsboro;"></div>
</div>

<form id="f_export" action="${ctx}/statistics/enginetype/export" method="post" target="_blank">
    <input type="hidden" id="filename" name="filename" value="车辆温度统计"/>
    <input type="hidden" id="img1" name="img"/>
    <input type="hidden" id="perssureImage" name="img"/>
</form>


</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
<script type="text/javascript" src="${ctx}/static/js/echarts.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/color.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/moment.min.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/statistics/temperature.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>