<@override name="view_title">用户中心</@override>
<@override name="view_body">

<div id="map" style="height: 400px;"></div>

</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=${mapkey!''}"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/hotmap/hotmap.js?_=${.now?string('yyyyMMddHHmmss')}"></script>

</@override>
<@extends name="/base/main.ftl"></@extends>