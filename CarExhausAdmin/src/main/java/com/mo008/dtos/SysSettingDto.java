package com.mo008.dtos;

import com.google.common.base.MoreObjects;
import com.google.common.base.Preconditions;

import com.mo008.Constants;
import com.mo008.crdm.models.sys.Settings;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.List;

import goja.core.StringPool;

/**
 * <p> </p>
 *
 * @author sogYF
 * @version 1.0
 * @since JDK 1.6
 */
public class SysSettingDto implements Serializable {

    private static final long serialVersionUID = 5801306428567757333L;

    /**
     * 系统LOGO
     */
    private final String logo;

    /**
     * 系统风格
     */
    private final String theme;

    /**
     * 菜单风格
     */
    private final String menu;

    /**
     * 系统名称
     */
    private final String name;


    /**
     * 组织信息
     */
    private String orgName;

    /**
     * 登录图片
     */
    private String loginPic;

    /**
     * 数据采集频率
     */
    private String frequency;
    /**
     * 百度地图KEY
     */
    private String mapKey;

    private SysSettingDto(String logo, String theme, String menu, String name) {
        this.logo = logo;
        this.theme = theme;
        this.menu = menu;
        this.name = name;
    }


    /**
     * 系统配置数据, 产生配置说明
     *
     * @param settings 配置信息
     * @return 信息说明
     */
    public static SysSettingDto toSetting(List<Settings> settings) {
        Preconditions.checkNotNull(settings);

        String logo = StringPool.EMPTY;
        String theme = StringPool.EMPTY;
        String menu = StringPool.EMPTY;
        String name = StringPool.EMPTY;
        String loginPic = StringPool.EMPTY;
        String orgName = StringPool.EMPTY;
        String frequency = StringPool.EMPTY;
        String mapKey = StringPool.EMPTY;
        for (Settings setting : settings) {
            String content = setting.getContent();
            String setName = setting.getName();
            if (StringUtils.equals(setName, "sys.logo")) {
                logo = content;
            } else if (StringUtils.equals(setName, "sys.theme")) {
                theme = content;
            } else if (StringUtils.equals(setName, "sys.menu")) {
                menu = content;
            } else if (StringUtils.equals(setName, "sys.name")) {
                name = content;
            } else if (StringUtils.equals(setName, "sys.login.pic")) {
                loginPic = content;
            } else if (StringUtils.equals(setName, "sys.org.name")) {
                orgName = content;
            } else if (StringUtils.equals(setName, "sys.frequency")) {
                frequency = content;
            } else if (StringUtils.equals(setName, "sys.map.key")) {
                mapKey = content;
            }
        }
        final SysSettingDto sysSettingDto = new SysSettingDto(logo, theme, menu, name);
        sysSettingDto.setLoginPic(loginPic);
        sysSettingDto.setOrgName(orgName);
        sysSettingDto.setFrequency(frequency);
        sysSettingDto.setMapKey(StringUtils.isEmpty(mapKey) ? Constants.DEFAULT_MAP_KEY : mapKey);
        return sysSettingDto;
    }

    public String getMapKey() {
        return mapKey;
    }

    public void setMapKey(String mapKey) {
        this.mapKey = mapKey;
    }

    public String getLogo() {
        return logo;
    }

    public String getTheme() {
        return theme;
    }

    public String getMenu() {
        return menu;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("logo", logo)
                .add("theme", theme)
                .add("menu", menu)
                .add("name", name)
                .toString();
    }

    public String getLoginPic() {
        return loginPic;
    }

    public void setLoginPic(String loginPic) {
        this.loginPic = loginPic;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }
}
