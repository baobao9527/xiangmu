<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
    <head id="Head1"><title>

    </title>
        <link rel="stylesheet" type="text/css" href="${ctx}/static/css/common.css"/>
        <link href="${ctx}/static/css/sexybuttons.css" rel="stylesheet" type="text/css"/>
        <link href="${ctx}/static/js/plugins/showloading/showLoading.css" rel="stylesheet" type="text/css"/>
        <link rel="stylesheet" type="text/css" href="${ctx}/static/easyui/themes/metro-blue/easyui.css"/>
        <link href="${ctx}/static/css/icon.css" rel="stylesheet" type="text/css"/>
        <script type="text/javascript" src="${ctx}/static/js/jquery-1.8.3.min.js"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/js.cookie-2.0.3.min.js"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/jQuery.Ajax.js"></script>
        <script type="text/javascript" src="${ctx}/static/easyui/jquery.easyui.min.js"></script>
        <script type="text/javascript" src="${ctx}/static/easyui/locale/easyui-lang-zh_CN.js"></script>
        <script type="text/javascript" src="${ctx}/static/easyui/easyloader.js"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/layer/layer.js"></script>
        <script type="text/javascript">
            var g = {};
            g.ctx = '${ctx}/';
        </script>

    </head>
    <body style="height:100%;width:100%;border:none; overflow:hidden;" oncontextmenu="return false"
          ondragstart="return false" oncopy="document.selection.empty()" onbeforecopy="return false">

        <div id="toolbar" class="page_toolbar">
            <div class="toolbar_row">
                <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-reload" title="重新加载">刷新
                </a>

                <div class='datagrid-btn-separator'></div>

            <@shiro.hasPermission name="add.sys.notice">
                <a id="a_add" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-add" title="新增产品数据">新增
                </a>
            </@shiro.hasPermission>

            <@shiro.hasPermission name="edit.sys.notice">
                <a id="a_edit" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-pencil" title="编辑选中的产品数据">编辑
                </a>
            </@shiro.hasPermission>

            <@shiro.hasPermission name="del.sys.notice">
                <a id="a_delete" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-delete3" title="删除选中的产品数据">删除
                </a>
            </@shiro.hasPermission>

                <div class='datagrid-btn-separator'></div>

            <@shiro.hasPermission name="send.sys.notice">
                <a id="a_publish" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-redo" title="发布">发布
                </a>
            </@shiro.hasPermission>
            </div>
        </div>

        <table id="list"></table>
        <div id="win"></div>


        <script type="text/javascript" src="${ctx}/static/js/app/business/Search.js"></script>
        <script type="text/javascript" src="${ctx}/static/js/app/business/exportutil.js"></script>

        <script type="text/javascript" src="${ctx}/static/js/plugins/jsCommon.js?v=29"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/rdiframework-core.js?v=29"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/json2.js"></script>
        <script type="text/javascript" src="${ctx}/static/js/plugins/jQuery.TableRowUI.js"></script>
        <script type="text/javascript" src="${ctx}/static/easyui/rdi.easyui-extend.js?v=29"></script>

        <script type="text/javascript" src="${ctx}/static/js/app/sys/notice.js"></script>
        <script type="text/javascript">
            if (top.location == self.location) {
                top.location = '/';
            }
            var currend_Date = '2015-11-20';
            easyloader.theme = 'default';


            var $notity = top.$('#notity');
            var msg = {
                ok: function (message) {
                    layer.msg(message, {
                        offset: 'rb',
                        shift: 2,
                        icon: 1
                    });
                    //$notity.jnotifyAddMessage({ text: message });
                },
                error: function (message) {
                    layer.msg(message, {
                        //offset: 'rb',
                        shift: 2,
                        icon: 5
                    });
                    //$notity.jnotifyAddMessage({ text: message, type: 'error' });
                },
                warning: function (message) {
                    layer.msg(message, {
                        //offset: 'rb',
                        shift: 2,
                        icon: 0
                    });
                    //$notity.jnotifyAddMessage({ text: message, type: 'warning' });
                }
            };
        </script>

    </body>

</html>
