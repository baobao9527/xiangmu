<@override name="view_title">用户中心</@override>
<@override name="view_body">

<style>
    .panel-tool-close {
        display: none !important;
    }
</style>

<div style="padding:2px; margin:0px;">
    <div id="layout" class="easyui-layout">
        <div region="west" iconCls="icon-chart_organisation" split="false" title="列表" style="width:300px;"
             collapsible="true">
            <div id="toolbar" class="page_toolbar">
                <div class="toolbar_row">
                    <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="false"
                       href="javascript:;"
                       icon="icon-delete3" title="删除选中的电子围栏">删除
                    </a>
                </div>
            </div>
            <table id="datalist" toolbar="#toolbar"></table>
        </div>
        <div region="center" title="地图" iconCls="icon-list" style="overflow: hidden">
            <div id="map"></div>
        </div>
    </div>
</div>


</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=${mapkey!''}"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/fencemap/fencemap.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>