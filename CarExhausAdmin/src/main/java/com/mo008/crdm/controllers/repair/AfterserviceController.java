/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.repair;

import com.mo008.crdm.models.car.CarInfo;
import com.mo008.crdm.models.repair.FixRecord;
import com.mo008.crdm.models.sys.User;
import com.mo008.services.UserService;

import goja.core.db.Dao;
import goja.core.sqlinxml.SqlKit;
import goja.mvc.Controller;
import goja.rapid.mvc.easyui.EuiDataGrid;
import com.jfinal.plugin.activerecord.Db;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
public class AfterserviceController extends Controller {
    public void index(){

    }

    public void list(){
        final int userType = UserService.getInstance().userType();
        switch (userType) {
            case User.Type.ADMIN:
                renderEasyUIDataGrid("fixRecord");
                break;
            case User.Type.AGENTS: {
                final List<Object> params = Lists.newArrayList();
                params.add(UserService.getInstance().userId());
                renderEasyUIDataGrid("fixRecord.agent", params);
                break;
            }
            case User.Type.NORMAL: {
                final List<Object> params = Lists.newArrayList();
                params.add(UserService.getInstance().userId());
                renderEasyUIDataGrid("fixRecord.normal", params);
                break;
            }

            default:
                renderJson(EuiDataGrid.EMPTY_DATAGRID);
                break;
        }
    }

    public void save(){
        FixRecord fixRecord = getModel(FixRecord.class,"fixRecord");
        boolean isOk;
        if(Dao.isNew(fixRecord)){
            fixRecord.setCreateTime(DateTime.now().toDate());
            fixRecord.setOkFlag(false);
            isOk = fixRecord.save();
        }else{
            isOk = fixRecord.update();
        }
        if(isOk){
            renderAjaxSuccess();
        }else{
            renderAjaxFailure();
        }
    }

    public void show(){
        FixRecord fixRecord = FixRecord.dao.findById(getParaToInt("id"));
        CarInfo carInfo = CarInfo.dao.findById(fixRecord.getCarId());
        Map<String,Object> result = Maps.newHashMap();
        result.put("fixRecord",fixRecord);
        result.put("car",carInfo);
        renderAjaxSuccess(result);
    }

    public void del(){
        String[] ids = getParaValues("id[]");
        final List<Object> params = Lists.newArrayList();
        Collections.addAll(params, ids);
        String inSql = StringUtils.repeat("?", ",", ids.length);
        String delRepair = SqlKit.sql("fixRecord.delByIds");
        if(Db.update(delRepair+" WHERE id in ("+inSql+")",params.toArray())>=0){
            renderAjaxSuccess();
        }else{
            renderAjaxFailure();
        }
    }

    public void ok(){
        String[] ids = getParaValues("id[]");
        final List<Object> params = Lists.newArrayList();
        Collections.addAll(params, ids);
        String inSql = StringUtils.repeat("?", ",", ids.length);
        String delRepair = SqlKit.sql("fixRecord.okByIds");
        if(Db.update(delRepair+" WHERE id in ("+inSql+")",params.toArray())>=0){
            renderAjaxSuccess();
        }else{
            renderAjaxFailure();
        }
    }

}
