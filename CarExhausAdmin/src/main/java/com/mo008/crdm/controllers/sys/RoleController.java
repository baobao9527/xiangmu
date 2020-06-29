/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.sys;

import com.mo008.crdm.models.sys.Resources;
import com.mo008.crdm.models.sys.Role;
import com.mo008.crdm.models.sys.User;
import com.mo008.services.UserService;

import goja.core.Func;
import goja.core.StringPool;
import goja.core.db.Dao;
import goja.core.sqlinxml.SqlKit;
import goja.logging.Logger;
import goja.mvc.Controller;
import goja.security.shiro.Securitys;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.joda.time.DateTime;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * <p> The url sys/role Controller. </p>
 *
 * @author sagyf yang
 * @version 1.0
 * @since JDK 1.6
 */
public class RoleController extends Controller {

    /**
     * The index route. the url /sys/role the view in index.ftl
     */
    public void index() {
    }

    public void list() {
        final int loginUserId = Securitys.getLogin().getId();
        boolean superAdmin =
                User.dao.findById(loginUserId).getSuperAdmin();

        if (superAdmin) {
            //管理员登录
            String roleres = getPara("roleres");
            if (Strings.isNullOrEmpty(roleres)) {
                renderEasyUIDataGrid("sys.role");
            } else {
                renderEasyUIDataGrid("sys.role.enablerole");
            }
        } else {
            //普通用户登录
            renderEasyUIDataGrid("sys.role.private");
        }
    }

    public void show() {
        int id = getParaToInt("id");
        Role role = Role.dao.findById(id);
        Map<String, Object> datas = Maps.newHashMap();
        datas.put("role", role);
        renderAjaxSuccess(datas);
    }

