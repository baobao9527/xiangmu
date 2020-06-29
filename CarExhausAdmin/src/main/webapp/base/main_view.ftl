<#compress >
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1">
    <title><@block name="view_title"></@block></title>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/common.css"/>
    <link href="${ctx}/static/css/sexybuttons.css" rel="stylesheet" type="text/css"/>
    <link href="${ctx}/static/js/plugins/showloading/showLoading.css" rel="stylesheet"
          type="text/css"/>
    <link rel="stylesheet" type="text/css"
          href="${ctx}/static/easyui/themes/metro-blue/easyui.css"/>
    <link rel="stylesheet" href="${ctx}/static/js/plugins/layui/css/layui.css?t=1515376178738" media="all">
    <link href="${ctx}/static/css/zTreeStyle/zTreeStyle.css" rel="stylesheet" type="text/css"/>
    <link href="${ctx}/static/css/icon.css" rel="stylesheet" type="text/css"/>
    <script type="text/javascript" src="${ctx}/static/js/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="${ctx}/static/js/plugins/js.cookie-2.0.3.min.js"></script>
    <script type="text/javascript" src="${ctx}/static/js/plugins/jQuery.Ajax.js"></script>
    <script type="text/javascript" src="${ctx}/static/easyui/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="${ctx}/static/easyui/locale/easyui-lang-zh_CN.js"></script>
    <script type="text/javascript" src="${ctx}/static/easyui/easyloader.js"></script>
    <script type="text/javascript">
        var g = {};
        g.ctx = '${ctx}/';
    </script>

    <@block name="view_css"></@block>
</head>
<body style="height:100%;width:100%;border:none; overflow:hidden;">

    <@block name="view_body"></@block>

<script type="text/javascript" src="${ctx}/static/js/plugins/jsCommon.js?v=29"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/rdiframework-core.js?v=29"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/json2.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/jQuery.TableRowUI.js"></script>
<script type="text/javascript" src="${ctx}/static/easyui/rdi.easyui-extend.js?v=29"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/layui/layui.all.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/plugins/zTreeMaster/jquery.ztree.all-3.5.min.js"></script>

<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>
    <@block name="view_scripts"></@block>

</body>
</html>
</#compress>