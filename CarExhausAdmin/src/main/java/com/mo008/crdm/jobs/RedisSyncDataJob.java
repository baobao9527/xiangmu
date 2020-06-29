package com.mo008.crdm.jobs;

import com.mo008.services.DeviceDataService;

import goja.core.annotation.On;
import goja.job.Job;

/**
 * <p> </p>
 *
 * @author Dark.Yang
 * @version 1.0
 * @since JDK 1.7
 */
@On("* * * * * ?")
public class RedisSyncDataJob extends Job {
    @Override
    public void doJob() throws Exception {

        DeviceDataService.getInstance().deal();
    }
}
