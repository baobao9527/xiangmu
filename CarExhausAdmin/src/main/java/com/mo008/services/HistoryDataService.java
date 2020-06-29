package com.mo008.services;

import com.jfinal.plugin.activerecord.Record;
import com.mo008.Constants;
import com.mo008.crdm.models.device.DeviceDataHistory;
import com.xiaoleilu.hutool.date.DatePattern;
import com.xiaoleilu.hutool.util.StrUtil;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.SystemUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import goja.Goja;

/**
 * @author yaoleiroyal
 * @version 1.0
 * @since jdk1.6
 */
public class HistoryDataService {

    private static final Logger logger = LoggerFactory.getLogger(HistoryDataService.class);

    private HistoryDataService() {

    }

    public static HistoryDataService getInstance() {
        return new HistoryDataService();
    }


    /**
     * 处理历史数据
     *
     * @param dealDate 日期
     */
    public void processHistoryData(DateTime dealDate) {

        DeviceDataHistory device = DeviceDataHistory.dao;

        // 1. dealDate，以及三年前的日期threeYearAgo
        if (dealDate == null) {
            dealDate = DateTime.now().millisOfDay().withMinimumValue();
        } else {
            dealDate = dealDate.millisOfDay().withMinimumValue();
        }
        DateTime threeYearAgo = dealDate.minusYears(3);

        // 3. 查询历史表，如果有比threeYearAgo还小的日期，循环，并逐天生成excel历史数据备份，逐天删除历史数据
        List<Date> dates = device.getDeleteDates(threeYearAgo);
        if (dates != null && dates.size() > 0) {
            DateTime dt;
            for (Date date : dates) {
                dt = new DateTime(date);

                try {
                    // 查询数据，并将数据导出到csv文件
                    exportDataToCsv(dt);
                } catch (IOException ex) {
                    continue;
                }

                // 最后一步，删除当天的数据
                final boolean historyDataDelState = device.deleteHistoryDataByDate(dt);
                if (!historyDataDelState) {
                    logger.error("删除 {} 数据失败 ", dt);
                }
            }
        }

        // 4. 如果数据库存在threeYearAgo前一年的数据库表，删除这张表，因为数据库只保留三年的数据库表
        DateTime truncateDate = threeYearAgo.minusYears(1);
        final boolean truncateState = device.truncateHistoryTable(truncateDate);
        if (!truncateState) {
            logger.error("删除{}年的历史数据表失败! ", truncateDate.getYear());
        }
    }

    /**
     * 备份历史某一天的数据
     *
     * @param dealDate 日期
     */
    public void processHistoryOneDay(DateTime dealDate) {

        if (dealDate == null) {
            return;
        }

        DeviceDataHistory device = DeviceDataHistory.dao;
        dealDate = DateTime.now().millisOfDay().withMinimumValue();
        try {
            // 查询数据，并将数据导出到csv文件
            exportDataToCsv(dealDate);
        } catch (IOException ex) {
            logger.error("导出 日期 {} 的 CSV 失败 ", dealDate, ex);
            return;
        }

        // 最后一步，删除当天的数据
        final boolean historyDataDelState = device.deleteHistoryDataByDate(dealDate);
        if (!historyDataDelState) {
            logger.error("删除 {} 数据失败 ", dealDate);
        }
    }

    /**
     * 查询数据，并将数据导出到csv文件
     *
     * @param dealDate 日期
     */
    public void exportDataToCsv(DateTime dealDate) throws IOException {

        logger.info("----------------数据处理开始！");
        Long startTime = DateTime.now().getMillis();
        DeviceDataHistory device = DeviceDataHistory.dao;

        String configDir = Goja.configuration.getProperty("mysql.backup.dir");
        Integer year = dealDate.getYear();

        //try {
        FileUtils.forceMkdir(new File(configDir + File.separator + year.toString()));


        // 查询device数据并导出
        exportdataHistory(dealDate, device, configDir, year);

        // 查询gps数据并导出
        exportdataGps(dealDate, device, configDir, year);
        //} catch (IOException e) {
        //    return;
        //}
        Long endTime = DateTime.now().getMillis();
        logger.info("----------------数据处理结束！用时：" + ((endTime - startTime) / 1000) + "秒");
    }

