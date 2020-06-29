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
            <div class="searchArea ">
                日期:
                <input name="s_start_date" id="s_start_date" style="width: 100px;" type="text" class="txt01"/>
                -
                <input name="s_end_date" id="s_end_date" style="width: 100px;" type="text" class="txt01"/>
                围栏名称:
                <input type="text" style="width: 80px;" class="txt01" id="s_name"/>
                <a id="a_search" href="javascript:void(0);" plain="true" class="easyui-linkbutton"
                   icon="icon-search"
                   title="查询">查询
                </a>
            </div>
            <div class="toolbar_row">
                <a id="a_refresh" class="easyui-linkbutton" style="float:left" plain="true" href="javascript:;"
                   icon="icon-reload" title="重新加载">刷新
                </a>
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

        <script type="text/javascript" src="${ctx}/static/js/app/fence/record.js?_${.now?string("yyyyMMhhss")}"></script>
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
