

INSERT INTO `mo_user` (`id`, `name`, `phone`, `username`, `password`, `salt`, `default_flag`, `create_time`, `role_id`, `super_admin`, `gender`, `birthday`,`qq`, `wxchat`, `remark`, `last_login_time`, `last_login_ip`, `first_login_time`)
VALUES
  (1, 'admin', '13088888888', '管理员', 'df205377de56408508398c0ec7f50b6f0919cc4d', '329c1b59e81aa3fc', 1, '2015-11-19 10:44:41', 1, 1, 0, '1990-01-01',NULL, NULL, '', '2015-11-28 15:18:24', '192.168.1.104', NULL);


INSERT INTO `mo_settings` (`id`, `item`, `name`, `content`, `create_time`, `description`, `create_user`, `last_update_user`, `last_update_time`, `default_flag`)
VALUES
  ('18a24086-0cb1-4774-8a54-6ec93995', 'sys', 'sys.logo', '/static/images/logo.png', NULL, NULL, NULL, 0, NULL, 1),
  ('1ca2bc58-5bc3-48fd-bf69-0ce7e9db', 'sys', 'sys.theme', 'default', '2015-11-19 10:44:41', NULL, NULL, 0, NULL, 0),
  ('794cf0a5-a952-40c9-9ff4-a611ca46', 'sys', 'sys.menu', 'Accordion', NULL, NULL, NULL, 0, NULL, 0),
  ('7c86b611-5ac5-4872-9deb-c05f8972', 'sys', 'sys.name', '柴油机尾气管理系统', NULL, '', NULL, 0, NULL, 1);

-- ----------------------------
--  Records of `mo_role`
-- ----------------------------
BEGIN;
INSERT INTO `mo_role` (`id`, `code`, `name`, `description`, `user_ids`, `status`, `create_user`, `create_time`)
VALUES
	(1, '__superadmin', '超级管理员', '超级管理员', NULL, 1, 1, '2016-03-02 12:12:12');

COMMIT;


-- ----------------------------
--  Records of `mo_resources`
-- ----------------------------
BEGIN;
INSERT INTO `mo_resources` (`id`, `code`, `name`, `show_name`, `style`, `path`, `icon`, `description`, `status`, `parent`, `sort`)
VALUES
	(1, 'menu.device', '终端列表', '终端列表', 'menu_group', NULL, 'icon-lorry', NULL, 1, 0, 1),
	(2, 'menu.device.home', '终端列表', '终端列表', 'menu', 'device/home', 'icon-lorry', NULL, 1, 1, 1),
	(3, 'menu.device.update', '终端升级', '终端升级', 'menu', 'device/update', 'icon-lorry', NULL, 1, 1, 2),

	(4, 'menu.car', '车辆管理', '车辆管理', 'menu_group', NULL, 'icon-lorry', NULL, 1, 0, 2),
	(5, 'menu.car.home', '车辆管理', '车辆管理', 'menu', 'car/home', 'icon-lorry_add', NULL, 1, 4, 1),
	(6, 'menu.car.history', '历史数据查询', '历史数据查询', 'menu', 'car/history', 'icon-vector_key', NULL, 1, 4, 3),
	(7, 'menu.car.monitor', '平台数据监控', '平台数据监控', 'menu', 'car/monitor', 'icon-vector', NULL, 1, 4, 2),


	(8, 'menu.map', '在线地图', '在线地图', 'menu_group', NULL, 'icon-application_view_gallery', NULL, 1, 0, 3),
	(9, 'menu.map.positioning', '车辆定位', '车辆定位', 'menu', 'map/positioning', 'icon-transmit_red', NULL, 1, 8, 1),
	(10, 'menu.map.locus', '车辆轨迹', '车辆轨迹', 'menu', 'map/locus', 'icon-arrow_switch', NULL, 1, 8, 2),
	(11, 'menu.map.hot', '车辆热图', '车辆热图', 'menu', 'map/hot', 'icon-transmit', NULL, 1, 8, 3),
	(12, 'menu.map.fence', '电子栅栏', '电子栅栏', 'menu', 'map/fence', 'icon-border_all', NULL, 1, 8, 4),
	(13, 'menu.map.panorama', '全景展示', '全景展示', 'menu', 'map/panorama', 'icon-map_clipboard', NULL, 1, 8, 5),

	(14, 'menu.statistics', '数据统计', '数据统计', 'menu_group', NULL, 'icon-application_split', NULL, 1, 0, 4),
	(15, 'menu.statistics.cartype', '安装车辆类型统计', '安装车辆类型统计', 'menu', 'stat/cartype', 'icon-lorry_add', NULL, 1, 14, 1),
	(16, 'menu.statistics.engine', '发动机排量统计', '发动机排量统计', 'menu', 'stat/engine', 'icon-drive_error', NULL, 1, 14, 2),

	(17, 'menu.repair', '售后管理', '售后管理', 'menu_group', NULL, 'icon-group', NULL, 1, 0, 5),
	(18, 'menu.repair.home', '售后管理', '售后管理', 'menu', 'repair/home', 'icon-group_gear', NULL, 1, 17, 1),
	(19, 'menu.repair.shop', '维修店维护', '维修店维护', 'menu', 'repair/shop', 'icon-group_gear', NULL, 1, 17, 2),
	(20, 'menu.repair.fixer', '维修工维护', '维修工维护', 'menu', 'repair/fixer', 'icon-group_gear', NULL, 1, 17, 3),

	(21, 'menu.sys', '系统管理', '系统管理', 'menu_group', NULL, 'icon-cog', NULL, 1, 0, 5),
	(22, 'menu.sys.dict', '数据字典维护', '数据字典维护', 'menu', 'sys/dict', 'icon-book_open_mark', NULL, 1, 21, 1),
	(23, 'menu.sys.user', '用户管理', '用户管理', 'menu', 'sys/user', 'icon-user_key', NULL, 1, 21, 2),
	(24, 'menu.sys.role', '角色管理', '角色管理', 'menu', 'sys/role', 'icon-user_gray_cool', NULL, 1, 21, 3),
	(25, 'menu.sys.resource', '资源管理', '资源管理', 'menu', 'sys/resource', 'icon-outline', NULL, 1, 21, 4),
	(26, 'menu.sys.log', '操作日志', '操作日志', 'menu', 'sys/oprlog', 'icon-stop', NULL, 1, 21, 5);

COMMIT;



