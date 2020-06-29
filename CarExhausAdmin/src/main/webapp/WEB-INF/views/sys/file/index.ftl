<@override name="view_title">用户中心</@override>
<@override name="view_body">

<#--<div id="toolbar" class="page_toolbar">
    <div class="searchArea">
        <a id="a_upload" class="l-btn l-btn-plain" style="float:left" plain="true" href="javascript:;"
           icon="icon-disk_upload" title="上传">
            <span class="l-btn-text icon-disk_upload l-btn-icon-left" style="padding-left: 18px;">上传</span>
        </a>
        <a id="a_create" class="l-btn l-btn-plain" style="float:left" plain="true" href="javascript:;"
           icon="icon-disk_upload" title="创建文件夹">
            <span class="l-btn-text icon-folder_add l-btn-icon-left" style="padding-left: 18px;">创建文件夹</span>
        </a>
        <div class="datagrid-btn-separator"></div>
        <span class="location">

        </span>
    </div>
</div>
<table id="list"></table>-->

<div class="easyui-layout" data-options="fit:true">
    <div data-options="region:'east',split:true,border:false" style="width:500px">
        <div id="preview">

        </div>
    </div>
    <div data-options="region:'center',border:false">
        <div id="toolbar" class="page_toolbar">
            <div class="searchArea">
                <a id="a_upload" class="l-btn l-btn-plain" style="float:left" plain="true" href="javascript:;"
                   icon="icon-disk_upload" title="上传">
                    <span class="l-btn-text icon-disk_upload l-btn-icon-left" style="padding-left: 18px;">上传</span>
                </a>
                <a id="a_create" class="l-btn l-btn-plain" style="float:left" plain="true" href="javascript:;"
                   icon="icon-disk_upload" title="创建文件夹">
                    <span class="l-btn-text icon-folder_add l-btn-icon-left" style="padding-left: 18px;">创建文件夹</span>
                </a>
                <div class="datagrid-btn-separator"></div>
                <span class="location">

        </span>
            </div>
        </div>
        <table id="list"></table>
    </div>
</div>

</@override>

<@override name="view_scripts">
<script type="text/javascript"
        src="${ctx}/static/js/plugins/moment.min.js"></script>
<script type="text/javascript"
        src="${ctx}/static/js/app/sys/file.js?_=${.now?string('yyyyMMddHHmmss')}"></script>
</@override>
<@extends name="/base/main.ftl"></@extends>