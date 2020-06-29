/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package app.models.sys;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.plugin.redis.RedisPlugin;
import com.mo008.Constants;
import com.mo008.services.HistoryDataService;
import goja.Goja;
import goja.test.ModelTestCase;
import org.apache.commons.io.FileUtils;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.util.IOUtils;
import org.joda.time.DateTime;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class DataTest extends ModelTestCase {

    private static final Logger logger = LoggerFactory.getLogger(DataTest.class);

    @Test
    public void testDoData() throws Exception {

        RedisPlugin redisPlugin = new RedisPlugin("main", "127.0.0.1");
        redisPlugin.start();
        String data = "{\"afterDPF\": 230,\"avgEngineSpeed\": 0,\"curOn\": 0,\"deviceId\": \"2016032610506\",\"engineLoad\": 0,\"latitude\": 30.40498,\"longitude\": 117.33515,\"mileage\": 23768,\"nox\": 0,\"noxDeep\": 0,\"obd\": 0,\"pressure\": 0,\"proDPF\": 270,\"speed\": 0,\"torque\": 0}";

        Redis.use().getJedis().lpush("device:mq:datas", data);
    }

    @Test
    public void testDate() {

        DateTime date = DateTime.now().millisOfDay().withMinimumValue();
        Date startDate = date.toDate();
        Date endDate = date.plusDays(1).toDate();
        System.out.println("startDate:" + startDate + ",endDate:" + endDate);
    }

    @Test
    public void testDateTime() {
        DateTime date = new DateTime(2015, 3, 1, 10, 10);
        DateTime oneYearAgo = date.minusYears(3);
        SimpleDateFormat format = new SimpleDateFormat("YYYY-MM-dd");
        System.out.println(String.format("date:" + format.format(date.toDate()) + ",oneYearAge:" + format.format
                (oneYearAgo.toDate())));
        Date d = new Date();
        DateTime d2 = new DateTime(d);
        System.out.println("d:" + format.format(d2.toDate()));
        logger.debug("-----------------");
    }

    @Test
    public void testFile() {
        String configDir = Goja.configuration.getProperty("mysql.backup.dir");
        System.out.println(configDir);
        try {
            FileUtils.forceMkdir(new File(configDir));
        } catch (IOException e) {
            return;
        }
        DateTime date = new DateTime("2015-03-01");
        Integer year = date.getYear();
        SimpleDateFormat format = new SimpleDateFormat("YYYY-MM-dd");
        String filename = format.format(date.toDate()) + ".csv";
        //Path path = Paths.get(configDir,year.toString(),filename);
        File csv = new File(configDir + File.separator + year.toString() + File.separator + filename);
        if (csv.exists()) {
            try {
                FileUtils.forceDelete(csv);
            } catch (IOException e) {
            }
        }
    }

    @Test
    public void testExportData() {
        HistoryDataService service = HistoryDataService.getInstance();
        try {
            service.exportDataToCsv(new DateTime("2017-01-01"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testProcessHistoryData() {
        HistoryDataService service = HistoryDataService.getInstance();
        service.processHistoryData(new DateTime("2017-01-01"));
    }

    @Test
    public void testOtherDb() {
        String name = Db.queryStr("select name from mo_area limit 1");
        System.out.println("-------- the name is :" + name);
    }

    @Test
    public void testFileName() {
        File file = new File("/Users/yaolei.royal/Program/qq.txt");
        System.out.println(file.getName());
        System.out.println(file.getAbsolutePath().replaceAll("/Users/yaolei.royal", ""));
    }

    @Test
    public void testExportImg() {
        FileOutputStream fileOut = null;
        BufferedImage bufferImg = null;
        //先把读进来的图片放到一个ByteArrayOutputStream中，以便产生ByteArray
        try {
            ByteArrayOutputStream byteArrayOut = new ByteArrayOutputStream();
            bufferImg = ImageIO.read(new File("/Users/yaoleiroyal/Program/test.jpg"));
            ImageIO.write(bufferImg, "jpg", byteArrayOut);

            HSSFWorkbook wb = new HSSFWorkbook();
            HSSFSheet sheet1 = wb.createSheet("test picture");
            //画图的顶级管理器，一个sheet只能获取一个（一定要注意这点）
            HSSFPatriarch patriarch = sheet1.createDrawingPatriarch();
            //anchor主要用于设置图片的属性
            HSSFClientAnchor anchor = new HSSFClientAnchor(0, 0, 255, 255, (short) 1, 1, (short) 5, 12);
            anchor.setAnchorType(3);
            //插入图片
            patriarch.createPicture(anchor, wb.addPicture(byteArrayOut.toByteArray(), HSSFWorkbook.PICTURE_TYPE_JPEG));
            fileOut = new FileOutputStream("/Users/yaoleiroyal/Program/test.xls");
            // 写入excel文件
            wb.write(fileOut);
            System.out.println("----Excle文件已生成------");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (fileOut != null) {
                try {
                    fileOut.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Test
    public void testExportImg2() throws IOException {
        final int COL_WIDTH = 13000;
        final int ROW_HEIGHT = 5000;
        String name = "name";

        String remark = "remark";

        String period = "2013-01-01" + " ~ " + "2014-01-01";

        String memo = "memo";

        HSSFWorkbook wb = new HSSFWorkbook();
        HSSFSheet sheet = wb.createSheet("sheet");

        for (int i = 0; i < 4; i++) {
            sheet.setColumnWidth(i, 5000);
        }
        sheet.setColumnWidth(3, COL_WIDTH);

        //header style
        Font headerFont = wb.createFont();
        headerFont.setBoldweight((short) 700);
        CellStyle headerStyle = wb.createCellStyle();
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(CellStyle.ALIGN_CENTER);
        headerStyle.setBorderBottom(CellStyle.BORDER_THIN);
        headerStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        headerStyle.setBorderLeft(CellStyle.BORDER_THIN);
        headerStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        headerStyle.setBorderRight(CellStyle.BORDER_THIN);
        headerStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
        headerStyle.setBorderTop(CellStyle.BORDER_THIN);
        headerStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());

        //th style
        Font thFont = wb.createFont();
        thFont.setBoldweight((short) 700);
        CellStyle thStyle = wb.createCellStyle();
        thStyle.setFont(headerFont);
        thStyle.setAlignment(CellStyle.ALIGN_LEFT);
        thStyle.setBorderBottom(CellStyle.BORDER_THIN);
        thStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        thStyle.setBorderLeft(CellStyle.BORDER_THIN);
        thStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        thStyle.setBorderRight(CellStyle.BORDER_THIN);
        thStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
        thStyle.setBorderTop(CellStyle.BORDER_THIN);
        thStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());

        //td style
        CellStyle tdStyle = wb.createCellStyle();
        tdStyle.setAlignment(CellStyle.ALIGN_LEFT);
        tdStyle.setBorderBottom(CellStyle.BORDER_THIN);
        tdStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        tdStyle.setBorderLeft(CellStyle.BORDER_THIN);
        tdStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        tdStyle.setBorderRight(CellStyle.BORDER_THIN);
        tdStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
        tdStyle.setBorderTop(CellStyle.BORDER_THIN);
        tdStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());

        LinkedHashMap<String, String> voucherInfoMap = new LinkedHashMap<String, String>();
        voucherInfoMap.put("优惠券名称", name);
        voucherInfoMap.put("优惠券描述", remark);
        voucherInfoMap.put("有效期 ", period);
        voucherInfoMap.put("使用说明", memo);

        //1.头部优惠券信息
        int rowCount = 0;
        for (Map.Entry<String, String> entry : voucherInfoMap.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            Row row = sheet.createRow(rowCount);

            Cell cell0 = row.createCell(0);
            cell0.setCellValue(key);
            cell0.setCellStyle(headerStyle);

            Cell cell1 = row.createCell(1);
            cell1.setCellValue(value);
            cell1.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowCount, rowCount, 1, 3));

            row.createCell(2).setCellStyle(headerStyle);
            row.createCell(3).setCellStyle(headerStyle);

            rowCount++;
        }
        //2.列表头部
        List<String> thNames = new ArrayList<String>();
        thNames.add("序号");
        thNames.add("门店");
        thNames.add("门店名称");
        thNames.add("二维码");

        Row row = sheet.createRow(rowCount);
        int thCellCount = 0;
        for (String thName : thNames) {
            Cell cell = row.createCell(thCellCount);
            cell.setCellValue(thName);
            cell.setCellStyle(thStyle);
            thCellCount++;
        }
        rowCount++;

        //3.列表内容
        row = sheet.createRow(rowCount);

        row.setHeight((short) ROW_HEIGHT);


        CreationHelper helper = wb.getCreationHelper();
        Drawing drawing = sheet.createDrawingPatriarch();
        ClientAnchor anchor = helper.createClientAnchor();
        int pictureIdx = wb.addPicture(IOUtils.toByteArray(new FileInputStream(
                "/Users/yaoleiroyal/Program/test.jpg")), Workbook.PICTURE_TYPE_PNG);//一个300*300的图片

        anchor.setRow1(5);
        anchor.setCol1(3);
        anchor.setDx1(getAnchorX(5, COL_WIDTH));
        anchor.setDy1(getAnchorY(5, ROW_HEIGHT));

        anchor.setRow2(5);
        anchor.setCol2(3);
        anchor.setDx2(getAnchorX(305, COL_WIDTH));
        anchor.setDy2(getAnchorY(305, ROW_HEIGHT));

        drawing.createPicture(anchor, pictureIdx);

        // Write the output to a file
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        wb.write(bos);
        byte[] bytes = bos.toByteArray();
        IOUtils.copy(new ByteArrayInputStream(bytes), new FileOutputStream("/Users/yaoleiroyal/Program/test2.xlsx"));
    }

    private static int getAnchorX(int px, int colWidth) {
        return (int) Math.round(((double) 701 * 16000.0 / 301) * ((double) 1 / colWidth) * px);
    }

    private static int getAnchorY(int px, int rowHeight) {
        return (int) Math.round(((double) 144 * 8000 / 301) * ((double) 1 / rowHeight) * px);
    }

    private static int getRowHeight(int px) {
        return (int) Math.round(((double) 4480 / 300) * px);
    }

    private static int getColWidth(int px) {
        return (int) Math.round(((double) 10971 / 300) * px);
    }
}
