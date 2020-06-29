<@override name="view_title">设备申请</@override>
<@override name="view_body">
</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/app/device/update.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>