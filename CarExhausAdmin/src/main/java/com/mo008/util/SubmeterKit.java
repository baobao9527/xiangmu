package com.mo008.util;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.mo008.Constants;
import com.xiaoleilu.hutool.util.StrUtil;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import goja.core.StringPool;
import goja.core.sqlinxml.node.SqlNode;

/**
 * <p> 分表工具类 </p>
 *
 * <p> Created At 2018-02-03 17:14  </p>
 *
 * @author FitzYang
 * @version 1.0
 * @since JDK 1.8
 */
public class SubmeterKit {


    /**
     * 解析配置中是否有 gps和历史数据表 如果有进行分表sql处理
     *
     * @param sqlNode sql Node
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static SqlNode convertSqlNode(SqlNode sqlNode) {
        final int year = DateTime.now().getYear();
        String strSql = sqlNode.sql;
        String strWhreSql = sqlNode.whereSql;
        boolean submeter = false;
        if (StringUtils.contains(sqlNode.sql, Constants.CAR_GPS_TABLE)) {
            final String gpsTable = Constants.CAR_GPS_TABLE + StringPool.UNDERSCORE + year;
            strSql = StringUtils.replace(sqlNode.sql, Constants.CAR_GPS_TABLE, gpsTable);
            strWhreSql = StringUtils.replace(sqlNode.whereSql, Constants.CAR_GPS_TABLE, gpsTable);
            submeter = true;
        }

        if (StringUtils.contains(sqlNode.sql, Constants.DEVICE_DATA_HISTORY)) {
            final String dataHistoryTable = Constants.DEVICE_DATA_HISTORY + StringPool.UNDERSCORE + year;
            strSql = StringUtils.replace(sqlNode.sql, Constants.DEVICE_DATA_HISTORY, dataHistoryTable);
            strWhreSql = StringUtils.replace(sqlNode.whereSql, Constants.DEVICE_DATA_HISTORY, dataHistoryTable);
            submeter = true;
        }
        if (!submeter) {
            return sqlNode;
        }
        final String conditionSql = sqlNode.conditionSql;
        final String selectSql = sqlNode.selectSql;
        final boolean condition = sqlNode.condition;
        final boolean where = sqlNode.where;
        return new SqlNode(strSql, where, condition, conditionSql, selectSql, strWhreSql);
    }

    /**
     * 解析sql中是否有 gps 如果有进行分表sql处理
     *
     * @param sql sql Node
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static String converGpsTable(String sql) {
        final int year = DateTime.now().getYear();
        final String gpsYearTable = Constants.CAR_GPS_TABLE + StringPool.UNDERSCORE + year;
        return StringUtils.replace(sql, Constants.CAR_GPS_TABLE, gpsYearTable);
    }

    /**
     * 解析sql中是否有 历史数据表 如果有进行分表sql处理
     *
     * @param sql sql Node
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static String converDataHistoryTable(String sql) {
        final int year = DateTime.now().getYear();
        final String dataHistoryTable = Constants.DEVICE_DATA_HISTORY + StringPool.UNDERSCORE + year;
        return StringUtils.replace(sql, Constants.DEVICE_DATA_HISTORY, dataHistoryTable);
    }

    /**
     * 解析sql中是否有 gps 如果有进行分表sql处理
     *
     * @param sql  sql Node
     * @param year 指定年份
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static String converGpsTable(String sql, int year) {
        final String gpsYearTable = Constants.CAR_GPS_TABLE + StringPool.UNDERSCORE + year;
        return StringUtils.replace(sql, Constants.CAR_GPS_TABLE, gpsYearTable);
    }

    /**
     * 解析sql中是否有 gps 如果有进行分表sql处理
     *
     * @param sql  sql Node
     * @param year 指定年份
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static String converMinuteGpsTable(String sql, int year) {
        final String gpsYearTable = Constants.CAR_GPS_MINITE_TABLE + StringPool.UNDERSCORE + year;
        return StringUtils.replace(sql, Constants.CAR_GPS_MINITE_TABLE, gpsYearTable);
    }

    /**
     * 解析sql中是否有 历史数据表 如果有进行分表sql处理
     *
     * @param sql  sql Node
     * @param year 指定年份
     * @return 解析后的分表sql node，如果没有 则返回 输入的sqlNode
     */
    public static String converDataHistoryTable(String sql, int year) {
        final String dataHistoryTable = Constants.DEVICE_DATA_HISTORY + StringPool.UNDERSCORE + year;
        return StringUtils.replace(sql, Constants.DEVICE_DATA_HISTORY, dataHistoryTable);
    }

    /**
     * 生成指定年份 的 GPS表
     *
     * @param year 年份 （如果小于0 则采用当前年份）
     * @return 历史GPS数据表
     */
    public static String submeterGpsTableName(int year) {
        if (year <= 0) {
            year = DateTime.now().getYear();
        }
        return Constants.CAR_GPS_TABLE + StringPool.UNDERSCORE + year;
    }
    /**
     * 生成指定年份 的 GPS 分时 表
     *
     * @param year 年份 （如果小于0 则采用当前年份）
     * @return 历史GPS数据表
     */
    public static String submeterMinuteGpsTableName(int year) {
        if (year <= 0) {
            year = DateTime.now().getYear();
        }
        return Constants.CAR_GPS_MINITE_TABLE + StringPool.UNDERSCORE + year;
    }

    /**
     * 生成指定年份 的 历史数据表
     *
     * @param year 年份 （如果小于0 则采用当前年份）
     * @return 历史数据表
     */
    public static String submeterDataHistoryTableName(int year) {
        if (year <= 0) {
            year = DateTime.now().getYear();
        }
        return Constants.DEVICE_DATA_HISTORY + StringPool.UNDERSCORE + year;
    }

    /**
     * 判断指定数据库中是否有指定表
     *
     * @param dbSchema 数据库
     * @param gpsTable 数据库表名
     * @return ture 包含
     */
    public static boolean checkExistTable(String dbSchema, String gpsTable) {
        String checkTableSql = StrUtil.format("Select TABLE_NAME from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='{}' AND TABLE_NAME='{}'", dbSchema, gpsTable);

        final Record checkRecord = Db.findFirst(checkTableSql);
        if (checkRecord != null) {
            final String existTableName = checkRecord.getStr("TABLE_NAME");
            return StringUtils.isNotEmpty(existTableName);
        }
        return false;
    }
}
