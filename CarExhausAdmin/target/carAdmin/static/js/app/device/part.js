/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved. 
 */

/**
 *
 * @author sog
 * @version 1.0
 */
var moduleGrid, url = {
    list: g.ctx + 'device/part/list',
    applyForm: g.ctx + 'static/views/device/part-applyForm.html?v=' + Math.random(),
    applySave: g.ctx + 'device/part/save',
    applyAndGenerateSave: g.ctx + 'device/part/generate',
    show: g.ctx + 'device/part/show',
    del: g.ctx + 'device/part/delete'
}, elements = {
    formId: '#deviceApplyFrom',
    gridId: '#list'
};

$(function () {
    
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_refresh').on('click', DevicePart.refreash);
    $('#a_roleSet').on('click', DevicePart.roleUser);
    $('#a_device_view').on('click', DevicePart.viewDevice);
    $('#a_export_btn').on('click', function () {
        var selectedRow = grid.getSelectedRow();
        if (selectedRow) {

            var rows = grid.getSelectedRows();

            if (rows.length != 1) {
                top.$.messager.alert('温馨提示', '无法同时对多个设备申请信息进行导出');
            } else {

                if (selectedRow.status == 1) {
                    top.$.messager.alert('温馨提示', '设备已经导出,无法继续导出了!');
                    return;
                }
                top.$.messager.confirm('温馨提示', '您确定要导出该申请单的设备么?', function (r) {
                    if (r) {
                        window.location.href = g.ctx + 'device/part/export/' + selectedRow.id;
                    }
                });

            }
        } else {
            top.$.messager.alert('温馨提示', '请选择要导出的申请单');
            return false;
        }
        return false;
    });
    $('#a_import_btn').on('click', function () {

        var importDialog = top.$.hDialog({
            href: g.ctx + 'static/views/device/import.html?v=' + Math.random(),
            title: '导入设备清单',
            iconCls: 'icon-tab_add',
            width: 350,
            height: 200,
            onLoad: function () {

                top.$('#import_view_template').attr('href', g.ctx + 'static/views/device/导入模板.xls');

                var uploader;

                if (uploader) {
                    return;
                }

                uploader = top.WebUploader.create({
                    swf: g.ctx + 'static/js/plugins/webuploader/Uploader.swf',
                    pick: {
                        id: top.$('#addbtn'),
                        label: '点击选择文件',
                        multiple: false
                    },
                    width: 160,
                    height: 160,
                    server: g.ctx + 'device/part/inventor',
                    paste: top.window.document.body,
                    accept: {
                        title: '导入设备清单Excel',
                        extensions: 'xls,xlsx',
                        mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    fileSingleSizeLimit: 10485760
                });

                var uploadLoader;

                uploader.on('startUpload', function () {
                    // console.log('startUpload');
                    uploadLoader = top.layer.load(0, {shade: false});  //正在加载提示
                });

                uploader.on('uploadComplete', function () {
                    // console.log('uploadComplete');
                    top.layer.close(uploadLoader);
                });

                uploader.on('uploadSuccess', function (file, response) {
                    if (response.status == 'OK') {
                        importDialog.dialog('close');
                        grid.reload();
                        top.$.messager.alert('温馨提示', '导入成功！', 'info');
                    } else {
                        MessageOrRedirect(response);
                    }
                });

                uploader.on('fileQueued', function () {
                    uploader.upload();
                });

                uploader.on('uploadError', function () {
                    top.$.messager.alert('温馨提示', '附件上传失败！', 'warning');
                });

                uploader.on('error', function (type) {
                    if (type == 'F_EXCEED_SIZE') {
                        top.$.messager.alert('温馨提示', '上传的文件大小不能超过10M！', 'warning');
                    }
                });
            }
        });

        return false;
    });
});

var grid = {
    bind: function (winSize) {
        moduleGrid = $('#list').datagrid({
            toolbar: '#toolbar',
            url: url.list,
            nowrap: false,
            rownumbers: true,
            loadMsg: '正在努力加载中....',
            resizable: true,
            collapsible: false,
            singleSelect: false, //单选
            width: winSize.width,
            height: winSize.height,
            onContextMenu: pageContextMenu.createTreeGridContextMenu,
            idField: 'id',
            border: false,
            selectOnCheck: true,
            checkOnSelect: true, // onDblClickRow: function (row) {
            //     document.getElementById('a_edit').click();
            // },
            frozenColumns: [[{
                field: "ck",
                checkbox: true
            }, {
                title: '申请号',
                field: 'code',
                width: 180
            }, {
                title: '主键',
                field: 'id',
                hidden: true
            }]],
            columns: [[{
                title: '申请数量',
                field: 'devices',
                width: 140
            }, {
                title: '申请时间',
                field: 'dateline',
                width: 160
            }, {
                title: '状态',
                field: 'status',
                width: 60,
                formatter: function (v, d, i) {
                    return v ? '已创建' : '已生成';
                }
            }, {
                title: '操作人',
                field: 'operator_name',
                width: 140,
                align: 'center'
            }]],
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 30, 40]
        })
    },
    reload: function () {
        moduleGrid.datagrid('clearSelections').datagrid('reload', {filter: ''});
    },
    getSelectedRow: function () {
        return moduleGrid.datagrid('getSelected');
    },
    getSelectedRows: function () {
        return moduleGrid.datagrid('getSelections');
    }
};

