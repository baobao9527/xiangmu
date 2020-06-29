/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.statistics;

import com.jfinal.kit.PathKit;
import com.mo008.crdm.models.car.CarInfo;

import org.apache.commons.io.IOUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.imageio.ImageIO;

import goja.core.libs.Codec;
import goja.mvc.Controller;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
public class EnginetypeController extends Controller {

    private static String root;
    private static SimpleDateFormat format;

    static {

        root = PathKit.getWebRootPath() + File.separator + "upload";
        File file = new File(root);
        if (!file.exists()) {
            file.mkdir();
        }

        format = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    }

    /**
     * The index route.
     */
    public void index() {
    }

    public void data() {
        String areaCode = getPara("code");
        int type = getParaToInt("type", 2);
        List<CarInfo> carInfos = CarInfo.dao.findByDischarge(areaCode, type);
        renderJson(carInfos);
    }

    /**
     * echartsjs 图表导出
     */
    public void export() {
        String[] imgs = getParaValues("img");
        String filename = getPara("filename");

        List<File> files = new ArrayList<File>();
        File image;
        for (int i = 0; i < imgs.length; i++) {
            image = createImage(Integer.valueOf(i + 1).toString(), imgs[i]);
            files.add(image);
        }
        renderFile(createExcels(files, filename));

        /*File fImg1 = createImage("img1", img1);
        File fImg2 = createImage("img1", img2);
        File file = createExcels(new File[]{fImg1, fImg2});
        renderFile(file);*/
    }

    /**
     * 生成图片
     *
     * @param filename
     * @param data
     */
    private File createImage(String filename, String data) {

        String filepath = root + File.separator + format.format(new Date()) + "_" + filename + ".png";
        File file = new File(filepath);
        try {
            String[] url = data.split(",");
            String u = url[1];
            // Base64解码
            byte[] b = Codec.decodeBASE64(u);
            // 生成图片
            OutputStream out = new FileOutputStream(file);
            out.write(b);
            out.flush();
            out.close();

            return file;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 导出Excel
     *
     * @param files
     * @param filename
     * @return
     */
    private File createExcels(List<File> files, String filename) {

        File file;
        String filepath = root + File.separator + filename + "_" + format.format(new Date()) + ".xls";
        File newFile = new File(filepath);

        //File file = files[0];
        //String filepath = file.getAbsolutePath().replaceAll("png", "xls");
        FileOutputStream fileOut = null;
        BufferedImage bufferImg = null;
        //先把读进来的图片放到一个ByteArrayOutputStream中，以便产生ByteArray
        try {

            HSSFWorkbook wb = new HSSFWorkbook();
            HSSFSheet sheet1 = wb.createSheet("test picture");
            //画图的顶级管理器，一个sheet只能获取一个（一定要注意这点）
            HSSFPatriarch patriarch = sheet1.createDrawingPatriarch();
            HSSFClientAnchor anchor = null;

            HSSFRow row = sheet1.createRow(1);
            row.setHeightInPoints(30);
            HSSFCell cell = row.createCell(2);
            cell.setCellValue(filename);

            //header style
            Font headerFont = wb.createFont();
            //headerFont.setBoldweight((short) 700);
            headerFont.setFontHeightInPoints((short) 25);// 设置字体大小
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(headerFont);

            cell.setCellStyle(headerStyle);

            int xStep = 10;

            for (int i = 0; i < files.size(); i++) {
                file = files.get(i);

                ByteArrayOutputStream byteArrayOut = new ByteArrayOutputStream();
                bufferImg = ImageIO.read(file);
                ImageIO.write(bufferImg, "png", byteArrayOut);

                //anchor主要用于设置图片的属性
                anchor = new HSSFClientAnchor(0, 0, 255, 255,
                        (short) (1 + i * xStep + 1), 5, (short) (10 + i * xStep + 1), 26);
                anchor.setAnchorType(3);
                //插入图片
                patriarch.createPicture(anchor, wb.addPicture(byteArrayOut.toByteArray(), HSSFWorkbook.PICTURE_TYPE_JPEG));
            }
            fileOut = new FileOutputStream(newFile);
            // 写入excel文件
            wb.write(fileOut);
            return newFile;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            IOUtils.closeQuietly(fileOut);
        }
        return null;
    }
}