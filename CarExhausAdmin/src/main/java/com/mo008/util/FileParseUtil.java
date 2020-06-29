package com.mo008.util;

import com.google.common.collect.Lists;

import com.mo008.dtos.FilePage;
import com.xiaoleilu.hutool.date.DateUtil;
import com.xiaoleilu.hutool.util.ArrayUtil;

import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;

import static java.util.stream.Collectors.summingLong;

/**
 * <p> </p>
 *
 * @author Dark.Yang
 * @version 1.0
 * @since JDK 1.7
 */
public class FileParseUtil {

    /**
     * 解析目录
     *
     * @param file   文件
     * @param prefix 根目录的路径
     * @return 返回文件数据对象
     */
    public static FilePage parseFile(File file, String prefix) {
        if (!file.exists()) {
            return null;
        }

        FilePage page = new FilePage();
        page.setFilename(file.getName());
        page.setDirectory(file.getAbsolutePath().replaceAll(prefix, ""));
        final String modifyStr = DateUtil.format(new Date(file.lastModified()), DateUtil.NORM_DATETIME_PATTERN);
        page.setLastmodifiedtime(modifyStr);
        if (file.isDirectory()) {
            page.setDir(true);
            File[] files = file.listFiles((dir, name) -> name.indexOf('.') != 0);
            if (ArrayUtil.isEmpty(files)) {
                page.setFilelength(0L);
                page.setRows(Collections.emptyList());
                return page;
            }
            List<FilePage> children = Lists.newArrayList();
            Arrays.stream(files).forEach(file1 -> children.add(parseFile(file1, prefix)));
            final long fileLength = children.stream().mapToLong(FilePage::getFilelength).sum();
            page.setFilelength(fileLength);
            page.setRows(children);
        } else {
            page.setFilelength(file.length());
        }

        return page;
    }
}
