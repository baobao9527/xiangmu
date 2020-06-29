package com.mo008.crdm.controllers;

import com.google.common.collect.Lists;
import com.google.common.io.Files;

import com.jfinal.kit.PathKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.upload.UploadFile;
import com.mo008.crdm.models.supplier.Supplier;
import com.mo008.crdm.models.supplier.SupplierCar;
import com.mo008.crdm.models.sys.Role;
import com.mo008.dtos.SupplierCarExcelDto;
import com.mo008.services.UserService;
import com.xiaoleilu.hutool.date.DateUtil;
import com.xiaoleilu.hutool.io.FileUtil;
import com.xiaoleilu.hutool.io.IoUtil;
import com.xiaoleilu.hutool.util.CollectionUtil;
import com.xiaoleilu.hutool.util.StrUtil;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.jeecgframework.poi.excel.ExcelExportUtil;
import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import goja.core.StringPool;
import goja.core.date.DateFormatter;
import goja.mvc.Controller;
import goja.security.shiro.Securitys;

import static java.util.stream.Collectors.groupingBy;

/**
 * <p> 供应商管理 </p>
 *
 * <pre> Created: 2018-05-19 16:31  </pre>
 * <pre> Project: CarExhausAdmin  </pre>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.7
 */
public class SupplierController extends Controller {
    /**
     * SupplierController's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(SupplierController.class);

    /**
     * The index route.
     */
    public void index() {
    }

    public void list() {
        final List<Object> params = Lists.newArrayList();
        if (Securitys.isRole(Role.SUPER_ADMIN)) {
            // 平台管理员 可以查看所有的供应商数据
            renderEasyUIDataGrid("supplier.admin");
        } else {
            // 只能看到自己的创建的供应商数据
            params.add(UserService.getInstance().userId());
            renderEasyUIDataGrid("supplier.user", params);
        }
    }

    /**
     * 模板
     */
    public void tpl() {

        final String filePath = StrUtil.indexedFormat("{0}{1}static{1}views{1}supplier{1}供应商车辆.xls", PathKit.getWebRootPath(), File.separator);
        if (!FileUtil.exist(filePath)) {

            final ExportParams params = new ExportParams("供应商车辆信息表", "供应商车辆");
            Workbook workbook = ExcelExportUtil.exportExcel(params,
                    SupplierCarExcelDto.class, Collections.emptyList());
            FileOutputStream fileOut = null;
            try {
                fileOut = new FileOutputStream(new File(filePath));
                workbook.write(fileOut);
            } catch (IOException e) {
                LOGGER.error("生成模板失败!", e);
            } finally {
                IoUtil.close(fileOut);
            }
        }


        renderFile(new File(filePath));
    }


    public void imp() {
        final UploadFile uploadFile = getFile();
        // 处理逻辑
        final String fileExtension = Files.getFileExtension(uploadFile.getFileName());
        if (!StringUtils.equals(fileExtension, "xls") && !StringUtils.equals(fileExtension, "xlsx")) {
            renderAjaxFailure("请上传Excel文件,具体格式请下载模板进行查阅!");
            return;
        }

        File impFile = uploadFile.getFile();
        try {
            final int userId = UserService.getInstance().userId();
            final ImportParams params = new ImportParams();
            params.setTitleRows(1);
            params.setStartRows(2);
            final List<SupplierCarExcelDto> supplierCars;
            supplierCars = ExcelImportUtil.importExcel(impFile, SupplierCarExcelDto.class, params);
            if (CollectionUtil.isEmpty(supplierCars)) {
                renderAjaxFailure("Excel数据为空，请检查");
                return;
            }

            for (int i = 0; i < supplierCars.size(); i++) {
                final SupplierCarExcelDto supplierCar = supplierCars.get(i);
                final String supplierName = supplierCar.getName();
                final String carNo = supplierCar.getCarNo();
                if (StringUtils.isEmpty(supplierName)) {
                    renderAjaxFailure(StrUtil.format("Excel中第{}行经销商名称为空!", i + 2));
                    return;
                }

                if (StringUtils.isEmpty(carNo)) {
                    renderAjaxFailure(StrUtil.format("Excel中第{}行车牌号为空!", i + 2));
                    return;
                }

                Supplier existSupplier = Supplier.dao.findByCarNo(carNo);
                if (existSupplier != null) {
                    renderAjaxFailure(StrUtil.format("Excel中车牌号{}已被其他经销商关联，请检查!", carNo));
                    return;
                }
            }

            final Map<String, List<SupplierCarExcelDto>> nameGroupSupplierCars;
            nameGroupSupplierCars = supplierCars.stream()
                    .collect(groupingBy(SupplierCarExcelDto::getName));

            List<Supplier> suppliers = Lists.newArrayList();
            for (String supplierName : nameGroupSupplierCars.keySet()) {

                String code = RandomStringUtils.randomNumeric(4)
                        + DateUtil.format(DateUtil.date(), DateFormatter.YYYYMMDD)
                        + RandomStringUtils.randomNumeric(4);
                Supplier supplier = new Supplier();
                supplier.setCode(code);
                supplier.setCreater(userId);
                supplier.setCreateTime(DateUtil.date());
                supplier.setName(supplierName);

                final List<SupplierCarExcelDto> carExcels = nameGroupSupplierCars.get(supplierName);

                final List<SupplierCar> supplierCarsList = Lists.newArrayList();
//                List<String> cars = Lists.newArrayList();
                for (SupplierCarExcelDto carExcel : carExcels) {
                    final String carNo = carExcel.getCarNo();

                    SupplierCar supplierCarDb = new SupplierCar();
                    supplierCarDb.setCarNo(carNo);
                    supplierCarDb.setCreater(userId);
                    supplierCarDb.setCreateTime(DateUtil.date());
                    supplierCarsList.add(supplierCarDb);
//                    cars.add(carNo);
                }
                supplier.put("_car_list", supplierCarsList);
//                supplier.setCars(StrUtil.join(StringPool.COMMA, cars));

                suppliers.add(supplier);
            }

            Db.tx(() -> {
                for (Supplier supplier : suppliers) {
                    final List<SupplierCar> supplierCarList = supplier.get("_car_list");

                    final boolean status = supplier.save();
                    if (status && CollectionUtil.isNotEmpty(supplierCarList)) {
                        final Integer supplierId = supplier.getId();
                        for (SupplierCar supplierCar : supplierCarList) {
                            supplierCar.setSupplierId(supplierId);
                        }
                        Db.batchSave(supplierCarList, 300);
                    }
                }
                return true;
            });
        } finally {
            FileUtil.del(impFile);
        }
        renderAjaxSuccess();
    }

    /**
     * 删除供应商
     */
    public void del() {
        final int supplierCarId = getParaToInt("id", 0);
        if (supplierCarId <= 0) {
            renderAjaxFailure("参数错误，请联系管理员");
            return;
        }
        final SupplierCar supplierCar = SupplierCar.dao.findById(supplierCarId);
        if(supplierCar == null){
            renderAjaxFailure("供应商车辆无法找到，请稍后重试！");
            return;
        }
        final Integer supplierId = supplierCar.getSupplierId();

        final boolean tx = Db.tx(() -> {
            supplierCar.delete();
            int cars =   Supplier.dao.countBySpplierId(supplierId);
            if (cars <= 0) {
                return Supplier.dao.deleteById(supplierId);
            }
            return true;
        });
        if (tx) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }

}
