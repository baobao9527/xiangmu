/*
 * Copyright (c)  2018 fitzyyf Inc.
 * All rights reserved.
 */

/**
 *
 * @author sog
 * @version 1.0
 */
var moduleGrid, url = {
    list: g.ctx + 'supplier/list',
    del: g.ctx + 'supplier/del'
};

$(function () {
    
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: SupplierGrid.bind,
        height: 0,
        width: 0
    });
    
    $('#a_refresh').on('click', function(){
        SupplierGrid.reload();
    });
    $('#a_delete').on('click', function(){
    
        var selectedRow = SupplierGrid.getSelectedRow();
        if (selectedRow) {
            var row = SupplierGrid.getSelectedRows();
            if(row.length > 1){
                top.$.messager.alert('温馨提示', '请选择单条经销商，无法多选进行删除！', 'warning');
                return;
            }
            var rowId = selectedRow.id;
        
            layer.confirm('您确认要删除经销商数据么?', {
                icon: 3,
                title: '提示'
            }, function (idx) {
                layer.close(idx);
                $.ajaxjson(url.del, {"id": rowId}, function (rst) {
                    if (rst.status == 'OK') {
                        top.$.messager.alert('温馨提示', '删除经销商成功！', 'info');
                        SupplierGrid.reload();
                    } else {
                        top.$.messager.alert('温馨提示', '删除经销商失败！', 'warning');
                    }
                });
            });
        } else {
            top.$.messager.alert('温馨提示', '请选择你要删除的行！', 'warning');
        }
        return false;
    });
    
    $('#a_import_btn').on('click', function () {
        
        var importDialog = top.$.hDialog({
            href: g.ctx + 'static/views/supplier/import.html?v=' + Math.random(),
            title: '导入供应商车辆',
            iconCls: 'icon-tab_add',
            width: 350,
            height: 200,
            submit: function(){
    
                top.layer.alert('请先选择要导入的文件');
                return false;
            },
            onLoad: function () {
                
                top.$('#link_supplier_excel').attr('href', g.ctx + 'supplier/tpl');
                
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
                    server: g.ctx + 'supplier/imp',
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
                        SupplierGrid.reload();
                        top.$.messager.alert('温馨提示', '导入成功！', 'info');
                    } else {
                        MessageOrRedirect(response);
                    }
                    uploader.removeFile(file, true);
                });
                
                uploader.on('fileQueued', function () {
                    uploader.upload();
                });
                
                uploader.on('uploadError', function (file) {
                    top.$.messager.alert('温馨提示', '附件上传失败！', 'warning');
                    uploader.removeFile(file, true);
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

var SupplierGrid = {
    bind: function (winSize) {
        moduleGrid = $('#list').datagrid({
            toolbar: '#toolbar',
            url: url.list,
            nowrap: false,
            rownumbers: true,
            loadMsg: '正在努力加载中....',
            resizable: true,
            collapsible: false,
            singleSelect: true, //单选
            width: winSize.width,
            height: winSize.height,
            // onContextMenu: pageContextMenu.createTreeGridContextMenu,
            idField: 'id',
            border: false,
            selectOnCheck: true,
            checkOnSelect: true,
            columns: [[{
                title: '供应商编码',
                field: 'code',
                width: 140
            }, {
                title: '供应商名称',
                field: 'name',
                width: 220
            }, {
                title: '主键',
                field: 'id',
                hidden: true
            },{
                title: '车牌号',
                field: 'car_no',
                width: 320
            }, {
                title: '创建时间',
                field: 'create_time',
                width: 160
            },{
                title: '创建人',
                field: 'createName',
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


