/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.dtos;

import java.io.Serializable;
import java.util.Date;

/**
 * <p> </p>
 *
 * @author sog
 * @version 1.0
 * @since JDK 1.6
 */
public class RealtimParamDto implements Serializable {
    private static final long serialVersionUID = 582958434681912565L;


    /**
     * id : 252
     * time : 2016-04-18 15:35:12
     */

    private int id;
    private Date time;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }
}
