package com.mo008.crdm.controllers.monitoring;

import com.google.common.io.Files;

import com.mo008.crdm.AppStartup;
import com.mo008.dtos.FilePage;
import com.mo008.util.FileParseUtil;

import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;

import goja.mvc.Controller;


/**
 * @author FitzYang
 */
@SuppressWarnings("unused")
public class DatabackupController extends Controller {
    public void index() {

    }

    public void list() {
        String root = getPara("path");
        if (StringUtils.isEmpty(root)) {
            root = AppStartup.dbBackupDir;
        } else {
            root = AppStartup.dbBackupDir + root;
        }
        File rootFile = new File(root);
        try {
            Files.createParentDirs(new File(root + File.separator + "touch.txt"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        String prefix = new File(AppStartup.dbBackupDir).getAbsolutePath();

        FilePage page = FileParseUtil.parseFile(rootFile, prefix);
        renderJson(page);
    }

    public void download() {
        String path = getPara("path");
        String root = AppStartup.dbBackupDir;
        renderFile(new File(root + path));
    }
}
