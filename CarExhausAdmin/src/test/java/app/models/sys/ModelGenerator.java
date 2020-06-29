/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package app.models.sys;

import goja.core.app.GojaConfig;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.activerecord.generator.Generator;
import com.jfinal.plugin.druid.DruidPlugin;

import org.junit.Before;
import org.junit.Test;

import javax.sql.DataSource;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class ModelGenerator {

  private static DataSource dataSource;

  @Before
  public void setUp() throws Exception {
    GojaConfig.init();
    DruidPlugin druidPlugin =
        new DruidPlugin(GojaConfig.getDefaultDBUrl(), GojaConfig.getDefaultDBUsername(),
            GojaConfig.getDefaultDBPassword());
    druidPlugin.start();
    dataSource = druidPlugin.getDataSource();
  }

  @Test
  public void testGenerator() throws Exception {
    // base model 所使用的包名
    String baseModelPackageName = "com.mo008.crdm.sys.models.base";
    // base model 文件保存路径
    String baseModelOutputDir = System.getProperty("user.dir");

    // model 所使用的包名 (MappingKit 默认使用的包名)
    String modelPackageName = "com.mo008.crdm.models.base";
    // model 文件保存路径 (MappingKit 与 DataDictionary 文件默认保存路径)
    String modelOutputDir = baseModelOutputDir + "/gen";

    // 创建生成器
    Generator gernerator = new Generator(dataSource, baseModelPackageName, baseModelOutputDir, modelPackageName, modelOutputDir);
    // 设置数据库方言
    gernerator.setDialect(new MysqlDialect());
    // 添加不需要生成的表名
    //gernerator.addExcludedTable("adv");
    // 设置是否在 Model 中生成 dao 对象
    gernerator.setGenerateDaoInModel(true);
    // 设置是否生成字典文件
    gernerator.setGenerateDataDictionary(false);
    // 设置需要被移除的表名前缀用于生成modelName。例如表名 "osc_user"，移除前缀 "osc_"后生成的model名为 "User"而非 OscUser
    gernerator.setRemovedTableNamePrefixes("mo_");
    // 生成
    gernerator.generate();
  }
}