var DevicePart = {

    currentActive: null,
    refreash: function () {
        grid.reload();
    },
    bindCtrl: function () {
        top.$('#name').focus();
        
        top.$('#birthday').datebox({
            formatter: function (date) {
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            },
            arser: function (date) {
                return new Date(Date.parse(date.replace(/-/g, "/")));
            }
        });
        
        top.$('#userform').validate({});

        var row = grid.getSelectedRow();

        if (row) {
            $.ajaxjson(url.show, {'id': row.id}, function (rst) {

                if (rst.status == "OK") {
                    var data = rst.data;
                    top.$(elements.formId).form('load', formatFormDataJson(data));
                } else {
                    top.$.messager.alert('温馨提示', '加载数据失败!', 'info');
                    self.window.dialog('close');
                }
            });
        }
    },
    viewDevice: function () {
        var selectRow = grid.getSelectedRow();
        if (selectRow) {
            var batchId = selectRow.id;
            var tmpDailog = top.$.hDialog({
                href: g.ctx + 'device/part/view/' + batchId,
                width: 550,
                height: 480,
                maximizable: false,
                resizable: true,
                title: '申请单查看',
                iconCls: 'icon-monitort',
                onLoad: function () {
                    top.$('#deviceGrid').datagrid({
                        url: g.ctx + 'device/part/devices?batch=' + batchId,
                        width: top.$('#device_panel').panel().width(),
                        height: 230,
                        nowrap: false,
                        rownumbers: true,
                        loadMsg: '正在努力加载中....',
                        resizable: true,
                        collapsible: false,
                        singleSelect: false, //单选
                        idField: 'id',
                        border: false,
                        method: 'get',
                        columns: [[{
                            title: '主键',
                            field: 'id',
                            hidden: true
                        }, {
                            title: '设备ID',
                            field: 'device_code',
                            width: 140
                        }, {
                            title: '鉴权号码',
                            field: 'auth_code',
                            width: 160
                        }, {
                            title: '申请时间',
                            field: 'dateline',
                            width: 160
                        }]],
                        pagination: true,
                        pageSize: 10,
                        pageList: [10, 20, 50, 100]
                    });
                    top.$('#export_btn').click(function () {
                        window.location.href = g.ctx + 'device/part/export/' + batchId;
                    })
                },
                buttons: [{
                    text: '关闭',
                    iconCls: 'icon-cancel',
                    handler: function () {
                        tmpDailog.dialog("close")
                    }
                }]
            });

        } else {
            top.$.hxlMessage.alerWarning('温馨提示', '请选择待查看的申请单');
            return false
        }
        return false
    }
};

