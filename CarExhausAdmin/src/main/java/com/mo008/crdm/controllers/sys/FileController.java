package com.mo008.crdm.controllers.sys;

import com.google.common.io.Files;
import com.jfinal.kit.FileKit;
import com.jfinal.kit.PathKit;
import com.jfinal.upload.MultipartRequest;
import com.jfinal.upload.UploadFile;
import com.mo008.crdm.AppStartup;
import com.mo008.dtos.FilePage;
import com.mo008.util.FileParseUtil;
import com.xiaoleilu.hutool.io.FileUtil;

import goja.core.app.GojaConfig;
import goja.mvc.Controller;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class FileController extends Controller{
    public void index(){

    }

    public void list(){
        String root = getPara("path");
        if(StringUtils.isEmpty(root)){
            root = AppStartup.fileDir ;
        }else{
            root = AppStartup.fileDir + root;
        }
        File rootFile = new File(root);
        if(!rootFile.exists()){
            return;
        }

        String prefix = new File(AppStartup.fileDir).getAbsolutePath();

        FilePage page = FileParseUtil.parseFile(rootFile, prefix);
        renderJson(page);
    }



    public void download(){
        try {
            String path = new String(getPara("path").getBytes("ISO-8859-1"), "UTF-8");
            String root = AppStartup.fileDir;
            renderFile(new File(root + path));
        } catch (UnsupportedEncodingException e) {
            renderAjaxFailure();
        }
    }

    public void upload(){

        final UploadFile uploadFile = getFile();
        String root = AppStartup.fileDir;
        String path = getPara("path");
        File file = uploadFile.getFile();
        try {
            File dest = new File(root + path + File.separator + uploadFile.getOriginalFileName());
            if(dest.exists()){
                dest.delete();
            }
            FileUtils.moveFile(file, dest);
        } catch (IOException e) {
            renderAjaxFailure();
            return;
        }
        renderAjaxSuccess();
    }

    public void saveDir(){

        String currentPath = getPara("currentPath");
        String oldDir = getPara("oldDir");
        String newDir = getPara("newDir");

        String root = AppStartup.fileDir;
        String realpath = root + currentPath;
        if(StringUtils.isEmpty(oldDir)){
            // 创建文件夹
            File file = new File(realpath + File.separator + newDir);
            if(file.exists()){
                renderAjaxFailure("已有同名文件夹，创建失败！");
                return;
            }
            try {
                FileUtils.forceMkdir(file);
            } catch (IOException e) {
                renderAjaxFailure("创建失败！");
                return;
            }
        }else{
            // 重命名
            File oldFile = new File(realpath + File.separator + oldDir);
            File file = new File(realpath + File.separator + newDir);
            if(file.exists()){
                renderAjaxFailure("已有同名文件夹，创建失败！");
                return;
            }
            oldFile.renameTo(file);
        }
        renderAjaxSuccess();
    }
}
