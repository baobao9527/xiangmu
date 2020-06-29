/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm;

import com.google.common.io.Files;

import com.jfinal.kit.PathKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.DbKit;
import com.mo008.crdm.models.sys.Settings;
import com.mo008.dtos.SysSettingDto;
import com.mo008.services.RedisService;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import goja.core.annotation.OnApplicationStart;
import goja.core.app.GojaConfig;
import goja.job.Job;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
@OnApplicationStart
public class AppStartup extends Job {
    /**
     * 系统配置
     */
    private static final String SYS    = "sys";
    /**
     * AppStartup's Logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(AppStartup.class);
    public static SysSettingDto sysSettingDto;
    public static String        dbBackupDir;
    public static String        fileDir;
    /**
     * 数据库名称
     */
    public static String        connDataBaseSchema;

    @Override
    public void run() {

        // 创建目录
        String backupDir = GojaConfig.getProperty("mysql.backup.dir");
        if (StringUtils.isEmpty(backupDir)) {
            backupDir = PathKit.getWebRootPath() + File.separator + "dbbackup" + File.separator;
        }
        try {
            Files.createParentDirs(new File(backupDir + "touch.txt"));
        } catch (IOException e) {
            LOGGER.error("创建数据库备份目录失败 ", e);
        }
        dbBackupDir = backupDir;
        String setFileDir = GojaConfig.getProperty("file.dir");
        if (StringUtils.isEmpty(setFileDir)) {
            setFileDir = PathKit.getWebRootPath() + File.separator + "file" + File.separator;
        }
        try {
            Files.createParentDirs(new File(setFileDir + "touch.txt"));
        } catch (IOException e) {
            LOGGER.error("创建文件管理目录失败 ", e);
        }

        fileDir = setFileDir;

        final String redisHost = GojaConfig.getProperty("redis.host", "127.0.0.1");
        final int redisPort = GojaConfig.getPropertyToInt("redis.port", 6379);
        final int redisDb = GojaConfig.getPropertyToInt("redis.db", 0);

        RedisService.getInstance().init(redisHost, redisPort, redisDb);

        // 读取所有设备写入Redis中

        RedisService.getInstance().syncAuthCode();
        final List<Settings> sysSettings = Settings.dao.findByItem(SYS);
        sysSettingDto = SysSettingDto.toSetting(sysSettings);

        try {
            connDataBaseSchema = DbKit.getConfig().getConnection().getCatalog();
        } catch (SQLException e) {
            LOGGER.error("获取数据库名称失败 ", e);
            connDataBaseSchema = Db.queryStr("select database()");
        }
    }


}
