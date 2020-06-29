<@override name="view_title">车辆全景</@override>
<@override name="view_body">


<div id="map" style="width: 1000px;height: 700px;"></div>


<script id="Car_Info_Bubble" type="text/template">
    <table  lay-size="sm" style="height: 360px;" class="layui-table">
        <colgroup>
            <col width="145">
            <col width="200">
        </colgroup>
        <tbody>
        <tr>
            <td>车牌号:</td>
            <td>{info.car_no}</td>
        </tr>
        <tr>
            <td>在线:</td>
            <td>
                <tpl if="info.online"><span style="color: deepskyblue;">在线</span><tpl else><span style="color:grey;">离线</span></tpl>
            </td>
        </tr>

        <tpl for="datas">
        <tr>
            <td>{title}</td>
            <td>{val}</td>
        </tr>
        </tpl>
        </tbody>
    </table>
</script>

</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=${mapkey!''}"></script>
<script type="text/javascript"
        src="http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/cmps/app_overlay.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/onlinemap/panoramic.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>