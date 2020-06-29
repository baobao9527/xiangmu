package com.mo008.dtos;

import com.google.common.base.MoreObjects;

import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecgframework.poi.excel.annotation.ExcelTarget;

import java.io.Serializable;

/**
 * <p> </p>
 *
 * <pre> Created: 2018-05-19 16:45  </pre>
 * <pre> Project: CarExhausAdmin  </pre>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.7
 */
@ExcelTarget("supplierCarExcelDto")
public class SupplierCarExcelDto implements Serializable {
    private static final long serialVersionUID = 1759237157159304863L;


    /**
     * 供应商名称
     */
    @Excel(name = "供应商名称", orderNum = "1", width = 60)
    private String name;
    /**
     * 车牌号
     */
    @Excel(name = "车牌号", orderNum = "2", width = 120)
    private String carNo;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCarNo() {
        return carNo;
    }

    public void setCarNo(String carNo) {
        this.carNo = carNo;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("name", name)
                .add("carNo", carNo)
                .toString();
    }
}
