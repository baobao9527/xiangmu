/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.models.sys.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseMonitorConfig<M extends BaseMonitorConfig<M>> extends Model<M> implements IBean {

	public void setUserId(Integer userId) {
		set("user_id", userId);
	}

	public Integer getUserId() {
		return get("user_id");
	}

	public void setConfigFields(String configFields) {
		set("config_fields", configFields);
	}

	public String getConfigFields() {
		return get("config_fields");
	}

	public void setSqlFields(String sqlFields) {
		set("sql_fields", sqlFields);
	}

	public String getSqlFields() {
		return get("sql_fields");
	}

	public void setConfigTime(java.util.Date configTime) {
		set("config_time", configTime);
	}

	public java.util.Date getConfigTime() {
		return get("config_time");
	}

	public void setLastUpdateTime(java.util.Date lastUpdateTime) {
		set("last_update_time", lastUpdateTime);
	}

	public java.util.Date getLastUpdateTime() {
		return get("last_update_time");
	}

	public void setLastUpdater(Integer lastUpdater) {
		set("last_updater", lastUpdater);
	}

	public Integer getLastUpdater() {
		return get("last_updater");
	}

}