    public void save() {
        final Role role = getModel(Role.class);
        boolean flag;
        if (Dao.isNew(role)) {
            role.setCreateTime(DateTime.now().toDate());
            role.setCreateUser((long) UserService.getInstance().userId());
            role.setStatus(1);
            flag = role.save();
        } else {
            flag = role.update();
        }
        if (flag) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("操作失败");
        }
    }

    public void del() {
        final String ids[] = getParaValues("id[]");

        final boolean flag = Dao.deleteByIds(ids, Role.class);
        if (flag) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("删除失败");
        }
    }

    public void getUsers() {
//        int roleId = getParaToInt("roleid");

        renderEasyUIDataGrid("sys.role.findallusers");
    }

    public void getSelectedUsers() {

        int roleId = getParaToInt("roleid");

        List<Object> list = Lists.newArrayList();
        list.add(roleId);
        renderEasyUIDataGrid("sys.role.findusersbyroleid", list);
    }

    public void permissionSave() {
        String userIds = getPara("ids");
        final String roleId = getPara("roleId");

        if (Strings.isNullOrEmpty(roleId)) {
            renderAjaxFailure("角色ID不能为空");
            return;
        }

        boolean ok;

        if (!Strings.isNullOrEmpty(userIds)) {
            //获得该角色的所有资源id

            List<String> userIdList = Func.COMMA_SPLITTER.splitToList(userIds);

            //当该角色有资源时，将为每个拥有该角色的用户添加资源权限、

            final Object[][] params = new Object[userIdList.size()][];
            for (int i = 0; i < userIdList.size(); i++) {
                String userId = userIdList.get(i);
                Object[] param = new Object[2];
                param[0] = roleId;
                param[1] = userId;
                params[i] = param;
            }

            //获得所有要删除的该角色的用户的id
            List<Integer> uids = Role.dao.getUseridByRoleId(Integer.parseInt(roleId));

            final List<String> delIdList = Lists.newArrayList();
            for (Integer id : uids) {
                String tempid = String.valueOf(id);
                if (!userIdList.contains(tempid)) {
                    delIdList.add(tempid);
                }
            }

            final Object[][] delparams = new Object[delIdList.size()][];
            for (int i = 0; i < delIdList.size(); i++) {
                String userId = delIdList.get(i);
                Object[] param = new Object[2];
                param[0] = 0;
                param[1] = userId;
                delparams[i] = param;
            }

            ok = Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    if (Db.update(SqlKit.sql("sys.role.deleteUserRfByRoleId"), roleId) >= 0) {
                        Db.batch(SqlKit.sql("sys.role.insertUserRole"), params, params.length);
                        Db.batch(SqlKit.sql("sys.role.updateUserRole"), params, params.length);
                        if (delparams.length > 0) {
                            Db.batch(SqlKit.sql("sys.role.updateUserRole"), delparams, delparams.length);
                        }
                        return true;
                    } else {
                        Db.batch(SqlKit.sql("sys.role.insertUserRole"), params, params.length);
                        Db.batch(SqlKit.sql("sys.role.updateUserRole"), params, params.length);
                        if (delparams.length > 0) {
                            Db.batch(SqlKit.sql("sys.role.updateUserRole"), delparams, delparams.length);
                        }
                        return true;
                    }
                }
            });
        } else {
            Db.update(SqlKit.sql("sys.role.deleteUserRfByRoleId"), roleId);

            List<Integer> uids = Role.dao.getUseridByRoleId(Integer.parseInt(roleId));
            if (uids.size() > 0) {
                final Object[][] delparams = new Object[uids.size()][];
                for (int i = 0; i < uids.size(); i++) {
                    String userId = String.valueOf(uids.get(i));
                    Object[] param = new Object[2];
                    param[0] = 0;
                    param[1] = userId;
                    delparams[i] = param;
                }
                ok = (Db.batch(SqlKit.sql("sys.role.updateUserRole"), delparams, delparams.length).length
                        > 0);
            } else {
                ok = true;
            }
        }

        if (ok) {
            renderAjaxSuccess();
        } else {
            renderAjaxFailure("角色用户设置失败");
        }
    }

    /**
     * 重写给用户附角色的方法
     */
    public void userRoleSave() {
        String userIds = getPara("ids");
        final int roleId = getParaToInt("roleId", 0);
        if (roleId == 0) {
            renderAjaxSuccess();
        } else {
            //获得该角色的所有用户的id
            final List<Integer> roleUserIds = Role.dao.getAllUserListByRoreId(roleId);
            //获得该角色的所有资源集合
            final List<Integer> roleResourceIds = Resources.dao.findResourceIdsByRole(roleId);
            // 当前所设置的用户ID
            final List<String> userIdList;
            if (Strings.isNullOrEmpty(userIds)) {
                userIdList = Lists.newArrayList();
            } else {
                userIdList = Func.COMMA_SPLITTER.splitToList(userIds);
            }

            final List<Integer> deleteUserIds = Lists.newArrayList(); // 删除的角色用户
            // 检测是否存在删除的用户
            for (Integer roleUserId : roleUserIds) {
                if (!userIdList.contains(String.valueOf(roleUserId))) {
                    // 选择的用户没有这个用户
                    deleteUserIds.add(roleUserId);
                }
            }

            final List<Record> inserUserRoleParams = Lists.newArrayList();
            for (String userId : userIdList) {
                Record record = new Record();
                record.set("role_id", roleId);
                record.set("user_id", userId);
                inserUserRoleParams.add(record);
            }


            boolean flag = Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    final int deleteByRoleNum = Db.update(SqlKit.sql("roleuser.deleteByRole"), roleId);
                    if (deleteByRoleNum >= 0) {
                        try {

                            Db.batch(SqlKit.sql("roleuser.insertroleuser"), "role_id,user_id",
                                    inserUserRoleParams, 100);
                            return true;
                        } catch (Exception e) {
                            Logger.error("执行数据错误!", e);
                            return false;
                        }
                    }
                    return false;
                }
            });
            if (flag) {
                renderAjaxSuccess("用户角色设置成功");
            } else {
                renderAjaxFailure("用户角色设置失败");
            }
        }
    }

    /**
     * 合并字符串的方法
     */
    private String mergeString(String fstr, String bstr) {
        Set<String> set = Sets.newHashSet();

        if (!Strings.isNullOrEmpty(fstr)) {
            List<String> inUses = Func.COMMA_SPLITTER.splitToList(fstr);
            set.addAll(inUses);
        }

        if (!Strings.isNullOrEmpty(bstr)) {
            List<String> checkUsers = Func.COMMA_SPLITTER.splitToList(bstr);
            set.addAll(checkUsers);
        }

        return Func.COMMA_JOINER.join(set);
    }

    /**
     * 给用户移除某角色后他的权限id做的改变
     */
    private String delmergeString(String oldstr, String delstr) {
        Set<String> set = Sets.newHashSet();
        if (!Strings.isNullOrEmpty(oldstr)) {
            List<String> tempoldstr = Func.COMMA_SPLITTER.splitToList(oldstr);
            for (String aTempoldstr : tempoldstr) {
                set.add(aTempoldstr);
            }
        }
        if (!Strings.isNullOrEmpty(delstr)) {
            List<String> tempdelstr = Func.COMMA_SPLITTER.splitToList(delstr);
            for (String aTempdelstr : tempdelstr) {
                //当原字符id中包含该id时，将其去除
                if (set.contains(aTempdelstr)) {
                    set.remove(aTempdelstr);
                }
            }
        }
        return Func.COMMA_JOINER.join(set);
    }

    /**
     * 合并角色的资源id
     */
    public String delResourceMergStr(Integer userId, String roleId) {
        List<Integer> roleIds = Db.query(SqlKit.sql("roleuser.mergroleidbyuid"), userId, roleId);

        String newresourcestr = "";

        Set<Integer> set = Sets.newHashSet();
        if (roleIds.size() > 0) {
            for (Integer rid : roleIds) {
                List<Integer> roleresourcesIds = Resources.dao.findResourceIdsByRole(rid);

                for (Integer resourceid : roleresourcesIds) {
                    set.add(resourceid);
                }
            }

            for (Object str : set) {
                newresourcestr += str + ",";
            }

            return newresourcestr;
        } else {
            return newresourcestr;
        }
    }

    public void permissions() {
        int userId = getParaToInt("id", 0);
        if (userId > 0) {
            List<String> permissions = Db.query(SqlKit.sql("sys.resources.findByRoleId"), userId);
            renderText(Func.COMMA_JOINER.join(permissions));
        } else {
            renderText(StringPool.EMPTY);
        }
    }

    public void rolePermissionSave() {
        final int roleid = getParaToInt("roleid", 0);
        String resourceIds = getPara("permissions");
        if (roleid > 0 && !Strings.isNullOrEmpty(resourceIds)) {
            final List<String> resourceIDList = Func.COMMA_SPLITTER.splitToList(resourceIds);
            final Object[][] params = new Object[resourceIDList.size()][];
            for (int i = 0; i < resourceIDList.size(); i++) {
                String resourceId = resourceIDList.get(i);
                Object[] param = new Object[2];
                param[0] = roleid;
                param[1] = resourceId;
                params[i] = param;
            }
            Db.tx(new IAtom() {
                @Override
                public boolean run() throws SQLException {
                    if (Db.update(SqlKit.sql("sys.resources.deleteResourceId"), roleid) >= 0) {
                        Db.batch(SqlKit.sql("sys.resources.setRoleResources"), params, 100);
                        return true;
                    }
                    return false;
                }
            });

            renderAjaxSuccess();
        } else {
            renderAjaxFailure();
        }
    }
}