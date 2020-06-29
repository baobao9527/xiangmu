/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.info;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.jfinal.plugin.activerecord.Db;
import com.mo008.crdm.models.info.Notice;
import com.mo008.crdm.models.info.NoticeView;
import com.mo008.services.UserService;

import org.joda.time.DateTime;

import java.util.List;
import java.util.Map;

import goja.core.db.Dao;
import goja.mvc.Controller;
import goja.security.shiro.Securitys;

/**
 * <p> </p>
 *
 * @author fmgu
 * @version 1.0
 * @since jdk1.8
 */
public class NoticeController extends Controller {
    public void index() {

    }

    public void list() {

        List<Object> params = Lists.newArrayList();

        params.add(false);
        renderEasyUIDataGrid("info.notice", params);
    }

    /**
     * 保存于编辑公告方法
     */
    public void save() {
        final Notice notice = getModel(Notice.class);

        final boolean runStatus;

        if (Dao.isNew(notice)) {
            notice.setCreateTime(DateTime.now().toDate());
            runStatus = notice.save();
        } else {
            runStatus = notice.update();
        }
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("保存失败");
        }
    }

    /**
     * 得到编辑时需要的数据
     */
    public void show() {
        int id = getParaToInt("id");
        final Notice notice = Notice.dao.findById(id);

        Map<String, Object> datas = Maps.newHashMap();
        datas.put("notice", notice);

        renderAjaxSuccess(datas);
    }

    public void view() {
        int noticeId = getParaToInt(0, 0);
        Notice notice = Notice.dao.findById(noticeId);

        final int userId = UserService.getInstance().userId();
        NoticeView view = NoticeView.dao.findByUserAndNotice(noticeId, userId);
        if (view == null) {
            view = new NoticeView();
            view.setNoticeId(noticeId);
            view.setUserId(userId);
            view.setViewTime(DateTime.now().toDate());
            view.save();
        }
        setAttr("notice", notice);
    }

    /**
     * 删除一条公告记录
     */
    public void del() {
        final String[] ids = getParaValues("id[]");
        final boolean runStatus = Db.tx(() -> {
            for (String id : ids) {
                Notice notice = Notice.dao.findById(id);
                if (notice != null) {
                    notice.setDeleteFlag(true);
                    notice.setStatus(Notice.Status.DELETE);
                    notice.setDeleteTime(DateTime.now().toDate());
                    notice.setDeleteUser(Securitys.getLogin().getId());
                    if (!notice.update()) {
                        return false;
                    }
                }
            }
            return true;
        });
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("删除失败");
        }
    }

    /**
     * 发布公告
     */
    public void publish() {
        final String[] ids = getParaValues("id[]");
        final boolean runStatus = Db.tx(() -> {
            for (String id : ids) {
                Notice notice = Notice.dao.findById(id);
                if (notice != null) {
                    notice.setStatus(Notice.Status.PUBLISHED);
                    notice.setPublishTime(DateTime.now().toDate());
                    notice.setPublisher(Securitys.getLogin().getId());
                    if (!notice.update()) {
                        return false;
                    }
                }
            }
            return true;
        });
        if (runStatus) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("发布公告失败");
        }
    }
}
