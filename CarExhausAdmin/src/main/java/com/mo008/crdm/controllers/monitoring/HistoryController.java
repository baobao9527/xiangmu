/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.monitoring;

import com.google.common.base.MoreObjects;
import com.google.common.base.Optional;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.mo008.crdm.models.car.CarInfo;
import com.mo008.crdm.models.sys.Dict;
import com.mo008.crdm.models.sys.User;
import com.mo008.services.UserService;
import com.mo008.util.SubmeterKit;
import com.xiaoleilu.hutool.date.DatePattern;
import com.xiaoleilu.hutool.date.DateUtil;
import com.xiaoleilu.hutool.util.CollectionUtil;
import com.xiaoleilu.hutool.util.StrUtil;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Triple;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.joda.time.DateTime;
import org.joda.time.Months;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import goja.core.StringPool;
import goja.core.date.DateFormatter;
import goja.core.db.Condition;
import goja.core.sqlinxml.SqlKit;
import goja.core.sqlinxml.node.SqlNode;
import goja.mvc.Controller;
import goja.rapid.mvc.datatables.DTDao;
import goja.rapid.mvc.easyui.EuiDataGrid;
import goja.rapid.mvc.easyui.req.DataGridReq;
import goja.rapid.mvc.easyui.rsp.DataGridRsp;

/**
 * <p> </p>
 *
 * @author BOGON
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.6
 */
public class HistoryController extends Controller {

    private static final int    MAX_COUNT = 10000;
    /**
     * HistoryController's Logger
     */
    private static final Logger LOGGER    = LoggerFactory.getLogger(HistoryController.class);

    /**
     * 列数据信息单元格样式
     *
     * @param workbook excel对象
     * @return 单元格样式
     */
    public static XSSFCellStyle getStyle(XSSFWorkbook workbook) {
        // 设置字体
        XSSFFont font = workbook.createFont();
        //设置字体名字
        font.setFontName("Courier New");
        //设置样式;
        XSSFCellStyle style = workbook.createCellStyle();
        //设置底边框;
        style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        //设置底边框颜色;
        style.setBottomBorderColor(IndexedColors.BLACK.index);
        //设置左边框;
        style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        //设置左边框颜色;
        style.setLeftBorderColor(IndexedColors.BLACK.index);
        //设置右边框;
        style.setBorderRight(XSSFCellStyle.BORDER_THIN);
        //设置右边框颜色;
        style.setRightBorderColor(IndexedColors.BLACK.index);
        //设置顶边框;
        style.setBorderTop(XSSFCellStyle.BORDER_THIN);
        //设置顶边框颜色;
        style.setTopBorderColor(IndexedColors.BLACK.index);
        //在样式用应用设置的字体;
        style.setFont(font);
        //设置自动换行;
        style.setWrapText(false);
        //设置水平对齐的样式为居中对齐;
        style.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        //设置垂直对齐的样式为居中对齐;
        style.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);

