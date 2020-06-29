/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

/**
 * Created by BOGONm on 16/5/5.
 */
$(function(){
    var importDialog = top.$.hDialog({
        href: g.ctx + 'static/views/device/update.html?v=' + Math.random(),
        title: '上传程序文件',
        iconCls: 'icon-tab_add',
        width: 350,
        height: 200,
        buttons: [{
            text: '确定',
            iconCls: 'icon-ok',
            handler: function () {
                importDialog.dialog('close');
                var tab =  top.$("#tabs").tabs('getSelected');
                var index = top.$("#tabs").tabs('getTabIndex',tab);
                top.$("#tabs").tabs("close", index);
                return false;
            }
        }, {
            text: '取消',
            iconCls: 'icon-cancel',
            handler: function () {
                importDialog.dialog('close');
                var tab =  top.$("#tabs").tabs('getSelected');
                var index = top.$("#tabs").tabs('getTabIndex',tab);
                top.$("#tabs").tabs("close", index);
                return false;
            }
        }],
        onLoad: function () {
            var uploader;
            if (uploader) {
                return;
            }
            uploader = top.WebUploader.create({
                swf: g.ctx + 'static/js/plugins/webuploader/Uploader.swf',
                pick: {
                    id: top.$('#addbtn'),
                    label: '点击选择程序文件',
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
});