    /**
     * 导出历史数据，针对mo_device_data_history表
     *
     * @param dealDate  处理日期
     * @param device    dao类
     * @param configDir 文件保存根目录
     * @param year      年份
     * @throws IOException 文件异常
     */
    private void exportdataHistory(DateTime dealDate, DeviceDataHistory device, String configDir, Integer year) throws IOException {
        try {

            final String dayFileName = dealDate.toString(DatePattern.NORM_DATE_PATTERN);
            String filename = StrUtil.format("{}_{}.csv", dayFileName, Constants.DEVICE_DATA_HISTORY);
            File csv = new File(configDir + File.separator + year.toString() + File.separator + filename);
            if (csv.exists()) {
                FileUtils.forceDelete(csv);
            }
            if (!csv.exists()) {
                csv.createNewFile();
            }
            Writer writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(csv, true), StandardCharsets.UTF_8));

            List<String> columns = device.getHistoryColumns(dealDate);

            writer.write(StringUtils.join(columns, ',') + File.separator);

            Long startId = device.getHistoryFirstId(dealDate);
            if (startId != null) {
                boolean flag = true;
                List<Record> records;
                while (flag) {
                    records = device.getHistoryData(dealDate, StringUtils.join(columns.toArray(), ','), startId);
                    if (records == null || records.size() == 0) {
                        flag = false;
                        continue;
                    }

                    writeToCsv(writer, records, columns);

                    startId = records.get(records.size() - 1).getLong("id");
                }
            }

            writer.flush();
            writer.close();
        } catch (IOException ex) {
            logger.error("数据导出异常！", ex);
            throw ex;
        }
    }

    /**
     * 导出历史数据，针对mo_car_gps表
     *
     * @param dealDate  处理日期
     * @param device    dao类
     * @param configDir 文件保存根目录
     * @param year      年份
     * @throws IOException 文件异常
     */
    private void exportdataGps(DateTime dealDate, DeviceDataHistory device, String configDir, Integer year) throws IOException {

        final String dayFileName = dealDate.toString(DatePattern.NORM_DATE_PATTERN);
        String filename = StrUtil.format("{}_{}.csv", dayFileName, Constants.CAR_GPS_TABLE);
        File csv = new File(configDir + File.separator + year.toString() + File.separator + filename);
        if (csv.exists()) {
            FileUtils.forceDelete(csv);
        }
        if (!csv.exists()) {
            csv.createNewFile();
        }
        Writer writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(csv, true), StandardCharsets.UTF_8));

        List<String> columns = device.getGpsColumns(dealDate);

        writer.write(StringUtils.join(columns, ',') + SystemUtils.LINE_SEPARATOR);

        Long startId = device.getGpsFirstId(dealDate);
        logger.info("startId:" + startId);
        if (startId != null) {
            boolean flag = true;
            List<Record> records;
            while (flag) {
                records = device.getGpsData(dealDate, StringUtils.join(columns.toArray(), ','), startId);
                if (records == null || records.size() == 0) {
                    flag = false;
                    continue;
                }

                writeToCsv(writer, records, columns);

                startId = records.get(records.size() - 1).getLong("id");
                logger.info("startId:" + startId);
                /*if(startId > 2000){
                    break;
                }*/
            }
        }

        writer.flush();
        writer.close();
    }

    /**
     * 将数据循环写入文件
     *
     * @param writer  写入
     * @param records 记录信息
     * @param columns 行信息
     * @throws IOException 文件异常
     */
    private static void writeToCsv(Writer writer, List<Record> records, List<String> columns) throws IOException {

        Record record;
        StringBuilder sb = new StringBuilder();
        for (Record record1 : records) {
            record = record1;
            for (int j = 0; j < columns.size(); j++) {

                sb.append(record.getStr(columns.get(j).replaceAll("`", "")));

                if (j < columns.size() - 1) {
                    sb.append(',');
                }
            }
            sb.append(SystemUtils.LINE_SEPARATOR);
        }
        writer.write(sb.toString());
        writer.flush();
        sb.setLength(0);
    }
}
