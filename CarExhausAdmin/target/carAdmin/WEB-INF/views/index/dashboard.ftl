<@override name="view_title">系统工作台</@override>
<@override name="view_css">

<link rel="stylesheet" type="text/css" href="${ctx}/static/css/portal.css">
<link rel="stylesheet" type="text/css" href="${ctx}/static/css/desktop.css">
</@override>
<@override name="view_body">
<div id="desktop" style="margin:30px auto 0 20px">
    <div style="width:50%;">

        <!-- 我的资料 -->
        <div title="我的资料" data-options="iconCls:'icon-vcard',collapsible:true"
             style="height:205px;">
            <div class="data-left">
                <img style="margin-top:15px" src="${ctx}/static/images/person-128.png">
            </div>

            <div class="data-right">
                <table class="data-grid2" style="height:150px;margin-top:12px;margin-left: 23px"
                       border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td id="realName" class="data-grid-td5" style="width: 200px">
                            姓名：${(user.name)!}
                        </td>
                        <td id="departmentName" class="data-grid-td5">
                            真实姓名： ${(user.username)!}
                        </td>
                    </tr>
                    <tr>
                        <td id="mobile" class="data-grid-td5">
                            手机：${(user.phone)!}
                        </td>
                        <td id="logOnCount" class="data-grid-td5">
                            身份角色： <#if (user.super_admin)!false>
                            超级管理员<#else>${(user.roleName)!}</#if>
                        </td>
                    </tr>
                    <tr>
                        <td id="lastVisit" class="data-grid-td5">
                            本次登录：${(user.last_login_time)!?string('yyyy-MM-dd HH:mm')}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3">
                            <a href="javascript:void(0);" data-options="iconCls:'icon-key_go'"
                               class="easyui-linkbutton" style="margin-right: 20px" title="修改密码"
                               id="editPwd">修改密码</a>
                            <a href="javascript:void(0);" data-options="iconCls:'sign-out'"
                               class="easyui-linkbutton" title="退出系统" id="exitSystem">退出系统</a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <div style="width:50%;">
        <div title="系统公告" data-options="iconCls:'icon-bell',collapsible:true"
             style="height:205px;padding: 9px">
            <table class="data-grid" border="0" cellpadding="0" cellspacing="0">
                <thead>
                <tr>
                    <th class="data-grid-td1" style="width:23px"></th>
                    <th class="data-grid-td1">标题</th>
                    <th class="data-grid-td1" style="width:69px"><a href="#" id="more_notice_btn">查看更多&gt;&gt;</a>
                    </th>
                </tr>
                </thead>
                <tbody>
                    <#list notices as notice>
                    <tr>
                        <td class="data-grid-td2">
                        ${notice_index + 1}
                        </td>
                        <td class="data-grid-td3" colspan="2">
                            <a href="${ctx}/info/notice/view/${(notice.id)!}"
                               target="_blank">${notice.title}</a>
                        </td>
                    </tr>
                    </#list>
                </tbody>
            </table>
        </div>

    </div>
</div>
</@override>

<@override name="view_scripts">
<script type="text/javascript" src="${ctx}/static/js/plugins/jquery.portal.js"></script>

<script type="text/javascript">

    $(function () {
        $('#exitSystem').click(function () {
            top.$.messager.confirm('温馨提示', '您确定要退出本次登录吗?', function (r) {
                if (r) {
                    top.location.href = '${ctx}/logout';
                }
            });
        });
        $('#editPwd').click(function () {
            parent.editMyPass();
        });

        $('#more_notice_btn').click(function () {
            parent.addTab("公告列表", g.ctx +"info/notice", "icon-vcard");
        });
    });

</script>
<script type="text/javascript"
        src="${ctx}/static/js/app/desktop.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>