<#compress>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="renderer" content="webkit">
    <title>柴油机尾气监控系统-系统登录</title>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/login/normalize.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/login/grid.css"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/static/css/login/login.css"/>
    <link rel="stylesheet" href="${ctx}/static/js/plugins/layui/css/layui.css?t=1515376178738" media="all">
</head>
<body>
<section class="login_main" style="background: url(${ctx}/${(sysconfig.loginPic)!}) no-repeat center center">
    <div class="container_12">
        <div class="grid_12">
            <article>
                <div class="grid_8 new_customers">&nbsp;&nbsp;
                </div>
                <div class="grid_4 registed_form" style="position: relative;">
                    <form class="registed" action="${ctx}/login" method="post" autocomplete="off">
                        <div class="email">
                            <label for="uname">用户名</label>
                            <input type="text" name="username" class="" value="${username!}" placeholder="请输入登录账号">
                        </div>
                        <div class="password">
                            <label for="upwd">密码</label>
                            <input type="password" name="password" class="" autocomplete="off" value="" placeholder="请输入登录密码">
                        </div>
                        <div class="valid">
                            <label for="upwd">验证码</label>
                            <input type="text" name="captcha" class="" value=""  placeholder="请输入验证码">
                            <img  id="captch" src="${ctx}/captcha?_=${.now?string('yyyyMMddHHmmss')}" width="80" height="34"/>
                        </div>
                        <div class="submit">
                            <label for="Remember_password" class="rem">
                                <input type="checkbox" id="Remember_password">&nbsp;&nbsp;记住密码
                            </label>
                            <input type="submit" value="立即登录">
                        </div>
                    </form>

                    <div style="color:#F0F0F0;margin-top:30px;text-align: center;">
                        <span>版权所有:Copyright &copy; 安徽艾可蓝环保股份有限公司, All Rights Reserved</span>
                    </div>

                </div>
            </article>
        </div>
        <div class="clear"></div>
    </div>
</section>
<script type="text/javascript" src="${ctx}/static/js/jquery-1.8.3.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/layui/layui.all.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/js.cookie-2.0.3.min.js"></script>
<script type="text/javascript" src="${ctx}/static/js/plugins/jquery.placeholder.min.js"></script>

<script type="text/javascript">
    $(function () {
        var error_message = Cookies.get('login.error');
        if (error_message) {
            layer.alert(error_message);
            Cookies.remove('login.error');
        }
        $('.loginbox').css({'position': 'absolute', 'left': ($(window).width() - 692) / 2});
        $(window).resize(function () {
            $('.loginbox').css({'position': 'absolute', 'left': ($(window).width() - 692) / 2});
        });

        $('#captch').click(function () {
            $(this).prop('src', '${ctx}/captcha?_=' + +new Date);
            return false;
        })
    });
</script>
</body>
</html>
</#compress>