<#compress >
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>柴油机尾气监控平台</title>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/js/plugins/showloading/showLoading.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/sexybuttons.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/common.css"/>
    <script type="text/javascript" src="${ctx}/sys/config"></script>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/easyui/themes/metro-blue/easyui.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/icon.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/css3btn.css"/>
    <link rel="stylesheet" href="${ctx}/static/js/plugins/layui/css/layui.css?t=1515376178738" media="all">
    <link rel="stylesheet" type="text/css" href="${ctx}/static/js/plugins/webuploader/webuploader.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/js/plugins/kindeditor/themes/default/default.css"/>
    <link type="text/css" href="${ctx}/static/css/zTreeStyle/zTreeStyle.css" rel="stylesheet" />

</head>

<body class="easyui-layout" style="overflow-y: hidden; " fit="true" >
<#--<body class="easyui-layout" style="overflow-y: hidden; "  fit="true"   scroll="no">-->
<div id="loading" style="position: fixed;top: -50%;left: -50%;width: 200%;height: 200%;background: #fff;z-index: 100;overflow: hidden;">
    <img src="${ctx}/static/images/ajax-loader.gif" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;" alt=""/>
</div>

<noscript>
    <div style=" position:absolute; z-index:100000; height:2046px;top:0;left:0; width:100%; background:white; text-align:center;">
        <img src="${ctx}/static/images/noscript.gif" alt='抱歉，请开启脚本支持！'/>
    </div>
</noscript>


<div id="northPanel" data-options="region: 'north', border: false" style="height: 103px; overflow: hidden;background-color:#E6EEF8;">
    <div id="topbar" class="top-bar headbackcss" style="background: url(${ctx}/${(sysconfig.logo)!}) 0 0 no-repeat">
        <div class="top-bar-right">
            <div id="timerSpan"></div>
        </div>
    </div>
    <div id="toptoolbar" class="panel-header panel-header-noborder top-toolbar" style="padding:3px 5px;">
        <div id="infobar">
            <span class="icon-boss" style="padding-left: 25px; background-position: left center;">
                欢迎 <span id="curname" style="font-weight: bold;"><@shiro.principal></@shiro.principal></span>
            </span>
        </div>
        <div id="buttonbar">
            <#if (countError >0)>
                <a id="syserr" class="easyui-linkbutton" data-options="plain: true, iconCls: 'icon-gj'">(<strong><span style="color: red" id="warnErrorText">${countError}</span></strong>)</a>
            <#else>
                <a id="syserr" class="easyui-linkbutton" data-options="plain: true, iconCls: 'icon-siren2'">(<strong><span style="color: #808080" id="warnErrorText">0</span></strong>)</a>
            </#if>
            <a id="editpass" class="easyui-linkbutton" data-options="plain: true, iconCls: 'icon-key_go'">修改密码</a>
            <a id="loginOut" class="easyui-linkbutton" data-options="plain: true, iconCls: 'sign-out'">退出系统</a>
            <a id="btnShowNorth" class="easyui-linkbutton" data-options="plain: true, iconCls: 'layout-button-down'" style="display: none;"></a>
        </div>
    </div>
</div>
<div region="west" split="false" title="导航菜单" style="width:180px;" id="west">
    <div id="wnav">
        <!--  手风琴导航内容 -->
    </div>
</div>
<div region="south" split="false" style="height: 30px;">
<div class="footer">Copyright &copy; 安徽艾可蓝环保股份有限公司, All Rights Reserved</div>
<#-- <div class="footer">Copyright &copy; ${(sysconfig.orgName)!}, All Rights Reserved</div>-->
</div>

<div id="mainPanle" region="center" style="background: #eee; overflow-y:hidden" border="false">
 <div id="tabs" class="easyui-tabs" fit="true"></div>
</div>

<div id="closeMenu" class="easyui-menu" style="width:150px;">
 <div id="refresh" iconCls="icon-arrow_refresh">刷新</div>
 <div class="menu-sep"></div>
 <div id="close">关闭</div>
 <div id="closeall">全部关闭</div>
 <div id="closeother">除此之外全部关闭</div>
 <div class="menu-sep"></div>
 <div id="closeright">关闭右侧窗口</div>
 <div id="closeleft">关闭左侧窗口</div>
 <div class="menu-sep"></div>
 <div id="exit">退出</div>
</div>

<div id="w"></div>
<div id="i"></div>
<div id="d"></div>

<!--<div id="notity"></div>-->

<#--<iframe height="0" width="0" src="${ctx}/uc/message"></iframe>-->

<script type="text/javascript" src="${ctx}/static/js/jquery-1.8.3.min.js"></script>
<script type="text/javascript">
    var g = {};
    g.ctx = "${ctx}/";
    var theme = 'metro-blue';
    var _menus = ${sysmenus!'[]'};
    $(function () {
        $('#loginOut').click(function () {
            $.messager.confirm('系统提示', '您确定要退出本次登录吗?', function (r) {
                if (r) {
                    location.href = '${ctx}/logout';
                }
            });
        });

        $(window).load(function () {
            $('#loading').fadeOut();
        });

        var $syserr = $('#syserr');

        function warning() {
            //
            // $.ajax({
            //     type: "GET",
            //     url: g.ctx + 'warning',
            //     dataType: "json",
            //     success: function (rsp) {
            //         if (rsp.status == 'OK') {
            //             var warings = rsp.data;
            //             var iconCLs = 'icon-siren2', text = '0' , color='#808080';
            //             if (warings > 0) {
            //                 iconCLs = 'icon-gj';
            //                 text = warings;
            //                 color = 'red';
            //             }
            //             $syserr.linkbutton({
            //                 iconCls: iconCLs,
            //                 text : String.format('(<strong><span style="color: {0}">{1}</span></strong>)', color, text)
            //             });
            //         }
            //     }
            // });

            setTimeout(warning, 1000)

        }

        setTimeout(warning, 1000);
    });
</script>
<script type="text/javascript"
        src="${ctx}/static/js/app/home/home.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
<script type="text/javascript" src="${ctx}/common/dictjs?_=${.now?string('yyyyMMddHHmmss')}"></script>
<script type="text/javascript" src="${ctx}/static/easyui/jquery.easyui.min.js"></script>
<script type="text/javascript" src="${ctx}/static/easyui/locale/easyui-lang-zh_CN.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/jQuery.Ajax.js"></script>
<script type="text/javascript" src="${ctx}/static/easyui/rdi.easyui-extend.js?v=29"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/rdiframework-core.js?v=29"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/moment.min.js"></script>
<script type="text/javascript" src="${ctx}/static/easyui/easyui-validate-rules.js"></script>
<script type="text/javascript" src='${ctx}/static/js/app/business/newlayout.js?&v=29'></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/qqmsg/jQuery.qqmsg.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/layui/layui.all.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/jquery.form.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/showloading/jquery.showLoading.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/validate/jquery.validate.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/validate/jQuery.Validate.message_cn.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/webuploader/webuploader.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/zTreeMaster/jquery.ztree.all-3.5.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/kindeditor/kindeditor-min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/kindeditor/lang/zh_CN.js"></script>

<script type="text/javascript" src="${ctx}/static/js/hamster.js"></script>

</body>
</html>
</#compress>