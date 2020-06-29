<@override name="view_title">用户中心</@override>
<@override name="view_body">

<div id="toolbar" class="page_toolbar">
    <div class="searchArea">

    </div>
</div>
<table id="list"></table>
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/plugins/moment.min.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/monitoring/databackup.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>