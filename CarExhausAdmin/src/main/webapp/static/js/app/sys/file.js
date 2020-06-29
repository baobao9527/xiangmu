/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'sys/file/list',
    form: g.ctx + 'static/views/sys/dir-form.html',
    save: g.ctx + 'sys/file/saveDir'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });

    $('#a_create').on('click', function(){
        SysNotice.add();
    });

    $('#a_upload').on('click', function () {

        var importDialog = top.$.hDialog({
            href: g.ctx + 'static/views/sys/file-upload.html?v=' + Math.random(),
            title: '上传文件',
            iconCls: 'icon-tab_add',
            width: 350,
            height: 200,
            onLoad: function () {

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
                    server: g.ctx + 'sys/file/upload',
                    paste: top.window.document.body,
                    accept: {
                        /*title: '导入设备清单Excel',
                        extensions: 'xls,xlsx',
                        mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'*/
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

                        _gridlist.datagrid('clearSelections').datagrid({
                            queryParams: {
                                path: crumb.directory
                            }
                        }).datagrid('reload');
                        top.$.messager.alert('温馨提示', '导入成功！', 'info');
                    } else {
                        MessageOrRedirect(response);
                    }
                });

                uploader.on('fileQueued', function () {
                    uploader.option('formData',{
                        path:crumb.directory
                    })
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
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载数据，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width-500,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            //idField: 'id',//主键
            singleSelect: true, //单选
            border: false,
            //onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            columns: [[
                {
                    title: '文件名称',
                    field: 'filename',
                    width: 200,
                    formatter: function (v, r) {
                        var icon = 'page';
                        if(r.dir == true){
                            icon = 'folder';
                        }else if(r.suffix == 'doc' || r.suffix == 'docx'){
                            icon = 'filetype-word';
                        }else if(r.suffix == 'xls' || r.suffix == 'xlsx'){
                            icon = 'filetype-excel';
                        }else if(r.suffix == 'ppt' || r.suffix == 'pptx'){
                            icon = 'filetype-ppt';
                        }else if(r.suffix == 'pdf'){
                            icon = 'filetype-pdf';
                        }else if(r.suffix == 'txt'){
                            icon = 'filetype-txt';
                        }else if(r.suffix == 'bmp' || r.suffix == 'jpg' || r.suffix == 'jpeg' || r.suffix == 'png' || r.suffix == 'gif'){
                            icon = 'image';
                        }else if(r.suffix == 'avi' || r.suffix == 'rmvb' || r.suffix == 'rm' || r.suffix == 'asf' || r.suffix == 'divx'
                            || r.suffix == 'mpg' || r.suffix == 'mpeg' || r.suffix == 'mpe' || r.suffix == 'wmv' || r.suffix == 'mp4'
                            || r.suffix == 'mkv' || r.suffix == 'vob'){
                            icon = 'film';
                        }else if(r.suffix == 'wav' || r.suffix == 'mp3' || r.suffix == 'ra' || r.suffix == 'wma' || r.suffix == 'mid'){
                            icon = 'music';
                        }
                        var span = '<span class="icon icon-' + icon + '" style="display:inline;"></span>';
                        if (r.dir == true) {
                            console.log('----- this is dir1');
                            return span + '<a href="javascript:crumb.refreash(\'' + r.directory + '\');"' +
                                ' style="color:#0043ff; text-decoration: underline;" >' + v + '</a>';
                        } else {
                            console.log('----- this is dir2');
                            return span + '<span>' + v + '</span>';
                        }
                    }
                }, {
                    title: '文件大小(字节)',
                    field: 'filelength',
                    width: 150
                }, {
                    title: '修改时间',
                    field: 'lastmodifiedtime',
                    width: 200
                }, {
                    title: '操作',
                    field: 'id',
                    width:100,
                    formatter: function (v, r) {
                        if (r.dir == true) {
                            return '<a href="javascript:SysNotice.rename(\'' + r.filename + '\');"' +
                                ' style="color:#0043ff; text-decoration: underline;" >重命名</a>';
                        } else {
                            return '<a href="' + g.ctx + 'sys/file/download?path=' + r.directory + '"' +
                                ' style="color:#0043ff; text-decoration: underline;" >下载</a>';
                        }
                    }
                }
                ]],
            onLoadSuccess: function(data){
                console.log('---------数据加载成功！\n');
                crumb.directory = data.directory;
                crumb.curmbBar();
            },
            onClickRow: function(index,r){
                if(r.suffix == 'bmp' || r.suffix == 'jpg' || r.suffix == 'jpeg' || r.suffix == 'png' || r.suffix == 'gif'){
                    $('#preview').empty();
                    $('#preview').append('<img src="' + g.ctx + 'sys/file/download?path=' + r.directory + '" style="width:100%;height:100%;"/>');
                }else{
                    $('#preview').empty();
                }
            }
        });
    },
    getSelectedRows: function () {
        return _gridlist.datagrid('getSelections');
    },
    getSelectedRow: function () {
        return _gridlist.datagrid('getSelected');
    },
    getSelectedRowIds: function () {
        var selecteds = _gridlist.datagrid('getSelections');
        var selectedIds = [];
        for (var i = 0; i < selecteds.length; i++) {
            selectedIds.push(selecteds[i].id);
        }
        return selectedIds;
        
    },
    reload: function () {
        _gridlist.datagrid('clearSelections').datagrid('reload', {filter: ''});
    }
};

