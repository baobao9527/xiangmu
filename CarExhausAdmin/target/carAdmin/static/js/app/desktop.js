var InformationAlert, url = {
    list: g.ctx + 'trial/overtime/list',
    form: g.ctx + 'static/views/sys/information-remind.html',
    show: g.ctx + 'index/show',
    show2: g.ctx + 'index/dashboard'
    
};

$(function () {
    autoResize({
        dataGrid: '#tableid',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
    $('.check').on('click', function (event) {
        rmindwindow.rmindwin(event);
        event.preventDefault();
        return false;
    });
    $(window).resize(function () {
        $('#desktop').portal({width: $(parent.window).width() - 255});
    });
    
    setTimeout(function () {
        $('#desktop').portal({
            border: false,
            fit: false,
            width: $(parent.window).width() - 255
        });
    }, 1);
    
    $('.data-grid tbody tr').hover(function () {
        $(this).addClass('data-grid-tr-over');
    }, function () {
        $(this).removeClass('data-grid-tr-over');
    });
    
    //initEvent();
    
});
var dashreload = {
    reload: function () {
        InformationAlert.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
};
var grid = {
    bind: function (winSize) {
        InformationAlert = $('#tableid').datagrid({
            url: url.list,
            loadMsg: "正在加载班次数据，请稍等...", //	iconCls: 'icon icon-list',
            //	rownumbers: true, //行号
            striped: true, //隔行变色
            //idField: 'id',//主键
            //singleSelect: false, //多选
            //border: false,
            //onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            //onDblClickRow: function (rowIndex, rowData) {
            //    document.getElementById('a_edit').click();
            //},
            //frozenColumns: [[
            //	//{field: 'ck', checkbox: true},
            //	{title: '提醒内容', field: 'employee', width: 80}
            //]],
            columns: [[//field后面的字段值是数据库的表的属性名
                {
                    title: '提醒内容',
                    field: 'employee',
                    width: 100
                }, {
                    title: '创建时间',
                    field: 'id',
                    width: 100
                }, {
                    title: '提醒类型',
                    field: 'organization',
                    width: 100
                }, {
                    title: '查看状态',
                    field: 'overtime_start_time',
                    width: 93
                }, {
                    title: '查看时间',
                    field: 'overtime_end_time',
                    width: 100
                }]]
        });
    }
    
};

/**
 * 初始化事件
 */
function initEvent() {
    //个人资料
    $('#userEdit').click(function () {
        var userDialog = parent.easyUI.modalDialog({
            title: '个人资料',
            iconCls: 'icon-person',
            width: 470,
            height: 385,
            url: preCurrentUserInfoEdit,
            buttons: [{
                text: '刷新',
                iconCls: 'icon-reload',
                handler: function () {
                    userDialog.dialog('refresh');
                }
            }, {
                text: '清空',
                iconCls: 'icon-chear',
                handler: function () {
                    var iframeObj = userDialog.find('iframe').get(0).contentWindow;
                    iframeObj.clearForm();
                }
            }, {
                text: '提交',
                iconCls: 'icon-ok',
                handler: function () {
                    var iframeObj = userDialog.find('iframe').get(0).contentWindow;
                    
                    if (!iframeObj.validSubmit()) {
                        return;
                    }
                    
                    var jsonInfo = iframeObj.serializeForm();
                    
                    jsutil.defaultReq(updateUserById, jsonInfo, function (data) {
                        if (data.resultType == "success") {
                            parent.alertBox.showAlert(data.resultMsg, 'info');
                            userDialog.dialog('destroy');
                        } else if (data.resultType == "failure") {
                            parent.alertBox.showAlert(data.resultMsg, 'warning');
                        } else {
                            parent.alertBox.showAlert(data.resultMsg, 'error');
                        }
                    });
                }
            }]
        });
        
    });
    
    //密码修改
    $('#pwdEdit').click(function () {
        var userPwdDialog = parent.easyUI.modalDialog({
            title: '密码修改',
            iconCls: 'icon-pwd-change',
            width: 475,
            height: 179,
            url: preCurrentUserPwdEdit,
            buttons: [{
                text: '清空',
                iconCls: 'icon-chear',
                handler: function () {
                    var iframeObj = userPwdDialog.find('iframe').get(0).contentWindow;
                    iframeObj.clearForm();
                }
            }, {
                text: '提交',
                iconCls: 'icon-ok',
                handler: function () {
                    var iframeObj = userPwdDialog.find('iframe').get(0).contentWindow;
                    
                    if (!iframeObj.validSubmit()) {
                        return;
                    }
                    
                    var jsonInfo = iframeObj.serializeForm();
                    jsutil.defaultReq(updateUserPasswordById, jsonInfo, function (data) {
                        if (data.resultType == "success") {
                            parent.alertBox.showAlert(data.resultMsg, 'info');
                            userPwdDialog.dialog('destroy');
                        } else if (data.resultType == "failure") {
                            parent.alertBox.showAlert(data.resultMsg, 'warning');
                        } else {
                            parent.alertBox.showAlert(data.resultMsg, 'error');
                        }
                    });
                    
                }
            }]
        });
    });
    
    //退出系统
    $('#exitSys').click(function () {
        parent.exitSystem();
    });
}

/**
 * 查看待办
 */
function taskView(taskUrl, taskId, taskParameter) {
    window.location.href =
        (taskUrl).replace(/\s+/g, "") + "?id=" + (taskId).replace(/\s+/g, "") + "&taskParameter=" +
        (taskParameter).replace(/\s+/g, "");
}

var rmindwindow = {
    rmindwin: function (event) {
        //console.log(event);
        var button = $(event.target);
        var self = this;
        var addDialog = top.$.hDialog({
            submit: null,
            closed: false,
            cache: false,
            title: '详细信息',
            width: 350,
            height: 400,
            href: url.form + '?v=' + Math.random(),
            iconCls: 'icon-add',
            onLoad: function () {
                var id = $(event.target).attr('data-id');
                var self = this;
                $.ajaxjson(g.ctx + 'index/show?id=' + id, {'id': id}, function (rst) {
                    if (rst.status == "OK") {
                        var data = rst.data;
                        top.$('#informationRemind').form('load', formatFormDataJson(data));
                        var remint = top.$('#plaTime').val();
                        if (remint == 4) {
                            top.$('#plaTime').val("员工生日提醒");
                        } else if (remint == 3) {
                            top.$('#plaTime').val("合同到期提醒");
                        } else if (remint == 2) {
                            top.$('#plaTime').val("转正提醒");
                        } else {
                            top.$('#plaTime').val("转试用提醒");
                        }
                    } else {
                        msg.ok('加载数据失败！');
                        self.window.dialog('close');
                    }
                });
            },
            
            submit: function () {
                addDialog.dialog('close');
                button.closest('tr').remove();
                self.currentActive = null;
                return false;
            }
        })
    }
}
/**
 * 查看公告详情
 */
function noticedetail(notid) {
    
    var noticedia = $('#notice').dialog({
        title: '公告详情',
        width: 430,
        height: 330,
        href: g.ctx + 'static/views/dashboard-shownotice.html',
        buttons: [{
            text: '关闭',
            handler: function () {
                noticedia.dialog('close');
            }
        }],
        onLoad: function () {
            $.ajaxjson(g.ctx + 'info/notice/show', {'id': notid}, function (rst) {
                
                if (rst.status == "OK") {
                    var data = rst.data;
                    
                    if (data != null) {
                        $('#noticeform1').form('load', formatFormDataJson(data));
                    } else {
                        noticedia.dialog('close')
                    }
                } else {
                    msg.ok('加载数据失败！');
                    noticedia.dialog('close');
                }
            });
        }
    });
}

/**
 * 用户提醒信息
 */
function remindinfo(remindid) {
    
    var noticedia = $('#remind').dialog({
        title: '提醒详情',
        width: 430,
        height: 300,
        href: g.ctx + 'static/views/dashboard-showremind.html',
        buttons: [{
            text: '关闭',
            handler: function () {
                
                noticedia.dialog('close');
            }
        }],
        onLoad: function () {
            $.ajaxjson(g.ctx + 'info/notice/showremind', {'id': remindid}, function (rst) {
                
                if (rst.status == "OK") {
                    var data = rst.data;
                    
                    if (data != null) {
                        $('#showremindform').form('load', formatFormDataJson(data));
                    } else {
                        noticedia.dialog('close')
                    }
                } else {
                    msg.ok('加载数据失败！');
                    noticedia.dialog('close');
                }
            });
        }
    });
}
