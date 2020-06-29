package com.mo008.crdm.jobs;

import com.mo008.services.HistoryDataService;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.PersistJobDataAfterExecution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import goja.core.annotation.On;
import goja.job.Job;

/**
 * 处理历史数据的Job
 * 每天凌晨0点10分开始跑这个Job
 *
 * @author yaoleiroyal
 * @version 1.0
 * @since JDK 1.6
 */
@On(value="0 10 0 * * ? *")
public class DealHistoryDataJob extends Job{

    private static final Logger logger = LoggerFactory.getLogger(DealHistoryDataJob.class);

    @Override
    public void doJob() throws Exception {
        super.doJob();

        // 历史数据处理服务
        HistoryDataService service = HistoryDataService.getInstance();

        try {
            service.processHistoryData(null);
        } catch (Exception e) {
            logger.error("历史数据处理错误!", e);
        }
    }
}