var crumb = {

    directory: '',

    curmbBar: function(){
        var dirs = this.directory.split('/');
        var toolbar = $('.location');
        toolbar.empty();
        toolbar.append('目录：');

        var path = '';
        for(var i = 0; i < dirs.length; i++){
            var dir = dirs[i];
            if(dir == ''){
                path = '/';
                dir = '/';
            }else{
                path += '/' + dir;
            }
            if(i < dirs.length - 1 || dirs.length == 1){
                var a = $('<a href="javascript:crumb.refreash(\'' + path + '\');" style="color:#0043ff;' +
                    ' text-decoration: underline;" >' + dir + '</a>');
                toolbar.append(a);
                if(dirs.length != 1){
                    toolbar.append(' > ');
                }
            }else{
                toolbar.append('<span>' + dir + '</span>');
            }
        }
    },

    refreash: function(path){
        _gridlist.datagrid('clearSelections').datagrid({
            queryParams: {
                path: path
            }
        });

        //$('#test').datagrid('options').queryParams=queryParams;
    }
};


var SysNotice = {
    currentActive: null,
    isEdit:false,
    window: null,
    showEditWindow: function (isEdit,oldname) {
        var self = this;

        this.window = top.$.hDialog({
            title: isEdit ? "重命名" : '创建文件夹',
            width: 600,
            height: 200,
            href: url.form + '?v=' + Math.random(),
            iconCls: isEdit ? 'icon-edit' : 'icon-add',
            onLoad: function () {
                top.$('#currentPath').val(crumb.directory);
                if(!isEdit){
                    top.$('#oldDir').val('');
                }else{
                    top.$('#oldDir').val(oldname);
                    top.$('#newDir').val(oldname);
                }
            },
            submit: function () {
                if (top.$('#noticeform').form("validate")) {
                    $.submitForm(top.$('#noticeform'), url.save, function (rst) {
                        self.window.dialog('close');
                        msg.ok('操作成功！');

                        _gridlist.datagrid('clearSelections').datagrid({
                            queryParams: {
                                path: crumb.directory
                            }
                        }).datagrid('reload');

                        self.currentActive = null;
                    });
                }
                return false;
            }
        });
    },

    add: function () {
        this.showEditWindow();
        return false;
    },

    rename: function (oldname) {
        this.showEditWindow(true,oldname);
        return false;
    },
    refreash: function () {
        grid.reload();
    }
};

//@ sourceURL=sysfile.js