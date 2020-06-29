/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.info;


import com.mo008.crdm.models.info.base.BaseNotice;

import goja.core.annotation.TableBind;
import goja.core.sqlinxml.SqlKit;

import java.util.List;

/**
 * <p> </p>
 *
 * @author fmgu
 * @version 1.0
 * @since jdk1.8
 */
@TableBind(tableName = "mo_notice")
public class Notice extends BaseNotice<Notice> {

    public static final Notice dao = new Notice();
    private static final long serialVersionUID = -1010397491609721167L;

    /**
     * 获得首页的公告信息
     *
     * @param userId 当前登录人
     * @return 首页公告信息
     */
    public List<Notice> findByHome(int userId) {

        return find(SqlKit.sql("info.notice.findByHome"), userId, false, Notice.Status.PUBLISHED, 10);
    }

    public enum Status {
        /**
         * 新创建
         */
        NEW(0),
        /**
         * 已发布
         */
        PUBLISHED(1),
        /**
         * 取消发布
         */
        UNPUBLISH(2),
        /**
         * 已删除
         */
        DELETE(3);

        /**
         * 状态
         */
        private final int status;

        /**
         * 状态
         *
         * @param status 实际状态
         */
        Status(int status) {
            this.status = status;
        }

        /**
         * 实际状态
         *
         * @return 实际状态
         */
        public int getStatus() {
            return status;
        }
    }
}
