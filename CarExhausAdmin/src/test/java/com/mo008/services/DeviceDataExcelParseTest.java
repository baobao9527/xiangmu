/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.services;

import goja.test.ModelTestCase;

import org.junit.Test;

import java.io.File;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class DeviceDataExcelParseTest extends ModelTestCase{
    @Test
    public void importDataByExcel() throws Exception {
        DeviceDataExcelParse.importDataByExcel(new File("/Users/sog/Downloads/上海车辆数据.xlsx"));
    }

}