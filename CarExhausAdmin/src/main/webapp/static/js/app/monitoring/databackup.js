/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

var _gridlist, url = {
    list: g.ctx + 'monitoring/databackup/list'
};

$(function () {
    autoResize({
        dataGrid: '#list',
        gridType: 'datagrid',
        callback: grid.bind,
        height: 0,
        width: 0
    });
    $('#a_refresh').attr('onclick', 'deviceData.refreash();');
    $('#a_search').attr('onclick', 'deviceData.searchData();');
});

var grid = {
    bind: function (winSize) {
        _gridlist = $('#list').datagrid({
            url: url.list,
            toolbar: '#toolbar',
            loadMsg: "正在加载数据，请稍等...",
            iconCls: 'icon icon-list',
            width: winSize.width,
            height: winSize.height,
            nowrap: false, //折行
            rownumbers: true, //行号
            striped: true, //隔行变色
            //idField: 'id',//主键
            singleSelect: false, //单选
            border: false,
            //onRowContextMenu: pageContextMenu.createDataGridContextMenu,
            columns: [[
                {
                    title: '文件名称',
                    field: 'filename',
                    width: 300,
                    formatter: function (v, r) {
                        if (r.dir == true) {
                            console.log('----- this is dir1');
                            return '<a href="javascript:crumb.refreash(\'' + r.directory + '\');"' +
                                ' style="color:#0043ff; text-decoration: underline;" >' + v + '</a>';
                        } else {
                            console.log('----- this is dir2');
                            return '<span>' + v + '</span>';
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
                            return '';
                        } else {
                            return '<a href="' + g.ctx + 'monitoring/databackup/download?path=' + r.directory + '"' +
                                ' style="color:#0043ff; text-decoration: underline;" >下载</a>';
                        }
                    }
                }
                ]],
            onLoadSuccess: function(data){
                console.log('---------数据加载成功！\n');
                crumb.directory = data.directory;
                crumb.curmbBar();
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
        var toolbar = $('.searchArea');
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
                //$('#a_refresh').attr('onclick', 'deviceData.refreash();');
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
        }).datagrid('reload');

        //$('#test').datagrid('options').queryParams=queryParams;
    }
}

var deviceData = {
    
    isEdit: false,
    
    currentActive: null,
    
    window: null,
    
    educationWindow: null,
    
    selectedRecord: null,
    
    searchData: function () {
        var carNo = $("#s_car_no").val();
        var carModel = $("#s_car_model").combobox("getValue");
        var driverCompany = $("#s_driver_company").val();
        var noQualified = $("#s_no_qualified").combobox("getValue");
        var startDate = $("#s_start_date").datebox("getValue");
        var endDate = $("#s_end_date").datebox("getValue");
        var areaProvince = $("#s_province").combobox("getValue");
        var areaCity = $("#s_city").combobox("getValue");
        var areaSn = areaCity ? areaCity : areaProvince;
        
        if (!carNo) {
            msg.warning('请输入车牌号!');
            return;
        }
        
        if (!startDate) {
            msg.warning('请选择开始日期');
            return;
        }
        
        if (!endDate) {
            msg.warning('请选择结束日期');
            return;
        }

        console.log('---startDate:' + startDate + ',endDate:' + endDate);
        
        var startMDate = moment(startDate, 'YYYY-M-D');
        var endMDate = moment(endDate, 'YYYY-M-D');

        console.log('---startMDate:' + startMDate + ',endMDate:' + endMDate);

        if (endMDate.diff(startMDate) < 0) {
            msg.warning('结束日期需要大于开始日期!');
            return;
        }
        
        if (endMDate.diff(startMDate, 'months') >= 1) {
            msg.warning('请查询1个月内的数据!');
            return;
        }

        if(endMDate._d.getFullYear() != startMDate._d.getFullYear()){
            msg.warning('请查询同一年度内的数据!');
            return;
        }

        var threeYearAgo = moment().subtract(3, 'years');
        console.log('---threeYearAge:' + threeYearAgo.format('YYYY-MM-DD'));
        if (threeYearAgo.diff(startMDate) >= 0) {
            msg.warning('请查询3年内的数据!');
            return;
        }
        
        $('#list').datagrid({
            url: url.list,
            queryParams: {
                'carNo': carNo,
                'carModel': carModel,
                'driverCompany': driverCompany,
                'noQualified': noQualified,
                'startDate': startDate,
                'endDate': endDate,
                'areaSn': areaSn
            }
        });
    },
    
    refreash: function () {
        grid.reload();
    }
};

//@ sourceURL=databackup.js