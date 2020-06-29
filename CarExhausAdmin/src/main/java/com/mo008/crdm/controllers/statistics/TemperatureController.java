/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.statistics;

import com.google.common.base.MoreObjects;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.mo008.crdm.models.car.CarInfo;
import com.mo008.util.SubmeterKit;

import org.joda.time.DateTime;
import org.joda.time.Days;
import org.joda.time.Hours;
import org.joda.time.Minutes;
import org.joda.time.Months;
import org.joda.time.Years;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.List;
import java.util.Map;

import goja.core.date.DateFormatter;
import goja.core.sqlinxml.SqlKit;
import goja.mvc.Controller;

import static java.util.stream.Collectors.groupingBy;

/**
 * <p> </p>
 *
 * @author yaolei
 * @version 1.0
 * @since JDK 1.6
 */
public class TemperatureController extends Controller {

    /**
     * The index route.
     */
    public void index() {

    }

    public void data() {
        String carNo = getPara("carNo");
        String startDate = getPara("startDate");
        String endDate = getPara("endDate");

        if (Strings.isNullOrEmpty(startDate) || Strings.isNullOrEmpty(endDate)) {
            renderJson("");
            return;
        }

        CarInfo carInfo = CarInfo.dao.findByCarNo(carNo);
        if (carInfo == null) {
            renderJson("");
            return;
        }
        final long deviceId = MoreObjects.firstNonNull(carInfo.getDeviceId(), 0L);
        if (deviceId <= 0) {
            renderJson("");
            return;
        }

        final DateTimeFormatter ymdFormatter = DateTimeFormat.forPattern(DateFormatter.YYYY_MM_DD_HH_MM);
        final DateTime queryStartDate = DateTime.parse(startDate, ymdFormatter);
        final DateTime queryEndDate = DateTime.parse(endDate, ymdFormatter);

        if (Years.yearsBetween(queryStartDate, queryEndDate).getYears() > 1) {
            renderJson("");
            return;
        }

        String sqlCode;
        int queryType;
        if (Hours.hoursBetween(queryStartDate, queryEndDate).getHours() <= 2) {
            sqlCode = "deviceDataHistory.temperature.minutes";
            queryType = 1;
        } else if (Days.daysBetween(queryStartDate, queryEndDate).getDays() == 0) {
            sqlCode = "deviceDataHistory.temperature.hour";
            queryType = 2;
        } else if (Months.monthsBetween(queryStartDate, queryEndDate).getMonths() == 0) {
            sqlCode = "deviceDataHistory.temperature.day";
            queryType = 3;
        } else {
            sqlCode = "deviceDataHistory.temperature.month";
            queryType = 0;
        }


        List<Object> params = Lists.newArrayList();
        params.add(deviceId);

        params.add(queryStartDate.toDate());
        params.add(queryEndDate.toDate());

        String sqlStr = SubmeterKit.converDataHistoryTable(SqlKit.sql(sqlCode), queryStartDate.getYear());
        List<Record> list = Db.find(sqlStr, params.toArray());

        final Map<String, List<Record>> dateGroupBys = list.stream().collect(groupingBy(e -> e.getStr("xdate")));

        switch (queryType) {
            case 1: {

                final int minutes = Minutes.minutesBetween(queryStartDate, queryEndDate).getMinutes();
                for (int i = 0; i <= minutes; i++) {
                    final String dateStr = queryStartDate.plusMinutes(i).toString("HH:mm");
                    checkAddSupplement(list, dateGroupBys, dateStr);
                }
                break;
            }
            case 2: {
                final int hours = Hours.hoursBetween(queryStartDate, queryEndDate).getHours();
                for (int i = 0; i <= hours; i++) {
                    final String dateStr = queryStartDate.plusHours(i).toString("HH");
                    checkAddSupplement(list, dateGroupBys, dateStr);
                }
                break;
            }
            case 3: {
                final int days = Days.daysBetween(queryStartDate, queryEndDate).getDays();
                for (int i = 0; i <= days; i++) {
                    final String dateStr = queryStartDate.plusDays(i).toString("MM-dd");
                    checkAddSupplement(list, dateGroupBys, dateStr);
                }
                break;
            }
            default:

                final int months = Months.monthsBetween(queryStartDate, queryEndDate).getMonths();
                for (int i = 0; i <= months; i++) {
                    final String dateStr = queryStartDate.plusMonths(i).toString("yyyy-MM");
                    checkAddSupplement(list, dateGroupBys, dateStr);
                }
                break;
        }
        renderJson(list);
    }

    private static void checkAddSupplement(List<Record> list, Map<String, List<Record>> dateGroupBys, String dateStr) {
        if (!dateGroupBys.containsKey(dateStr)) {
            Record record = new Record();
            record.set("xdate", dateStr);
            record.set("dpf_before_pressure", 0);
            record.set("dpf_after_pressure", 0);
            record.set("pressure", 0);
            record.set("dpf_before_temperature", 0);
            record.set("dpf_arter_temperature", 0);
            record.set("doc_before_temperature", 0);
            list.add(record);
        }
    }
}