/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.device;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.io.Files;

import com.jfinal.aop.Before;
import com.jfinal.ext.interceptor.GET;
import com.jfinal.ext.interceptor.POST;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.upload.UploadFile;
import com.mo008.crdm.models.device.Device;
import com.mo008.crdm.models.device.DeviceAuthBatch;
import com.mo008.crdm.models.sys.Role;
import com.mo008.dtos.DeviceAuthEntity;
import com.mo008.services.RedisService;
import com.mo008.services.UserService;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.jeecgframework.poi.excel.ExcelExportUtil;
import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.joda.time.DateTime;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import goja.core.StringPool;
import goja.core.sqlinxml.SqlKit;
import goja.mvc.Controller;
import goja.security.shiro.Securitys;


/**
 * <p> 设备批次生成 </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class PartController extends Controller {

    /**
     * The index route.
     */
    public void index() {
    }

    public void list() {
        final List<Object> params = Lists.newArrayList();
        if (Securitys.isRole(Role.SUPER_ADMIN)) {
            // 平台管理员 可以查看所有的设备批次
            params.add(DeviceAuthBatch.Status.DELETE);
            renderEasyUIDataGrid("device.authbatch.admin");
        } else {
            // 只能看到自己的创建的设备批次
            params.add(UserService.getInstance().userId());
            params.add(DeviceAuthBatch.Status.DELETE);
            renderEasyUIDataGrid("device.authbatch", params);
        }
    }


    /**
     * 导入Excel,并生成授权鉴权码
     */
    public void inventor() {
        final UploadFile uploadFile = getFile();
        final String fileExtension = Files.getFileExtension(uploadFile.getFileName());
        if (!StringUtils.equals(fileExtension, "xls") && !StringUtils.equals(fileExtension, "xlsx")) {
            renderAjaxFailure("请上传Excel文件,具体格式为导出的Excel申请单!");

        } else {


            File file = uploadFile.getFile();
            try {
                final int userId = UserService.getInstance().userId();
                final ImportParams params = new ImportParams();
                params.setTitleRows(1);
                params.setStartRows(2);
                final List<DeviceAuthEntity> authEntities = ExcelImportUtil.importExcel(file, DeviceAuthEntity.class, params);
                final List<Device> devices = Lists.newArrayList();
                final DateTime now = DateTime.now();
                final Date dateline = now.toDate();

                final DeviceAuthBatch authBatch = new DeviceAuthBatch();
                authBatch.setStatus(DeviceAuthBatch.Status.GENERATE);
                authBatch.setDateline(dateline);
                authBatch.setCode(Files.getNameWithoutExtension(uploadFile.getOriginalFileName()));
                authBatch.setOperator(userId);
                authBatch.setDevices(authEntities.size());

                Device device;
                for (DeviceAuthEntity authEntity : authEntities) {
                    final String deviceId = authEntity.getDeviceId();
                    final Device byDeviceId = Device.dao.findByDeviceId(deviceId);
                    if (byDeviceId != null) {
                        renderAjaxFailure("设备号[" + authEntity.getDeviceId() + "]已经存在,无法导入,请重新整理后在进行导入");
                        return;
                    }
                    device = new Device();
                    device.setOperator(userId);
                    device.setDateline(dateline);
                    device.setDeviceCode(deviceId);
                    device.setDeviceModel(StringPool.EMPTY);
                    device.setAuthCode(RandomStringUtils.randomNumeric(3) + now.toString("MMddHHmmss") + RandomStringUtils.randomNumeric(3));
                    device.setStatus(true);
                    devices.add(device);
                }


                boolean dbExec = Db.tx(() -> {
                    if (authBatch.save()) {
                        for (Device device1 : devices) {
                            device1.setBatchId(authBatch.getId());
                        }
                        return Db.batch(SqlKit.sql("device.importDevices"), "batch_id, device_code, auth_code, device_model, operator, dateline, status", devices, 100).length >= 0;

                    }
                    return false;
                });
                if (dbExec) {
                    RedisService.getInstance().syncAuthCode();
                    renderAjaxSuccess();
                } else {
                    renderAjaxFailure("设备号导入生成鉴权信息出错!");
                }
            } catch (Exception e) {
                renderAjaxFailure("解析文件出错");
            } finally {
                FileUtils.deleteQuietly(file);
            }
        }


    }

    /**
     * 查看批次的设备
     */
    public void devices() {
        List<Object> params = Lists.newArrayList();
        params.add(getParaToInt("batch", 0));
        renderEasyUIDataGrid("device.auth", params);
    }


    public void view() {
        final Integer authBatchId = getParaToInt(0, 0);
        if (authBatchId == 0) {
            renderNull();
            return;
        }
        DeviceAuthBatch deviceAuthBatch = DeviceAuthBatch.dao.findInfoByUser(authBatchId);
        setAttr("authbatch", deviceAuthBatch);

    }


    @Before(POST.class)
    public void delete() {
        final String[] ids = getParaValues("id[]");

        boolean runStatus = DeviceAuthBatch.dao.changeByDeleteStatus(ids);
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("删除数据失败");
        }
    }

    @Before(GET.class)
    public void export() {
        int authbatchId = getParaToInt(0, 0);
        if (authbatchId == 0) {
            renderNull();
        } else {
            final DeviceAuthBatch authBatch = DeviceAuthBatch.dao.findById(authbatchId);
            List<Device> deviceList = Device.dao.findByBatchId(authbatchId);
            List<DeviceAuthEntity> dataList = Lists.transform(deviceList, new Function<Device, DeviceAuthEntity>() {
                @Override
                public DeviceAuthEntity apply(Device input) {
                    DeviceAuthEntity entity = new DeviceAuthEntity();
                    entity.setAuthCode(input.getAuthCode());
                    entity.setDeviceId(input.getDeviceCode());
                    entity.setId(input.getId());
                    return entity;
                }
            });
            final Workbook workbook = ExcelExportUtil.exportExcel(new ExportParams("设备鉴权信息", "设备列表"),
                    DeviceAuthEntity.class, dataList);

            ServletOutputStream outputStream = null;
            try {
                final HttpServletResponse response = getResponse();
                response.setContentType("application/ms-excel;charset=GBK");
                response.setHeader("Content-Disposition", "attachment;filename=" + DateTime.now().toString("yyyyMMddHHmmss") + ".xls");
                outputStream = response.getOutputStream();
                workbook.write(outputStream);
                outputStream.flush();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                IOUtils.closeQuietly(outputStream);
            }

            renderNull();
        }
    }
}