        return style;

    }

    public void index() {

    }

    public void list() {
        String carNo = getPara("carNo");
        String carModel = getPara("carModel");
//        String driverCompany = getPara("driverCompany");
        String startDate = getPara("startDate");
        String endDate = getPara("endDate");
        String areaSn = getPara("areaSn");

        if (Strings.isNullOrEmpty(startDate) || Strings.isNullOrEmpty(endDate)) {
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }

        CarInfo carInfo = CarInfo.dao.findByCarNo(carNo);
        if (carInfo == null) {
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }
        final long deviceId = MoreObjects.firstNonNull(carInfo.getDeviceId(), 0L);
        if (deviceId <= 0) {
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }

        /*
         * 1:里程是否失效
         * 2:车速是否失效
         * 3:温度1℃是否失效
         * 4:温度2℃是否失效
         * 5:温度3℃是否失效
         * 6:温度4℃是否失效
         * 7:压差是否失效
         * 8:尿素温度是否失效
         * 9;尿素液位是否失效
         */
        int noQualified = getParaToInt("noQualified", 0);
        //使用拼接sql字符串的方式将查询数据放在easyui中显示
        final Optional<DataGridReq> reqOptional = EuiDataGrid.req(getRequest());
        if (reqOptional.isPresent()) {
            List<Object> params = Lists.newArrayList();
            params.add(deviceId);

            final DateTimeFormatter ymdFormatter = DateTimeFormat.forPattern(DateFormatter.YYYY_MM_DD);
            final DateTime queryStartDate = DateTime.parse(startDate, ymdFormatter).millisOfDay().withMinimumValue();
            final DateTime queryEndDate = DateTime.parse(endDate, ymdFormatter).millisOfDay().withMaximumValue();
            if (Months.monthsBetween(queryStartDate, queryEndDate).getMonths() > 1) {
                // 非常抱歉,只能查询1个月内的数据
                renderJson(EuiDataGrid.EMPTY_DATAGRID);
                return;
            }

            final int year = queryStartDate.getYear();


            params.add(queryStartDate.toDate());
            params.add(queryEndDate.toDate());

            DataGridReq req = reqOptional.get();
            int pageSize = req.rows;
            int page = req.page;
            //要查询的sql语句 组名+sql名
            SqlNode sql = SqlKit.sqlNode("deviceDataHistory.easyui.datagrid");
            final List<Triple<String, Condition, Object>> customParams = req.params;
            StringBuilder where = DTDao.appendWhereSql(params, sql, customParams);


            if (!Strings.isNullOrEmpty(carModel)) {
                where.append(" AND mci.car_flag = ? ");
                params.add(carModel);
            }
            boolean qualifiedParam = qualifiedSql(noQualified, where);
            if (qualifiedParam) {
                params.add(true);
            }

            if (!Strings.isNullOrEmpty(areaSn)) {
                where.append(" AND mci.area_sn = ?");
                params.add(areaSn);
            }
            final boolean userTypeParams = userTypeParams(params, where);
            if (!userTypeParams) {
                renderJson(EuiDataGrid.EMPTY_DATAGRID);
                return;
            }
            String whereSql = SubmeterKit.converDataHistoryTable(where.toString(), year);
            //组装拼接的子串
            final Page<Record> paginate = Db.paginate(page,
                    pageSize,
                    "SELECT t. * ",
                    " FROM (" + sql.selectSql + whereSql + ") t ORDER BY report_time DESC",
                    params.toArray());
            DataGridRsp.Builder builder = new DataGridRsp.Builder();
            builder.rows(paginate.getList()).total(paginate.getTotalRow());


            List<Record> list = paginate.getList();
            if (list != null && list.size() > 0) {
                List<Long> gpsids = new ArrayList<>();
                for (Record record : list) {
                    gpsids.add(record.getLong("gps_id"));
                }

                final String questionMark =
                        StringUtils.repeat(StringPool.QUESTION_MARK, StringPool.COMMA, gpsids.size());
                List<Record> gpss = Db.find("select id,baidu_latitude,baidu_longitude from " +
                        SubmeterKit.submeterGpsTableName(year) +
                        " where id in " +
                        "(" + questionMark + ")", gpsids.toArray());
                for (Record record : list) {
                    if (CollectionUtil.isNotEmpty(gpss)) {
                        for (Record gps : gpss) {
                            if (gps.getLong("id").equals(record.getLong("gps_id"))) {
                                record.set("baidu_latitude", gps.getDouble("baidu_latitude"));
                                record.set("baidu_longitude", gps.getDouble("baidu_longitude"));
                                break;
                            }
                        }
                    }
                }
            }

            renderJson(builder.build());
        }
    }

    /**
     * 把查询结果导出excel
     */
    public void export() {
        String carNo = getPara("carNo");
        String carModel = getPara("carModel");
        String startDate = getPara("startDate");
        String endDate = getPara("endDate");
        String areaSn = getPara("areaSn");

        if (Strings.isNullOrEmpty(startDate) || Strings.isNullOrEmpty(endDate)) {
            return;
        }

        CarInfo carInfo = CarInfo.dao.findByCarNo(carNo);
        if (carInfo == null) {
            return;
        }

        final long deviceId = MoreObjects.firstNonNull(carInfo.getDeviceId(), 0L);
        if (deviceId <= 0) {
            return;
        }

        int noQualified = getParaToInt("noQualified", 0);
        List<Object> params = Lists.newArrayList();
        params.add(deviceId);

        final DateTimeFormatter ymdFormatter = DateTimeFormat.forPattern(DateFormatter.YYYY_MM_DD);
        final DateTime queryStartDate = DateTime.parse(startDate, ymdFormatter).millisOfDay().withMinimumValue();
        final DateTime queryEndDate = DateTime.parse(endDate, ymdFormatter).millisOfDay().withMaximumValue();
        if (Months.monthsBetween(queryStartDate, queryEndDate).getMonths() > 1) {
            // 非常抱歉,只能查询1个月内的数据
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }


        params.add(queryStartDate.toDate());
        params.add(queryEndDate.toDate());
        //要查询的sql语句 组名+sql名
        SqlNode sql = SqlKit.sqlNode("deviceDataHistory.easyui.datagrid");
        StringBuilder where = new StringBuilder(sql.whereSql);


        if (!Strings.isNullOrEmpty(carModel)) {
            where.append(" AND mci.car_flag = ? ");
            params.add(carModel);
        }

        final boolean qualifiedParam = qualifiedSql(noQualified, where);
        if (qualifiedParam) {
            params.add(true);
        }


        if (!Strings.isNullOrEmpty(areaSn)) {
            where.append(" AND mci.area_sn = ?");
            params.add(areaSn);
        }
        final boolean userTypeParams = userTypeParams(params, where);
        if (!userTypeParams) {
            renderJson(EuiDataGrid.EMPTY_DATAGRID);
            return;
        }
        final int year = queryStartDate.getYear();
        String whereSql = SubmeterKit.converDataHistoryTable(where.toString(), year);

        Long count = Db.queryLong("select count(1) as value from (" + sql.selectSql +
                whereSql + ") t", params.toArray());
        if (count > MAX_COUNT) {
            return;
        }

        List<Record> list = Db.find("SELECT t. * FROM (" + sql.selectSql + whereSql
                + ") t ORDER BY report_time DESC", params.toArray());

        if (CollectionUtil.isNotEmpty(list)) {
            List<Long> gpsids = Lists.newArrayListWithCapacity(list.size());
            list.forEach(record1 -> gpsids.add(record1.getLong("gps_id")));

            final String questionMark =
                    StringUtils.repeat(StringPool.QUESTION_MARK, StringPool.COMMA, gpsids.size());

            final String gpsTableName = SubmeterKit.submeterGpsTableName(year);
            final String gpsSql = StrUtil.format("select id,baidu_latitude,baidu_longitude from {} where id in ({})", gpsTableName, questionMark);

            List<Record> gpss = Db.find(gpsSql, gpsids.toArray());

            for (Record record : list) {
                if (gpss != null && gpss.size() > 0) {
                    for (Record gps : gpss) {
                        if (gps.getLong("id").equals(record.getLong("gps_id"))) {
                            record.set("baidu_latitude", gps.getDouble("baidu_latitude"));
                            record.set("baidu_longitude", gps.getDouble("baidu_longitude"));
                            break;
                        }
                    }
                }
            }
        }

        XSSFWorkbook wb = writeExcel(list);
        HttpServletResponse response = getResponse();

        response.setHeader("Accept-Ranges", "bytes");
        response.setHeader("Content-disposition", "attachment; filename=" + this.encodeFileName());
        response.setContentType("application/octet-stream");
        OutputStream out = null;
        try {
            out = response.getOutputStream();
            wb.write(out);
            out.flush();
        } catch (IOException e) {
            LOGGER.error("导出数据发生错误", e);
        } finally {

            IOUtils.closeQuietly(out);

        }

    }

    private String encodeFileName() {
        try {
            return new String("车辆历史数据导出.xlsx".getBytes(StandardCharsets.UTF_8), "ISO8859-1");
        } catch (UnsupportedEncodingException var3) {
            return "车辆历史数据导出.xlsx";
        }
    }

    /**
     * 列头单元格样式
     */
    private static XSSFCellStyle getColumnTopStyle(XSSFWorkbook workbook) {

        // 设置字体
        XSSFFont font = workbook.createFont();
        //设置字体大小
        font.setFontHeightInPoints((short) 11);
        //字体加粗
        font.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);
        //设置字体名字
        font.setFontName("Courier New");
        //设置样式;
        XSSFCellStyle style = workbook.createCellStyle();
        //设置底边框;
        style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        //设置底边框颜色;
        style.setBottomBorderColor(IndexedColors.BLACK.index);
        //设置左边框;
        style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        //设置左边框颜色;
        style.setLeftBorderColor(IndexedColors.BLACK.index);
        //设置右边框;
        style.setBorderRight(XSSFCellStyle.BORDER_THIN);
        //设置右边框颜色;
        style.setRightBorderColor(IndexedColors.BLACK.index);
        //设置顶边框;
        style.setBorderTop(XSSFCellStyle.BORDER_THIN);
        //设置顶边框颜色;
        style.setTopBorderColor(IndexedColors.BLACK.index);
        //在样式用应用设置的字体;
        style.setFont(font);
        //设置自动换行;
        style.setWrapText(false);
        //设置水平对齐的样式为居中对齐;
        style.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        //设置垂直对齐的样式为居中对齐;
        style.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);

        return style;

    }

    /**
     * 列数据信息单元格样式 绿色
     *
     * @param workbook excel工作簿
     * @return 列数据信息单元格样式
     */
    private static XSSFCellStyle getstyleGreen(XSSFWorkbook workbook) {

        XSSFCellStyle style = getStyle(workbook);
        XSSFFont font = style.getFont();

        font.setColor(IndexedColors.GREEN.index);

        return style;

    }

    /**
     * 列数据信息单元格样式 红色
     *
     * @param workbook excel工作簿
     * @return 列数据信息单元格样式
     */
    private static XSSFCellStyle getstyleRed(XSSFWorkbook workbook) {

        XSSFCellStyle style = getStyle(workbook);
        XSSFFont font = style.getFont();

        font.setColor(IndexedColors.RED.index);

        return style;

    }

    /**
     * 列数据信息单元格样式 灰色
     *
     * @param workbook excel工作簿
     * @return 列数据信息单元格样式
     */
    private static XSSFCellStyle getstyleGrey(XSSFWorkbook workbook) {

        XSSFCellStyle style = getStyle(workbook);
        XSSFFont font = style.getFont();

        font.setColor(IndexedColors.GREY_80_PERCENT.index);

        return style;

    }

    /**
     * 将数据写入excel
     *
     * @param list 数据
     */
    private static XSSFWorkbook writeExcel(List<Record> list) {

        final List<Dict> deviceDataDicts = Dict.dao.findByCategory("DEVICE_DATA_MAP");
        Map<String, String> columns = new HashMap<String, String>(21) {
            private static final long serialVersionUID = 6528990551140335296L;

            {
                put("car_no", "车牌号码");
                put("car_no_color", "车牌颜色");
                put("car_framework_no", "车架号");
                put("report_time", "日期");

            }
        };

        List<String> colArr = Lists.newArrayList("car_no", "car_no_color", "car_framework_no", "report_time");
        deviceDataDicts.forEach(dict -> {
            columns.put(dict.getCode(), dict.getName());
            colArr.add(dict.getCode());
        });
        columns.put("car_flag", "车辆标识");
        columns.put("terminal", "生产厂商");
        columns.put("errorcode", "故障码");
        columns.put("baidu_longitude", "经度");
        columns.put("baidu_latitude", "纬度");

        colArr.add("car_flag");
        colArr.add("terminal");
        colArr.add("errorcode");
        colArr.add("baidu_longitude");
        colArr.add("baidu_latitude");

        Map<String, Map<String, String>> dicts = Dict.dao.findDicts();

        XSSFWorkbook wb = new XSSFWorkbook();
        XSSFSheet sheet = wb.createSheet();

        // 产生表格标题行
        XSSFRow rowm = sheet.createRow(0);
        XSSFCell cellTiltle = rowm.createCell(0);

        //sheet样式定义【getColumnTopStyle()/getStyle()均为自定义方法 - 在下面  - 可扩展】
        //获取列头样式对象
        XSSFCellStyle columnTopStyle = getColumnTopStyle(wb);
        //单元格样式对象
        XSSFCellStyle style = getStyle(wb);
        XSSFCellStyle styleGreen = getstyleGreen(wb);
        XSSFCellStyle styleRed = getstyleRed(wb);

        // 定义所需列数
        final int columnNum = colArr.size();
        sheet.addMergedRegion(new CellRangeAddress(0, 1, 0, (columnNum - 1)));
        cellTiltle.setCellStyle(columnTopStyle);
        cellTiltle.setCellValue("车辆历史数据导出");

        // 在索引2的位置创建行(最顶端的行开始的第二行)
        XSSFRow rowRowName = sheet.createRow(2);

        // 将列头设置到sheet的单元格中
        int c = 0;
        for (String key : colArr) {
            //创建列头对应个数的单元格
            XSSFCell cellRowName = rowRowName.createCell(c);
            //设置列头单元格的数据类型
            cellRowName.setCellType(XSSFCell.CELL_TYPE_STRING);
            XSSFRichTextString text = new XSSFRichTextString(columns.get(key));
            //设置列头单元格的值
            cellRowName.setCellValue(text);
            //设置列头单元格样式
            cellRowName.setCellStyle(columnTopStyle);
            c++;
        }

        //将查询出的数据设置到sheet对应的单元格中
        for (int i = 0; i < list.size(); i++) {
//遍历每个对象
            Record record = list.get(i);
            //创建所需的行数
            XSSFRow row = sheet.createRow(i + 3);

            for (int j = 0; j < columnNum; j++) {
                //设置单元格的数据类型
                XSSFCell cell;
                final String exportColumnName = colArr.get(j);
                Object o = record.get(exportColumnName);
                if (o == null) {
                    cell = row.createCell(j, XSSFCell.CELL_TYPE_BLANK);
                    cell.setCellStyle(style);
                } else if (o instanceof Date) {
                    cell = row.createCell(j, XSSFCell.CELL_TYPE_STRING);
                    cell.setCellValue(DateUtil.format((Date) o, DatePattern.NORM_DATETIME_FORMAT));
                    cell.setCellStyle(style);
                } else if (o instanceof Number) {
                    cell = row.createCell(j, XSSFCell.CELL_TYPE_NUMERIC);
                    if ("car_no_color".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(dicts.get("RHJYQO").get(o.toString()));
                        cell.setCellStyle(style);
                    } else if ("temperature_1".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer temperature1Flag = record.getInt("temperature_1_flag");
                        if (temperature1Flag != null && temperature1Flag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("temperature_2".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer temperature2Flag = record.getInt("temperature_2_flag");
                        if (temperature2Flag != null && temperature2Flag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("temperature_3".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer temperature3Flag = record.getInt("temperature_3_flag");
                        if (temperature3Flag != null && temperature3Flag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("temperature_4".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer temperature4Flag = record.getInt("temperature_4_flag");
                        if (temperature4Flag != null && temperature4Flag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("pressure".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer pressureFlag = record.getInt("pressure_flag");
                        if (pressureFlag != null && pressureFlag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("urea_temperature".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer ureaTemperatureFlag = record.getInt("urea_temperature_flag");
                        if (ureaTemperatureFlag != null && ureaTemperatureFlag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("urea_position".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer ureaPositionFlag = record.getInt("urea_position_flag");
                        if (ureaPositionFlag != null && ureaPositionFlag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("speed".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer flagSpeed = record.getInt("flag_speed");
                        if (flagSpeed != null && flagSpeed == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("after_km".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer flagMileage = record.getInt("flag_mileage");
                        if (flagMileage != null && flagMileage == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("pm_value".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer pmValueFlag = record.getInt("pm_value_flag");
                        if (pmValueFlag != null && pmValueFlag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("no_value".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        final Integer noValueFlag = record.getInt("no_value_flag");
                        if (noValueFlag != null && noValueFlag == 1) {
                            cell.setCellStyle(styleRed);
                        } else {
                            cell.setCellStyle(styleGreen);
                        }
                    } else if ("dpf_arter_temperature".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        cell.setCellStyle(styleGreen);
                    } else {
                        cell.setCellValue(Double.parseDouble(o.toString()));
                        cell.setCellStyle(style);
                    }
                } else {
                    cell = row.createCell(j, XSSFCell.CELL_TYPE_STRING);
                    if ("car_flag".equalsIgnoreCase(exportColumnName)) {
                        cell.setCellValue(dicts.get("YIIBFH").get(o.toString()));
                    } else {
                        cell.setCellValue(o.toString());
                    }
                    cell.setCellStyle(style);
                }
            }
        }
        //让列宽随着导出的列长自动适应
        for (int colNum = 0; colNum < columnNum; colNum++) {
            int columnWidth = sheet.getColumnWidth(colNum) / 256;
            for (int rowNum = 0; rowNum < sheet.getLastRowNum(); rowNum++) {
                XSSFRow currentRow;
                //当前行未被使用过
                if (sheet.getRow(rowNum) == null) {
                    currentRow = sheet.createRow(rowNum);
                } else {
                    currentRow = sheet.getRow(rowNum);
                }
                if (currentRow.getCell(colNum) != null) {
                    XSSFCell currentCell = currentRow.getCell(colNum);
                    if (currentCell.getCellType() == XSSFCell.CELL_TYPE_STRING) {
                        int length = currentCell.getStringCellValue().getBytes().length;
                        if (columnWidth < length) {
                            columnWidth = length;
                        }
                    }
                }
            }
            if (colNum == 0) {
                sheet.setColumnWidth(colNum, (columnWidth - 2) * 256);
            } else {
                sheet.setColumnWidth(colNum, (columnWidth + 4) * 256);
            }
        }

        return wb;
    }

    /**
     * 用户身份sql处理
     *
     * @param params 参数
     * @param where  where语句
     * @return 是否有身份，如果没有身份，则返回false
     */
    private static boolean userTypeParams(List<Object> params, StringBuilder where) {
        final int userType = UserService.getInstance().userType();
        switch (userType) {
            case User.Type.ADMIN:
                break;
            case User.Type.AGENTS: {
                where.append(" AND exists (select 1 from mo_car_permission mcp where mcp.car_id = mci.id and mcp.user_id = ?)");
                params.add(UserService.getInstance().userId());
                break;
            }
            case User.Type.NORMAL: {
                where.append(" AND mci.operator = ?");
                params.add(UserService.getInstance().userId());
                break;
            }
            default:
                return false;
        }
        return true;
    }

    private static boolean qualifiedSql(int noQualified, StringBuilder where) {
        boolean param = false;
        if (noQualified > 0) {

            switch (noQualified) {
                case 1:
                    where.append(" AND mddh.flag_mileage = ?");
                    param = true;
                    break;
                case 2:
                    where.append(" AND mddh.flag_speed = ?");
                    param = true;
                    break;
                case 3:
                    where.append(" AND mddh.temperature_1_flag = ?");
                    param = true;
                    break;
                case 4:
                    where.append(" AND mddh.temperature_2_flag = ?");
                    param = true;
                    break;
                case 5:
                    where.append(" AND mddh.temperature_3_flag = ?");
                    param = true;
                    break;
                case 6:
                    where.append(" AND mddh.temperature_4_flag = ?");
                    param = true;
                    break;
                case 7:
                    where.append(" AND mddh.pressure_flag = ?");
                    param = true;
                    break;
                case 8:
                    where.append(" AND mddh.urea_temperature_flag = ?");
                    param = true;
                    break;
                case 9:
                    where.append(" AND mddh.urea_position_flag = ?");
                    param = true;
                    break;
                default:
                    break;
            }
        }
        return param;
    }
}
