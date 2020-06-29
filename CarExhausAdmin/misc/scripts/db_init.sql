
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mo_car_sys` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
-- 创建用户(正式服务器上需要创建用户)
CREATE USER 'car'@'localhost' IDENTIFIED BY 'car@usr';
CREATE USER 'car'@'127.0.0.1' IDENTIFIED BY 'car@usr';
CREATE USER 'car'@'%' IDENTIFIED BY 'car@usr';
-- 授权限(正式环境赋值给用户，开发环境复权限给dev用户)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'car'@'127.0.0.1';

-- 测试环境
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'dev'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'dev'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys`.* TO 'dev'@'127.0.0.1';



CREATE DATABASE IF NOT EXISTS `mo_car_sys_ly` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_ly`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_ly`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_ly`.* TO 'car'@'127.0.0.1';

CREATE DATABASE IF NOT EXISTS `mo_car_sys_hy` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hy`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hy`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hy`.* TO 'car'@'127.0.0.1';

CREATE DATABASE IF NOT EXISTS `mo_car_sys_hz` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hz`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hz`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_hz`.* TO 'car'@'127.0.0.1';

CREATE DATABASE IF NOT EXISTS `mo_car_sys_yf` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yf`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yf`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yf`.* TO 'car'@'127.0.0.1';

CREATE DATABASE IF NOT EXISTS `mo_car_sys_yj` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yj`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yj`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_yj`.* TO 'car'@'127.0.0.1';

CREATE DATABASE IF NOT EXISTS `mo_car_sys_obd` DEFAULT CHARACTER SET `utf8` COLLATE `utf8_unicode_ci`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_obd`.* TO 'car'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_obd`.* TO 'car'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `mo_car_sys_obd`.* TO 'car'@'127.0.0.1';



INSERT INTO `mo_dict` (`id`, `code`, `name`, `description`, `parent`, `enabled`, `order_code`, `level_code`)
VALUES
    (37, 'DEVICE_DATA_MAP', '设备数据监控名称', '设备数据监控名称', 0, 1, 5, NULL),
    (38, 'obd', '里程', '里程', 37, 1, 1, NULL),
    (39, 'after_km', '里程(m)', '里程(m)', 37, 1, 2, NULL),
    (40, 'speed', '车速(km/h)', '车速(km/h)', 37, 1, 3, NULL),
    (41, 'engine_speed', '发动机平均转速', '发动机平均转速', 37, 1, 4, NULL),
    (42, 'torque', '扭矩', '扭矩', 37, 1, 5, NULL),
    (43, 'nox', 'NOX浓度', 'NOX浓度', 37, 1, 6, NULL),
    (44, 'curon', '瞬时油耗', '瞬时油耗', 37, 1, 7, NULL),
    (45, 'engine_load', '发动机负荷', '发动机负荷', 37, 1, 8, NULL),
    (46, 'dpf_before_temperature', 'DPF前温(℃)', 'DPF前温(℃)', 37, 1, 9, NULL),
    (47, 'dpf_arter_temperature', 'DPF后温(选配)', 'DPF后温(选配)', 37, 1, 10, NULL),
    (48, 'urea_temperature', '尿素温度(℃)', '尿素温度(℃)', 37, 1, 11, NULL),
    (49, 'urea_position', '尿素液位(%)', '尿素液位(%)', 37, 1, 12, NULL),
    (50, 'temperature_1', 'DOC前温(℃)', 'DOC前温(℃)', 37, 1, 13, NULL),
    (51, 'temperature_2', 'SCR后温(℃)', 'SCR后温(℃)', 37, 1, 14, NULL),
    (52, 'temperature_3', 'DPF前压力(Pa)', 'DPF前压力(Pa)', 37, 1, 15, NULL),
    (53, 'temperature_4', 'DPF后压力(Pa)', 'DPF后压力(Pa)', 37, 1, 16, NULL),
    (54, 'pressure', '压差(Pa)', '压差(Pa)', 37, 1, 17, NULL),
    (64, 'pm_value', 'PM净化(g)', 'PM净化(g)', 37, 1, 18, NULL),
    (65, 'no_value', 'NO净化(g)', 'NO净化(g)', 37, 1, 19, NULL);
