<@override name="view_title">用户中心</@override>
<@override name="view_body">

<div id="toolbar" class="page_toolbar">
    <div class="searchArea ">
        车牌号:
        <input name="name" id="car_code"   style="" type="text" class="txt01"/>
        日期:
        <input name="s_start_date"    id="s_start_date" style="width: 140px;" type="text" class="txt01"/>
        -
        <input name="s_end_date" id="s_end_date" style="width: 140px;" type="text" class="txt01"/>
        <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton" icon="icon-search"
           title="查询">查询
        </a>
    </div>
</div>

<div id="map"></div>


</@override>

<@override name="view_scripts">
<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=${mapkey!''}"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/moment.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/BaiduMap_lushu.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/locusmap/locusmap.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>