Hamster.define('App.Overlay', {
    
    statics: {
        mark: new Hamster.tpl.Base({html: ' <div style="position: absolute;width: 80px;">' +
            '        <span class="layui-badge layui-bg-blue">{name}</span>' +
            '        <img style="display: block;width: 40px; height: 40px;" src="{ctx}/static/images/car/{image}.png"/>' +
            '    </div>'}),
        renderTpl: function (data) {
            return this.mark.apply(data);
        },
        carImages: {
            A: 'icon_daba',
            B: 'icon_qinka',
            C: 'icon_zhongka',
            D: 'icon_shuilijiaobanche',
            E: 'icon_diaoche',
            F: 'icon_daoluqinsaoche',
            G: 'icon_xiaofangche',
            H: 'icon_chache',
            I: 'icon_wajueji',
            J: 'icon_tuituji',
            K: 'icon_yaluji',
            L: 'icon_fadianjizu',
            M: 'icon_tanpuji',
            N: 'icon_chuanbo'
        }
    },
    
    extend: BMap.Overlay,
    
    isCarMark: true,
    
    constructor: function (point, data, options) {
        this.options = Hamster.apply({}, options, {
            offsetX: 0,
            offsetY: 0,
            applyData: function (record) {
                return record
            },
            key: Hamster.EMPTY_FUNCTION,
            bindEvents: Hamster.EMPTY_FUNCTION
        });
        this.center = point;
        this.data = this.options.applyData(data);
        this.callParent(arguments);
    },
    
    getCarImage: function () {
        this.data.image = this.statics().carImages[this.data.type];
        this.data.ctx = g.ctx;
    },
    
    initialize: function (map) {
        this.map = map;
        this.getCarImage();
        this.mark = Hamster.get(this.statics().renderTpl(this.data));
        this.map.getPanes().markerPane.appendChild(this.mark[0]);
        this.options.bindEvents.apply(this);
        return this.mark[0];
    },
    
    draw: function () {
        var pos = this.map.pointToOverlayPixel(this.center);
        this.mark.css({
            top: pos.y + (this.options.offsetY || -20) + 'px',
            left: pos.x + (this.options.offsetX || -20) + 'px'
        });
    },
    
    getMarkElement: function () {
        return this.mark;
    }
    
});


Hamster.define('App.Location.Overlay', {
    
    statics: {
        mark: new Hamster.tpl.Base({html: '<div style="position: absolute; width: 80px;">' +
            '        <span class="layui-badge layui-bg-blue">{car_no}</span>' +
            '        <img style="display: block;width: 40px; height: 40px;" src="{ctx}/static/images/car/{image}.png" />' +
            '    </div>'}),
        renderTpl: function (data) {
            return this.mark.apply(data);
        },
        carImages: {
            A: 'icon_daba',
            B: 'icon_qinka',
            C: 'icon_zhongka',
            D: 'icon_shuilijiaobanche',
            E: 'icon_diaoche',
            F: 'icon_daoluqinsaoche',
            G: 'icon_xiaofangche',
            H: 'icon_chache',
            I: 'icon_wajueji',
            J: 'icon_tuituji',
            K: 'icon_yaluji',
            L: 'icon_fadianjizu',
            M: 'icon_tanpuji',
            N: 'icon_chuanbo'
        }
    },
    
    extend: BMap.Overlay,
    
    constructor: function (point, data, options) {
        this.options = Hamster.apply({}, options, {
            offsetX: 0,
            offsetY: 0,
            applyData: function (record) {
                return record
            },
            key: Hamster.EMPTY_FUNCTION,
            bindEvents: Hamster.EMPTY_FUNCTION
        });
        this.center = point;
        this.data = this.options.applyData(data);
        this.callParent(arguments);
    },
    
    getCarImage: function () {
        this.data.image = this.statics().carImages[this.data.type];
        this.data.ctx = g.ctx;
    },
    
    initialize: function (map) {
        this.map = map;
        this.getCarImage();
        this.mark = Hamster.get(this.statics().renderTpl(this.data));
        this.mark.attr('car_no', this.data.carNo);
        this.map.getPanes().markerPane.appendChild(this.mark[0]);
        this.options.bindEvents.apply(this);
        return this.mark[0];
    },
    
    draw: function () {
        var pos = this.map.pointToOverlayPixel(this.center);
        this.mark.css({
            top: pos.y + (this.options.offsetY || -20) + 'px',
            left: pos.x + (this.options.offsetX || -20) + 'px'
        });
        
        this.mark.tooltip({
            content: $('<div></div>'),
            showEvent: 'hover',
            position: 'left',
            onUpdate: Hamster.Function.bind(this.options.getTooltipContent, this),
            onShow: function(){
                var t = $(this);
                t.tooltip('tip').unbind().bind('mouseenter', function(){
                    t.tooltip('show');
                }).bind('mouseleave', function(){
                    t.tooltip('hide');
                });
            }
        });
    },
    
    getMarkElement: function () {
        return this.mark;
    }
    
});


