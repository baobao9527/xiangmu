package com.mo008.crdm.jobs;

import com.mo008.crdm.AppStartup;
import com.mo008.crdm.models.device.DeviceDataHistory;
import com.mo008.util.SubmeterKit;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import goja.core.annotation.On;
import goja.core.annotation.OnApplicationStart;
import goja.job.Job;

/**
 * <p> 定时任务创建 按年分表 </p>
 *
 * @author Dark.Yang
 * @version 1.0
 * @since JDK 1.7
 */
@On(value = "0 10 0 1 * ?")
@OnApplicationStart
public class SubmeterJob extends Job {

    /**
     * SubmeterJob's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(SubmeterJob.class);

    @Override
    public void doJob() throws Exception {
        super.doJob();

        DateTime now = DateTime.now();
        final int year = now.getYear();

        final String dbSchema = AppStartup.connDataBaseSchema;

        // 生成新的三年的表
        for (int i = 0; i < 3; i++) {
            int yeaerTable = year + i;
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("创建按年分表 年度{} ", yeaerTable);
            }
            String historyTable = SubmeterKit.submeterDataHistoryTableName(yeaerTable);
            // 检查表是否存在
            final boolean historyExist = SubmeterKit.checkExistTable(dbSchema, historyTable);
            if (historyExist) {
                LOGGER.info("表 {} 已存在 ", historyTable);
            } else {

                boolean createState = DeviceDataHistory.dao.createDataHistoryWithYear(yeaerTable);
                if (!createState) {
                    LOGGER.error("创建表 {} 失败", historyTable);
                }
            }

            String gpsTable = SubmeterKit.submeterGpsTableName(yeaerTable);
            final boolean gpsExist = SubmeterKit.checkExistTable(dbSchema, gpsTable);
            if (gpsExist) {
                LOGGER.error("表 {} 已存在 ", gpsTable);
            } else {
                boolean createState = DeviceDataHistory.dao.createGpsTableWith(yeaerTable);
                if (!createState) {
                    LOGGER.error("创建表 {} 失败", gpsTable);
                }
            }

            String minuteGpsTableName = SubmeterKit.submeterMinuteGpsTableName(yeaerTable);
            final boolean miniteGpsTableExist = SubmeterKit.checkExistTable(dbSchema, minuteGpsTableName);
            if (miniteGpsTableExist) {
                LOGGER.error("表 {} 已存在 ", minuteGpsTableName);
            } else {
                boolean createState = DeviceDataHistory.dao.createMinuteGpsTableWith(yeaerTable);
                if (!createState) {
                    LOGGER.error("创建表 {} 失败", gpsTable);
                }
            }

        }

    }

}
