package com.mo008.dtos;

import java.util.List;

/**
 * 文件信息对象
 *
 * @author yaoleiroyal
 */
public class FilePage {

    /**
     * 文件目录下还有多少文件
     */
    private int total;

    /**
     * 文件目录名
     */
    private String directory;

    /**
     * 子文件列表
     */
    private List<FilePage> rows;

    /**
     * 该文件是不是目录
     */
    private boolean isDir;

    /**
     * 文件名，包含后缀
     */
    private String filename;

    /**
     * 文件后缀名
     */
    private String suffix;

    /**
     * 文件大小
     */
    private Long filelength;

    /**
     * 最后修改时间
     */
    private String lastmodifiedtime;

    public int getTotal() {
        return isDir ? (rows != null ? rows.size() : 0) : 1;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public String getDirectory() {
        return directory;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }

    public List<FilePage> getRows() {
        return rows;
    }

    public void setRows(List<FilePage> rows) {
        this.rows = rows;
    }

    public boolean isDir() {
        return isDir;
    }

    public void setDir(boolean dir) {
        isDir = dir;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getSuffix() {
        int loc = filename.lastIndexOf('.');

        return loc > 0 ? filename.substring(loc + 1).toLowerCase() : "";
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public Long getFilelength() {
        return filelength;
    }

    public void setFilelength(Long filelength) {
        this.filelength = filelength;
    }

    public String getLastmodifiedtime() {
        return lastmodifiedtime;
    }

    public void setLastmodifiedtime(String lastmodifiedtime) {
        this.lastmodifiedtime = lastmodifiedtime;
    }
}
