/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package com.mo008.crdm.controllers.fence;

import goja.mvc.Controller;

/**
 * @author FitzYang
 */
@SuppressWarnings("unused")
public class RecordController extends Controller {
    public void index(){

    }

    public void list(){
        renderEasyUIDataGrid("fenceRecord");
    }

}
