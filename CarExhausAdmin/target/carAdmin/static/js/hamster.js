(function () {

    var global = window,
        enumerables = true,
        enumerablesTestObj = {
            toString: 1
        },
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        nonWhitespaceRe = /\S/,
        callOverrideParent = function () {
            var method = callOverrideParent.caller.caller;
            return method.$owner.prototype[method.$name].apply(this, arguments);
        },
        name;

    //初始化Hamster对象，赋值为一个空对象
    var Hamster = global.Hamster = {};
    //让Hamster对象的global指向全局window/this
    Hamster.global = global;

    //标准浏览器对于for(var i in enumerablesTest){console.log(i)};
    //会输出"toString", 因为toString已经为自定义成员了。所以会遍历这个成员，
    //而IE6却只认名字不认人。它不会输出自定义的toString成员，
    //包括其它系统的成员也不会。因此，在IE6需要主动判断是否定义了toString。
    for (name in enumerablesTestObj) {
        enumerables = !enumerables;
    }

    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
            'toLocaleString', 'toString', 'constructor'
        ];
    }

    Hamster.enumerables = enumerables;

    Hamster.global.window.undefined = window.undefined;

    Hamster.globalEval = Hamster.global.execScript ? function(code) {
        return execScript(code);
    } : function($$code) {
        return (function() {
            var Hamster = this.Hamster;
            return eval($$code);
        }());
    };

    /**
     * 单纯的对象继承覆盖功能
     * @function
     * @param {object} object 待继承对象
     * @param {object} config
     * @param {object} defaults 可选
     * @returns {object} 返回经过覆盖属性/方法后的新object对象
     * */
    Hamster.apply = function (object, config, defaults) {
        if (defaults) {
            Hamster.apply(object, defaults || {});
        }
        if (object && config && typeof config == 'object') {
            var i, j, k;
            for (i in config) {
                object[i] = config[i];
            }
            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }
        return object;
    };

    Hamster.apply(Hamster, {

        name: 'Hamster',

        emptyString: "",

        emptyFn: function () {
        },

        EMPTY_STRING: "",

        EMPTY_FUNCTION: function () {
        },

        identityFn: function (o) {
            return o;
        },

        /**
         * 单纯的对象继承覆盖功能，但是和apply有一定的区别，只是拷贝config中在object中没有的成员
         * @function
         * @param {object} object
         * @param {object} config
         * @returns {object}  返回经过覆盖属性/方法后的新object对象
         * */
        applyIf: function (object, config) {
            var property;
            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }
            return object;
        },

        each: function (object, fn, scope) {
            if (Hamster.isEmpty(object)) {
                return;
            }
            if (Hamster.isNumber(object)) {
                for (var i = 0; i < object; i++) {
                    var ret = fn.call(scope || Hamster.global, i);
                    if (ret === false) {
                        return;
                    }
                }
                return;
            }
            Hamster[Hamster.isIterable(object) ? 'Array' : 'Object'].each.apply(this, arguments);
        }

    });

    Hamster.apply(Hamster, {

        extend: (function () {
            var objectConstructor = objectPrototype.constructor,
                inlineOverrides = function (o) {
                    for (var m in o) {
                        if (!o.hasOwnProperty(m)) {
                            continue;
                        }
                        this[m] = o[m];
                    }
                };

            return function (subclass, superclass, overrides) {
                if (Hamster.isObject(superclass)) {
                    overrides = superclass;
                    superclass = subclass;
                    subclass = overrides.constructor !== objectConstructor ? overrides.constructor : function () {
                        superclass.apply(this, arguments);
                    };
                }

                if (!superclass) {
                    Hamster.Error({
                        className: 'Hamster',
                        methodName: 'extend',
                        msg: 'Attempting to extend from a class which has not been loaded on the page.'
                    });
                }

                var F = function () {},
                    subclassProto, superclassProto = superclass.prototype;

                F.prototype = superclassProto;
                subclassProto = subclass.prototype = new F();
                subclassProto.constructor = subclass;
                subclass.superclass = superclassProto;

                if (superclassProto.constructor === objectConstructor) {
                    superclassProto.constructor = superclass;
                }

                subclass.override = function (overrides) {
                    Hamster.override(subclass, overrides);
                };

                subclassProto.override = inlineOverrides;
                subclassProto.proto = subclassProto;

                subclass.override(overrides);
                subclass.extend = function (o) {
                    return Hamster.extend(subclass, o);
                };

                return subclass;
            };
        }()),

        override: function (target, overrides) {
            if (target.$isClass) {
                target.override(overrides);
            } else if (typeof target == 'function') {
                Hamster.apply(target.prototype, overrides);
            } else {
                var owner = target.self,
                    name, value;

                if (owner && owner.$isClass) {
                    for (name in overrides) {
                        if (overrides.hasOwnProperty(name)) {
                            value = overrides[name];

                            if (typeof value == 'function') {
                                if (owner.$className) {
                                    value.displayName = owner.$className + '#' + name;
                                }

                                value.$name = name;
                                value.$owner = owner;
                                value.$previous = target.hasOwnProperty(name)
                                    ? target[name]
                                    : callOverrideParent;
                            }

                            target[name] = value;
                        }
                    }
                } else {
                    Hamster.apply(target, overrides);
                }
            }
            return target;
        }
    });

    var hasOwn = Object.prototype.hasOwnProperty;

    var iteratesOwnLast;
    (function() {
        var props = [];
        function Ctor() { this.x = 1; }
        Ctor.prototype = { 'valueOf': 1, 'y': 1 };
        for (var prop in new Ctor()) { 
            props.push(prop); 
        }
        iteratesOwnLast = props[0] !== 'x';
    }());

    function isWindow(o) {
        return o != null && o == o.window;
    }

    Hamster.apply(Hamster, {

        objectPrototype: Object.prototype,

        isEmptyObject: function (object) {
            if (!object || !Hamster.isObject(object)) {
                return false;
            }

            for (var p in object) {
                if (object.hasOwnProperty(p)) {
                    return false;
                }
            }
            return true;
        },

        isEmpty: function (value, allowBlank) {
            return (value === null) || 
                (value === undefined) || 
                (Hamster.isArray(value) && !value.length) ||
                (value.jquery && !value.length) ||
                (!allowBlank ? value === '' : false);
        },

        isArray: function (array) {
            return Hamster.objectPrototype.toString.apply(array) === '[object Array]';
        },

        isObject: function (object) {
            return !!object && !object.tagName && Hamster.objectPrototype.toString.apply(object) === '[object Object]';
        },

        isPlainObject: function (object) {
            if (!Hamster.isObject(object) || object.nodeType || isWindow(object)) {
                return false;
            }

            try {
                if (object.constructor && 
                        !hasOwn.call(object, 'constructor') &&
                        !hasOwn.call(object.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                return false;
            }

            var key;

            if (iteratesOwnLast) {
                for (key in object) {
                    return hasOwn.call(object, key);
                }
            }

            for (key in object) {}

            return key === undefined || hasOwn.call(object, key);
        },

        isFunction: function (fun) {
            return Hamster.objectPrototype.toString.apply(fun) === '[object Function]';
        },

        isString: function (str) {
            return typeof str === 'string';
        },

        isNumber: function (number) {
            return Hamster.objectPrototype.toString.apply(number) === '[object Number]';
        },

        isNumeric: function (value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        isInteger: function (number) {
            return Hamster.isNumeric(number) && (new RegExp(/^\d+$/).test(number));
        },

        isDate: function (date) {
            return Hamster.objectPrototype.toString.apply(date) === '[object Date]';
        },

        isBoolean: function (boo) {
            return Hamster.objectPrototype.toString.apply(boo) === '[object Boolean]';
        },

        //判断对象是否为基本数据（字符串， 数字， 布尔值）类型
        isPrimitive: function (value) {
            return Hamster.isString(value) || Hamster.isNumber(value) || Hamster.isBoolean(value);
        },

        isElement: function (element) {
            if (typeof HTMLElement === 'object') {
                return element instanceof HTMLElement;
            } else {
                return element && typeof element === 'object' && element.nodeType === 1 && typeof element.nodeName === "string";
            }
        },

        isDefined: function (defin) {
            return typeof defin !== 'undefined';
        },

        //判断对象是否为可迭代对象，包括array，节点数组
        isIterable: function (iter) {
            if (!iter) {
                return false;
            }
            //iter.callee成立的话， 说明iter是Function的arguments数组
            //iter.find && iter.filter说明是jQuery对象
            if (Hamster.isArray(iter) || iter.callee || (iter.find && iter.filter)) {
                return true;
            }
            //判断是否为节点数组
            if (/NodeList|HTMLCollection/.test(Hamster.objectPrototype.toString.apply(iter))) {
                return true;
            }

            return ((typeof iter.nextNode !== 'undefined' || iter.item) && Hamster.isNumber(iter.length)) || false;
        },

        isEmail: function (email) {
            return email && email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) != null
        },

        isRegExp: function (regexp) {
            return regexp && Hamster.objectPrototype.toString.call(regexp) == '[object RegExp]';
        },

        isJQuery: function (object) {
            return !!object.jquery;
        }
    });

    Hamster.apply(Hamster, {

        typeOf: function (value) {
            var type, typeToString;
            if (value === null) {
                return 'null';
            }
            type = typeof value;
            if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }
            typeToString = toString.call(value);

            switch (typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }
            if (type === 'function') {
                return 'function';
            }
            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return (nonWhitespaceRe).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    } else {
                        return 'element';
                    }
                }

                return 'object';
            }

            Hamster.Error({
                className: 'Hamster',
                methodName: 'typeOf',
                error: 'Failed to determine the type of the specified value "' + value + '". This is most likely a bug.'
            });
        },

        copyTo: function (dest, source, names) {
            if (typeof names == 'string') {
                names = names.split(/[,;\s]/);
            }

            var nLen = names ? names.length : 0,
                n, name;

            for (n = 0; n < nLen; n++) {
                name = names[n];
                if (source.hasOwnProperty(name)) {
                    dest[name] = source[name];
                }
            }
            return dest;
        },

        clone: function (item) {
            if (item === null || item === undefined) {
                return item;
            }

            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }

            var type = toString.call(item);

            // Date
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }

            var i, j, k, clone, key;

            // Array
            if (type === '[object Array]') {
                i = item.length;

                clone = [];

                while (i--) {
                    clone[i] = Hamster.clone(item[i]);
                }
            }
            // Object
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = Hamster.clone(item[key]);
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        clone[k] = item[k];
                    }
                }
            }

            return clone || item;
        },

        isEqual: function (a, b) {
            if (a === b) {
                return true;
            }
            if (Hamster.isEmpty(a) && Hamster.isEmpty(b)) {
                return true;
            }
            var type = Hamster.typeOf(a);
            if (type != Hamster.typeOf(b)) {
                return false
            }
            switch (type) {
                case 'string':
                    return a == String(b);
                case 'number':
                    return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
                case 'date':
                case 'boolean':
                    return +a == +b;
                case 'regexp':
                    return a.source == b.source &&
                        a.global == b.global &&
                        a.multiline == b.multiline &&
                        a.ignoreCase == b.ignoreCase;
                case 'array':
                    var aString = a.toString();
                    var bString = b.toString();

                    return aString.indexOf('[object') === -1 &&
                        bString.indexOf('[object') === -1 &&
                        aString === bString;
            }
            if (typeof a != 'object' || typeof b != 'object') {
                return false;
            }
            if (Hamster.isObject(a) && Hamster.isObject(b)) {
                if (!Hamster.isEqual(Hamster.Object.getKeys(a), Hamster.Object.getKeys(b))) {
                    return false;
                }
                for (var p in a) {
                    if (a[p] !== b[p]) {
                        return false;
                    }
                }
                return true;
            }
        },

        coerce: function (from, to) {
            var fromType = Hamster.typeOf(from),
                toType = to && to.name || Hamster.typeOf(to),
                isString = typeof from === 'string';

            if (Hamster.isEmpty(toType)) {
                return from;
            }

            toType = toType.toLowerCase();

            if (fromType !== toType) {
                switch (toType) {
                    case 'string':
                        return String(from);
                    case 'number':
                        return Number(from);
                    case 'boolean':
                        return isString && (!from || from === 'false') ? false : Boolean(from);
                    case 'null':
                        return isString && (!from || from === 'null') ? null : from;
                    case 'undefined':
                        return isString && (!from || from === 'undefined') ? undefined : from;
                    case 'date':
                        return isString && isNaN(from) ? Hamster.Date.parse(from, Hamster.Date.defaultFormat) : Date(Number(from));
                }
            }
            return from;
        },

        uniqueId: function (prefix) {
            return (prefix || 'Hamster_') + +new Date() + '_' +
                Hamster.Number.randomInt(0, 1000);
        },

        length: function (object) {
            if (Hamster.isIterable(object)) {
                return object.length;
            } 

            if (Hamster.isJQuery(object)) {
                return object.length;
            } 

            if (object.length) {
                return object.length;
            }

            if (object.count) {
                return object.count;
            }

            if (Hamster.isFunction(object.length)) {
                return object.length();
            }

            if (Hamster.isFunction(object.count)) {
                return object.count();
            }
        }

    });

    return Hamster;

})();

//Array
(function (Hamster) {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice;

    //splice function in IE8 is broken (hack)
    var supportsSplice = (function () {
        var array = [],
            lengthBefore, i = 20;

        if (!array.splice) {
            return false;
        }

        while (i--) {
            array.push("A");
        }

        array.splice(15, 0, "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F");

        lengthBefore = array.length;

        //预期的长度应该是42，实际长度为55
        array.splice(13, 0, "XXX");

        if (lengthBefore + 1 != array.length) {
            return false;
        }

        return true;
    })();

    function fixArrayIndex(array, index) {
        return (index < 0) ? Math.max(0, array.length + index) : Math.min(array.length, index);
    }

    function replaceSim(array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index),
            remove,
            tailOldPos,
            tailNewPos,
            tailCount,
            lengthAfterRemove,
            i;

        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            remove = Math.min(removeCount, length - pos);
            tailOldPos = pos + remove;
            tailNewPos = tailOldPos + add - remove;
            tailCount = length - tailOldPos;
            lengthAfterRemove = length - remove;

            if (tailNewPos < tailOldPos) {
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos + i] = array[tailOldPos + i];
                }
            } else if (tailNewPos > tailOldPos) {
                for (i = tailCount; i--;) {
                    array[tailNewPos + i] = array[tailOldPos + i];
                }
            }

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove;
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add;
                for (i = 0; i < add; ++i) {
                    array[pos + i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative(array, index, removeCount, insert) {
        if (insert && insert.length) {
            if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            } else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim(array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative(array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim(array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos + removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative(array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    var erase = supportsSplice ? eraseNative : eraseSim;
    var replace = supportsSplice ? replaceNative : replaceSim;
    var splice = supportsSplice ? spliceNative : spliceSim;

    var arrayPrototype = Array.prototype,
        supportsForEach = 'forEach' in arrayPrototype,
        supportsMap = 'map' in arrayPrototype,
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsEvery = 'every' in arrayPrototype,
        supportsSome = 'some' in arrayPrototype,
        supportsFilter = 'filter' in arrayPrototype,
        supportsSort = function() {
            var a = [1,2,3,4,5].sort(function(){ return 0; });
            return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
        }(),
        supportsSliceOnNodeList = true;

    try {
        // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }

    /*给HY定义Array对象*/
    Hamster.Array = {

        each: function (array, fn, scope, reverse) {
            //当array不是可迭代数组，或者是基本数据类型的话，那么创建array
            array = Hamster.Array.from(array);

            var i, k, len = array.length;

            if (reverse !== true) {
                for (i = 0; i < len; i++) {
                    k = array[i];
                    //循环执行fn函数，若fn返回false时，直接跳出each循环
                    if (fn.call(scope || k, k, i, array) === false) {
                        return i;
                    }
                }
            } else {
                for (i = len - 1; i > -1; i--) {
                    k = array[i];
                    if (fn.call(scope || k, k, i, array) === false) {
                        return i;
                    }
                }
            }
            
            return true;
        },

        forEach: function (array, fn, scope) {
            array = Hamster.Array.from(array);
            if (supportsForEach) {
                return array.forEach(fn, scope);
            }
            var i, k, ln = array.length;
            for (i = 0; i < ln; i++) {
                k = array[i];
                fn.call(scope, k, i, array);
            }
        },

        /**
         * 返回(想要找寻值)一样的该值在数组的索引值
         * @function
         * @param {array} array 待检测的数组
         * @param {all} item 需要检测索引值的项
         * @param {number} from 设置从待检测数组开始检测索引
         * @returns {array}
         */
        indexOf: function (array, item, from) {
            from = from || 0;
            if (supportsIndexOf) {
                return array.indexOf(item, from);
            }
            var i, length = array.length;
            //判断from的大小，然后定位起始点
            for (i = (from < 0 ? Math.max(0, length + from) : from || 0); i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
        },

        //查找数组中是否包含item项
        contains: function (array, item) {
            return (Hamster.Array.indexOf(array, item) > -1);
        },

        /**
         * 从一个数组中截取新的数组
         * @function
         * @param {array} array 新数组的母体
         * @param {number} start 截取数组的开始索引
         * @param {number} end 截取数组的结束索引
         * @returns {array}
         */
        subArray: function (array, start, end) {
            return arrayPrototype.slice.call(array || [], start || 0, end || array.length)
        },

        slice: function (array, start, end) {
            return this.subArray(array, start, end)
        },

        /**
         * 遍历数组，执行函数,迭代数组，每个元素作为参数执行callBack方法，
         * 由callBack方法对每个元素进行处理，最后返回处理后的一个数组
         * @function
         * @param {array} array 待遍历的数组
         * @param {function} fn 每次遍历执行的回调函数
         * @param {object} scope 回调函数内部的作用域，即this的指向对象
         * @returns {array}
         */
        map: function (array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "map",
                    error: "fn must be a valid callback function"
                })
            }

            if (supportsMap) {
                return array.map(fn, scope);
            }

            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        clean: function (array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Hamster.isEmpty(item)) {
                    results.push(item);
                }
            } 

            return results;
        },

        /**
         * 通过自定义规则过滤数组，得到新的数组
         * @function
         * @param {array} array 待过滤的数组
         * @param {function} fn 每次遍历执行的回调函数
         * @param {object} scope 回调函数内部的作用域，即this的指向对象
         * @returns {array}
         */
        filter: function (array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "filter",
                    error: "fn must be a valid callback function"
                });
            }

            if (supportsFilter) {
                return array.filter(fn, scope);
            }

            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array) === true) {
                    results.push(array[i]);
                }
            }

            return results;
        },

        /**
         * 给数组去重，得到一个新的数组
         * @function
         * @param {array} array 待去重的数组
         * @returns {array}
         */
        unique: function (array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (Hamster.Array.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

        remove: function (array, item) {
            var index = Hamster.Array.indexOf(array, item);
            if (index !== -1) {
                array.splice(index, 1)
            }
            return array;
        },

        /**
         * 向一个数组中添加元素项，但是保持唯一性
         * @function
         * @param {array} array 待添加的数组
         * @param {all} item 待添加到数组中的元素项，需要验证唯一性
         * @returns {array}
         */
        include: function (array, item) {
            if (!Hamster.Array.contains(array, item)) {
                array.push(item)
            }
            return array;
        },

        /**
         * 克隆数组
         * @function
         * @param {array} array 待克隆数组
         * @returns {array}
         */
        clone: function (array) {
            return arrayPrototype.slice.call(array);
        },

        /**
         * 数组合并获得新数组
         * @function
         * @param {array} array 待合并数组
         * @returns {array}
         */
        merge: function () {
            if (arguments.length == 0) {
                return [];
            }

            var me = Hamster.Array,
                source = arguments[0],
                remain = arrayPrototype.slice.call(arguments, 1);

            me.each(remain, function (item, i) {
                me.each(item, function (kitem, k) {
                    source.push(kitem)
                })
            });

            return source;
        },

        uniqueMerge: function () {
            if (arguments.length == 0) {
                return [];
            }

            var me = Hamster.Array,
                source = me.unique(arguments[0]),
                remain = arrayPrototype.slice.call(arguments, 1);

            me.each(remain, function (item, i) {
                me.each(item, function (kitem, k) {
                    me.include(source, kitem)
                })
            });

            return source;
        },

        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Hamster.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            if (value && value.length !== undefined && typeof value !== 'string') {
                return Hamster.Array.toArray(value);
            }

            return [value];
        },

        toArray: function (iterable, start, end) { 

            if (!iterable || !iterable.length) {
                return [];
            }

            if (typeof iterable === 'string') {
                iterable = iterable.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(iterable, start || 0, end || iterable.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? iterable.length + end : end) : iterable.length;

            for (i = start; i < end; i++) {
                array.push(iterable[i]);
            }

            return array;
        },

        min: function (array, comparisonFn) {
            //debug
            if (!Hamster.isIterable(array)) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "min",
                    error: "arguments type must be an array"
                });
            }
            //debug
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

        max: function (array, comparisonFn) {
            //debug
            if (!Hamster.isIterable(array)) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "max",
                    error: "arguments type must be an array"
                });
            }
            //debug
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        sum: function (array, name) {
            //debug
            if (!Hamster.isIterable(array)) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "sum",
                    error: "arguments type must be an array"
                });
            }
            //debug
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        mean: function(array) {
            return array.length > 0 ? Hamster.Array.sum(array) / array.length : undefined;
        },

        //获取arr中每个对象中的prop属性值，并且放到array中
        pluck: function (arr, prop) {
            var ret = [];
            Hamster.each(arr, function (v) {
                ret.push(v[prop]);
            });
            return ret;
        },

        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Hamster.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

        grep: function (arr, callback, inv) {
            var ret = [],
                retVal;
            inv = !!inv;

            for (var i = 0, length = arr.length; i < length; i++) {
                retVal = !!callback(arr[i], i);
                if (inv !== retVal) {
                    ret.push(arr[i]);
                }
            }
            return ret;
        },

        erase: erase,

        replace: replace,

        splice: splice,

        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        sort: supportsSort ? function(array, sortFn) {
            if (sortFn) {
                return array.sort(sortFn);
            } else {
                return array.sort();
            }
         } : function (array, sortFn) {
            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        some: supportsSome ? function(array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "some",
                    error: "must have a callback function passed as second argument."
                })
            }
            return array.some(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "some",
                    error: "must have a callback function passed as second argument."
                })
            }
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },

        every: supportsEvery ? function(array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "every",
                    error: "must have a callback function passed as second argument."
                })
            }
            return array.every(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Hamster.Error({
                    className: "Hamster.Array",
                    methodName: "every",
                    error: "must have a callback function passed as second argument."
                })
            }
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        intersect: function() {
            var intersection = [],
                arrays = slice.call(arguments),
                arraysLength,
                array,
                arrayLength,
                minArray,
                minArrayIndex,
                minArrayCandidate,
                minArrayLength,
                element,
                elementCandidate,
                elementCount,
                i, j, k;

            if (!arrays.length) {
                return intersection;
            }

            arraysLength = arrays.length;
            for (i = minArrayIndex = 0; i < arraysLength; i++) {
                minArrayCandidate = arrays[i];
                if (!minArray || minArrayCandidate.length < minArray.length) {
                    minArray = minArrayCandidate;
                    minArrayIndex = i;
                }
            }

            minArray = Hamster.Array.unique(minArray);
            erase(arrays, minArrayIndex, 1);

            minArrayLength = minArray.length;
            arraysLength = arrays.length;
            for (i = 0; i < minArrayLength; i++) {
                element = minArray[i];
                elementCount = 0;

                for (j = 0; j < arraysLength; j++) {
                    array = arrays[j];
                    arrayLength = array.length;
                    for (k = 0; k < arrayLength; k++) {
                        elementCandidate = array[k];
                        if (element === elementCandidate) {
                            elementCount++;
                            break;
                        }
                    }
                }

                if (elementCount === arraysLength) {
                    intersection.push(element);
                }
            }

            return intersection;
        },

        invoke : function(arr, methodName){
            var ret  = [],
                args = Array.prototype.slice.call(arguments, 2),
                a, v,
                aLen = arr.length;

            for (a = 0; a < aLen; a++) {
                v = arr[a];

                if (v && typeof v[methodName] == 'function') {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            }

            return ret;
        }

    }
})(Hamster);
Hamster.Date = new function () {
    
    var utilDate = this,
        stripEscapeRe = /(\\.)/g,
        hourInfoRe = /([gGhHisucUOPZ]|MS)/,
        dateInfoRe = /([djzmnYycU]|MS)/,
        slashRe = /\\/gi,
        numberTokenRe = /\{(\d+)\}/g,
        MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
        code = [
            "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday,",
            "def = me.defaults,",
            "from = Hamster.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);", 

            "if(results){",
            "{1}",

            "if(u != null){", 
            "v = new Date(u * 1000);", 
            "}else{",
            
            "dt = me.clearTime(new Date);",

            "y = from(y, from(def.y, dt.getFullYear()));",
            "m = from(m, from(def.m - 1, dt.getMonth()));",
            "d = from(d, from(def.d, dt.getDate()));",

            "h  = from(h, from(def.h, dt.getHours()));",
            "i  = from(i, from(def.i, dt.getMinutes()));",
            "s  = from(s, from(def.s, dt.getSeconds()));",
            "ms = from(ms, from(def.ms, dt.getMilliseconds()));",

            "if(z >= 0 && y >= 0){",
           
            "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",

            "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
            "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){", 
            "v = null;",
            "}else{",
            "if (W) {", 
            "year = y || (new Date()).getFullYear(),",
            "jan4 = new Date(year, 0, 4, 0, 0, 0),",
            "week1monday = new Date(jan4.getTime() - ((jan4.getDay() - 1) * 86400000));",
            "v = Hamster.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));",
            "} else {",
            "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
            "}",
            "}",
            "}",
            "}",

            "if(v){",
            "if(zz != null){",
            "v = me.add(v, me.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            "v = me.add(v, me.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
            "}",

            "return v;"
        ].join('\n');

  
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(numberTokenRe, function (m, i) {
            return args[i];
        });
    }

    Hamster.apply(utilDate, {
       
        now: Date.now || function () {
            return +new Date();
        },

        toString: function (date) {
            var pad = Hamster.String.leftPad;

            return date.getFullYear() + "-"
                + pad(date.getMonth() + 1, 2, '0') + "-"
                + pad(date.getDate(), 2, '0') + "T"
                + pad(date.getHours(), 2, '0') + ":"
                + pad(date.getMinutes(), 2, '0') + ":"
                + pad(date.getSeconds(), 2, '0');
        },

        getElapsed: function (dateA, dateB) {
            return Math.abs(dateA - (dateB || new Date()));
        },

        useStrict: false,

        formatCodeToRegex: function (character, currentGroup) {
            var p = utilDate.parseCodes[character];

            if (p) {
                p = typeof p == 'function' ? p() : p;
                utilDate.parseCodes[character] = p; 
            }

            return p ? Hamster.applyIf({
                c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
            }, p) : {
                g: 0,
                c: null,
                s: Hamster.String.escapeRegex(character)
            };
        },

        parseFunctions: {
            "MS": function (input, strict) {
                var r = (input || '').match(MSFormatRe);
                return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
            },
            "time": function (input, strict) {
                var num = parseInt(input, 10);
                if (num || num === 0) {
                    return new Date(num);
                }
                return null;
            },
            "timestamp": function (input, strict) {
                var num = parseInt(input, 10);
                if (num || num === 0) {
                    return new Date(num * 1000);
                }
                return null;
            }
        },
        parseRegexes: [],

        formatFunctions: {
            "MS": function () {
                return '\\/Date(' + this.getTime() + ')\\/';
            },
            "time": function () {
                return this.getTime().toString();
            },
            "timestamp": function () {
                return utilDate.format(this, 'U');
            }
        },

        y2kYear: 50,

        MILLI: "ms",

        SECOND: "s",

        MINUTE: "mi",

        HOUR: "h",

        DAY: "d",

        MONTH: "mo",

        YEAR: "y",

        defaults: {},

        dayNames: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ],
        
        monthNames : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        
        monthNumbers: {
            January: 0,
            Jan: 0,
            February: 1,
            Feb: 1,
            March: 2,
            Mar: 2,
            April: 3,
            Apr: 3,
            May: 4,
            June: 5,
            Jun: 5,
            July: 6,
            Jul: 6,
            August: 7,
            Aug: 7,
            September: 8,
            Sep: 8,
            October: 9,
            Oct: 9,
            November: 10,
            Nov: 10,
            December: 11,
            Dec: 11
        },
       
        defaultFormat: "Y-m-d",
        
        getShortMonthName: function (month) {
            return Hamster.Date.monthNames[month].substring(0, 3);
        },
        
        getShortDayName: function (day) {
            return Hamster.Date.dayNames[day].substring(0, 3);
        },
        
        getMonthNumber: function (name) {
            return Hamster.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },
        
        formatContainsHourInfo: function (format) {
            return hourInfoRe.test(format.replace(stripEscapeRe, ''));
        },

        formatContainsDateInfo: function (format) {
            return dateInfoRe.test(format.replace(stripEscapeRe, ''));
        },

        unescapeFormat: function (format) {
            return format.replace(slashRe, '');
        },

        formatCodes : {
            d: "Hamster.String.leftPad(this.getDate(), 2, '0')",
            D: "Hamster.Date.getShortDayName(this.getDay())",
            j: "this.getDate()",
            l: "Hamster.Date.dayNames[this.getDay()]",
            N: "(this.getDay() ? this.getDay() : 7)",
            S: "Hamster.Date.getSuffix(this)",
            w: "this.getDay()",
            z: "Hamster.Date.getDayOfYear(this)",
            W: "Hamster.String.leftPad(Hamster.Date.getWeekOfYear(this), 2, '0')",
            F: "Hamster.Date.monthNames[this.getMonth()]",
            m: "Hamster.String.leftPad(this.getMonth() + 1, 2, '0')",
            M: "Hamster.Date.getShortMonthName(this.getMonth())",
            n: "(this.getMonth() + 1)",
            t: "Hamster.Date.getDaysInMonth(this)",
            L: "(Hamster.Date.isLeapYear(this) ? 1 : 0)",
            o: "(this.getFullYear() + (Hamster.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Hamster.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
            Y: "Hamster.String.leftPad(this.getFullYear(), 4, '0')",
            y: "('' + this.getFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'am' : 'pm')",
            A: "(this.getHours() < 12 ? 'AM' : 'PM')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "Hamster.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "Hamster.String.leftPad(this.getHours(), 2, '0')",
            i: "Hamster.String.leftPad(this.getMinutes(), 2, '0')",
            s: "Hamster.String.leftPad(this.getSeconds(), 2, '0')",
            u: "Hamster.String.leftPad(this.getMilliseconds(), 3, '0')",
            O: "Hamster.Date.getGMTOffset(this)",
            P: "Hamster.Date.getGMTOffset(this, true)",
            T: "Hamster.Date.getTimezone(this)",
            Z: "(this.getTimezoneOffset() * -60)",

            c: function() {
                var c, code, i, l, e;
                for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                    e = c.charAt(i);
                    code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); 
                }
                return code.join(" + ");
            },
            U: "Math.round(this.getTime() / 1000)"
        },

        isValid: function (y, m, d, h, i, s, ms) {
            h = h || 0;
            i = i || 0;
            s = s || 0;
            ms = ms || 0;

            var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);

            return y == dt.getFullYear() &&
                m == dt.getMonth() + 1 &&
                d == dt.getDate() &&
                h == dt.getHours() &&
                i == dt.getMinutes() &&
                s == dt.getSeconds() &&
                ms == dt.getMilliseconds();
        },

        parse: function (input, format, strict) {
            var p = utilDate.parseFunctions;
            if (p[format] == null) {
                utilDate.createParser(format);
            }
            return p[format].call(utilDate, input, Hamster.isDefined(strict) ? strict : utilDate.useStrict);
        },

        parseDate: function (input, format, strict) {
            return utilDate.parse(input, format, strict);
        },

        getFormatCode: function (character) {
            var f = utilDate.formatCodes[character];

            if (f) {
                f = typeof f == 'function' ? f() : f;
                utilDate.formatCodes[character] = f; 
            }

            return f || ("'" + Hamster.String.escape(character) + "'");
        },

        createFormat: function (format) {
            var code = [],
                special = false,
                ch = '',
                i;

            for (i = 0; i < format.length; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    code.push("'" + Hamster.String.escape(ch) + "'");
                } else {
                    code.push(utilDate.getFormatCode(ch));
                }
            }
            utilDate.formatFunctions[format] = Hamster.functionFactory("return " + code.join('+'));
        },

        createParser: function (format) {
            var regexNum = utilDate.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "",
                i = 0,
                len = format.length,
                atEnd = [],
                obj;

            for (; i < len; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    regex.push(Hamster.String.escape(ch));
                } else {
                    obj = utilDate.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex.push(obj.s);
                    if (obj.g && obj.c) {
                        if (obj.calcAtEnd) {
                            atEnd.push(obj.c);
                        } else {
                            calc.push(obj.c);
                        }
                    }
                }
            }

            calc = calc.concat(atEnd);

            utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
            utilDate.parseFunctions[format] = Hamster.functionFactory("input", "strict", xf(code, regexNum, calc.join('')));
        },

        parseCodes: {
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(3[0-1]|[1-2][0-9]|0[1-9])" 
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(3[0-1]|[1-2][0-9]|[1-9])" 
            },
            D: function () {
                for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); 
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.join("|") + ")"
                };
            },
            l: function () {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + utilDate.dayNames.join("|") + ")"
                };
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]" 
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})" 
            },
            W: {
                g: 1,
                c: "W = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})" 
            },
            F: function () {
                return {
                    g: 1,
                    c: "m = parseInt(me.getMonthNumber(results[{0}]), 10);\n", 
                    s: "(" + utilDate.monthNames.join("|") + ")"
                };
            },
            M: function () {
                for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); 
                return Hamster.applyIf({
                    s: "(" + a.join("|") + ")"
                }, utilDate.formatCodeToRegex("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(1[0-2]|0[1-9])"
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(1[0-2]|[1-9])" 
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})" 
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})" 

            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})" 
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n"
                    + "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n",
                s: "(\\d{1,2})"
            },
            a: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\n"
                    + "if (!h || h == 12) { h = 0; }\n"
                    + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(am|pm|AM|PM)",
                calcAtEnd: true
            },
            A: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\n"
                    + "if (!h || h == 12) { h = 0; }\n"
                    + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM|am|pm)",
                calcAtEnd: true
            },
            g: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(1[0-2]|[0-9])" 
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(2[0-3]|1[0-9]|[0-9])" 
            },
            h: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(1[0-2]|0[1-9])" 
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(2[0-3]|[0-1][0-9])" 
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "([0-5][0-9])"
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "([0-5][0-9])"
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)" 
            },
            O: {
                g: 1,
                c: [
                    "o = results[{0}];",
                    "var sn = o.substring(0,1),", 
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", 
                    "mn = o.substring(3,5) % 60;", 
                    "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Hamster.String.leftPad(hr, 2, '0') + Hamster.String.leftPad(mn, 2, '0')) : null;\n"
                ].join("\n"),
                s: "([+-]\\d{4})" 
            },
            P: {
                g: 1,
                c: [
                    "o = results[{0}];",
                    "var sn = o.substring(0,1),", 
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", 
                    "mn = o.substring(4,6) % 60;",
                    "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Hamster.String.leftPad(hr, 2, '0') + Hamster.String.leftPad(mn, 2, '0')) : null;\n"
                ].join("\n"),
                s: "([+-]\\d{2}:\\d{2})" 
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,5}" 
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n" 
                    + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+-]?\\d{1,5})" 
            },
            c: function () {
                var calc = [],
                    arr = [
                        utilDate.formatCodeToRegex("Y", 1), 
                        utilDate.formatCodeToRegex("m", 2), 
                        utilDate.formatCodeToRegex("d", 3), 
                        utilDate.formatCodeToRegex("H", 4), 
                        utilDate.formatCodeToRegex("i", 5), 
                        utilDate.formatCodeToRegex("s", 6), 
                        {c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, 
                        {c: [ 
                            "if(results[8]) {", 
                            "if(results[8] == 'Z'){",
                            "zz = 0;", 
                            "}else if (results[8].indexOf(':') > -1){",
                            utilDate.formatCodeToRegex("P", 8).c, 
                            "}else{",
                            utilDate.formatCodeToRegex("O", 8).c, 
                            "}",
                            "}"
                        ].join('\n')}
                    ],
                    i,
                    l;

                for (i = 0, l = arr.length; i < l; ++i) {
                    calc.push(arr[i].c);
                }

                return {
                    g: 1,
                    c: calc.join(""),
                    s: [
                        arr[0].s, 
                        "(?:", "-", arr[1].s, 
                        "(?:", "-", arr[2].s, 
                        "(?:",
                        "(?:T| )?", 
                        arr[3].s, ":", arr[4].s,  
                        "(?::", arr[5].s, ")?", 
                        "(?:(?:\\.|,)(\\d+))?", 
                        "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", 
                        ")?",
                        ")?",
                        ")?"
                    ].join("")
                };
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)" 
            }
        },

        dateFormat: function (date, format) {
            return utilDate.format(date, format);
        },

        isEqual: function (date1, date2) {
            if (date1 && date2) {
                return (date1.getTime() === date2.getTime());
            }
            return !(date1 || date2);
        },

        format: function (date, format) {
            var formatFunctions = utilDate.formatFunctions;

            if (!Hamster.isDate(date)) {
                return '';
            }

            if (formatFunctions[format] == null) {
                utilDate.createFormat(format);
            }

            return formatFunctions[format].call(date) + '';
        },

        getTimezone: function (date) {
            return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
        },

        getGMTOffset: function (date, colon) {
            var offset = date.getTimezoneOffset();
            return (offset > 0 ? "-" : "+")
                + Hamster.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
                + (colon ? ":" : "")
                + Hamster.String.leftPad(Math.abs(offset % 60), 2, "0");
        },

        getDayOfYear: function (date) {
            var num = 0,
                d = Hamster.Date.clone(date),
                m = date.getMonth(),
                i;

            for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
                num += utilDate.getDaysInMonth(d);
            }
            return num + date.getDate() - 1;
        },

        getWeekOfYear: (function () {
            var ms1d = 864e5,
                ms7d = 7 * ms1d;

            return function (date) { 
                var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, 
                    AWN = Math.floor(DC3 / 7), 
                    Wyr = new Date(AWN * ms7d).getUTCFullYear();

                return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
            };
        }()),

        isLeapYear: function (date) {
            var year = date.getFullYear();
            return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
        },

        getFirstDayOfMonth: function (date) {
            var day = (date.getDay() - (date.getDate() - 1)) % 7;
            return (day < 0) ? (day + 7) : day;
        },

        getLastDayOfMonth: function (date) {
            return utilDate.getLastDateOfMonth(date).getDay();
        },

        getFirstDateOfMonth: function (date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        },

        getLastDateOfMonth: function (date) {
            return new Date(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
        },

        getDaysInMonth: (function () {
            var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            return function (date) { 
                var m = date.getMonth();

                return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
            };
        }()),

        getSuffix: function (date) {
            switch (date.getDate()) {
                case 1:
                case 21:
                case 31:
                    return "st";
                case 2:
                case 22:
                    return "nd";
                case 3:
                case 23:
                    return "rd";
                default:
                    return "th";
            }
        },
 
        clone: function (date) {
            return new Date(date.getTime());
        },

        isDST: function (date) {
            return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
        },

        clearTime: function (date, clone) {
            if (clone) {
                return Hamster.Date.clearTime(Hamster.Date.clone(date));
            }

            var d = date.getDate(),
                hr,
                c;

            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            if (date.getDate() != d) { 
                for (hr = 1, c = utilDate.add(date, Hamster.Date.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, Hamster.Date.HOUR, hr));

                date.setDate(d);
                date.setHours(c.getHours());
            }

            return date;
        },

        add: function (date, interval, value) {
            var d = Hamster.Date.clone(date),
                Date = Hamster.Date,
                day, decimalValue, base = 0;
            if (!interval || value === 0) {
                return d;
            }

            decimalValue = value - parseInt(value, 10);
            value = parseInt(value, 10);

            if (value) {
                switch (interval.toLowerCase()) {
                    case Hamster.Date.MILLI:
                        d.setTime(d.getTime() + value);
                        break;
                    case Hamster.Date.SECOND:
                        d.setTime(d.getTime() + value * 1000);
                        break;
                    case Hamster.Date.MINUTE:
                        d.setTime(d.getTime() + value * 60 * 1000);
                        break;
                    case Hamster.Date.HOUR:
                        d.setTime(d.getTime() + value * 60 * 60 * 1000);
                        break;
                    case Hamster.Date.DAY:
                        d.setDate(d.getDate() + value);
                        break;
                    case Hamster.Date.MONTH:
                        day = date.getDate();
                        if (day > 28) {
                            day = Math.min(day, Hamster.Date.getLastDateOfMonth(Hamster.Date.add(Hamster.Date.getFirstDateOfMonth(date), Hamster.Date.MONTH, value)).getDate());
                        }
                        d.setDate(day);
                        d.setMonth(date.getMonth() + value);
                        break;
                    case Hamster.Date.YEAR:
                        day = date.getDate();
                        if (day > 28) {
                            day = Math.min(day, Hamster.Date.getLastDateOfMonth(Hamster.Date.add(Hamster.Date.getFirstDateOfMonth(date), Hamster.Date.YEAR, value)).getDate());
                        }
                        d.setDate(day);
                        d.setFullYear(date.getFullYear() + value);
                        break;
                }
            }

            if (decimalValue) {
                switch (interval.toLowerCase()) {
                    case Hamster.Date.MILLI:
                        base = 1;
                        break;
                    case Hamster.Date.SECOND:
                        base = 1000;
                        break;
                    case Hamster.Date.MINUTE:
                        base = 1000 * 60;
                        break;
                    case Hamster.Date.HOUR:
                        base = 1000 * 60 * 60;
                        break;
                    case Hamster.Date.DAY:
                        base = 1000 * 60 * 60 * 24;
                        break;

                    case Hamster.Date.MONTH:
                        day = utilDate.getDaysInMonth(d);
                        base = 1000 * 60 * 60 * 24 * day;
                        break;

                    case Hamster.Date.YEAR:
                        day = (utilDate.isLeapYear(d) ? 366 : 365);
                        base = 1000 * 60 * 60 * 24 * day;
                        break;
                }
                if (base) {
                    d.setTime(d.getTime() + base * decimalValue);
                }
            }

            return d;
        },

        subtract: function (date, interval, value) {
            return utilDate.add(date, interval, -value);
        },

        between: function (date, start, end) {
            var t = date.getTime();
            return start.getTime() <= t && t <= end.getTime();
        },

        compat: function () {
            var nativeDate = window.Date,
                p,
                statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
                proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
                sLen = statics.length,
                pLen = proto.length,
                stat, prot, s;

            for (s = 0; s < sLen; s++) {
                stat = statics[s];
                nativeDate[stat] = utilDate[stat];
            }

            for (p = 0; p < pLen; p++) {
                prot = proto[p];
                nativeDate.prototype[prot] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(this);
                    return utilDate[prot].apply(utilDate, args);
                };
            }
        }
    });
};

// 中文处理
(function () {

    Hamster.Date.monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    Hamster.Date.dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    Hamster.Date.formatCodes.a = "(this.getHours() < 12 ? '上午' : '下午')";
    Hamster.Date.formatCodes.A = "(this.getHours() < 12 ? '上午' : '下午')";

    parseCodes = {
        g: 1,
        c: "if (/(上午)/i.test(results[{0}])) {\n"
            + "if (!h || h == 12) { h = 0; }\n"
            + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
        s: "(上午|下午)",
        calcAtEnd: true
    };

    Hamster.Date.parseCodes.a = Hamster.Date.parseCodes.A = parseCodes;

})();
Hamster.Function = {

    clone: function(method) {
        return function() {
            return method.apply(this, arguments);
        };
    },

    //private
    //给function包装成setting方式
    //fn(obj) ---> fn(key, name) * n
    flexSetter: function (fun) {
        return function (key, value) {
            if (Hamster.isEmpty(key)) {
                return this;
            }

            var proto, me = this;

            if (typeof key !== 'string') {
                for (proto in key) {
                    if (key.hasOwnProperty(proto)) {
                        fun.call(this, proto, key[proto]);
                    }
                }

                if (Hamster.enumerables) {
                    Hamster.Array.forEach(Hamster.enumerables, function (name, i) {
                        if (key.hasOwnProperty(name)) {
                            fun.call(me, name, key[name])
                        }
                    })
                }
            } else {
                fun.call(this, key, value)
            }
            return this;
        }
    },

    //设置别名
    /**
     * var obj = {
     *     fun: function(){}
     * };
     * var fun2 = Hamster.Function.alias(obj, fun);
     */
    alias: function (object, name) {
        return function () {
            return object[name].apply(object, arguments);
        }
    }, 

    //给一个函数绑定this值和参数集合
    bind: function (fn, scope, args, appendArgs) {
        var method = fn,
            applyArgs,
            slice = Array.prototype.slice;

        return function () {
            var callArgs = args || arguments;
            if (appendArgs === true) {
                callArgs = slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            } else if (typeof appendArgs == 'number') {
                callArgs = slice.call(arguments, 0);
                Hamster.Array.insert(callArgs, appendArgs, args);
            }

            return method.apply(scope || window, callArgs);
        }
    },

    /**
     * 在原来的函数参数集合中合并新加参数
     * var testFn = function(a, b){
     *     Hamster.log(a + b);
     * };
     * var testFn2 = function(fn){
     *     fn();
     * };
     * testFn2(Hamster.Function.mergeArgs(testFn, [1, 2], this));
     */
    mergeArgs: function (fn, args, scope) {
        if (args) {
            args = Hamster.Array.toArray(args);
        }

        return function () {
            return fn.apply(scope, Hamster.Array.toArray(arguments).concat(args));
        };
    },

    changeArgs: function (fn, scope, args) {
        var method = fn,
            aargs = arguments,
            alen = aargs.length,
            slice = Array.prototype.slice;

        return function () {
            var callArgs = slice.call(arguments, 0),
                i = 2;

            for (; i < alen; i++) {
                callArgs[aargs[i][0]] = aargs[i][1];
            }

            return method.apply(scope || window, callArgs);
        }
    },

    //给一个函数绑定this值和参数集合， 并且可以设置delay(延迟执行)， 主要针对callback回调函数
    callback: function (callback, scope, args, delay) {
        if (Hamster.isFunction(callback)) {
            args = args || [];
            scope = scope || window;
            if (delay) {
                Hamster.delay(callback, delay, scope, args);
            } else {
                callback.apply(scope, args);
            }
        }
    },

    //给一个函数设置延迟执行， 并且执行它
    defer: function (fn, delay, scope, args, appendArgs) {
        fn = Hamster.Function.bind(fn, scope, args, appendArgs);
        if (delay > 0) {
            return setTimeout(fn, delay);
        }
        fn();
        return 0;

    },

    //给一个函数创建拦截器
    //当条件在拦截器中通过的话， 那么才可以执行原来的函数origFn， 否则返回一个默认自行设置的值
    createInterceptor: function (origFn, newFn, scope, returnValue) {
        var method = origFn;
        if (!Hamster.isFunction(newFn)) {
            return origFn;
        } else {
            return function () {
                var me = this,
                    args = arguments;
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || window, args) !== false) ? origFn.apply(me || window, args) : returnValue || null;
            };
        }
    },

    createDelayed: function (fn, delay, scope, args, appendArgs) {
        if (scope || args) {
            fn = Hamster.Function.bind(fn, scope, args, appendArgs);
        }
        return function() {
            var me = this,
                args = Array.prototype.slice.call(arguments);

            setTimeout(function() {
                fn.apply(me, args);
            }, delay);
        };
    },

    //给一个函数创建缓冲器
    createBuffered: function (fn, buffer, scope, args) {
        var timerId;
        return function() {
            var callArgs = args || Array.prototype.slice.call(arguments, 0),
                me = scope || this;

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(function(){
                fn.apply(me, callArgs);
            }, buffer);
        };
    },

    //给一个函数创建序列化执行
    createSequence: function (origFn, newFn, scope) {
        if (!Hamster.isFunction(newFn)) {
            return origFn;
        } else {
            return function () {
                var retval = origFn.apply(this || window, arguments);
                newFn.apply(scope || this || window, arguments);
                return retval;
            };
        }
    },

    createThrottled: function(fn, interval, scope) {
        var lastCallTime, elapsed, lastArgs, timer, execute = function() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = new Date().getTime();
        };

        return function() {
            elapsed = new Date().getTime() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || (elapsed >= interval)) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    },
 
    factory: function () {
        var args = Array.prototype.slice.call(arguments);
        return Function.prototype.constructor.apply(Function.prototype, args);
    },

    pass: function(fn, args, scope) {
        if (args) {
            args = Hamster.Array.from(args);
        }

        return function() {
            return fn.apply(scope, args.concat(Hamster.Array.toArray(arguments)));
        };
    },

    before: function(object, methodName, fn, scope) {
        var method = object[methodName] || Hamster.emptyFn;

        return (object[methodName] = function() {
            var ret = fn.apply(scope || this, arguments);
            method.apply(this, arguments);

            return ret;
        });
    },

    after: function(object, methodName, fn, scope) {
        var method = object[methodName] || Hamster.emptyFn;

        return (object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(scope || this, arguments);
        });
    }

};

Hamster.defer = Hamster.Function.alias(Hamster.Function, 'defer');

Hamster.pass = Hamster.Function.alias(Hamster.Function, 'pass');

Hamster.bind = Hamster.Function.alias(Hamster.Function, 'bind');

Hamster.callback = Hamster.Function.alias(Hamster.Function, 'callback');

Hamster.functionFactory = Hamster.Function.alias(Hamster.Function, 'factory');
(function() {

    var math = Math;
    var isToFixedBroken = (0.9).toFixed() !== '1';

    Hamster.Number = {
        //限制一个数字类型的大小范围， 如果小于最小范围， 那么返回最小值
        //如果大于最大范围， 那么返回最大值
        constrain: function(number, min, max) {
            number = parseFloat(number);
            if (!isNaN(min)) {
                number = math.max(number, min);
            }
            if (!isNaN(max)) {
                number = math.min(number, max);
            }
            return number;
        },

        //精确到几位
        toFixed: function(value, precision) {
            if (isToFixedBroken) {
                precision = precision || 0;
                var pow = math.pow(10, precision);
                return (math.round(value * pow) / pow).toFixed(precision);
            }

            return value.toFixed(precision);
        },

        //Hamster.Number.num('1.23', 1); // returns 1.23
        //Hamster.Number.num('abc', 1);  // returns 1
        num: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }
            return !isNaN(value) ? value : defaultValue;
        },

        from: function(value, defaultValue) {
            return Hamster.Number.num(value, defaultValue)
        },

        randomInt: function(from, to) {
            return math.floor(math.random() * (to - from + 1) + from);
        },

        correctFloat: function(n) {
            return parseFloat(n.toPrecision(14));
        },

        snap: function(value, increment, minValue, maxValue) {
            var m;

            if (value === undefined || value < minValue) {
                return minValue || 0;
            }

            if (increment) {
                m = value % increment;
                if (m !== 0) {
                    value -= m;
                    if (m * 2 >= increment) {
                        value += increment;
                    } else if (m * 2 < -increment) {
                        value -= increment;
                    }
                }
            }
            return Hamster.Number.constrain(value, minValue, maxValue);
        }

    };

})();

Hamster.num = Hamster.Number.num;
(function() {

    var TemplateClass = function () {};

    Hamster.Object = {

        chain: Object.create || function(object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
        },

        //循环迭代对象
        each: function(obj, fn, scope) {
            var prop;
            scope = scope || obj;

            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (fn.call(scope, prop, obj[prop], obj) === false) {
                        return;
                    }
                }
            }
        },

        toQueryObjects: function(name, value, recursive) {
            var self = Hamster.Object.toQueryObjects,
                objects = [],
                i, ln;

            if (Hamster.isArray(value)) {
                for (i = 0, ln = value.length; i < ln; i++) {
                    if (recursive) {
                        objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                    } else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            } else if (Hamster.isObject(value)) {
                for (i in value) {
                    if (value.hasOwnProperty(i)) {
                        if (recursive) {
                            objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                        } else {
                            objects.push({
                                name: name,
                                value: value[i]
                            });
                        }
                    }
                }
            } else {
                objects.push({
                    name: name,
                    value: value
                });
            }

            return objects;
        },


        toQueryString: function(object, recursive) {
            var paramObjects = [],
                params = [],
                i, j, ln, paramObject, value;

            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    paramObjects = paramObjects.concat(Hamster.Object.toQueryObjects(i, object[i], recursive));
                }
            }

            for (j = 0, ln = paramObjects.length; j < ln; j++) {
                paramObject = paramObjects[j];
                value = paramObject.value;

                if (Hamster.isEmpty(value)) {
                    value = '';
                } else if (Hamster.isDate(value)) {
                    value = Hamster.Date.toString(value);
                }

                params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
            }

            return params.join('&');
        },


        fromQueryString: function(queryString, recursive) {
            var parts = queryString.replace(/^\?/, '').split('&'),
                object = {},
                temp, components, name, value, i, ln,
                part, j, subLn, matchedKeys, matchedName,
                keys, key, nextKey;

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (part.length > 0) {
                    components = part.split('=');
                    name = decodeURIComponent(components[0]);
                    value = (components[1] !== undefined) ? decodeURIComponent(components[1]) : '';

                    if (!recursive) {
                        if (object.hasOwnProperty(name)) {
                            if (!Hamster.isArray(object[name])) {
                                object[name] = [object[name]];
                            }

                            object[name].push(value);
                        } else {
                            object[name] = value;
                        }
                    } else {
                        matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
                        matchedName = name.match(/^([^\[]+)/);

                        if (!matchedName) {
                            throw new Error('[Hamster.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                        }

                        name = matchedName[0];
                        keys = [];

                        if (matchedKeys === null) {
                            object[name] = value;
                            continue;
                        }

                        for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                            key = matchedKeys[j];
                            key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                            keys.push(key);
                        }

                        keys.unshift(name);

                        temp = object;

                        for (j = 0, subLn = keys.length; j < subLn; j++) {
                            key = keys[j];

                            if (j === subLn - 1) {
                                if (Hamster.isArray(temp) && key === '') {
                                    temp.push(value);
                                } else {
                                    temp[key] = value;
                                }
                            } else {
                                if (temp[key] === undefined || typeof temp[key] === 'string') {
                                    nextKey = keys[j + 1];

                                    temp[key] = (Hamster.isNumeric(nextKey) || nextKey === '') ? [] : {};
                                }

                                temp = temp[key];
                            }
                        }
                    }
                }
            }

            return object;
        },


        //给一个对象合并其他的值
        merge: function(source, key, value) {
            source = source || {};

            if (Hamster.isString(key)) {
                if (Hamster.isObject(value) && Hamster.isObject(source[key])) {
                    Hamster.Object.merge(source[key], value);
                } else if (Hamster.isObject(value)) {
                    source[key] = value;
                } else {
                    source[key] = value;
                }

                return source;
            }

            var index = 1,
                len = arguments.length,
                i = 0,
                obj, perp;

            for (; i < len; i++) {
                obj = arguments[i] || {};

                var hasProp = false;
                for (perp in obj) {
                    hasProp = true;
                }
                if (hasProp) {
                    for (perp in obj) {
                        if (obj.hasOwnProperty(perp)) {
                            Hamster.Object.merge(source, perp, obj[perp]);
                        }
                    }
                }
            }
            return source;
        },

        mergeIf: function(destination) {
            var i = 1,
                ln = arguments.length,
                cloneFn = Hamster.clone,
                object, key, value;

            for (; i < ln; i++) {
                object = arguments[i];

                for (key in object) {
                    if (!(key in destination)) {
                        value = object[key];

                        if (value && value.constructor === Object) {
                            destination[key] = cloneFn(value);
                        }
                        else {
                            destination[key] = value;
                        }
                    }
                }
            }

            return destination;
        },

        //根据值来获取键
        getKey: function(object, value) {
            for (var property in object) {
                if (object.hasOwnProperty(property) && object[property] === value) {
                    return property;
                }
            }
            return null;
        },

        getValues: function(object) {
            var values = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    values.push(object[property]);
                }
            }
            return values;
        },

        getKeys: ('keys' in Object.prototype) ? Object.keys : function(object) {
            var keys = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }
            return keys;
        },

        getSize: function(object) {
            var size = 0,
                property;
            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    size++;
                }
            }
            return size;
        },

        toStringBy: function(object, by, by2) {
            by = by || ":";
            by2 = by2 || "|";
            var string = [];
            Hamster.each(object, function(name, value) {
                string.push(name + by + value);
            });
            return string.join(by2);
        },

        isEmpty: function(object){
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;    
        },

        equals: (function() {
            var check = function(o1, o2) {
                var key;
            
                for (key in o1) {
                    if (o1.hasOwnProperty(key)) {
                        if (o1[key] !== o2[key]) {
                            return false;
                        }    
                    }
                }    
                return true;
            };
            
            return function(object1, object2) {
                
                if (object1 === object2) {
                    return true;
                } 

                if (object1 && object2) {
                    return check(object1, object2) && check(object2, object1);  
                } else if (!object1 && !object2) {
                    return object1 === object2;
                } else {
                    return false;
                }
            };
        })(),

        clone: function(object) {
            return Hamster.clone(object)
        }
    };

    Hamster.merge = Hamster.Object.merge;

    Hamster.mergeIf = Hamster.Object.mergeIf;

    Hamster.urlEncode = function() {
        var args = Hamster.Array.from(arguments),
            prefix = '';

        if ((typeof args[1] === 'string')) {
            prefix = args[1] + '&';
            args[1] = false;
        }

        return prefix + Hamster.Object.toQueryString.apply(Hamster.Object, args);
    };

    Hamster.urlDecode = function() {
        return Hamster.Object.fromQueryString.apply(Hamster.Object, arguments);
    };

})();
Hamster.String = (function () {

    var trimRegex     = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
        escapeRe      = /('|\\)/g,
        formatRe      = /\{(\d+)\}/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        basicTrimRe   = /^\s+|\s+$/g,
        whitespaceRe  = /\s+/,
        varReplace    = /(^[^a-z]*|[^\w])/gi,
        charToEntity,
        entityToChar,
        charToEntityRegex,
        entityToCharRegex,
        htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        },
        htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        },
        boundsCheck = function(s, other){
            if (s === null || s === undefined || other === null || other === undefined) {
                return false;
            }
            
            return other.length <= s.length; 
        };

    return {

        EMPTY: "",

        has: function (string, chars) {
            return string.indexOf(chars) >= 0;
        },

        //首字母变成大写
        firstUpperCase: function (string) {
            return string.charAt(0).toUpperCase() + string.substr(1);
        },

        insert: function(s, value, index) {
            if (!s) {
                return value;
            }
            
            if (!value) {
                return s;
            }
            
            var len = s.length;
            
            if (!index && index !== 0) {
                index = len;
            }
            
            if (index < 0) {
                index *= -1;
                if (index >= len) {
                    // negative overflow, insert at start
                    index = 0;
                } else {
                    index = len - index;
                }
            }
            
            if (index === 0) {
                s = value + s;
            } else if (index >= s.length) {
                s += value;
            } else {
                s = s.substr(0, index) + value + s.substr(index);
            }
            return s;
        },
        
        startsWith: function(s, start, ignoreCase){
            var result = boundsCheck(s, start);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    start = start.toLowerCase();
                }
                result = s.lastIndexOf(start, 0) === 0;
            }
            return result;
        },
        
        endsWith: function(s, end, ignoreCase){
            var result = boundsCheck(s, end);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    end = end.toLowerCase();
                }
                result = s.indexOf(end, s.length - end.length) !== -1;
            }
            return result;
        },

        createVarName: function(s) {
            return s.replace(varReplace, '');
        },

        htmlEncode: function(value) {
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
        },

        htmlDecode: function(value) {
            return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
        },

        addCharacterEntities: function(newEntities) {
            var charKeys = [],
                entityKeys = [],
                key, echar;
            for (key in newEntities) {
                echar = newEntities[key];
                entityToChar[key] = echar;
                charToEntity[echar] = key;
                charKeys.push(echar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        },

        resetCharacterEntities: function() {
            charToEntity = {};
            entityToChar = {};
            // add the default set
            this.addCharacterEntities({
                '&amp;'     :   '&',
                '&gt;'      :   '>',
                '&lt;'      :   '<',
                '&quot;'    :   '"',
                '&#39;'     :   "'"
            });
        },

        urlAppend : function(url, string) {
            if (!Hamster.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        trim: function(string) {
            return string.replace(trimRegex, "");
        },

        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.substr(1);
        },

        uncapitalize: function(string) {
            return string.charAt(0).toLowerCase() + string.substr(1);
        },

        ellipsis: function(value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index !== -1 && index >= (len - 15)) {
                        return vs.substr(0, index) + "...";
                    }
                }
                return value.substr(0, len - 3) + "...";
            }
            return value;
        },

        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },

        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },

        
        toggle: function(string, value, other) {
            return string === value ? other : value;
        },

        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },

        format: function(format) {
            var args = Hamster.Array.toArray(arguments, 1);
            return format.replace(formatRe, function(m, i) {
                return args[i];
            });
        },

        repeat: function(pattern, count, sep) {
            if (count < 1) {
                count = 0;
            }
            for (var buf = [], i = count; i--; ) {
                buf.push(pattern);
            }
            return buf.join(sep || '');
        },

        splitWords: function (words) {
            if (words && typeof words == 'string') {
                return words.replace(basicTrimRe, '').split(whitespaceRe);
            }
            return words || [];
        },

        parseVersion: function (version) {
            var parts, releaseStartIndex, info = {};

            info.version = info.shortVersion = String(version).toLowerCase().replace(/_/g, '.').replace(/[\-+]/g, '');
            releaseStartIndex = info.version.search(/([^\d\.])/);

            if (releaseStartIndex !== -1) {
                info.release = info.version.substr(releaseStartIndex, version.length);
                info.shortVersion = info.version.substr(0, releaseStartIndex);
            }

            info.shortVersion = info.shortVersion.replace(/[^\d]/g, '');
            parts = info.version.split('.');

            info.major = parseInt(parts.shift() || 0, 10);
            info.minor = parseInt(parts.shift() || 0, 10);
            info.patch = parseInt(parts.shift() || 0, 10);
            info.build = parseInt(parts.shift() || 0, 10);

            return info;
        },

        hasHtmlCharacters: function (str) {
            return charToEntityRegex.test(str);
        }
    }
})();

Hamster.String.resetCharacterEntities();

Hamster.htmlEncode = Hamster.String.htmlEncode;

Hamster.htmlDecode = Hamster.String.htmlDecode;


// Hamster.more

Hamster.apply(Hamster.Namespace = {}, {

    classes: {},

    toName: function(url) {
        return url.replace(/\//g, '.');
    },

    toUrl: function(namespace) {
        return namespace.replace(/\./g, '/');
    },

    set: function(namespace, cls) {
        this.classes[namespace] = this.assign(namespace, cls);
    },

    get: function(namespace) {
        if (Hamster.isEmpty(namespace)) {
            return null;
        }
        if (!Hamster.isString(namespace)) {
            return namespace;
        }
        if (this.classes.hasOwnProperty(namespace)) {
            return this.classes[namespace];
        }
        var root = Hamster.global,
            parts = this.parse(namespace),
            part;

        for (var i = 0, len = parts.length; i < len; i++) {
            part = parts[i];
            if (!Hamster.isString(part)) {
                root = part;
            } else {
                if (!root || !root[part]) {
                    return null;
                }
                root = root[part];
            }
        }
        return root;
    },

    //解析命名空间
    parse: function(namespace) {
        if (!Hamster.isString(namespace)) {
            throw new Error("[Hamster.ClassManager] Invalid namespace, must be a string");
        }
        var parts = [],
            root = Hamster.global;
        parts.push(root);
        parts = parts.concat(namespace.split(/\/|\./g));
        return parts;
    },

    //分配命名空间
    assign: function(name, value) {
        var root = Hamster.global,
            list = this.parse(name),
            leaf = list.pop();

        Hamster.Array.forEach(list, function(item, i) {
            if (!Hamster.isString(item)) {
                root = item;
            } else {
                if (!root[item]) {
                    root[item] = {};
                }
                root = root[item];
            }
        });
        root[leaf] = value;

        return root[leaf];
    },

    //创建命名空间
    create: function() {
        var root = Hamster.global,
            namespace = Hamster.Array.toArray(arguments);

        Hamster.Array.forEach(namespace, function(item, i) {
            Hamster.Array.forEach(Hamster.Namespace.parse(item), function(name, j) {
                if (!Hamster.isString(name)) {
                    root = name;
                } else {
                    if (!root[name]) {
                        root[name] = {};
                    }
                    root = root[name];
                }
            });
        }, this);

        return root;
    }

});

Hamster.ns = Hamster.namespace = Hamster.Namespace.create;

Hamster.apply(Hamster, {

    //level: "error", "warn", "info" or "log" (the default is "log")
    log: function(level, msg) {
        var console = Hamster.global.console;
        if (console) {
            if (arguments.length == 1) {
                msg = level;
                level = 'log';
            }
            console[level](msg);
        }
    },

    Error: function(error) {
        var method, msg, owner;
        error = error || {};
        if (Hamster.isString(error)) {
            if ((method = this.Error.caller) && (owner = method.$owner)) {
                var name = method.$name;
                var className = owner.$className;
                if (name && className) {
                    return Hamster.Error({
                        className: className,
                        methodName: name,
                        error: error
                    });
                }
            } else {
                error = {
                    error: error
                }
            }
        }
        if (!error.className || !error.methodName) {
            msg = error.error;
        } else {
            msg = '[' + error.className + '.' + error.methodName + ']: ' + error.error;
        }

        throw new Error(msg);
    }

});

if (Hamster.isEmpty(Hamster.$ = Hamster.DOM_QUERY = window.jQuery || window.$)) {
    Hamster.Error('you must load jquery lib');
}

Hamster.ajax = Hamster.DOM_QUERY.ajax;

(function() {

    function httpRequest(url, callback) {
        var responseText;
        Hamster.ajax({
            url: url,
            async: false,
            dataType: 'text'
        }).done(function(data, status, xhr) {
            responseText = xhr.responseText;
        });
        return callback(responseText);
    }

    function jsEscape(content) {
        return content.replace(/(["\\])/g, "\\$1")
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r")
            .replace(/[\u2028]/g, "\\u2028")
            .replace(/[\u2029]/g, "\\u2029");
    }

    function loadFileToSet(path, callback) {
        if (Hamster.isEmpty(path)) {
            return;
        }
        return httpRequest(path, function(content) {
            return callback(content);
        });
    }

    Hamster.apply(Hamster, {

        loadTextFile: function(path) {
            return loadFileToSet(path, function(content) {
                return content;
            });
        },

        loadJsonFile: function(path) {
            return loadFileToSet(path, function(content) {
                return Hamster.globalEval('(' + content + ')');
            });
        },

        loadHandlebarsFile: function(path) {
            if (Hamster.isEmpty(Hamster.global.Handlebars)) {
                Hamster.Error('you must load Handlebars lib');
            }
            return loadFileToSet(path, function(content) {
                return Handlebars.compile(content);
            });
        }

    });

})();

// 对 requirejs 进行别名设置
Hamster.module = Hamster.global.define;
Hamster.require = Hamster.global.require;
Hamster.requirejs = Hamster.global.requirejs;

// Hamster.Config

(function () {

	Hamster.ns('Hamster.Setting', 'Hamster.Setting.constant', 'Hamster.Setting.Updates');

	function eq (name, value) {
		var change = Hamster.Setting.Updates[name];
		if (Hamster.Setting[name] !== value && Hamster.isFunction(change)) {
			change.call(Hamster.Setting, value, Hamster.Setting[name]);
		}
	}

	Hamster.setting = function (name, value, change) {
		if (Hamster.isFunction(change)) {
			Hamster.Setting.registerUpdate(name, change);
			return Hamster.setting(name, value);
		}
		if (arguments.length == 2) {
			name = name.toUpperCase();
			eq(name, value);
			Hamster.Setting[name] = value;
			return value;
		}
		if (Hamster.isObject(name)) {
			Hamster.Object.each(name, function (key, val) {
				Hamster.setting(key, val);
			});
		} else if (Hamster.isString(name)) {
			return Hamster.Setting[name.toUpperCase()];
		}
	};

	Hamster.apply(Hamster.Setting, {

		USE_NATIVE_JSON: false

	});

	// 系统中Component中模板获取的配置
	Hamster.apply(Hamster.Setting, {

		// tpl or ejs or handlebars
		TEMPLATE_TYPE: "tpl",

	    TEMPLATE_SERVER_URL: null,

	    TEMPLATE_SERVER_METHOD: 'GET'

	});

	// 对系统使用的RequieJS进行配置
	Hamster.Setting.REQUIRE_CONFIG = {};

	Hamster.Setting.registerUpdate = function (name, change) {
		if (!Hamster.isString(name) || !Hamster.isFunction(change)) {
			return;
		}
		name = name.toUpperCase();
		Hamster.Setting.Updates[name] = change;
	};

	Hamster.Setting.registerUpdate('TEMPLATE_TYPE', function (type) {
		if (type == 'ejs') {
			if (!Hamster.isDefined(Hamster.global.ejs)) {
	            Hamster.Error('you must load ejs lib');
	        }
		} else if (type == 'handlebars') {
			if (!Hamster.isDefined(Hamster.global.Handlebars)) {
	            Hamster.Error('you must load handlebarsjs lib');
	        }
		}
	});

	Hamster.Setting.registerUpdate('REQUIRE_CONFIG', function (config) {
		if (!Hamster.isDefined(Hamster.global.requirejs)) {
	        Hamster.Error('you must load requirejs lib');
	    }
	    var requirejs = Hamster.global.requirejs;
	    requirejs.config(config);
	});

})();

// Keyboard
Hamster.apply(Hamster.Keyboard = {}, {

    BACKSPACE: 8,

    TAB: 9,

    NUM_CENTER: 12,

    ENTER: 13,

    RETURN: 13,

    SHIFT: 16,

    CTRL: 17,

    ALT: 18,

    PAUSE: 19,

    CAPS_LOCK: 20,

    ESC: 27,

    SPACE: 32,

    PAGE_UP: 33,

    PAGE_DOWN: 34,

    END: 35,

    HOME: 36,

    LEFT: 37,

    UP: 38,

    RIGHT: 39,

    DOWN: 40,

    PRINT_SCREEN: 44,

    INSERT: 45,

    DELETE: 46,

    ZERO: 48,

    ONE: 49,

    TWO: 50,

    THREE: 51,

    FOUR: 52,

    FIVE: 53,

    SIX: 54,
    
    SEVEN: 55,
    
    EIGHT: 56,
   
    NINE: 57,
   
    A: 65,
  
    B: 66,
 
    C: 67,
   
    D: 68,
   
    E: 69,
   
    F: 70,
   
    G: 71,
    
    H: 72,

    I: 73,

    J: 74,

    K: 75,

    L: 76,

    M: 77,

    N: 78,

    O: 79,

    P: 80,

    Q: 81,

    R: 82,

    S: 83,

    T: 84,

    U: 85,

    V: 86,

    W: 87,

    X: 88,

    Y: 89,

    Z: 90,

    CONTEXT_MENU: 93,

    NUM_ZERO: 96,

    NUM_ONE: 97,

    NUM_TWO: 98,

    NUM_THREE: 99,

    NUM_FOUR: 100,

    NUM_FIVE: 101,

    NUM_SIX: 102,

    NUM_SEVEN: 103,
  
    NUM_EIGHT: 104,

    NUM_NINE: 105,

    NUM_MULTIPLY: 106,

    NUM_PLUS: 107,

    NUM_MINUS: 109,

    NUM_PERIOD: 110,

    NUM_DIVISION: 111,

    F1: 112,

    F2: 113,

    F3: 114,

    F4: 115,

    F5: 116,

    F6: 117,

    F7: 118,

    F8: 119,

    F9: 120,

    F10: 121,

    F11: 122,

    F12: 123

});

// StatusType 
Hamster.apply(Hamster.StatusType = {}, {

	SUCCESS: 'success',

	FAIL: 'fail',

	OK: 'ok',

	YES: 'yes',

	NO: 'no',

	CONFIRE: 'confirm',

	CANCEL: 'cancel',

	INFO: 'info',

	WARNING: 'warning',

	QUESTION: 'question',

	ERROR: 'error',

	NOT_FIND: 404,

	SERVER_ERROR: 500,

	HTTP_OK: 200

});

// ElementTag
Hamster.apply(Hamster.ElementTag = {}, {

	ABBR: 'abbr',

	ADDRESS: 'address',

	AREA: 'area',

	ARTICLE: 'article',

	AUDIO: 'audio',

	DIV: 'div',

	SPAN: 'span',

	A: 'a',

	UL: 'ul',

	LI: 'li',

	TABLE: 'table',

	TBODY: 'tbody',

	THEAD: 'thead',

	TFOOT: 'tfoot',

	TR: 'tr',

	TD: 'td',

	TH: 'th',

	DL: 'dl',

	DT: 'dt',

	DD: 'dd',

	BODY: 'body',

	HTML: 'html',

	HEAD: 'head',

	LINK: 'link',

	SCRIPT: 'script',

	B: 'b',

	BOTTON: 'botton',

	CANVAS: 'canvas',

	CAPTION: 'caption',

	CENTER: 'center',

	CITE: 'cite',

	CODE: 'code',

	COL: 'col',

	COLGROUP: 'colgroup',

	DEL: 'del',

	DETAILS: 'details',

	DIR: 'dir',

	EM: 'em',

	EMBED: 'embed',

	FONT: 'font',

	FORM: 'form',

	FRAME: 'frame',

	FRAMESET: 'frameset',

	HEADER: 'header',

	HR: 'hr',

	H1: 'h1',

	H2: 'h2',
	
	H3: 'h3',
	
	H4: 'h4',
	
	H5: 'h5',
	
	H6: 'h6',

	I: 'i',

	IFRAME: 'iframe',

	IMG: 'img',

	INPUT: 'input',

	INS: 'ins',

	LABEL: 'label',

	MAP: 'map',

	MARK: 'mark',

	MENU: 'menu',

	MENUITEM: 'menuitem',

	META: 'meta',

	METER: 'meter',

	NAV: 'nav',

	NOFRAMES: 'noframes',

	NOSCRIPT: 'noscript',

	OBJECT: 'object',

	OL: 'ol',

	OPTION: 'option',

	OUTPUT: 'output',

	P: 'p',

	PARAM: 'param',

	PRE: 'pre',

	PROGRESS: 'progress',

	S: 's',

	SECTION: 'section',

	SELECT: 'select',

	SMALL: 'small',

	SOURCE: 'source',

	STRONG: 'strong',

	STYLE: 'style',

	SUB: 'sub',

	SUMMARY: 'summary',

	SUP: 'sup',

	TEXTAREA: 'textarea',

	TIME: 'time',

	TITLE: 'title',

	TRACK: 'track',

	TT: 'tt',

	U: 'u',

	VAR: 'var',

	VIDEO: 'video',

	WBR: 'wbr'

});


// EventType
Hamster.apply(Hamster.EventType = {}, {

	CLICK: 'click',

	DBLCLICK: 'dblclick',

	BLUR: 'blur',

	CHANGE: 'change',

	ERROR: 'error',

	FOCUS: 'focus',

	KEYDOWN: 'keydown',

	KEYPRESS: 'keypress',

	KEYUP: 'keyup',

	MOUSEDOWN: 'mousedown',

	MOUSEENTER: 'mouseenter',

	MOUSELEAVE: 'mouseleave',

	MOUSEMOVE: 'mousemove',

	MOUSEOUT: 'mouseout',

	MOUSEOVER: 'mouseover',

	MOUSEUP: 'mouseup',

	RESIZE: 'resize',

	SCROLL: 'scroll',

	SELECT: 'select',

	SUBMIT: 'submit',

	HOVER: 'hover'

});


Hamster.apply(Hamster.SettingName = {

    USE_NATIVE_JSON: 'USE_NATIVE_JSON',

    TEMPLATE_TYPE: 'TEMPLATE_TYPE',

    TEMPLATE_SERVER_URL: 'TEMPLATE_SERVER_URL',

    TEMPLATE_SERVER_METHOD: 'TEMPLATE_SERVER_METHOD',

    REQUIRE_CONFIG: 'REQUIRE_CONFIG'

});


(function (flexSetter) {

    var noArgs = [],
        Base = function () {
        },
        hookFunctionFactory = function (hookFunction, underriddenFunction, methodName, owningClass) {
            var result = function () {
                var result = this.callParent(arguments);
                hookFunction.apply(this, arguments);
                return result;
            };
            result.$name = methodName;
            result.$owner = owningClass;
            if (underriddenFunction) {
                result.$previous = underriddenFunction.$previous;
                underriddenFunction.$previous = result;
            }
            return result;
        };

    Hamster.apply(Base, {

        $className: 'Hamster.Base',

        $isClass: true,

        create: function () {
            return Hamster.create.apply(Hamster, [this].concat(Array.prototype.slice.call(arguments, 0)));
        },

        extend: function (parent) {
            var parentPrototype = parent.prototype,
                basePrototype, prototype, i, ln, name, statics;

            prototype = this.prototype = Hamster.Object.chain(parentPrototype);
            prototype.self = this;

            this.superclass = prototype.superclass = parentPrototype;

            if (!parent.$isClass) {
                basePrototype = Hamster.Base.prototype;

                for (i in basePrototype) {
                    if (i in prototype) {
                        prototype[i] = basePrototype[i];
                    }
                }
            }

            statics = parentPrototype.$inheritableStatics;

            if (statics) {
                for (i = 0, ln = statics.length; i < ln; i++) {
                    name = statics[i];
                    if (!this.hasOwnProperty(name) || name == 'create') {
                        this[name] = parent[name];
                    }
                }
            }

            if (parent.$onExtended) {
                this.$onExtended = parent.$onExtended.slice();
            }
        },

        $onExtended: [],

        triggerExtended: function () {
            var callbacks = this.$onExtended,
                ln = callbacks.length,
                i, callback;

            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    callback = callbacks[i];
                    callback.fn.apply(callback.scope || this, arguments);
                }
            }
        },

        onExtended: function (fn, scope) {
            this.$onExtended.push({
                fn: fn,
                scope: scope
            });

            return this;
        },

        addStatics: function (members) {
            var member, name;

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    if (typeof member == 'function' && !member.$isClass && member !== Hamster.emptyFn && member !== Hamster.identityFn) {
                        member.$owner = this;
                        member.$name = name;

                        member.displayName = Hamster.getClassName(this) + '.' + name;
                    }
                    this[name] = member;
                }
            }

            return this;
        },

        addInheritableStatics: function (members) {
            var inheritableStatics,
                hasInheritableStatics,
                prototype = this.prototype,
                name, member;

            inheritableStatics = prototype.$inheritableStatics;
            hasInheritableStatics = prototype.$hasInheritableStatics;

            if (!inheritableStatics) {
                inheritableStatics = prototype.$inheritableStatics = [];
                hasInheritableStatics = prototype.$hasInheritableStatics = {};
            }

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    if (typeof member == 'function') {
                        member.displayName = Hamster.getClassName(this) + '.' + name;
                    }
                    this[name] = member;

                    if (!hasInheritableStatics[name]) {
                        hasInheritableStatics[name] = true;
                        inheritableStatics.push(name);
                    }
                }
            }

            return this;
        },

        addMembers: function (members) {
            var prototype = this.prototype,
                enumerables = Hamster.enumerables,
                names = [],
                i, ln, name, member;

            for (name in members) {
                names.push(name);
            }

            if (enumerables) {
                names.push.apply(names, enumerables);
            }

            for (i = 0, ln = names.length; i < ln; i++) {
                name = names[i];

                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    this.addMember.call(this, name, member);
                }
            }

            return this;
        },

        addMember: function (name, member) {
            var prototype = this.prototype;
            if (typeof member == 'function' && !member.$isClass && member !== Hamster.emptyFn && member !== Hamster.identityFn) {
                member.$owner = this;
                member.$name = name;
                member.displayName = (this.$className || '') + '#' + name;
            }

            if (Hamster.isPlainObject(member) && Hamster.isPlainObject(prototype[name])) {
                prototype[name] = Hamster.apply({}, member, prototype[name]);
            } else {
                prototype[name] = member;
            }
            return this;
        },

        implement: function () {
            this.addMembers.apply(this, arguments);
        },

        borrow: function (fromClass, members) {
            var prototype = this.prototype,
                fromPrototype = fromClass.prototype,
                className = Hamster.getClassName(this),
                i, ln, name, fn, toBorrow;

            members = Hamster.Array.from(members);

            for (i = 0, ln = members.length; i < ln; i++) {
                name = members[i];

                toBorrow = fromPrototype[name];

                if (typeof toBorrow == 'function') {
                    fn = Hamster.Function.clone(toBorrow);

                    if (className) {
                        fn.displayName = className + '#' + name;
                    }

                    fn.$owner = this;
                    fn.$name = name;

                    prototype[name] = fn;
                }
                else {
                    prototype[name] = toBorrow;
                }
            }

            return this;
        },

        override: function (members) {
            var me = this,
                enumerables = Hamster.enumerables,
                target = me.prototype,
                cloneFunction = Hamster.Function.clone,
                name, index, member, statics, names, previous;

            if (arguments.length === 2) {
                name = members;
                members = {};
                members[name] = arguments[1];
                enumerables = null;
            }

            do {
                names = [];
                statics = null;

                for (name in members) {
                    if (name == 'statics') {
                        statics = members[name];
                    } else if (name == 'inheritableStatics') {
                        me.addInheritableStatics(members[name]);
                    } else {
                        names.push(name);
                    }
                }

                if (enumerables) {
                    names.push.apply(names, enumerables);
                }

                for (index = names.length; index--;) {
                    name = names[index];

                    if (members.hasOwnProperty(name)) {
                        member = members[name];

                        if (typeof member == 'function' && !member.$className && member !== Hamster.emptyFn && member !== Hamster.identityFn) {
                            if (typeof member.$owner != 'undefined') {
                                member = cloneFunction(member);
                            }

                            if (me.$className) {
                                member.displayName = me.$className + '#' + name;
                            }

                            member.$owner = me;
                            member.$name = name;

                            previous = target[name];
                            if (previous) {
                                member.$previous = previous;
                            }
                        }

                        target[name] = member;
                    }
                }

                target = me;
                members = statics;
            } while (members);

            return this;
        },

        callParent: function (args) {
            var method;
            return (method = this.callParent.caller) && (method.$previous ||
                ((method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass.self[method.$name])).apply(this, args || noArgs);
        },

        callSuper: function (args) {
            var method;
            return (method = this.callSuper.caller) &&
                ((method = method.$owner ? method : method.caller) &&
                    method.$owner.superclass.self[method.$name]).apply(this, args || noArgs);
        },

        mixin: function (name, mixinClass) {
            var me = this,
                mixin = mixinClass.prototype,
                prototype = me.prototype,
                key, statics, i, ln, staticName,
                mixinValue, hookKey, hookFunction;

            if (typeof mixin.onClassMixedIn != 'undefined') {
                mixin.onClassMixedIn.call(mixinClass, me);
            }

            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = Hamster.Object.chain(prototype.mixins);
                }
                else {
                    prototype.mixins = {};
                }
            }

            for (key in mixin) {
                mixinValue = mixin[key];
                if (key === 'mixins') {
                    Hamster.merge(prototype.mixins, mixinValue);
                } else if (key === 'xhooks') {
                    for (hookKey in mixinValue) {
                        hookFunction = mixinValue[hookKey];
                        hookFunction.$previous = Hamster.emptyFn;

                        if (prototype.hasOwnProperty(hookKey)) {
                            hookFunctionFactory(hookFunction, prototype[hookKey], hookKey, me);
                        } else {
                            prototype[hookKey] = hookFunctionFactory(hookFunction, null, hookKey, me);
                        }
                    }
                } else if (!(key === 'mixinId' || key === 'config') && (prototype[key] === undefined)) {
                    prototype[key] = mixinValue;
                }
            }

            statics = mixin.$inheritableStatics;

            if (statics) {
                for (i = 0, ln = statics.length; i < ln; i++) {
                    staticName = statics[i];
                    if (!me.hasOwnProperty(staticName) || name == 'create') {
                        me[staticName] = mixinClass[staticName];
                    }
                }
            }

            prototype.mixins[name] = mixin;
            return me;
        },

        getName: function () {
            return Hamster.getClassName(this);
        }
        
    });

    Base.implement({

        isInstance: true,

        $className: 'Hamster.Base',

        statics: function () {
            var method = this.statics.caller,
                self = this.self;

            if (!method) {
                return self;
            }

            return method.$owner;
        },

        callParent: function (args) {

            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous ||
                    ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass[method.$name]));

            if (!superMethod) {
                method = this.callParent.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callParent() was called but there's no such method (" + methodName +
                        ") found in the parent class (" + (Hamster.getClassName(parentClass) || 'Object') + ")");
                }
            }

            return superMethod.apply(this, args || noArgs);
        },

        callSuper: function (args) {

            var method,
                superMethod = (method = this.callSuper.caller) &&
                    ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass[method.$name]);

            if (!superMethod) {
                method = this.callSuper.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callSuper() was called but there's no such method (" + methodName +
                        ") found in the parent class (" + (Hamster.getClassName(parentClass) || 'Object') + ")");
                }
            }

            return superMethod.apply(this, args || noArgs);
        },

        self: Base,

        constructor: function () {            
            return this;
        },

        destroy: function () {
            this.destroy = Hamster.emptyFn;
        }
    });

    Base.prototype.callOverridden = Base.prototype.callParent;

    Hamster.Base = Base;

}(Hamster.Function.flexSetter));

// class
(function () {

    var HamsterClass,
        Base = Hamster.Base,
        baseStaticMembers = [],
        baseStaticMember, baseStaticMemberLength;

    for (baseStaticMember in Base) {
        if (Base.hasOwnProperty(baseStaticMember)) {
            baseStaticMembers.push(baseStaticMember);
        }
    }

    baseStaticMemberLength = baseStaticMembers.length;

    function Ctor (className) {
        function constructor () {
            return this.constructor.apply(this, arguments) || null;
        }
        if (className) {
            constructor.displayName = className;
        }
        return constructor;
    }

    Hamster.Class = HamsterClass = function (Class, properties, fn) {
        if (typeof Class != 'function') {
            fn = properties;
            properties = Class;
            Class = null;
        }
        properties = properties || {};
        Class = HamsterClass.create(Class, properties);
        HamsterClass.process(Class, properties, fn);
        return Class;
    };

    Hamster.apply(HamsterClass, {

        onBeforeCreated: function (Class, properties, hooks) {
            properties.$configs = {};
            Class.addMembers(properties);
            hooks.onCreated.call(Class, Class);
        },

        process: function (Class, data, onCreated) {
            var preprocessorStack = data.preprocessors || HamsterClass.defaultPreprocessors,
                registeredPreprocessors = this.preprocessors,
                hooks = {
                    onBeforeCreated: this.onBeforeCreated
                },
                preprocessors = [],
                preprocessor, preprocessorsProperties,
                i, ln, j, subLn, preprocessorProperty;

            delete data.preprocessors;

            for (i = 0,ln = preprocessorStack.length; i < ln; i++) {
                preprocessor = preprocessorStack[i];

                if (typeof preprocessor == 'string') {
                    preprocessor = registeredPreprocessors[preprocessor];
                    preprocessorsProperties = preprocessor.properties;

                    if (preprocessorsProperties === true) {
                        preprocessors.push(preprocessor.fn);
                    } else if (preprocessorsProperties) {
                        for (j = 0,subLn = preprocessorsProperties.length; j < subLn; j++) {
                            preprocessorProperty = preprocessorsProperties[j];

                            if (data.hasOwnProperty(preprocessorProperty)) {
                                preprocessors.push(preprocessor.fn);
                                break;
                            }
                        }
                    }
                }
                else {
                    preprocessors.push(preprocessor);
                }
            }

            hooks.onCreated = onCreated ? onCreated : Hamster.emptyFn;
            hooks.preprocessors = preprocessors;

            this.doProcess(Class, data, hooks);
        },

        doProcess: function(Class, data, hooks) {
            var me = this,
                preprocessors = hooks.preprocessors,
                preprocessor = preprocessors.shift(),
                doProcess = me.doProcess;

            for ( ; preprocessor ; preprocessor = preprocessors.shift()) {
                if (preprocessor.call(me, Class, data, hooks, doProcess) === false) {
                    return;
                }
            }
            hooks.onBeforeCreated.apply(me, arguments);
        },
        
        create: function (Class, properties) {
            var name, i;
            Class = Class || Ctor(properties.$className);
            for (i = 0; i < baseStaticMemberLength; i++) {
                name = baseStaticMembers[i];
                Class[name] = Base[name];
            }
            return Class;
        },

        preprocessors: {},

        registerPreprocessor: function (name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }
            if (!properties) {
                properties = [name];
            }
            this.preprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };
            this.setDefaultPreprocessorPosition(name, position, relativeTo);
            return this;
        },

        getPreprocessor: function (name) {
            return this.preprocessors[name];
        },

        getPreprocessors: function () {
            return this.preprocessors;
        },

        defaultPreprocessors: [],

        getDefaultPreprocessors: function () {
            return this.defaultPreprocessors;
        },

        setDefaultPreprocessors: function (preprocessors) {
            this.defaultPreprocessors = Hamster.Array.from(preprocessors);
            return this;
        },

        setDefaultPreprocessorPosition: function (name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;

            if (typeof offset == 'string') {    
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);
                    return this;
                } else if (offset === 'last') {
                    defaultPreprocessors.push(name);
                    return this;
                }
                offset = (offset === 'after') ? 1 : -1;
            }

            index = Hamster.Array.indexOf(defaultPreprocessors, relativeName);
            if (index !== -1) {
                Hamster.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }
            return this;
        },

        configNameCache: {},

        getConfigNameMap: function (name) {
            var cache = this.configNameCache,
                map = cache[name],
                capitalizedName;

            if (!map) {
                capitalizedName = name.charAt(0).toUpperCase() + name.substr(1);
                map = cache[name] = {
                    internal: name,
                    initialized: '__is' + capitalizedName + 'Initialized',
                    apply: 'apply' + capitalizedName,
                    update: 'update' + capitalizedName,
                    set: 'set' + capitalizedName,
                    get: 'get' + capitalizedName
                };
            }
            return map;
        }

    });

    Hamster.Class.registerPreprocessor('extend', function (Class, properties, hooks) {
        var Base = Hamster.Base,
            basePrototype = Base.prototype,
            extend = properties.extend,
            Parent, parentPrototype, i;

        delete properties.extend;

        if (extend && extend !== Object) {
            if (Hamster.isString(extend)) {
                extend = Hamster.Namespace.get(extend);
            }
            Parent = extend;
        } else {
            Parent = Base;
        }
        parentPrototype = Parent.prototype;

        if (!Parent.$isClass) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }

        Class.extend(Parent);
        Class.triggerExtended.apply(Class, arguments);

        if (properties.onClassExtended) {
            Class.onExtended(properties.onClassExtended, Class);
            delete properties.onClassExtended;
        }

    }, true);

    Hamster.Class.registerPreprocessor('statics', function (Class, properties, hooks) {
        Class.addStatics(properties.statics);
        delete properties.statics;
    });

    Hamster.Class.registerPreprocessor('inheritableStatics', function (Class, properties, hooks) {
        Class.addInheritableStatics(properties.inheritableStatics);
        delete properties.inheritableStatics;
    });

    Hamster.Class.registerPreprocessor('config', function (Class, properties) {
        var config = properties.config,
            prototype = Class.prototype;

        delete properties.config;

        prototype.initUpdateForConfig = function (configs) {
            configs = Hamster.Array.from(configs);
            Hamster.Array.forEach(configs, function (name) {
                var nameMap = Hamster.Class.getConfigNameMap(name),
                    setName = nameMap.set,
                    internalName = nameMap.internal;
                this[setName](this[internalName], false, true);
            }, this);
        };

        Hamster.Object.each(config, function (name, value) {
            var nameMap = Hamster.Class.getConfigNameMap(name),
                internalName = nameMap.internal,
                initializedName = nameMap.initialized,
                applyName = nameMap.apply,
                updateName = nameMap.update,
                setName = nameMap.set,
                getName = nameMap.get;

            var hasOwnSetter = (setName in prototype) || properties.hasOwnProperty(setName),
                hasOwnApplier = (applyName in prototype) || properties.hasOwnProperty(applyName),
                hasOwnUpdater = (updateName in prototype) || properties.hasOwnProperty(updateName);

            var optimizedGetter, customGetter;

            if (value === null || (!hasOwnSetter && !hasOwnApplier && !hasOwnUpdater)) {
                prototype[internalName] = value;
                prototype[initializedName] = true;
            } else {
                prototype[initializedName] = false;
            }

            if (!hasOwnSetter) {
                properties[setName] = function (value, unupdate, always) {
                    var oldValue = this[internalName],
                        applier = this[applyName],
                        updater = this[updateName];

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                    }
                    if (applier) {
                        var _value = applier.call(this, value, oldValue);
                        if (_value !== undefined) {
                            value = _value;
                        }
                    }
                    
                    this[internalName] = value;
                    if (typeof value != 'undefined' && !unupdate) {
                        if (updater && (always || (value !== oldValue))) {
                            updater.call(this, value, oldValue);
                        }
                    }

                    return this;
                }
            }

            if (!(getName in prototype) || properties.hasOwnProperty(getName)) {
                customGetter = properties[getName] || false;

                if (customGetter) {
                    optimizedGetter = function() {
                        return customGetter.apply(this, arguments);
                    };
                } else {
                    optimizedGetter = function() {
                        return this[internalName];
                    };
                }

                properties[getName] = function() {
                    var currentGetter;

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                        this[setName](this.config[name], true);
                    }

                    currentGetter = this[getName];

                    if ('$previous' in currentGetter) {
                        currentGetter.$previous = optimizedGetter;
                    } else {
                        this[getName] = optimizedGetter;
                    }

                    return optimizedGetter.apply(this, arguments);
                };
            }

        });

    });

    Hamster.Class.registerPreprocessor('mixins', function (Class, properties, hooks) {
        var mixins = properties.mixins,
            name, mixin, i, len;

        delete properties.mixins;

        Hamster.Function.before(hooks, 'onCreated', function () {
            if (mixins instanceof Array) {
                for (i = 0, len = mixins.length; i < len; i++) {
                    mixin = mixins[i];
                    name = mixin.prototype.mixinId || mixin.$className;
                    Class.mixin(name, mixin);
                }
            } else {
                for (var mixinName in mixins) {
                    if (mixins.hasOwnProperty(mixinName)) {
                        Class.mixin(mixinName, mixins[mixinName]);
                    }
                }
            }
        });
    });

    Hamster.extend = function (Class, Parent, members) {
        if (arguments.length === 2 && Hamster.isObject(Parent)) {
            members = Parent;
            Parent = Class;
            Class = null;
        }
        var cls;
        if (!Parent) {
            throw new Error("[Hamster.extend] Attempting to extend from a class which has not been loaded on the page.");
        }

        members.extend = Parent;
        members.preprocessors = ['extend', 'statics', 'inheritableStatics', 'mixins'];

        if (Class) {
            cls = new HamsterClass(Class, members);
            cls.prototype.constructor = Class;
        } else {
            cls = new HamsterClass(members);
        }

        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };
        return cls;
    };

})();
(function (Class, alias, arraySlice, arrayFrom, global) {

    function makeCtor() {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    }

    var Manager = Hamster.ClassManager = {

        classes: {},

        existCache: {},

        fileCache: {},

        maps: {
            alternateToName: {},
            nameToAlternates: {}
        },

        namespaceRewrites: [{
            from: 'Hamster.',
            to: Hamster
        }],

        enableNamespaceParseCache: true,

        namespaceParseCache: {},

        instantiators: [],

        isCreated: function (className) {
            var existCache = this.existCache,
                i, ln, part, root, parts;

            if (typeof className != 'string' || className.length < 1) {
                throw new Error("[Hamster.ClassManager] Invalid classname, must be a string and must not be empty");
            }

            if (Hamster.String.has(className, '!')) {
                return this.fileCache[className] !== undefined;
            }

            if (this.classes[className] || existCache[className]) {
                return true;
            }
            root = global;
            parts = this.parseNamespace(className);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];
                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return false;
                    }
                    root = root[part];
                }
            }
            existCache[className] = true;
            this.triggerCreated(className);
            return true;
        },

        createdListeners: [],

        nameCreatedListeners: {},

        triggerCreated: function (className) {
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                alternateNames = this.maps.nameToAlternates[className],
                names = [className],
                i, ln, j, subLn, listener, name;

            for (i = 0, ln = listeners.length; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope, className);
            }

            if (alternateNames) {
                names.push.apply(names, alternateNames);
            }

            for (i = 0, ln = names.length; i < ln; i++) {
                name = names[i];
                listeners = nameListeners[name];

                if (listeners) {
                    for (j = 0, subLn = listeners.length; j < subLn; j++) {
                        listener = listeners[j];
                        listener.fn.call(listener.scope, name);
                    }
                    delete nameListeners[name];
                }
            }
        },

        onCreated: function (fn, scope, className) {
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                listener = {
                    fn: fn,
                    scope: scope
                };

            if (className) {
                if (this.isCreated(className)) {
                    fn.call(scope, className);
                    return;
                }

                if (!nameListeners[className]) {
                    nameListeners[className] = [];
                }

                nameListeners[className].push(listener);
            }
            else {
                listeners.push(listener);
            }
        },



        parseNamespace: function (namespace) {
            if (typeof namespace != 'string') {
                throw new Error("[Hamster.ClassManager] Invalid namespace, must be a string");
            }

            var cache = this.namespaceParseCache,
                parts,
                rewrites,
                root,
                name,
                rewrite, from, to, i, ln;

            if (this.enableNamespaceParseCache) {
                if (cache.hasOwnProperty(namespace)) {
                    return cache[namespace];
                }
            }

            parts = [];
            rewrites = this.namespaceRewrites;
            root = global;
            name = namespace;

            for (i = 0, ln = rewrites.length; i < ln; i++) {
                rewrite = rewrites[i];
                from = rewrite.from;
                to = rewrite.to;

                if (name === from || name.substring(0, from.length) === from) {
                    name = name.substring(from.length);

                    if (typeof to != 'string') {
                        root = to;
                    } else {
                        parts = parts.concat(to.split('.'));
                    }

                    break;
                }
            }

            parts.push(root);

            parts = parts.concat(name.split('.'));

            if (this.enableNamespaceParseCache) {
                cache[namespace] = parts;
            }

            return parts;
        },

        setNamespace: function (name, value) {
            var root = global,
                parts = this.parseNamespace(name),
                ln = parts.length - 1,
                leaf = parts[ln],
                i, part;

            for (i = 0; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root[part]) {
                        root[part] = {};
                    }

                    root = root[part];
                }
            }

            root[leaf] = value;

            return root[leaf];
        },

        createNamespaces: function () {
            var root = global,
                parts, part, i, j, ln, subLn;

            for (i = 0, ln = arguments.length; i < ln; i++) {
                parts = this.parseNamespace(arguments[i]);

                for (j = 0, subLn = parts.length; j < subLn; j++) {
                    part = parts[j];

                    if (typeof part != 'string') {
                        root = part;
                    } else {
                        if (!root[part]) {
                            root[part] = {};
                        }

                        root = root[part];
                    }
                }
            }

            return root;
        },

        set: function (name, value) {
            if (Hamster.String.has(name, '!')) {
                this.fileCache[name] = value;
                return this;
            }
            var me = this,
                maps = me.maps,
                nameToAlternates = maps.nameToAlternates,
                targetName = me.getName(value),
                alternates;

            me.classes[name] = me.setNamespace(name, value);

            if (targetName && targetName !== name) {
                maps.alternateToName[name] = targetName;
                alternates = nameToAlternates[targetName] || (nameToAlternates[targetName] = []);
                alternates.push(name);
            }

            return this;
        },

        get: function (name) {
            var classes = this.classes,
                root,
                parts,
                part, i, ln;

            if (Hamster.String.has(name, '!')) {
                return this.fileCache[name];
            }
            if (classes[name]) {
                return classes[name];
            }

            root = global;
            parts = this.parseNamespace(name);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return null;
                    }

                    root = root[part];
                }
            }

            return root;
        },





        getName: function (object) {
            return object && object.$className || '';
        },

        getClass: function (object) {
            return object && object.self || null;
        },

        define: function (className, data, createdFn) {
            if (className != null && typeof className != 'string') {
                throw new Error("[Hamster.define] Invalid class name '" + className + "' specified, must be a non-empty string");
            }

            var ctor = makeCtor();
            if (typeof data == 'function') {
                data = data(ctor);
            }

            if (className) {
                ctor.displayName = className;
            }

            data.$className = className;

            return new Class(ctor, data, function () {
                var postprocessorStack = data.postprocessors || Manager.defaultPostprocessors,
                    registeredPostprocessors = Manager.postprocessors,
                    postprocessors = [],
                    postprocessor, i, ln, j, subLn, postprocessorProperties, postprocessorProperty;

                delete data.postprocessors;

                for (i = 0, ln = postprocessorStack.length; i < ln; i++) {
                    postprocessor = postprocessorStack[i];

                    if (typeof postprocessor == 'string') {
                        postprocessor = registeredPostprocessors[postprocessor];
                        postprocessorProperties = postprocessor.properties;

                        if (postprocessorProperties === true) {
                            postprocessors.push(postprocessor.fn);
                        }
                        else if (postprocessorProperties) {
                            for (j = 0, subLn = postprocessorProperties.length; j < subLn; j++) {
                                postprocessorProperty = postprocessorProperties[j];

                                if (data.hasOwnProperty(postprocessorProperty)) {
                                    postprocessors.push(postprocessor.fn);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        postprocessors.push(postprocessor);
                    }
                }

                data.postprocessors = postprocessors;
                data.createdFn = createdFn;
                Manager.processCreate(className, this, data);
            });
        },

        processCreate: function (className, cls, clsData) {
            var me = this,
                postprocessor = clsData.postprocessors.shift(),
                createdFn = clsData.createdFn;

            if (!postprocessor) {

                if (className) {
                    me.set(className, cls);
                }

                if (createdFn) {
                    createdFn.call(cls, cls);
                }

                if (className) {
                    me.triggerCreated(className);
                }
                return;
            }

            if (postprocessor.call(me, className, cls, clsData, me.processCreate) !== false) {
                me.processCreate(className, cls, clsData);
            }
        },

        instantiate: function () {
            var name = arguments[0],
                nameType = typeof name,
                args = arraySlice.call(arguments, 1),
                alias = name,
                possibleName, cls;

            if (nameType != 'function') {
                if (nameType != 'string' && args.length === 0) {
                    args = [name];
                    name = name.xclass;
                }
                if (typeof name != 'string' || name.length < 1) {
                    throw new Error("[Hamster.create] Invalid class name or alias '" + name + "' specified, must be a non-empty string");
                }
                cls = this.get(name);
            }
            else {
                cls = name;
            }

            if (!cls) {
                var className = this.getClassNameByXType(name);
                if (!Hamster.isEmpty(className)) {
                    cls = this.get(name = className);
                }
            }

            if (!cls) {
                throw new Error("[Hamster.create] Cannot create an instance of unrecognized class name / alias: " + alias);
            }

            if (typeof cls != 'function') {
                throw new Error("[Hamster.create] '" + name + "' is a singleton and cannot be instantiated");
            }

            return this.getInstantiator(args.length)(cls, args);
        },

        getInstantiator: function (length) {
            var instantiators = this.instantiators,
                instantiator,
                i,
                args;

            instantiator = instantiators[length];

            if (!instantiator) {
                i = length;
                args = [];

                for (i = 0; i < length; i++) {
                    args.push('a[' + i + ']');
                }

                instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
                instantiator.displayName = "Hamster.ClassManager.instantiate" + length;
            }

            return instantiator;
        },




        postprocessors: {},

        defaultPostprocessors: [],

        registerPostprocessor: function (name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }
            if (!properties) {
                properties = [name];
            }
            this.postprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };
            this.setDefaultPostprocessorPosition(name, position, relativeTo);
            return this;
        },

        setDefaultPostprocessors: function (postprocessors) {
            this.defaultPostprocessors = arrayFrom(postprocessors);
            return this;
        },

        setDefaultPostprocessorPosition: function (name, offset, relativeName) {
            var defaultPostprocessors = this.defaultPostprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPostprocessors.unshift(name);
                    return this;
                } else if (offset === 'last') {
                    defaultPostprocessors.push(name);
                    return this;
                }
                offset = (offset === 'after') ? 1 : -1;
            }

            index = Hamster.Array.indexOf(defaultPostprocessors, relativeName);
            if (index !== -1) {
                Hamster.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
            }
            return this;
        }

    };

    Manager.registerPostprocessor('singleton', function (name, cls, properties, fn) {
        if (properties.singleton) {
            fn.call(this, name, (cls = new cls()), properties);
        } else {
            return true;
        }
        return false;
    });

    Manager.registerPostprocessor('alternateClassName', function (name, cls, properties) {
        var alternates = properties.alternateClassName, i, len, alternate;

        if (!(alternates instanceof Array)) {
            alternates = [alternates];
        }
        for (i = 0, len = alternates.length; i < len; i++) {
            alternate = alternates[i];
            if (typeof alternate != 'string') {
                throw new Error("[Hamster.define] Invalid alternate of: '" + alternate + "' for class: '" + name + "'; must be a valid string");
            }
            this.set(alternate, cls);
        }
    });

    function generateClassName () {
        return "Hamster.InnerHelpCreate." + Hamster.uniqueId();
    }

    Hamster.apply(Hamster, {

        define: function (className, data, createdFn) {
            if (arguments.length == 1) {
                data = className;
                className = generateClassName();
                return Manager.define.apply(Manager, [className, data]);
            }
            return Manager.define.apply(Manager, arguments);
        },

        create: alias(Manager, 'instantiate'),

        getClassName: alias(Manager, 'getName'),

        getDisplayName: function(object) {
            if (object) {
                if (object.displayName) {
                    return object.displayName;
                }

                if (object.$name && object.$class) {
                    return Hamster.getClassName(object.$class) + '#' + object.$name;
                }

                if (object.$className) {
                    return object.$className;
                }
            }

            return 'Anonymous';
        },

        getClass: alias(Manager, 'getClass')
    });

    Class.registerPreprocessor('className', function (cls, properties) {
        if (properties.$className) {
            cls.$className = properties.$className;
            cls.displayName = cls.$className;
        }
    }, true, 'first');

})(Hamster.Class, Hamster.Function.alias, Array.prototype.slice, Hamster.Array.from, Hamster.global);

Hamster.define('Hamster.env.Browser', {

    statics: {

        browserNames: {
            ie: 'IE',
            firefox: 'Firefox',
            safari: 'Safari',
            chrome: 'Chrome',
            opera: 'Opera',
            other: 'Other'
        },

        engineNames: {
            webkit: 'WebKit',
            gecko: 'Gecko',
            presto: 'Presto',
            trident: 'Trident',
            other: 'Other'
        },

        enginePrefixes: {
            webkit: 'AppleWebKit/',
            gecko: 'Gecko/',
            presto: 'Presto/',
            trident: 'Trident/'
        },

        browserPrefixes: {
            ie: 'MSIE ',
            firefox: 'Firefox/',
            chrome: 'Chrome/',
            safari: 'Version/',
            opera: 'Opera/'
        }

    },

    isSecure: /^https/i.test(Hamster.global.location.protocol),

    isStrict: Hamster.global.document.compatMode === "CSS1Compat",

    name: null,

    engineName: null,

    is: Hamster.emptyFn,

    constructor: function () {

        var userAgent = this.userAgent = Hamster.global.navigator.userAgent,
            selfClass = this.statics(),
            browserMatch = userAgent.match(new RegExp('((?:' + Hamster.Object.getValues(selfClass.browserPrefixes).join(')|(?:') + '))([\\d\\._]+)')),
            engineMatch = userAgent.match(new RegExp('((?:' + Hamster.Object.getValues(selfClass.enginePrefixes).join(')|(?:') + '))([\\d\\._]+)')),
            browserName = selfClass.browserNames.other,
            browserVersion = '',
            engineName = selfClass.engineNames.other,
            engineVersion = '',
            key, value;

        this.is = function (name) {
            return this.is[name] === true;
        };

        if (browserMatch) {
            browserName = selfClass.browserNames[Hamster.Object.getKey(selfClass.browserPrefixes, browserMatch[1])];
            browserVersion = browserMatch[2];
        }

        if (engineMatch) {
            engineName = selfClass.engineNames[Hamster.Object.getKey(selfClass.enginePrefixes, engineMatch[1])];
            engineVersion = engineMatch[2];
        }

        Hamster.apply(this, {
            name: browserName,
            engineVersion: Hamster.String.parseVersion(engineVersion),
            engineName: engineName,
            version: Hamster.String.parseVersion(browserVersion)
        });

        this.is[this.name] = true;
        this.is[this.name + (this.version.major || '')] = true;
        this.is[this.name + this.version.shortVersion] = true;

        for (key in selfClass.browserNames) {
            if (selfClass.browserNames.hasOwnProperty(key)) {
                value = selfClass.browserNames[key];
                this.is[value] = (this.name === value);
            }
        }

        this.is[this.name] = true;
        this.is[this.engineName + (this.engineVersion.major || '')] = true;
        this.is[this.engineName + this.engineVersion.shortVersion] = true;

        for (key in selfClass.engineNames) {
            if (selfClass.engineNames.hasOwnProperty(key)) {
                value = selfClass.engineNames[key];
                this.is[value] = (this.engineName === value);
            }
        }

        return this;
    }

}, function () {

    Hamster.browser = new Hamster.env.Browser();

    Hamster.isStrict = Hamster.browser.isStrict;

});

Hamster.define('Hamster.env.FeatureDetector', {

    statics: {

        tests: {

            Canvas: function () {
                var element = this.getTestElement('canvas');
                return !!(element && element.getContext && element.getContext('2d'));
            },

            SVG: function () {
                var doc = Hamster.global.document;

                return !!(doc.createElementNS && !!doc.createElementNS("http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect);
            },

            VML: function () {
                var element = this.getTestElement(),
                    ret = false;

                element.innerHTML = "<!--[if vml]><br/><br/><![endif]-->";
                ret = (element.childNodes.length === 2);
                element.innerHTML = "";

                return ret;
            },

            Touch: function () {
                return ('ontouchstart' in Hamster.global) && !(Hamster.platform && Hamster.platform.name.match(/Windows|MacOSX|Linux/));
            },

            Orientation: function () {
                return ('orientation' in Hamster.global);
            },

            Geolocation: function () {
                return !!Hamster.global.navigator.geolocation;
            },

            SqlDatabase: function () {
                return !!Hamster.global.openDatabase;
            },

            Websockets: function () {
                return 'WebSocket' in Hamster.global;
            },

            History: function () {
                return !!(Hamster.global.history && Hamster.global.history.pushState);
            },

            CSSTransforms: function () {
                return this.isStyleSupported('transform');
            },

            CSS3DTransforms: function () {
                return this.has('csstransforms') && this.isStyleSupported('perspective');
            },

            CSSAnimations: function () {
                return this.isStyleSupported('animationName');
            },

            CSSTransitions: function () {
                return this.isStyleSupported('transitionProperty');
            },

            Audio: function () {
                return !!this.getTestElement('audio').canPlayType;
            },

            Video: function () {
                return !!this.getTestElement('video').canPlayType;
            },

            PositionSticky: function () {
                if (Hamster.browser.isIE) {
                    return false;
                }
                var doc = Hamster.global.document;
                var container = doc.body;

                if (doc.createElement && container && container.appendChild && container.removeChild) {
                    var isSupported, el = this.getTestElement('div');
                    var getStyle = function (st) {
                        if (Hamster.global.getComputedStyle) {
                            return Hamster.global.getComputedStyle(el).getPropertyValue(st);
                        } else {
                            return el.currentStyle.getAttribute(st);
                        }
                    };
                    container.appendChild(el);
                    
                    var stickyPrefix = ["-webkit-", "-ms-", "-o-", "-moz-", ""];
                    for (var i = 0; i < stickyPrefix.length; i++) {
                        el.style.cssText = "position:" + stickyPrefix[i] + "sticky;visibility:hidden;";
                        if (isSupported = getStyle("position").indexOf("sticky") !== -1) {
                            break;
                        }
                    }

                    el.parentNode.removeChild(el);
                    return isSupported;
                }
            },

            PositionFixed: function () {
                return !Hamster.browser.isIE6;
            }

        },

        stylePrefixes: ['Webkit', 'Moz', 'O', 'ms']

    },

    tests: {},

    testElements: {},

    constructor: function () {
        this.registerTests(this.statics().tests, true);
        return this;
    },

    has: function (name) {
        if (!this.hasTest(name)) {
            return false;
        }
        else if (this.has.hasOwnProperty(name)) {
            return this.has[name];
        }
        else {
            return this.getTestResult(name);
        }
    },

    getTestResult: function (name) {
        return !!this.getTest(name).call(this);
    },

    getTestElement: function (tag) {
        if (!tag) {
            tag = 'div';
        }

        if (!this.testElements[tag]) {
            this.testElements[tag] = Hamster.global.document.createElement(tag);
        }

        return this.testElements[tag];
    },

    registerTest: function (name, fn, isDefault) {
        if (this.hasTest(name)) {
            Hamster.Error({
                className: "Hamster.env.FeatureDetector",
                methodName: "registerTest",
                error: "Test name " + name + " has already been registered"
            });
        }
        this.tests[name] = fn;
        if (isDefault) {
            this.has[name] = this.getTestResult(name);
        }
        return this;
    },

    registerTests: function (tests, isDefault) {
        var key;
        for (key in tests) {
            if (tests.hasOwnProperty(key)) {
                this.registerTest(key, tests[key], isDefault);
            }
        }
        return this;
    },

    hasTest: function (name) {
        return this.tests.hasOwnProperty(name);
    },

    getTest: function (name) {
        if (!this.hasTest(name)) {
            Hamster.Error({
                className: "Hamster.env.FeatureDetector",
                methodName: "getTest",
                error: "Test name " + name + " does not exist"
            });
        }
        return this.tests[name];
    },

    getTests: function () {
        return this.tests;
    },

    isStyleSupported: function (name, tag) {
        var elementStyle = this.getTestElement(tag).style,
            cName = Hamster.String.capitalize(name),
            i = this.statics().stylePrefixes.length;

        if (elementStyle[name] !== undefined) {
            return true;
        }

        while (i--) {
            if (elementStyle[this.statics().stylePrefixes[i] + cName] !== undefined) {
                return true;
            }
        }
        return false;
    },

    isEventSupported: function (name, tag) {
        var element = this.getTestElement(tag),
            eventName = 'on' + name,
            isSupported = false;

        isSupported = (eventName in element);

        if (!isSupported) {
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';
                if (typeof element[eventName] !== 'undefined') {
                    element[eventName] = undefined;
                }
                element.removeAttribute(eventName);
            }
        }

        return isSupported;
    }


}, function () {

    Hamster.features = new Hamster.env.FeatureDetector();

});

Hamster.define('Hamster.util.Event', {

    constructor: function (config) {
        Hamster.apply(this, config || {});
        this.__$listeners = {};
        this.__$eventsSuspended = 0;
        this.initListeners();
    },

    initListeners: function () {
        var listeners = this.listeners;
        this.hasListeners = {};
        Hamster.Object.each(listeners, function (name, fn) {
            this.hasListeners[name] = true;
            this.on(name, fn);
        }, this);
    },

    on: function (events, handler, scope) {
        var cache, event, list;
        if (!handler) {
            return this;
        }
        events = events.split(/\s+/);
        while (event = events.shift()) {
            list = this.__$listeners[event] || (this.__$listeners[event] = []);
            list.push(handler, scope);
        }
        return this
    },

    once: function (events, handler, scope) {
        var me = this;
        var callback = function () {
            me.off(events, callback);
            handler.apply(scope || me, arguments);
        };
        return this.on(events, callback, scope);
    },

    off: function (events, handler, scope) {
        var event, list, i;
        // 当没有任何参数的时候
        if (!(events || handler || scope)) {
            this.__$listeners = {};
            return this;
        }
        events = events ? events.split(/\s+/) : Hamster.Object.getKeys(this.__$listeners);
        while (event = events.shift()) {
            list = this.__$listeners[event];
            if (!list) {
                continue;
            }
            if (!(handler || scope)) {
                delete this.__$listeners[event];
                continue;
            }
            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(handler && list[i] !== handler || scope && list[i + 1] !== scope)) {
                    list.splice(i, 2);
                }
            }
        }
        return this;
    },

    trigger: function (events) {
        var event, all, list, i, len, rest = [],
            returned = true;

        events = events.split(/\s+/);

        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }

        while (event = events.shift()) {
            if (all = this.__$listeners.all) {
                all = all.slice();
            }
            if (list = this.__$listeners[event]) {
                list = list.slice();
            }
            if (event !== 'all') {
                returned = this.__$continueFireEvent(list, rest) && returned;
            }
            returned = this.__$continueFireEvent(all, [event].concat(rest)) && returned;
        }
        return returned;
    },

    suspendEvents: function () {
        this.__$eventsSuspended += 1;
        this.__$eventQueue = [];
    },

    resumeEvents: function () {
        var me = this,
            queued = me.__$eventQueue,
            qLen, q;

        if (me.__$eventsSuspended && ! --me.__$eventsSuspended) {
            delete me.__$eventQueue;

            if (queued) {
                qLen = queued.length;
                for (q = 0; q < qLen; q++) {
                    me.__$continueFireEvent.apply(me, queued[q]);
                }
            }
        }
    },

    __$continueFireEvent: function (list, args) {
        var pass = true;
        if (this.__$eventsSuspended) {
            if (this.__$eventQueue) {
                this.__$eventQueue.push([list, args]);
            }
            return pass;
        } else {
            if (Hamster.isEmpty(list)) {
                return pass;
            }
            var i = 0, l = list.length;
            for (; i < l; i += 2) {
                pass = list[i].apply(list[i + 1] || this, args) !== false && pass;
            }
        }
        return pass;
    }

});
Hamster.define('Hamster.util.Sorter', {

    mixins: {
        event: Hamster.util.Event
    },

    property: null,

    sorterFn: null,

    root: null,

    transform: null,

    direction: "ASC",

    constructor: function (config) {
        Hamster.apply(this, config);
        if (Hamster.isEmpty(this.property) && Hamster.isEmpty(this.sorterFn)) {
            Hamster.Error("A Sorter requires either a property or a sorter function");
        }
        this.mixins.event.constructor.call(this, config);
        this.updateSortFunction();
    },

    createSortFunction: function (sorterFn) {
        var me = this,
            property = me.property,
            direction = me.direction || "ASC",
            modifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        return function (o1, o2) {
            return modifier * sorterFn.call(me, o1, o2);
        };
    },

    defaultSorterFn: function (o1, o2) {
        var me = this,
            transform = me.transform,
            v1 = me.getRoot(o1)[me.property],
            v2 = me.getRoot(o2)[me.property];

        if (transform) {
            v1 = transform(v1);
            v2 = transform(v2);
        }

        return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
    },

    getRoot: function (item) {
        return Hamster.isEmpty(this.root) ? item : item[this.root];
    },

    setDirection: function (direction) {
        var me = this;
        me.direction = direction ? direction.toUpperCase() : direction;
        me.updateSortFunction();
    },

    toggle: function () {
        var me = this;
        me.direction = Hamster.String.toggle(me.direction, "ASC", "DESC");
        me.updateSortFunction();
    },

    updateSortFunction: function (fn) {
        var me = this;
        fn = fn || me.sorterFn || me.defaultSorterFn;
        me.sort = me.createSortFunction(fn);
    }

});
Hamster.define("Hamster.util.Sortable", {

    isSortable: true,

    defaultSortDirection: "ASC",

    sortRoot: null,

    initSortable: function () {
        var sorters = this.sorters;

        this.sorters = new Hamster.util.AbstractMixedCollection(false, function (item) {
            return item.id || item.property;
        });

        if (sorters) {
            this.sorters.addAll(this.decodeSorters(sorters));
        }
    },

    sort: function (sorters, direction, where, doSort) {
        var me = this,
            sorter, sorterFn,
            newSorters;

        if (Hamster.isArray(sorters)) {
            doSort = where;
            where = direction;
            newSorters = sorters;
        } else if (Hamster.isObject(sorters)) {
            doSort = where;
            where = direction;
            newSorters = [sorters];
        } else if (Hamster.isString(sorters)) {
            sorter = me.sorters.get(sorters);

            if (!sorter) {
                sorter = {
                    property: sorters,
                    direction: direction
                };
                newSorters = [sorter];
            } else if (direction === undefined) {
                sorter.toggle();
            } else {
                sorter.setDirection(direction);
            }
        }

        if (newSorters && newSorters.length) {
            newSorters = me.decodeSorters(newSorters);
            if (Hamster.isString(where)) {
                if (where === 'prepend') {
                    sorters = me.sorters.clone().items;

                    me.sorters.clear();
                    me.sorters.addAll(newSorters);
                    me.sorters.addAll(sorters);
                }
                else {
                    me.sorters.addAll(newSorters);
                }
            }
            else {
                me.sorters.clear();
                me.sorters.addAll(newSorters);
            }
        }

        if (doSort !== false) {
            me.onBeforeSort(newSorters);

            sorters = me.sorters.items;
            if (sorters.length) {
                me.doSort(me.generateComparator());
            }
        }

        return sorters;
    },

    generateComparator: function () {
        var sorters = this.sorters.getRange();
        return sorters.length ? this.createComparator(sorters) : this.emptyComparator;
    },

    createComparator: function (sorters) {
        return function (r1, r2) {
            var result = sorters[0].sort(r1, r2),
                length = sorters.length,
                i = 1;

            for (; i < length; i++) {
                result = result || sorters[i].sort.call(this, r1, r2);
            }
            return result;
        };
    },

    emptyComparator: function () {
        return 0;
    },

    onBeforeSort: Hamster.emptyFn,

    decodeSorters: function (sorters) {
        if (!Hamster.isArray(sorters)) {
            if (sorters === undefined) {
                sorters = [];
            } else {
                sorters = [sorters];
            }
        }

        var length = sorters.length,
            Sorter = Hamster.util.Sorter,
            config, i;

        for (i = 0; i < length; i++) {
            config = sorters[i];

            if (!(config instanceof Sorter)) {
                if (Hamster.isString(config)) {
                    config = {
                        property: config
                    };
                }

                Hamster.applyIf(config, {
                    root: this.sortRoot,
                    direction: "ASC"
                });

                if (config.fn) {
                    config.sorterFn = config.fn;
                }

                if (typeof config == 'function') {
                    config = {
                        sorterFn: config
                    };
                }

                sorters[i] = new Hamster.util.Sorter(config);
            }
        }

        return sorters;
    },

    getSorters: function () {
        return this.sorters.items;
    },

    getFirstSorter: function () {
        var sorters = this.sorters.items,
            len = sorters.length,
            i = 0,
            sorter;

        for (; i < len; ++i) {
            sorter = sorters[i];
            return sorter;
        }
        return null;
    }
});
Hamster.define('Hamster.util.Filter', {

    mixins: {
        event: Hamster.util.Event
    },

    statics: {

        createFilterFn: function (filters) {
            return filters && filters.length ? function (candidate) {
                var isMatch = true,
                    length = filters.length,
                    i, filter;

                for (i = 0; isMatch && i < length; i++) {
                    filter = filters[i];
                    if (!filter.disabled) {
                        isMatch = isMatch && filter.filterFn.call(filter.scope || filter, candidate);
                    }
                }
                return isMatch;
            } : function () {
                return true;
            };
        }

    },

    anyMatch: false,

    exactMatch: false,

    caseSensitive: false,

    root: null,

    filterFn: null,

    property: null,

    value: null,

    // < <= = >= > !=
    operator: null,

    operatorFns: {
        "<": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) < this.value;
        },
        "<=": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) <= this.value;
        },
        "=": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) == this.value;
        },
        "==": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) == this.value;
        },
        ">=": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) >= this.value;
        },
        ">": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) > this.value;
        },
        "!=": function (candidate) {
            return Hamster.coerce(this.getRoot(candidate)[this.property], this.value) != this.value;
        }
    },

    constructor: function (config) {
        this.initialConfig = config;
        Hamster.apply(this, config);
        this.mixins.event.constructor.call(this, config);
        this.filter = this.filter || this.filterFn;
        if (Hamster.isEmpty(this.filter)) {
            this.setValue(config.value);
        }
    },

    setValue: function (value) {
        this.value = value;
        if (this.property === undefined || this.value === undefined) {

        } else {
            this.filter = this.createFilterFn();
        }
        this.filterFn = this.filter;
    },

    setFilterFn: function (filterFn) {
        this.filterFn = this.filter = filterFn;
    },

    createFilterFn: function () {
        var me = this, matcher = this._createValueMatcher(),
            property = this.property;

        if (this.operator) {
            return this.operatorFns[this.operator];
        } else {
            return function (item) {
                var value = me.getRoot.call(me, item)[property];
                return matcher === null ? value === null : matcher.test(value);
            };
        }
    },

    getRoot: function (item) {
        var root = this.root;
        return Hamster.isEmpty(root) ? item : item[root];
    },

    _createValueMatcher: function () {
        var value = this.value,
            anyMatch = this.anyMatch,
            exactMatch = this.exactMatch,
            caseSensitive = this.caseSensitive,
            escapeRe = Hamster.String.escapeRegex;

        if (value === null) {
            return value;
        }

        if (!value.exec) {
            value = String(value);

            if (anyMatch === true) {
                value = escapeRe(value);
            } else {
                value = '^' + escapeRe(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
        }

        return value;
    },

    serialize: function () {
        var result = Hamster.apply({}, this.initialConfig);
        result.value = this.value;
        return result;
    }

});
// 4.0.1
Hamster.define('Hamster.util.AbstractMixedCollection', {

    mixins: {
        event: Hamster.util.Event
    },

    isMixedCollection: true,

    generation: 0,

    constructor: function (keyFn) {
        if (Hamster.isObject(keyFn)) {
            Hamster.apply(this, keyFn);
        } else if (Hamster.isFunction(keyFn)) {
            this.getKey = keyFn;
        }
        this.mixins.event.constructor.call(this);

        this.items = [];
        this.map = {};
        this.keys = [];
        this.length = 0;
    },

    getKey: function (item) {
        return item.id
    },

    add: function (key, item) {
        var iKey = key, iItem = item, old;
        if (arguments.length == 1) {
            iItem = iKey;
            iKey = this.getKey(iItem)
        }
        if (typeof iKey != 'undefined' && iKey !== null) {
            old = this.map[iKey];
            if (typeof old != 'undefined') {
                return this.replace(iKey, iItem);
            }
            this.map[iKey] = iItem
        }

        this.generation++;
        this.length++;
        this.items.push(iItem);
        this.keys.push(iKey);
        this.trigger('add', this.length - 1, iItem, iKey);
        return iItem
    },

    addAll: function (items) {
        var i = 0, args, len, key;
        if (arguments.length > 1 || Hamster.isArray(items)) {
            args = arguments.length > 1 ? arguments : items;
            for (len = args.length; i < len; i++) {
                this.add(args[i])
            }
        } else {
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    this.add(key, items[key])
                }
            }
        }
    },

    replace: function (key, item) {
        var old, index;
        if (arguments.length == 1) {
            item = arguments[0];
            key = this.getKey(item);
        }

        old = this.map[key];
        if (typeof key == 'undefined' || key === null || typeof old == 'undefined') {
            return this.add(key, item)
        }
        this.generation++;
        index = this.indexOfKey(key);
        this.items[index] = item;
        this.map[key] = item;
        this.trigger('replace', key, old, item);
        return item
    },

    each: function (fn, scope) {
        var items = [].concat(this.items);
        var len = items.length, i = 0, item;
        for (; i < len; i++) {
            item = items[i];
            if (fn.call(scope || item, item, i, len) === false) {
                break;
            }
        }
    },

    eachKey: function (fn, scope) {
        var keys = this.keys,
            items = this.items,
            len = keys.length,
            i = 0;

        for (; i < len; i++) {
            fn.call(scope || window, keys[i], items[i], i, len)
        }
    },

    findBy: function (fn, scope) {
        var keys = this.keys,
            items = this.items,
            len = items.length,
            i = 0;
        for (; i < len; i++) {
            if (fn.call(scope || window, items[i], keys[i])) {
                return items[i]
            }
        }
        return null
    },

    find: function () {
        return this.findBy.apply(this, arguments)
    },

    insert: function (index, key, record) {
        var iKey = key, iRecord = record;
        if (arguments.length == 2) {
            iRecord = record;
            iKey = this.getKey(iRecord);
        }
        if (this.containsKey(iKey)) {
            this.suspendEvents();
            this.removeAtKey(iKey);
            this.resumeEvents();
        }
        if (index >= this.length) {
            return this.add(iKey, iRecord);
        }
        this.generation++;
        this.length++;
        Hamster.Array.splice(this.items, index, 0, iRecord);
        if (typeof iKey != 'undefined' && iKey !== null) {
            this.map[iKey] = iRecord
        }
        Hamster.Array.splice(this.keys, index, 0, iRecord);
        this.trigger('add', index, iRecord, iKey);
        return iRecord
    },

    remove: function (record) {
        this.generation++;
        return this.removeAt(this.indexOf(record))
    },

    removeAt: function (index) {
        var key, record;
        if (index < this.length && index >= 0) {
            this.length--;
            record = this.items[index];
            Hamster.Array.erase(this.items, index, 1);
            key = this.keys[index];
            if (typeof key != 'undefined') {
                delete this.map[key]
            }
            Hamster.Array.erase(this.keys, index, 1);
            this.trigger('remove', record, key);
            this.generation++;
            return record
        }
        return false
    },

    removes: function (items) {
        items = [].concat(items);
        var i, len = items.length;
        for (i = 0; i < len; i++) {
            this.remove(items[i])
        }
        return this
    },

    removeAtKey: function (key) {
        return this.removeAt(this.indexOfKey(key));
    },

    getCount: function () {
        return this.length;
    },

    indexOf: function (record) {
        return Hamster.Array.indexOf(this.items, record);
    },

    indexOfKey : function(key) {
        return Hamster.Array.indexOf(this.keys, key);
    },

    get: function (key) {
        var record = this.map[key],
            item = record !== undefined ? record : (typeof key == 'number') ? this.items[key] : undefined;
        return typeof item != 'function' ? item : null;
    },

    getAt: function (index) {
        return this.items[index];
    },

    getByKey: function (key) {
        return this.map[key];
    },

    contains: function (item) {
        return typeof this.map[this.getKey(item)] != 'undefined';
    },

    containsKey: function (key) {
        return typeof this.map[key] != 'undefined';
    },

    clear: function () {
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.generation++;
        this.trigger('clear');
    },

    first: function () {
        return this.items[0]
    },

    last: function () {
        return this.items[this.length - 1];
    },

    sum: function (property, root, start, end) {
        var values = this._extractValues(property, root),
            length = values.length,
            sum = 0,
            i;

        start = start || 0;
        end = (end || end === 0) ? end : length - 1;
        for (i = start; i <= end; i++) {
            sum += values[i];
        }
        return sum;
    },

    _extractValues: function (property, root) {
        var values = this.items;
        if (root) {
            values = Hamster.Array.pluck(values, root);
        }
        return Hamster.Array.pluck(values, property);
    },

    collect: function (property, root, isUnique, allowNull) {
        var values = this._extractValues(property, root),
            length = values.length,
            hits = {},
            unique = [],
            value, strValue, i;

        for (i = 0; i < length; i++) {
            value = values[i];
            strValue = String(value);
            if ((allowNull || !Hamster.isEmpty(value))) {
                if (isUnique) {
                    if (!hits[strValue]) {
                        hits[strValue] = true;
                        unique.push(value);
                    }
                } else {
                    unique.push(value);
                }
            }
        }
        return unique;
    },

    getRange: function (start, end) {
        var items = this.items,
            range = [],
            i;

        if (items.length < 1) {
            return range;
        }
        start = start || 0;
        end = Math.min(typeof end == 'undefined' ? this.length - 1 : end, this.length - 1);
        if (start <= end) {
            for (i = start; i <= end; i++) {
                range[range.length] = items[i];
            }
        } else {
            for (i = start; i >= end; i--) {
                range[range.length] = items[i];
            }
        }
        return range;
    },

    filter: function (property, value, anyMatch, caseSensitive) {
        var filters = [], filterFn;
        if (Hamster.isString(property)) {
            filters.push(new Hamster.util.Filter({
                property: property,
                value: value,
                anyMatch: anyMatch,
                caseSensitive: caseSensitive
            }))
        } else if (Hamster.isArray(property) || property instanceof  Hamster.util.Filter) {
            filters = filters.concat(property)
        }

        filterFn = function (record) {
            var isMatch = true, length = filters.length;
            var filter, scope, fn, i;
            for (i = 0; i < length; i++) {
                filter = filters[i];
                fn = filter.filterFn;
                scope = filter.scope;
                isMatch = isMatch && fn.call(scope, record);
            }
            return isMatch;
        };

        return this.filterBy(filterFn)
    },

    filterBy: function (fn, scope) {
        var newMC = new (this.self)(),
            keys = this.keys,
            items = this.items,
            length = items.length,
            i;

        newMC.getKey = this.getKey;

        for (i = 0; i < length; i++) {
            if (fn.call(scope || this, items[i], keys[i])) {
                newMC.add(keys[i], items[i]);
            }
        }
        return newMC;
    },

    findIndex: function (property, value, start, anyMatch, caseSensitive) {
        if (Hamster.isEmpty(value, false)) {
            return -1
        }
        value = this._createValueMatcher(value, anyMatch, caseSensitive);
        return this.findIndexBy(function (record) {
            return record && value.test(record[property]);
        }, null, start);
    },

    findIndexBy: function (fn, scope, start) {
        var keys = this.keys,
            items = this.items,
            len = items.length,
            i = start || 0;

        for (; i < len; i++) {
            if (fn.call(scope || this, items[i], keys[i])) {
                return i;
            }
        }
        return -1;
    },

    _createValueMatcher: function (value, anyMatch, caseSensitive, exactMatch) {
        if (!value.exec) {
            var er = Hamster.String.escapeRegex;
            value = String(value);
            if (anyMatch === true) {
                value = er(value)
            } else {
                value = '^' + er(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
        }
        return value;
    },

    clone: function () {
        var copy = new (this.self)(),
            keys = this.keys,
            items = this.items,
            len = items.length,
            i = 0;

        for (; i < len; i++) {
            copy.add(keys[i], items[i]);
        }
        copy.getKey = this.getKey;
        return copy;
    }

});
Hamster.define('Hamster.util.MixedCollection', {

    mixins: {
        sortable: Hamster.util.Sortable
    },

    extend: Hamster.util.AbstractMixedCollection,

    constructor: function () {
        this.callParent(arguments);
        this.initSortable()
    },

    doSort: function (sorterFn) {
        this.sortBy(sorterFn)
    },

    _sort: function (property, dir, fn) {
        var dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,
            keys = this.keys,
            items = this.items,
            c = [],
            i, len;

        fn = fn || function (a, b) {
            return a - b;
        };

        for (i = 0, len = items.length; i < len; i++) {
            c[c.length] = {
                key: keys[i],
                value: items[i],
                index: i
            };
        }

        Hamster.Array.sort(c, function (a, b) {
            var v = fn(a[property], b[property]) * dsc;
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        for (i = 0, len = c.length; i < len; i++) {
            items[i] = c[i].value;
            keys[i] = c[i].key;
        }

        this.trigger('sort', this);
    },

    sortBy: function (sorterFn, scope) {
        var items = this.items,
            keys = this.keys,
            length = items.length,
            temp = [],
            i;

        for (i = 0; i < length; i++) {
            temp[i] = {
                key: keys[i],
                value: items[i],
                index: i
            };
        }

        Hamster.Array.sort(temp, function (a, b) {
            var v = sorterFn.call(scope || this, a.value, b.value);
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }

            return v;
        }, this);

        for (i = 0; i < length; i++) {
            items[i] = temp[i].value;
            keys[i] = temp[i].key;
        }

        this.trigger('sort', this, items, keys);
    },

    findInsertionIndex: function (newItem, sorterFn) {
        var items = this.items,
            start = 0,
            end = items.length - 1,
            middle,
            comparison;

        if (!sorterFn) {
            sorterFn = this.generateComparator();
        }
        while (start <= end) {
            middle = (start + end) >> 1;
            comparison = sorterFn(newItem, items[middle]);
            if (comparison >= 0) {
                start = middle + 1;
            } else if (comparison < 0) {
                end = middle - 1;
            }
        }
        return start;
    },

    reorder: function (mapping) {
        var items = this.items,
            index = 0,
            length = items.length,
            order = [],
            remaining = [],
            oldIndex;

        //todo suspendEvents

        for (oldIndex in mapping) {
            order[mapping[oldIndex]] = items[oldIndex];
        }
        for (index = 0; index < length; index++) {
            if (mapping[index] == undefined) {
                remaining.push(items[index]);
            }
        }
        for (index = 0; index < length; index++) {
            if (order[index] == undefined) {
                order[index] = remaining.shift();
            }
        }

        this.clear();
        this.addAll(order);

        //todo resumeEvents
        this.trigger('sort', this);
    },

    sortByKey: function (dir, fn, scope) {
        if (Hamster.isFunction(dir)) {
            fn = dir;
            dir = "ASC";
        }
        this._sort('key', dir, Hamster.Function.bind(fn || function (a, b) {
            var v1 = String(a).toUpperCase(), v2 = String(b).toUpperCase();
            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        }, scope || this));
    }

});
Hamster.define('Hamster.util.Cookie', {

    singleton: true,

    set: function (name, value) {
        var argv = arguments;
        var argc = arguments.length;

        var expires = (argc > 2) ? argv[2] : null;
        var path = (argc > 3) ? argv[3] : '/';
        var domain = (argc > 4) ? argv[4] : null;
        var secure = (argc > 5) ? argv[5] : false;

        var expressions = name + "=" + escape(value);

        if (expires !== null) {
            expressions += "; expires=" + expires.toGMTString();
        }
        if (path !== null) {
            expressions += "; path=" + path;
        }
        if (domain !== null) {
            expressions += "; domain=" + domain;
        }
        if (secure === true) {
            expressions += "; secure";
        }

        document.cookie = expressions;
    },

    get: function (name) {
        var arg = name + "=",
            alen = arg.length,
            clen = document.cookie.length,
            i = 0,
            j = 0;

        while (i < clen) {
            j = i + alen;
            if (document.cookie.substring(i, j) == arg) {
                return this.getCookieVal(j);
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if (i === 0) {
                break;
            }
        }
        return null;
    },

    clear: function (name, path) {
        if (this.get(name)) {
            path = path || '/';
            document.cookie = name + '=' + '; expires=Thu, 01-Jan-70 00:00:01 GMT; path=' + path;
        }
    },

    getCookieVal: function (offset) {
        var endstr = document.cookie.indexOf(";", offset);
        if (endstr == -1) {
            endstr = document.cookie.length;
        }
        return unescape(document.cookie.substring(offset, endstr));
    }

});

Hamster.define('Hamster.util.JSON', {

    singleton: true,

    encodingFunction: null,

    decodingFunction: null,

    useNative: null,

    useHasOwn: !!{}.hasOwnProperty,

    specials: {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b'
    },

    charToReplace: /[\\\"\x00-\x1f\x7f-\uffff]/g,

    isNative: function () {
        return Hamster.Setting.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]'
    },

    pad: function (n) {
        return n < 10 ? "0" + n : n;
    },

    doDecode: function (json) {
        return eval("(" + json + ')');
    },

    doEncode: function (o, newline) {
        if (o === null || o === undefined) {
            return "null";
        } else if (Hamster.isDate(o)) {
            return this.encodeDate(o);
        } else if (Hamster.isString(o)) {
            return this.encodeString(o);
        } else if (typeof o == "number") {
            return isFinite(o) ? String(o) : "null";
        } else if (Hamster.isBoolean(o)) {
            return String(o);
        } else if (o.toJSON) {
            return o.toJSON();
        } else if (Hamster.isArray(o)) {
            return this.encodeArray(o, newline);
        } else if (Hamster.isObject(o)) {
            return this.encodeObject(o, newline);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },

    encodeString: function (s) {
        return '"' + s.replace(this.charToReplace, function (a) {
            var c = this.specials[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },

    encodeArrayPretty: function (o, newline) {
        var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline],
            i;

        for (i = 0; i < len; i += 1) {
            a.push(this.encodeValue(o[i], cnewline), sep);
        }
        a[a.length - 1] = newline + ']';
        return a.join('');
    },

    encodeObjectPretty: function (o, newline) {
        var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline],
            i;

        for (i in o) {
            if (!this.useHasOwn || o.hasOwnProperty(i)) {
                a.push(this.encodeValue(i) + ': ' + this.encodeValue(o[i], cnewline), sep);
            }
        }
        a[a.length - 1] = newline + '}';
        return a.join('');
    },

    encodeArray: function (o, newline) {
        if (newline) {
            return this.encodeArrayPretty(o, newline);
        }
        var a = ["[", ""],
            len = o.length,
            i;
        for (i = 0; i < len; i += 1) {
            a.push(this.encodeValue(o[i]), ',');
        }
        a[a.length - 1] = ']';
        return a.join("");
    },

    encodeObject: function (o, newline) {
        if (newline) {
            return this.encodeObjectPretty(o, newline);
        }
        var a = ["{", ""],
            i;
        for (i in o) {
            if (!this.useHasOwn || o.hasOwnProperty(i)) {
                a.push(this.encodeValue(i), ":", this.encodeValue(o[i]), ',');
            }
        }
        a[a.length - 1] = '}';
        return a.join("");
    },

    encodeDate: function (o) {
        return '"' + o.getFullYear() + "-"
            + this.pad(o.getMonth() + 1) + "-"
            + this.pad(o.getDate()) + "T"
            + this.pad(o.getHours()) + ":"
            + this.pad(o.getMinutes()) + ":"
            + this.pad(o.getSeconds()) + '"';
    },

    encode: function (o) {
        if (!this.encodingFunction) {
            this.encodingFunction = this.isNative() ? JSON.stringify : this.doEncode;
        }
        return this.encodingFunction(o);
    },

    decode: function (json, safe) {
        if (!this.decodingFunction) {
            this.decodingFunction = this.isNative() ? JSON.parse : this.doDecode;
        }
        try {
            return this.decodingFunction(json);
        } catch (e) {
            if (safe === true) {
                return null;
            }
            Hamster.Error({
                className: "Hamster.util.JSON",
                methodName: "decode",
                error: "You're trying to decode an invalid JSON String: " + json
            });
        }
    }

}, function () {

    Hamster.JSON = Hamster.util.JSON;

    Hamster.JSON.encodeValue = Hamster.JSON.doEncode;

});
Hamster.define('Hamster.util.Format',  (function () {

    var stripTagsRE = /<\/?[^>]+>/gi,
        stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe = /\r?\n/g,
        formatCleanRe = /[^\d\.]/g,
        I18NFormatCleanRe;

    return {

        singleton: true,

        thousandSeparator: ",",

        //小数分隔符
        decimalSeparator: ".",

        //货币的精确到2位小数
        currencyPrecision: 2,
        //货币符号
        currencySign: '$',

        currencyAtEnd: false,

        undef: function (value) {
            return value !== undefined ? value : "";
        },

        defaultValue: function (value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        substr: 'ab'.substr(-1) != 'b' ? function (value, start, length) {
            var str = String(value);
            return (start < 0) ? str.substr(Math.max(str.length + start, 0), length) : str.substr(start, length);
        } : function (value, start, length) {
            return String(value).substr(start, length);
        },

        lowercase: function (value) {
            return String(value).toLowerCase();
        },

        uppercase: function (value) {
            return String(value).toUpperCase();
        },

        usMoney: function (v) {
            return this.currency(v, '$', 2);
        },

        //格式化一个数字类型的值为货币类型
        currency: function (v, currencySign, decimals, end) {
            //negativeSign：正负标识
            var negativeSign = "",
                format = ',0',
                i = 0;

            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }

            decimals = decimals || _module.currencyPrecision;
            format += format + (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = this.number(v, format);
            if ((end || this.currencyAtEnd) === true) {
                return Hamster.String.format("{0}{1}{2}", negativeSign, v, currencySign || this.currencySign);
            } else {
                return Hamster.String.format("{0}{1}{2}", negativeSign, currencySign || this.currencySign, v);
            }
        },

        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Hamster.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Hamster.Date.format(v, format || Hamster.Date.defaultFormat);
        },

        dateRenderer: function (format) {
            return function (v) {
                return Hamster.Date.format(v, format);
            };
        },

        stripTags: function (v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },

        stripScripts: function (v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },

        fileSize: function (size) {
            if (size < 1024) {
                return size + " bytes";
            } else if (size < 1048576) {
                return (Math.round(((size*10) / 1024))/10) + " KB";
            } else {
                return (Math.round(((size*10) / 1048576))/10) + " MB";
            }
        },

        math: function () {
            var fns = {};
            return function (v, a) {
                if (!fns[a]) {
                    fns[a] = Hamster.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }(),

        round: function (value, precision) {
            var result = Number(value);
            if (typeof precision == 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            }
            return result;
        },

        //format.number(123456.9, '0.0000') --> 123456.9000
        number: function (v, formatString) {
            if (!formatString) {
                return v;
            }
            v = Hamster.Number.num(v, NaN);
            if (isNaN(v)) {
                return "";
            }
            var comma = this.thousandSeparator,
                dec = this.decimalSeparator,
                i18n = false,
                neg = v < 0,
                hasComma, psplit;

            v = Math.abs(v);

            if (formatString.substr(formatString.length - 2) == '/i') {
                if (!I18NFormatCleanRe) {
                    I18NFormatCleanRe = new RegExp('[^\\d\\' + this.decimalSeparator + ']', 'g');
                }
                formatString = formatString.substr(0, formatString.length - 2);
                i18n = true;
                hasComma = formatString.indexOf(comma) != -1;
                psplit = formatString.replace(I18NFormatCleanRe).split(dec);
            } else {
                hasComma = formatString.indexOf(',') != -1;
                psplit = formatString.replace(formatCleanRe, '').split('.');
            }

            if (1 < psplit.length) {
                v = v.toFixed(psplit[1].length);
            } else if (2 < psplit.length) {
                alert("Invalid number format, should have no more than 1 decimal");
                return;
            } else {
                v = v.toFixed(0);
            }

            var fnum = v.toString();
            psplit = fnum.split('.');
            if (hasComma) {
                var cnum = psplit[0],
                    parr = [],
                    j = cnum.length,
                    m = Math.floor(j / 3),
                    n = cnum.length % 3 || 3,
                    i;

                for (i = 0; i < j; i += n) {
                    if (i !== 0) {
                        n = 3;
                    }

                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }
                fnum = parr.join(comma);
                if (psplit[1]) {
                    fnum += dec + psplit[1];
                }
            } else {
                if (psplit[1]) {
                    fnum = psplit[0] + dec + psplit[1];
                }
            }

            return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
        },

        numberRenderer: function (format) {
            return function (v) {
                return this.number(v, format);
            };
        },

        plural: function (v, s, p) {
            return v + ' ' + (v == 1 ? s : (p ? p : s + 's'));
        },

        //把换行转化成html标签br
        nl2br: function (v) {
            return Hamster.isEmpty(v) ? '' : v.replace(nl2brRe, '<br/>')
        },

        //字符串首字母大写
        firstUpperCase: Hamster.String.firstUpperCase,

        //字符串超出长度以省略号代替
        ellipsis: Hamster.String.ellipsis,

        format: Hamster.String.format,

        htmlDecode: Hamster.String.htmlDecode,

        htmlEncode: Hamster.String.htmlEncode,

        leftPad: Hamster.String.leftPad,

        trim: Hamster.String.trim,

        escapeRegex: function (s) {
            return s.replace(/([\-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        },

        //主要是针对css中的象margin这样的设置， 10px可以写成10 10 10 10
        parseHamster: function (Hamster) {
            Hamster = Hamster || 0;
            if (Hamster.isObject(Hamster)) {
                return {
                    top: Hamster.top || 0,
                    right: Hamster.right || 0,
                    bottom: Hamster.bottom || 0,
                    left: Hamster.left || 0,
                    width: (Hamster.right || 0) + (Hamster.left || 0),
                    height: (Hamster.top || 0) + (Hamster.bottom || 0)
                };
            } else {
                if (typeof Hamster != 'string') {
                    Hamster = Hamster.toString();
                }
                var parts = Hamster.split(/\s+/),
                    ln = parts.length;

                if (ln == 1) {
                    parts[1] = parts[2] = parts[3] = parts[0];
                } else if (ln == 2) {
                    parts[2] = parts[0];
                    parts[3] = parts[1];
                } else if (ln == 3) {
                    parts[3] = parts[1];
                }

                return {
                    top: parseFloat(parts[0]) || 0,
                    right: parseFloat(parts[1]) || 0,
                    bottom: parseFloat(parts[2]) || 0,
                    left: parseFloat(parts[3]) || 0,
                    width: (parseFloat(parts[1]) || 0) + (parseFloat(parts[3]) || 0),
                    height: (parseFloat(parts[0]) || 0) + (parseFloat(parts[2]) || 0)
                };
            }
        }

    }

})());

// regexp see: VerbalExpressions 
Hamster.define('Hamster.util.RegExp', {

	statics: {

		create: function() {
			return new Hamster.util.RegExp();
		},

		is: function (type, str) {
			var fn = Hamster.util.RegExp[type];
			if (!Hamster.isFunction(fn)) {
				Hamster.Error('can not find ' + type + ' method');
			}
			return fn().test(str)
		},

		ip: function () {
			var regexp = Hamster.regexp().beginCapture().number().repeat(1, 2)
				.or().then("1").number().repeat(2)
				.or().then("2").range("0", "4").number()
				.or().then("25").range("0", "5").endCapture();
				
			return Hamster.regexp()
				.startOfLine()
				.beginCapture().then(regexp).then(".").endCapture()
				.repeat(3)
				.then(regexp)
				.endOfLine();
		},

		url: function (str) {
			return Hamster.regexp()
			    .startOfLine()
			    .then("http")
			    .maybe("s")
			    .then("://")
			    .maybe("www.")
			    .anythingBut(" ")
			    .endOfLine();
		},

		image: function (str) {
			return Hamster.regexp()
				.startOfLine()
			    .word().then(".")
				.orBy("jpg", "jfif", "jpeg", "tiff", "raw", "pam", "webp", "svg", "pns", "mpo", "jps", "png", "gif", "bmp")
			    .endOfLine();
		},

	    email: function (str) {
	    	return Hamster.regexp()
				.startOfLine()
				.word()
				.beginCapture()
			 		.then(".").word()
				.endCapture()
				.add("*")
				.then("@")
				.word()
				.beginCapture()
			 		.then(".").word()
				.endCapture()
				.add("+")
				.endOfLine();
	    }

	},

	isRegExp: true,

	prefixes: "",

	suffixes: "",

	source: "",

	modifiers: 'gm',

	sanitize: function(value) {
		if (value.source) {
			return value.source;
		}
		if (Hamster.isNumber(value)) {
			return value
		}
		return value.replace(/[^\w]/g, function(character) {
			return "\\" + character;
		});
	},

	add: function(value) {
		this.source += value || "";
		this.expression = this.expression || new RegExp();
		this.expression.compile(this.prefixes + this.source + this.suffixes, this.modifiers);
		return this;
	},

	reset: function() {
		return this.add(Hamster.EMPTY_STRING);
	},

	startOfLine: function(enable) {
		enable = (enable !== false);
		this.prefixes = enable ? "^" : "";
		return this.reset();
	},

	endOfLine: function(enable) {
		enable = (enable !== false);
		this.suffixes = enable ? "$" : "";
		return this.reset();
	},

	then: function(value) {
		value = this.sanitize(value);
		return this.add("(?:" + value + ")");
	},

	find: function(value) {
		return this.then(value);
	},

	maybe: function(value) {
		value = this.sanitize(value);
		return this.add("(?:" + value + ")?");
	},

	anything: function() {
		return this.add("(?:.*)");
	},


	anythingBut: function(value) {
		value = this.sanitize(value);
		return this.add("(?:[^" + value + "]*)");
	},



	something: function() {
		return this.add("(?:.+)");
	},

	somethingBut: function(value) {
		value = this.sanitize(value);
		return this.add("(?:[^" + value + "]+)");
	},

	lineBreak: function() {
		return this.add("(?:\\r\\n|\\r|\\n)");
	},

	br: function() {
		return this.lineBreak();
	},

	word: function() {
		return this.add("(?:\\w+)");
	},

	tab: function() {
		return this.add("(?:\\t)");
	},

	whitespace: function() {
		return this.add("(?:\\s)");
	},

	number: function() {
		return this.add("(?:\\d)");
	},

	any: function(value) {
		value = this.sanitize(value);
		return this.add("[" + value + "]");
	},

	range: function() {
		var value = "[";
		for (var _to = 1; _to < arguments.length; _to += 2) {
			var from = this.sanitize(arguments[_to - 1]);
			var to = this.sanitize(arguments[_to]);

			value += from + "-" + to;
		}
		value += "]";
		return this.add(value);
	},


	repeat: function() {
		var value, len = arguments.length;
		if (len == 0 || len > 2) {
			Hamster.Error("arguments’s length must gt 0 and lt 3");
		}
		if (arguments.length == 1) {
			value = "{" + Hamster.num(arguments[0]) + "}";
		} else {
			var values = [];
			for (var i = 0; i < arguments.length; i++) {
				values.push(Hamster.num(arguments[i]));
			}

			value = "{" + values.join(",") + "}";
		}
		return this.add(value || "");
	},


	multiple: function(value) {
		value = value.source ? value.source : this.sanitize(value);
		if (arguments.length === 1) {
			this.add("(?:" + value + ")*");
		}
		if (arguments.length == 2) {
			this.add("(?:" + value + ")");
			this.add("{" + arguments[1] + "}");
		}
		return this;
	},

	or: function(value) {
		this.prefixes += "(?:";
		this.suffixes = ")" + this.suffixes;

		this.add(")|(?:");
		if (value) {
			this.then(value);
		}
		return this;
	},

	orBy: function() {
		var args = Hamster.Array.toArray(arguments);
		args = Hamster.Array.map(args, function(item) {
			return item.source ? ("(?:" + item.source + ")") : this.sanitize(item);
		}, this);
		return this.add("(?:" + args.join('|') + ")");
	},

	beginCapture: function() {
		this.suffixes += ")";
		return this.add("(", false);
	},

	endCapture: function() {
		this.suffixes = this.suffixes.substring(0, this.suffixes.length - 1);
		return this.add(")", true);
	},

	setModifier: function(modifiers) {
		this.modifiers = modifiers;
		return this.reset();
	},



	toRegExp: function() {
		var arr = this.expression.toString().match(/\/(.*)\/([a-z]+)?/);
		return new RegExp(arr[1], arr[2]);
	},


	replace: function(value, text) {
		value = value.toString();
		return value.replace(this.expression, text);
	},

	exec: function(text) {
		return this.expression.exec(text);
	},

	test: function(text) {
		return this.expression.test(text);
	}

}, function() {

	Hamster.RegExp = Hamster.util.RegExp;
	
	Hamster.regexp = Hamster.util.RegExp.create;

});
Hamster.define('Hamster.util.HashMap', {

    mixins: {
        event: Hamster.util.Event
    },

    isHashMap: true,

    constructor: function (config) {
        this.initialConfig = config;
        if (Hamster.isObject(config)) {
            Hamster.apply(this, config || {});
        } else if (Hamster.isFunction(config)) {
            this.getKey = config
        }
        this.mixins.event.constructor.call(this, config);
        this.clear(true);
    },

    len: function () {
        return this.length;
    },

    getCount: function () {
        return this.len();
    },

    data: function (key, value) {
        if (value === undefined) {
            value = key;
            key = this.getKey(value)
        }
        return [key, value]
    },

    getData: function (key, value) {
       return this.data(key, value); 
    },

    getKey: function (item) {
        return item.id
    },

    push: function (key, value) {
        if (Hamster.isArray(key)) {
            Hamster.Array.forEach(key, function (item) {
                this.push(item)
            }, this);
            return this
        }

        var me = this,
            data;
        if (arguments.length === 1) {
            value = key;
            key = this.getKey(value)
        }
        if (this.indexOf(key)) {
            this.replace(key, value)
        } else {
            ++this.length
        }

        data = this.data(key, value);
        key = data[0];
        value = data[1];
        this.map[key] = value;
        this.trigger('add', this, key, value);
        return value;
    },

    add: function (key, value) {
        return this.push(key, value)
    },

    addAll: function (items) {
        return this.push(items);
    },

    get: function (key) {
        return this.map[key]
    },

    remove: function (item, isKey) {
        if (!isKey) {
            var key = this.findKey(item);
            if (key !== undefined) {
                return this.removeAtKey(key)
            }
            return false
        }
        return this.removeAtKey(item)
    },

    removeAtKey: function(key) {
        if (this.containsKey(key)) {
            var value = this.map[key];
            delete this.map[key];
            --this.length;
            this.trigger('remove', this, key, value);
            return true;
        }
        return false;
    },

    containsKey: function(key) {
        return this.map[key] != undefined;
    },

    contains: function(value) {
        return this.containsKey(this.findKey(value));
    },

    replace: function (key, value) {
        var old;
        if (arguments.length == 1) {
            value = key;
            key = this.getKey(key);
        }
        if (!this.containsKey(key)) {
            this.add(key, value);
            return value
        }
        old = this.map[key];
        this.map[key] = value;
        this.trigger('replace', this, key, value, old);
        return value
    },

    findKey: function (value) {
        var key;
        for (key in this.map) {
            if (this.map.hasOwnProperty(key) && this.map[key] == value) {
                return key
            }
        }
        return undefined
    },

    indexOf: function (key) {
        return this.map[key] !== undefined
    },

    clear: function (initial) {
        this.map = {};
        this.length = 0;
        if (initial !== true) {
            this.trigger('clear', this);
        }
        return this
    },

    eq: function (index) {
        var key, i = 0;
        index = index || 0;
        for (key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                if (index == i) {
                    return this.map[key]
                }
                i++
            }
        }
    },

    keys: function () {
        return this.getArray(true)
    },

    getKeys: function () {
        return this.keys()
    },

    values: function () {
        return this.getArray()
    },

    getValues: function () {
        return this.values();
    },

    getArray: function (isKey) {
        var arr = [],
            key;
        for (key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                arr.push(isKey ? key : this.map[key])
            }
        }
        return arr
    },

    each: function (fn, scope) {
        var items = Hamster.apply({}, this.map),
            len = this.length,
            i = 0,
            key;

        scope = scope || this;

        for (key in items) {
            if (items.hasOwnProperty(key)) {
                if (fn.call(scope, key, items[key], len, i) === false) {
                    break;
                }
                i++;
            }
        }

        return this
    },

    clone: function () {
        var hash = new (this.self)(this.initialConfig),
            key;
        for (key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                hash.push(key, this.map[key])
            }
        }
        return hash
    }

});
Hamster.define('Hamster.util.ListenerProxy', {

    statics: {

        create: function () {
            var proxy = new Hamster.util.ListenerProxy();
            var args = Array.prototype.concat.apply([], arguments);
            if (args.length > 0) {
                var errorHandler = args[args.length - 1];
                var callback = args[args.length - 2];
                if (typeof errorHandler === 'function' && typeof callback === 'function') {
                    args.pop();
                    proxy.fail(errorHandler);
                }
                proxy.all.apply(proxy, args);
            }
            return proxy;
        }

    },

    firedCaches: {},

    callbackCaches: {},

    afterCaches: {},

    all_event_name: '__all__',

    on: function (event, callback) {
        this.callbackCaches[event] = this.callbackCaches[event] || [];
        this.callbackCaches[event].push(callback);
        return this;
    },

    //绑定事件， 但是把事件绑定到第一个
    headOn: function (event, callback) {
        this.callbackCaches[event] = this.callbackCaches[event] || [];
        this.callbackCaches[event].unshift(callback);
        return this;
    },

    _on_all: function (callback) {
        this.on(this.all_event_name, callback)
    },

    off: function (name, callback) {
        var calls = this.callbackCaches;
        if (!Hamster.isEmpty(name)) {
            if (Hamster.isEmpty(callback)) {
                calls[name] = [];
            } else {
                var list = calls[name];
                if (list) {
                    var len = list.length;
                    for (var i = 0; i < len; i++) {
                        list[i] = null
                    }
                }
            }
        } else {
            this.callbackCaches = {}
        }
    },

    _off_all: function (callback) {
        this.off(this.all_event_name, callback)
    },

    emit: function (event, data) {
        var both = 2, list, ev, callback, args, i, l;
        while (both--) {
            ev = both ? event : this.all_event_name;
            list = this.callbackCaches[ev];
            if (Hamster.isEmpty(list)) {
                continue;
            }
            for (i = 0, l = list.length; i < l; i++) {
                if (!(callback = list[i])) {
                    list.splice(i, 1);
                    i--;
                    l--;
                } else {
                    args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
                    callback.apply(this, args);
                }
            }
        }
        return this;
    },

    once: function (event, callback) {
        var self = this;
        var wrapper = function () {
            callback.apply(self, arguments);
            self.off(event, wrapper);
        };
        this.on(event, wrapper);
        return this;
    },

    //立即执行
    immediate: function (event, callback, data) {
        this.on(event, callback);
        this.emit(event, data);
        return this
    },

    _assign: function (event1, event2, cb, once) {
        var self = this;
        var argsLength = arguments.length;
        var times = 0, flag = {};

        if (argsLength < 3) {
            return this
        }

        var events = Array.prototype.slice.call(arguments, 0, -2);
        var callback = arguments[argsLength - 2];
        var isOnce = arguments[argsLength - 1];

        if (typeof callback !== 'function') {
            return this;
        }

        Hamster.Array.forEach(events, function (event, i) {
            var method = isOnce ? 'once' : 'on';
            this[method](event, function (data) {
                this.firedCaches[event] = this.firedCaches[event] || {};
                this.firedCaches[event].data = data;
                if (!flag[event]) {
                    flag[event] = true;
                    times++;
                }
            })
        }, this);

        var all_fn = function (event) {
            if (times < events.length) {
                return;
            }
            if (!flag[event]) {
                return;
            }
            var data = Hamster.Array.map(events, function (event) {
                return this.firedCaches[event].data
            }, self);
            if (isOnce) {
                self._off_all(all_fn)
            }
            callback.apply(null, data)
        };

        this._on_all(all_fn)

    },

    all: function (event1, event2, callback) {
        var args = Array.prototype.concat.apply([], arguments);
        args.push(true);
        this._assign.apply(this, args);
        return this;
    },

    fail: function (callback) {
        var self = this;
        this.once('error', function (err) {
            self.off();
            callback.apply(null, arguments)
        });
        return this;
    },

    tail: function () {
        var args = Array.prototype.concat.apply([], arguments);
        args.push(false);
        this._assign.apply(this, args);
        return this;
    },

    after: function (event, times, callback) {
        if (times === 0) {
            callback.call(null, []);
            return this;
        }

        var self = this, firedData = [];
        var group = event + '_group';

        this.afterCaches = this.afterCaches || {};
        this.afterCaches[group] = {
            index: 0,
            results: []
        };

        var all_fn = function (name, data) {
            if (name === event) {
                times--;
                firedData.push(data);
                if (times < 1) {
                    self._off_all(all_fn);
                    callback.apply(null, [firedData]);
                }
            }
            if (name === group) {
                times--;
                self.afterCaches[group].results[data.index] = data.result;
                if (times < 1) {
                    self._off_all(all_fn);
                    callback.call(null, self.afterCaches[group].results);
                }
            }
        };
        this._on_all(all_fn);

    },

    group: function (event, callback) {
        var self = this,
            group = event + '_group',
            index = this.afterCaches[group].index,
            slice = Array.property.slice;

        this.afterCaches[group].index++;
        return function (err, data) {
            if (err) {
                return self.emit.apply(self, ['error'].concat(slice.call(arguments)));
            }
            self.emit(group, {
                index: index,
                result: callback ? callback.apply(null, slice.call(arguments, 1)) : data
            });
        };
    },

    any: function () {
        var slice = Array.property.slice,
            callback = arguments[arguments.length - 1],
            events = slice.call(arguments, 0, -1),
            event = events.join("_"),
            self = this;

        this.once(event, callback);

        var bind_fn = function (key) {
            self.on(key, function (data) {
                self.emit(event, {"data": data, eventName: key});
            });
        };

        Hamster.Array.forEach(events, function (key) {
            this.on(key, function (data) {
                self.emit(event, {"data": data, eventName: key});
            })
        }, this);
    },

    not: function (event, callback) {
        this._on_all(function (name, data) {
            if (name !== event) {
                callback(data);
            }
        })
    },

    done: function (handler, callback) {
        var self = this;
        var slice = Array.prototype.slice;
        return function (err, data) {
            if (err) {
                return self.emit.apply(self, ['error'].concat(slice.call(arguments)));
            }
            var args = slice.call(arguments, 1);

            if (typeof handler === 'string') {
                if (callback) {
                    return self.emit(handler, callback.apply(null, args));
                } else {
                    return self.emit.apply(self, [handler].concat(args));
                }
            }
            if (arguments.length <= 2) {
                return handler(data);
            }
            handler.apply(null, args);
        };
    }

}, function () {

    Hamster.Array.forEach([
        {
            name: 'all',
            alias: ['assign']
        },
        {
            name: 'on',
            alias: ['bind', 'addListener']
        },
        {
            name: 'off',
            alias: ['unbind', 'removeListener']
        },
        {
            name: 'emit',
            alias: ['trigger', 'fire']
        }
    ], function (item) {
        item.alias = Hamster.Array.toArray(item.alias);
        Hamster.Array.forEach(item.alias, function (_name) {
            this.prototype[_name] = Hamster.Function.alias(this.prototype, item.name);
        }, this)
    }, this)

});
Hamster.define('Hamster.util.LocalStorage', {

    statics: {

        ID: +new Date,

        cache: {},

        get: function (id) {
            var cache = this.cache;
            var config = {_users: 1}, instance;
            if (Hamster.isString(id)) {
                config.id = id;
            } else {
                Hamster.apply(config, id);
            }
            if (!(instance = cache[config.id])) {
                instance = new this(config);
            } else {
                if (instance === true) {
                    Hamster.Error('Creating a shared instance of private local store "' + this.id + '".');
                }
                ++instance._users;
            }
            return instance;
        },

        supported: true

    },

    id: null,

    destroyed: false,

    lazyKeys: true,

    prefix: '',

    session: false,

    _keys: null,

    _store: null,

    _users: 0,

    constructor: function (config) {
        var statics = this.statics();
        Hamster.apply(this, config);
        this.id = this.id || statics.ID++;
        if (this._users) {
            statics.cache[this.id] = this
        } else {
            if (statics.cache[this.id]) {
                Hamster.Error('Cannot create duplicate instance of local store "' +
                    this.id + '". Use Hamster.util.LocalStorage.get() to share instances.');
            }
            statics.cache[this.id] = true;
        }
        this.initStore();
    },

    initStore: function () {
        if (!this.prefix && this.id) {
            this.prefix = this.id + '-';
        }
        this._store = (this.session ? Hamster.global.sessionStorage : Hamster.global.localStorage);
    },

    getKeys: function () {
        var store = this._store,
            prefix = this.prefix,
            keys = this._keys,
            prefixLen = prefix.length,
            key, i;

        if (!keys) {
            this._keys = keys = [];
            for (i = store.length; i--;) {
                key = store.key(i);
                if (key.length > prefixLen) {
                    if (prefix === key.substring(0, prefixLen)) {
                        keys.push(key.substring(prefixLen));
                    }
                }
            }
        }
        return keys
    },

    key: function (index) {
        var keys = this._keys || this.getKeys();
        return (0 <= index && index < keys.length) ? keys[index] : null;
    },

    release: function () {
        if (!--this._users) {
            this.destroy();
        }
    },

    set: function (key, value) {
        var iKey = this.prefix + key,
            store = this._store,
            keys = this._keys,
            length = store.length;

        store.setItem(iKey, value);
        if (keys && length !== store.length) {
            keys.push(key)
        }
    },

    get: function (key) {
        return this._store.getItem(this.prefix + key)
    },

    remove: function (key) {
        var iKey = this.prefix + key,
            store = this._store,
            keys = this._keys,
            length = store.length;

        store.removeItem(iKey);
        if (keys && length !== store.length) {
            if (this.lazyKeys) {
                this._keys = null;
            } else {
                Hamster.Array.remove(keys, key);
            }
        }
    },

    clear: function () {
        var store = this._store,
            prefix = this.prefix,
            keys = this._keys || this.getKeys(),
            i;

        for (i = keys.length; i--;) {
            store.removeItem(prefix + keys[i]);
        }
        keys.length = 0;
    }

}, function () {

    var LocalStorage = this;

    if ('LocalStorage' in window) {
        return;
    }

    if (!Hamster.browser.is('IE')) {
        LocalStorage.supported = false;
        LocalStorage.prototype.init = function () {
            Hamster.Error("Local storage is not supported on this browser");
        };
        return;
    }

    Hamster.apply(this.prototype, {})

});
Hamster.define('Hamster.util.KeyMap', {

    alternateClassName: 'Hamster.KeyMap',

    eventName: 'keydown',

    binding: null,

    target: null,

    processEventScope: null,

    //是否忽略对input等标签的处理
    ignoreInputFields: false,

    constructor: function (config) {
        if ((arguments.length !== 1) || (typeof config === 'string') || config.dom || config.tagName || config === document || config.isComponent) {
            this.legacyConstructor.apply(this, arguments);
            return;
        }
        Hamster.apply(this, config);
        this.bindings = [];

        if (!this.target.isComponent) {
            this.target = Hamster.get(this.target);
        }

        if (this.binding) {
            this.addBinding(this.binding);
        } else if (config.key) {
            this.addBinding(config);
        }
        this.enable();
    },

    legacyConstructor: function (el, binding, eventName) {
        Hamster.apply(this, {
            target: Hamster.get(el),
            eventName: eventName || this.eventName,
            bindings: []
        });
        if (binding) {
            this.addBinding(binding);
        }
        this.enable();
    },

    addBinding: function (binding) {
        var keyCode = binding.key,
            bindings = this.bindings,
            i, len;

        if (this.processing) {
            this.bindings = bindings.slice(0);
        }

        if (Hamster.isArray(binding)) {
            for (i = 0, len = binding.length; i < len; i++) {
                this.addBinding(binding[i]);
            }
            return;
        }

        this.bindings.push(Hamster.apply({
            keyCode: this.processKeys(keyCode)
        }, binding));
    },

    removeBinding: function (binding) {
        var bindings = this.bindings,
            len = bindings.length,
            keys, item, i;

        if (this.processing) {
            this.bindings = bindings.slice(0);
        }

        keys = this.processKeys(binding.key);
        for (i = 0; i < len; ++i) {
            item = bindings[i];
            if ((item.fn || item.handler) === (binding.fn || binding.handler) && item.scope === binding.scope) {
                if (binding.alt === item.alt && binding.crtl === item.crtl && binding.shift === item.shift) {
                    if (Hamster.Array.equals(item.keyCode, keys)) {
                        Hamster.Array.erase(this.bindings, i, 1);
                        return;
                    }
                }
            }
        }
    },

    processKeys: function (keyCode) {
        var processed = false,
            keys, key, keyString, len, i;

        if (Hamster.isString(keyCode)) {
            keys = [];
            keyString = keyCode.toUpperCase();

            for (i = 0, len = keyString.length; i < len; ++i) {
                keys.push(keyString.charCodeAt(i));
            }
            keyCode = keys;
            processed = true;
        }

        if (!Hamster.isArray(keyCode)) {
            keyCode = [keyCode];
        }

        if (!processed) {
            for (i = 0, len = keyCode.length; i < len; ++i) {
                key = keyCode[i];
                if (Hamster.isString(key)) {
                    keyCode[i] = key.toUpperCase().charCodeAt(0);
                }
            }
        }
        return keyCode;
    },

    handleTargetEvent: (function () {
        var tagRe = /input|textarea/i;
        return function (event) {
            var me = this,
                bindings, i, len,
                target, contentEditable;

            if (me.enabled) {
                bindings = me.bindings;
                i = 0;
                len = bindings.length;

                event = me.processEvent.apply(me || me.processEventScope, arguments);

                if (me.ignoreInputFields) {
                    target = event.target;
                    contentEditable = target.contentEditable;
                    if (tagRe.test(target.tagName) || (contentEditable === '' || contentEditable === 'true')) {
                        return;
                    }
                }

                if (Hamster.isEmpty(event.which)) {
                    return event;
                }
                me.processing = true;
                for (; i < len; ++i) {
                    me.processBinding(bindings[i], event);
                }
                me.processing = false;
            }
        }
    }()),

    processEvent: Hamster.identityFn,

    processBinding: function (binding, evnet) {
        if (this.checkModifiers(binding, event)) {
            var key = event.which,
                handler = binding.fn || binding.handler,
                scope = binding.scope || this,
                keyCode = binding.keyCode,
                defaultEventAction = binding.defaultEventAction,
                i,
                len;


            for (i = 0, len = keyCode.length; i < len; ++i) {
                if (key === keyCode[i]) {
                    if (handler.call(scope, key, event) !== true && defaultEventAction) {
                        if (defaultEventAction == 'stopEvent') {
                            event.preventDefault();
                            event.stopPropagation();
                        } else {
                            event[defaultEventAction]();
                        }
                    }
                    break;
                }
            }
        }
    },

    checkModifiers: function (binding, event) {
        var keys = ['shift', 'ctrl', 'alt'],
            len = keys.length,
            i = 0, key, val;

        for (; i < len; ++i) {
            key = keys[i];
            val = binding[key];
            if (!(val === undefined || (val === event[key + 'Key']))) {
                return false;
            }
        }
        return true;
    },

    on: function (key, fn, scope) {
        var keyCode, shift, ctrl, alt;
        if (Hamster.isObject(key) && !Hamster.isArray(key)) {
            keyCode = key.key;
            shift = key.shift;
            ctrl = key.ctrl;
            alt = key.alt;
        } else {
            keyCode = key;
        }
        this.addBinding({
            key: keyCode,
            shift: shift,
            ctrl: ctrl,
            alt: alt,
            fn: fn,
            scope: scope
        });
    },

    un: function (key, fn, scope) {
        var keyCode, shift, ctrl, alt;
        if (Hamster.isObject(key) && !Hamster.isArray(key)) {
            keyCode = key.key;
            shift = key.shift;
            ctrl = key.ctrl;
            alt = key.alt;
        } else {
            keyCode = key;
        }
        this.removeBinding({
            key: keyCode,
            shift: shift,
            ctrl: ctrl,
            alt: alt,
            fn: fn,
            scope: scope
        });
    },

    isEnabled: function () {
        return this.enabled;
    },

    enable: function () {
        if (!this.enabled) {
            this.__$handleTargetEvent = Hamster.Function.bind(this.handleTargetEvent, this);
            this.target.on(this.eventName, this.__$handleTargetEvent);
            this.enabled = true;
        }
    },

    disable: function () {
        if (this.enabled && this.__$handleTargetEvent) {
            this.target.off(this.eventName, this.__$handleTargetEvent);
            this.enabled = false;
        }
    },

    setDisabled: function (disabled) {
        if (disabled) {
            this.disable();
        } else {
            this.enable();
        }
    },

    destroy: function () {
        var target = this.target;
        this.bindings = [];
        this.disable();
        delete this.target;
    }

});
Hamster.define('Hamster.util.KeyNav', {

    alternateClassName: 'Hamster.KeyNav',

    disabled: false,

    //stopPropagation preventDefault stopEvent
    defaultEventAction: 'stopEvent',

    forceKeyDown: false,

    eventName: 'keypress',

    processEventScope: null,

    ignoreInputFields: false,

    statics: {

        keyOptions: {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            space: 32,
            pageUp: 33,
            pageDown: 34,
            del: 46,
            backspace: 8,
            home: 36,
            end: 35,
            enter: 13,
            esc: 27,
            tab: 9
        }

    },

    constructor: function (config) {
        if (arguments.length === 2) {
            this.legacyConstructor.apply(this, arguments);
            return;
        }
        this.doConstruction(config);
    },

    legacyConstructor: function (el, config) {
        this.doConstruction(Hamster.apply({
            target: el
        }, config));
    },

    doConstruction: function (config) {
        var me = this,
            keymapCfg = {
                target: config.target,
                ignoreInputFields: config.ignoreInputFields,
                eventName: me.getKeyEvent('forceKeyDown' in config ? config.forceKeyDown : me.forceKeyDown, config.eventName),
                capture: config.capture
            },
            map;

        if (me.map) {
            me.map.destroy();
        }

        if (config.processEvent) {
            keymapCfg.processEvent = config.processEvent;
            keymapCfg.processEventScope = config.processEventScope || me;
        }

        if (config.keyMap) {
            map = me.map = config.keyMap;
        } else {
            map = me.map = new Hamster.util.KeyMap(keymapCfg);
            me.destroyKeyMap = true;
        }

        this.addBindings(config);

        map.disable();
        if (!config.disabled) {
            map.enable();
        }
    },

    addBindings: function (bindings) {
        var me = this,
            map = me.map,
            keyCodes = Hamster.util.KeyNav.keyOptions,
            defaultScope = bindings.scope || me;

        Hamster.Object.each(bindings, function (keyName, binding) {
            if (binding && (keyName.length === 1 || (keyName = keyCodes[keyName]) || (!isNaN(keyName = parseInt(keyName, 10))))) {
                if (typeof binding === 'function') {
                    binding = {
                        handler: binding,
                        defaultEventAction: (bindings.defaultEventAction !== undefined) ? bindings.defaultEventAction : me.defaultEventAction
                    };
                }
                map.addBinding({
                    key: keyName,
                    ctrl: binding.ctrl,
                    shift: binding.shift,
                    alt: binding.alt,
                    handler: Hamster.Function.bind(me.handleEvent, binding.scope || defaultScope, [binding.handler || binding.fn, me], true),
                    defaultEventAction: (binding.defaultEventAction !== undefined) ? binding.defaultEventAction : me.defaultEventAction
                });
            }
        }, this);
    },

    handleEvent: function (keyCode, event, handler, keyNav) {
        keyNav.lastKeyEvent = event;
        return handler.call(this, event);
    },

    destroy: function (removeEl) {
        if (this.destroyKeyMap) {
            this.map.destroy(removeEl);
        }
        delete this.map;
    },

    enable: function () {
        if (this.map) {
            this.map.enable();
            this.disabled = false;
        }
    },

    disable: function () {
        if (this.map) {
            this.map.disable();
        }
        this.disabled = true;
    },

    setDisabled: function (disabled) {
        this.map.setDisabled(disabled);
        this.disabled = disabled;
    },

    useKeyDown: Hamster.browser.is.WebKit ?
        parseInt(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1], 10) >= 525 :
        !((Hamster.browser.is.Gecko && !window) || Hamster.browser.is.Opera),

    getKeyEvent: function (forceKeyDown, configuredEventName) {
        if (forceKeyDown || (this.useKeyDown && !configuredEventName)) {
            return 'keydown';
        } else {
            return configuredEventName || this.eventName;
        }
    }


});
Hamster.define('Hamster.util.LruCache', {

    extend: Hamster.util.HashMap,

    maxSize: null,

    constructor: function(config) {
        Hamster.apply(this, config);
        this.callParent([config]);
    },

    add: function(key, newValue) {
        var me = this,
            existingKey = me.findKey(newValue),
            entry;

        if (existingKey) {
            me.unlinkEntry(entry = me.map[existingKey]);
            entry.prev = me.last;
            entry.next = null;
        } else {
            entry = {
                prev: me.last,
                next: null,
                key: key,
                value: newValue
            };
        }

        if (me.last) {
            me.last.next = entry;
        } else {
            me.first = entry;
        }
        me.last = entry;
        me.callParent([key, entry]);
        me.prune();
        return newValue;
    },

    insertBefore: function(key, newValue, sibling) {
        var me = this,
            existingKey,
            entry;

        if (sibling = this.map[this.findKey(sibling)]) {
            existingKey = me.findKey(newValue);

            if (existingKey) {
                me.unlinkEntry(entry = me.map[existingKey]);
            } else {
                entry = {
                    prev: sibling.prev,
                    next: sibling,
                    key: key,
                    value: newValue
                };
            }

            if (sibling.prev) {
                entry.prev.next = entry;
            } else {
                me.first = entry;
            }
            entry.next = sibling;
            sibling.prev = entry;
            me.prune();
            return newValue;
        } else {
            return me.add(key, newValue);
        }
    },

    get: function(key) {
        var entry = this.map[key];
        if (entry) {
            if (entry.next) {
                this.moveToEnd(entry);
            }
            return entry.value;
        }
    },

    removeAtKey: function(key) {
        this.unlinkEntry(this.map[key]);
        return this.callParent(arguments);
    },

    clear: function(initial) {
        this.first = this.last = null;
        return this.callParent(arguments);
    },

    unlinkEntry: function(entry) {
        if (entry) {
            if (entry.next) {
                entry.next.prev = entry.prev;
            } else {
                this.last = entry.prev;
            }
            if (entry.prev) {
                entry.prev.next = entry.next;
            } else {
                this.first = entry.next;
            }
            entry.prev = entry.next = null;
        }
    },

    moveToEnd: function(entry) {
        this.unlinkEntry(entry);
        if (entry.prev = this.last) {
            this.last.next = entry;
        } else {
            this.first = entry;
        }
        this.last = entry;
    },

    getArray: function(isKey) {
        var arr = [],
            entry = this.first;

        while (entry) {
            arr.push(isKey ? entry.key: entry.value);
            entry = entry.next;
        }
        return arr;
    },

    each: function(fn, scope, reverse) {
        var me = this,
            entry = reverse ? me.last : me.first,
            length = me.length;

        scope = scope || me;
        while (entry) {
            if (fn.call(scope, entry.key, entry.value, length) === false) {
                break;
            }
            entry = reverse ? entry.prev : entry.next;
        }
        return me;
    },

    findKey: function(value) {
        var key,
            map = this.map;

        for (key in map) {
            if (map.hasOwnProperty(key) && map[key].value === value) {
                return key;
            }
        }
        return undefined;
    },

    clone: function() {
        var newCache = new this.self(this.initialConfig),
            map = this.map,
            key;

        newCache.suspendEvents();
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                newCache.add(key, map[key].value);
            }
        }
        newCache.resumeEvents();
        return newCache;
    },

    prune: function() {
        var me = this,
            purgeCount = me.maxSize ? (me.length - me.maxSize) : 0;

        if (purgeCount > 0) {
            for (; me.first && purgeCount; purgeCount--) {
                me.removeAtKey(me.first.key);
            }
        }
    }
});
Hamster.define('Hamster.util.History', {

    mixins: {
        event: Hamster.util.Event
    },

    singleton: true,

    routeStripper: /^[#\/]|\s+$/g,

    rootStripper: /^\/+|\/+$/g,

    pathStripper: /#.*$/,

    started: false,

    handlers: [],

    constructor: function () {
        if (typeof window !== 'undefined') {
            this.location = window.location;
            this.history = window.history;
        }
        this.mixins.event.constructor.call(this);
    },

    interval: 50,

    atRoot: function () {
        var path = this.location.pathname.replace(/[^\/]$/, '$&/');
        return path === this.root && !this.getSearch();
    },

    getSearch: function () {
        var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
        return match ? match[0] : '';
    },

    getHash: function (window) {
        var match = (window || this).location.href.match(/#(.*)$/);
        return match ? match[1] : '';
    },

    getPath: function () {
        var path = decodeURI(this.location.pathname + this.getSearch());
        var root = this.root.slice(0, -1);
        if (!path.indexOf(root)) path = path.slice(root.length);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    getFragment: function (fragment) {
        if (fragment == null) {
            if (this._hasPushState || !this._wantsHashChange) {
                fragment = this.getPath();
            } else {
                fragment = this.getHash();
            }
        }
        return fragment.replace(this.routeStripper, '');
    },

    start: function (options) {
        if (this.started) {
            Hamster.Error('Hamster.util.Router has already been started');
        }
        this.started = true;

        this.options = Hamster.apply({
            root: '/'
        }, this.options, options);
        this.root = this.options.root;

        this._wantsHashChange = this.options.hashChange !== false;
        this._hasHashChange = 'onhashchange' in window;
        this._wantsPushState = !!this.options.pushState;
        this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);

        this.fragment = this.getFragment();

        this.root = ('/' + this.root + '/').replace(this.rootStripper, '/');

        if (this._wantsHashChange && this._wantsPushState) {
            if (!this._hasPushState && !this.atRoot()) {
                var root = this.root.slice(0, -1) || '/';
                this.location.replace(root + '#' + this.getPath());
                return true;
            } else if (this._hasPushState && this.atRoot()) {
                this.navigate(this.getHash(), {
                    replace: true
                });
            }
        }

        if (!this._hasHashChange && this._wantsHashChange && (!this._wantsPushState || !this._hasPushState)) {
            var iframe = document.createElement('iframe');
            iframe.src = 'javascript:0';
            iframe.style.display = 'none';
            iframe.tabIndex = -1;
            var body = document.body;
            this.iframe = body.insertBefore(iframe, body.firstChild).contentWindow;
            this.iframe.document.open().close();
            this.iframe.location.hash = '#' + this.fragment;
        }

        var addEventListener = window.addEventListener || function (eventName, listener) {
            return attachEvent('on' + eventName, listener);
        };

        var checkUrl = Hamster.Function.bind(this.checkUrl, this);

        if (this._hasPushState) {
            addEventListener('popstate', checkUrl, false);
        } else if (this._wantsHashChange && this._hasHashChange && !this.iframe) {
            addEventListener('hashchange', checkUrl, false);
        } else if (this._wantsHashChange) {
            this._checkUrlInterval = setInterval(checkUrl, this.interval);
        }

        if (!this.options.silent) {
            return this.loadUrl();
        }
    },

    stop: function () {
        var removeEventListener = window.removeEventListener || function (eventName, listener) {
            return detachEvent('on' + eventName, listener);
        };

        if (this._hasPushState) {
            removeEventListener('popstate', this.checkUrl, false);
        } else if (this._wantsHashChange && this._hasHashChange && !this.iframe) {
            removeEventListener('hashchange', this.checkUrl, false);
        }
        if (this.iframe) {
            document.body.removeChild(this.iframe.frameElement);
            this.iframe = null;
        }
        if (this._checkUrlInterval) {
            clearInterval(this._checkUrlInterval);
        }
        this.started = false;
    },

    route: function (route, callback) {
        this.handlers.unshift({
            route: route,
            callback: callback
        });
    },

    checkUrl: function (e) {
        var current = this.getFragment();

        if (current === this.fragment && this.iframe) {
            current = this.getHash(this.iframe);
        }
        if (current === this.fragment) {
            return false;
        }
        if (this.iframe) {
            this.navigate(current);
        }
        this.loadUrl();
    },

    loadUrl: function (fragment) {
        fragment = this.fragment = this.getFragment(fragment);
        Hamster.Array.each(this.handlers, function (handler) {
            if (handler.route.test(fragment)) {
                handler.callback(fragment);
                return false;
            }
        })
    },

    navigate: function (fragment, options) {
        if (!this.started) {
            return false;
        }
        if (!options || options === true) {
            options = {
                trigger: !!options
            };
        }

        fragment = this.getFragment(fragment || '');

        var root = this.root;
        if (fragment === '' || fragment.charAt(0) === '?') {
            root = root.slice(0, -1) || '/';
        }
        var url = root + fragment;

        fragment = decodeURI(fragment.replace(this.pathStripper, ''));

        if (this.fragment === fragment) {
            return;
        }
        this.fragment = fragment;

        if (this._hasPushState) {
            this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
        } else if (this._wantsHashChange) {
            this._updateHash(this.location, fragment, options.replace);
            if (this.iframe && (fragment !== this.getHash(this.iframe))) {
                if (!options.replace) {
                    this.iframe.document.open().close();
                }
                this._updateHash(this.iframe.location, fragment, options.replace);
            }
        } else {
            return this.location.assign(url);
        }
        if (options.trigger) {
            return this.loadUrl(fragment);
        }
    },

    _updateHash: function (location, fragment, replace) {
        if (replace) {
            var href = location.href.replace(/(javascript:|#).*$/, '');
            location.replace(href + '#' + fragment);
        } else {
            location.hash = '#' + fragment;
        }
    }

});
Hamster.define('Hamster.util.Router', {

    mixins: {
        event: Hamster.util.Event
    },

    scope: null,

    routes: {},

    optionalParam: /\((.*?)\)/g,

    namedParam: /(\(\?)?:\w+/g,

    splatParam: /\*\w+/g,

    escapeRegExp: /[\-{}\[\]+?.,\\\^$|#\s]/g,

    constructor: function (config) {
        Hamster.apply(this, config);
        this.scope = this.scope || this;
        this.mixins.event.constructor.call(this);
        this.set(this.routes);
        if (!Hamster.util.History.started) {
            Hamster.util.History.start();
        }
    },

    set: function (route, action) {
        if (Hamster.isObject(route)) {
            Hamster.Object.each(route, function (name, fn) {
                this.set(name, fn);
            }, this);
            return this;
        }
        if (!Hamster.isRegExp(route)) {
            route = this._routeToRegExp(route);
        }

        if (!Hamster.isFunction(action)) {
            action = this.scope[action];
        }
        var router = this;
        Hamster.util.History.route(route, function (fragment) {
            var args = router._extractParameters(route, fragment);
            if (router.execute(action, args) !== false) {
                router.trigger('route', args);
            }
        });
        return this;
    },

    navigate: function (fragment, options) {
        Hamster.util.History.navigate(fragment, options);
        return this;
    },

    execute: function (action, args) {
        action && action.apply(this.scope, args);
    },

    _routeToRegExp: function (route) {
        route = route.replace(this.escapeRegExp, '\\$&')
            .replace(this.optionalParam, '(?:$1)?')
            .replace(this.namedParam, function (match, optional) {
                return optional ? match : '([^/?]+)';
            })
            .replace(this.splatParam, '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    _extractParameters: function (route, fragment) {
        var params = route.exec(fragment).slice(1);
        return Hamster.Array.map(params, function (param, i) {
            if (i === params.length - 1) {
                return param || null;
            }
            return param ? decodeURIComponent(param) : null;
        });
    }

});
Hamster.define('Hamster.dom.Element', function () {

    var doc = document,
        activeElement = null,
        isCSS1 = doc.compatMode == "CSS1Compat";

    if (!('activeElement' in doc) && doc.addEventListener) {
        doc.addEventListener('focus', function (ev) {
            if (ev && ev.target) {
                activeElement = (ev.target == doc) ? null : ev.target;
            }
        }, true);
    }

    function makeSelectionRestoreFn(activeEl, start, end) {
        return function () {
            activeEl.selectionStart = start;
            activeEl.selectionEnd = end;
        };
    }

    function isIE9m() {
        return Hamster.browser.is.IE6 || Hamster.browser.is.IE7 || Hamster.browser.is.IE8 || Hamster.browser.is.IE9
    }

    return {

        singleton: true,

        alternateClassName: 'Hamster.Element',

        get: function (selector, content) {
            return Hamster.DOM_QUERY(selector, content);
        },

        getDom: function (el) {
            if (Hamster.isEmpty(el)) {
                return el;
            }
            if (Hamster.isElement(el)) {
                return el;  
            }
            if (Hamster.isString(el)) {
                return Hamster.DOM_QUERY(el)[0];
            }
            if (el.jquery) {
                return el[0];
            }
            return el;
        },

        defaultUnit: 'px',

        cssRe: /([a-z0-9\-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*)?;?/gi,

        unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,

        borders: {
            l: 'border-left-width',
            r: 'border-right-width',
            t: 'border-top-width',
            b: 'border-bottom-width'
        },

        paddings: {
            l: 'padding-left',
            r: 'padding-right',
            t: 'padding-top',
            b: 'padding-bottom'
        },

        margins: {
            l: 'margin-left',
            r: 'margin-right',
            t: 'margin-top',
            b: 'margin-bottom'
        },

        userAgent: navigator.userAgent.toLowerCase(),

        windowId: 'Hamster-window',

        documentId: 'Hamster-document',

        id: function (el, prefix) {
            el = this.getDom(el);
            if (el === document) {
                el.id = this.documentId;
            } else if (el === window) {
                el.id = this.windowId;
            }
            el.id = el.id || Hamster.uniqueId(prefix);
            return el.id;
        },

        contains: function (parent, dom) {
            var ret = false;

            parent = this.getDom(parent);
            dom = this.getDom(dom);

            if (!Hamster.isElement(parent) || !Hamster.isElement(dom)) {
                return false;
            }

            if (parent === dom) {
                return true;
            }

            if (parent && dom) {
                if (parent.contains) {
                    return parent.contains(dom)
                } else if (parent.compareDocumentPosition) {
                    return !!(parent.compareDocumentPosition(dom) & 16);
                } else {
                    while ((dom = dom.parentNode)) {
                        ret = dom == parent || ret;
                    }
                }
            }
            return ret;
        },

        addUnits: function (size, units) {
            if (typeof size == 'number') {
                return size + (units || this.defaultUnit || 'px');
            }

            if (size === '' || size == 'auto' || size === undefined || size === null) {
                return size || '';
            }

            if (!this.unitRe.test(size)) {
                Hamster.log('warn', 'Warning, size detected as NaN on Element.addUnits.');
                return size || '';
            }
            return size;
        },

        parseBox: function (box) {
            box = box || 0;
            var type = typeof box,
                parts, len;

            if (type === 'number') {
                return {
                    top: box,
                    right: box,
                    bottom: box,
                    left: box
                }
            } else if (type !== 'string') {
                return box
            }

            parts = box.split(' ');
            len = parts.length;

            if (len == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            } else if (len == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            } else if (len == 3) {
                parts[3] = parts[1];
            }

            return {
                top: parseFloat(parts[0]) || 0,
                right: parseFloat(parts[1]) || 0,
                bottom: parseFloat(parts[2]) || 0,
                left: parseFloat(parts[3]) || 0
            }
        },

        unitizeHamster: function (Hamster, units) {
            var parse = this.parseHamster(Hamster);
            return this.addUnits(parse.top, units) + ' ' +
                this.addUnits(parse.right, units) + ' ' +
                this.addUnits(parse.bottom, units) + ' ' +
                this.addUnits(parse.left, units);
        },

        parseStyles: function (styles) {
            var out = {},
                cssRe = this.cssRe,
                matches;

            if (styles) {
                cssRe.lastIndex = 0;
                while ((matches = cssRe.exec(styles))) {
                    out[matches[1]] = matches[2] || '';
                }
            }
            return out;
        },

        getActiveElement: function () {
            var active;
            try {
                active = document.activeElement;
            } catch (e) {

            }
            active = active || activeElement;
            if (!active) {
                active = activeElement = document.body;
            }
            return active;
        },

        getViewWidth: function (full) {
            return full ? this.getDocumentWidth() : this.getViewportWidth();
        },

        getViewHeight: function (full) {
            return full ? this.getDocumentHeight() : this.getViewportHeight();
        },

        getDocumentHeight: function () {
            return Math.max(!isCSS1 ? doc.body.scrollHeight : doc.documentElement.scrollHeight, this.getViewportHeight());
        },

        getDocumentWidth: function () {
            return Math.max(!isCSS1 ? doc.body.scrollWidth : doc.documentElement.scrollWidth, this.getViewportWidth());
        },

        getViewportHeight: function () {
            return isIE9m() ?
                (Hamster.isStrict ? doc.documentElement.clientHeight : doc.body.clientHeight) :
                window.innerHeight;
        },

        getViewportWidth: function () {
            return (!Hamster.isStrict && !Hamster.browser.is.Opera) ? doc.body.clientWidth :
                isIE9m() ? doc.documentElement.clientWidth : window.innerWidth;
        },

        getViewSize: function (full) {
            return {
                width: this.getViewWidth(full),
                height: this.getViewHeight(full)
            }
        },

        serializeForm: function (form) {
            var fElements = form.elements || (document.forms[form] || this.getDom(form)).elements,
                hasSubmit = false,
                encoder = encodeURIComponent,
                data = '',
                eLen = fElements.length,
                element, name, type, options, hasValue, e,
                o, oLen, opt;

            for (e = 0; e < eLen; e++) {
                element = fElements[e];
                name = element.name;
                type = element.type;
                options = element.options;

                if (!element.disabled && name) {
                    if (/select-(one|multiple)/i.test(type)) {
                        oLen = options.length;
                        for (o = 0; o < oLen; o++) {
                            opt = options[o];
                            if (opt.selected) {
                                hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                                data += Hamster.String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                            }
                        }
                    } else if (!(/file|undefined|reset|button/i.test(type))) {
                        if (!(/radio|checkHamster/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                            data += encoder(name) + '=' + encoder(element.value) + '&';
                            hasSubmit = /submit/i.test(type);
                        }
                    }
                }
            }
            return data.substr(0, data.length - 1);
        },

        getWin: (function () {
            var win;
            return function () {
                return win || (win = Hamster.dom.Element.get(window));
            }
        }()),

        getDoc: (function () {
            var doc;
            return function () {
                return doc || (doc = Hamster.dom.Element.get(document));
            }
        }()),

        getBody: (function () {
            var body;
            return function () {
                return body || (body = Hamster.dom.Element.get(document.body));
            }
        }()),

        getHead: (function () {
            var head;
            return function () {
                return head || (head = Hamster.dom.Element.get(document.getElementsByTagName("head")[0]));
            }
        }()),

        isScrollable: function (el) {
            var dom = Hamster.getDom(el);
            return dom.scrollHeight > dom.clientHeight || dom.scrollWidth > dom.clientWidth;
        },

        getScroll: function (el) {
            var dom = Hamster.getDom(el),
                doc = document,
                body = doc.body,
                docElement = doc.documentElement,
                left, top;

            if (dom === doc || dom === body) {
                left = docElement.scrollLeft || (body ? body.scrollLeft : 0);
                top = docElement.scrollTop || (body ? body.scrollTop : 0);
            } else {
                left = dom.scrollLeft;
                top = dom.scrollTop;
            }
            return {
                left: left,
                top: top
            }
        },

        getScrollLeft: function (el) {
            var dom = Hamster.getDom(el), doc = document;
            if (dom === doc || dom === doc.body) {
                return this.getScroll().left;
            } else {
                return dom.scrollLeft;
            }
        },

        getScrollTop: function (el) {
            var dom = Hamster.getDom(el), doc = document;
            if (dom === doc || dom === doc.body) {
                return this.getScroll().top;
            } else {
                return dom.scrollTop;
            }
        },

        setScrollLeft: function(el, left){
            var dom = Hamster.getDom(el);
            dom.scrollLeft = this.normalizeScrollLeft(left);
            return this;
        },

        setScrollTop: function(el, top) {
            var dom = Hamster.getDom(el);
            dom.scrollTop = top;
            return this;
        },

        normalizeScrollLeft: Hamster.identityFn,

        hoverClass: function (el, cls) {
            var dom = Hamster.get(el);
            dom.hover(function () {
                dom.addClass(cls);
            }, function () {
                dom.removeClass(cls);
            })
        },

        siblingsClass: function (el, cls) {
            var dom = Hamster.get(el);
            dom.addClass(cls).siblings().removeClass(cls);
        },

        load: function (el, url, params, callback, loadScripts) {
            Hamster.$.get(url, params || {}, function (html) {
                Hamster.Element.update(el, html, callback, loadScripts);
            }, 'html');
        },

        update: function (el, html, callback, loadScripts) {
            var dom = Hamster.getDom(el);

            if (Hamster.isBoolean(callback)) {
                loadScripts = callback;
                callback = function () {};
            }

            if (Hamster.isEmpty(dom)) {
                return;
            }
            if (loadScripts !== true) {
                Hamster.getDom(dom).innerHTML = html;
                callback.call(dom, dom, html);
                return el;
            }

            var uniqueId = Hamster.uniqueId();
            html += '<span id="' + uniqueId + '"></span>';

            dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, '');

            var interval = setInterval(function () {
                if (!document.getElementById(uniqueId)) {
                    return false;
                }
                clearInterval(interval);

                var doc = document,
                    head = doc.getElementsByTagName('head')[0],
                    re = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig,
                    srcRe = /\ssrc=([\'\"])(.*?)\1/i,
                    typeRe = /\stype=([\'\"])(.*?)\1/i,
                    match,
                    attrs,
                    srcMatch,
                    typeMatch,
                    span,
                    s;

                while ((match = re.exec(html))) {
                    attrs = match[1];
                    srcMatch = attrs ? attrs.match(srcRe) : false;

                    if (srcMatch && srcMatch[2]) {
                        s = doc.createElement('script');
                        s.src = srcMatch[2];
                        typeMatch = attrs.match(typeRe);
                        if (typeMatch && typeMatch[2]) {
                            s.type = typeMatch[2];
                        }
                        head.appendChild(s);
                    } else if (match[2] && match[2].length > 0) {
                        if (Hamster.global.execScript) {
                            Hamster.global.execScript(match[2]);
                        } else {
                            Hamster.global.eval(match[2]);
                        }
                    }
                }

                if (span = doc.getElementById(uniqueId)) {
                    Hamster.get(span).remove();
                }

                callback.call(dom, dom, html);
                html = null; 
            }, 20);

        }

    }

}, function () {

    function apply (src, target, methods) {
        Hamster.Array.forEach(methods, function (name) {
            src[name] = Hamster.Function.bind(target[name], Hamster.Element);
        });
    }

    apply(Hamster, Hamster.Element, ['id', 'get', 'getWin', 'getDom', 'getDoc', 'getBody', 'getHead']);

    Hamster.Element.getMousePosition = function () {
        return { x: xy.x, y: xy.y }
    };

    var xy = {x: 0, y: 0};
    Hamster.getDoc().bind(Hamster.EventType.MOUSEMOVE, function (e) {
        xy.x = e.pageX;
        xy.y = e.pageY;
    });

});

// Hamster.dom.Position
Hamster.define('Hamster.dom.Position', function () {

	var VIEWPORT = { _id: 'VIEWPORT', nodeType: 1 };
	var isPinFixed = false;

	// 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
	function normalize (posConfig) {
		posConfig = Hamster.getDom(posConfig) || {};
		
		if (posConfig.nodeType) {
			posConfig = {element: posConfig};
		}

		var element = Hamster.getDom(posConfig.element) || VIEWPORT;

		if (element.nodeType !== 1) {
			throw new Error('posObject.element is invalid.');
		}

		var result = {
			element: element,
			x: posConfig.x || 0,
			y: posConfig.y || 0
		};

		var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

		result.offset = function () {
			if (isPinFixed) {
				return { left: 0, top: 0 };
			} else if (isVIEWPORT) {
				return { left: Hamster.getDoc().scrollLeft(), top: Hamster.getDoc().scrollTop() }
			} else {
				return getOffset(Hamster.getDom(element));
			}
		}

		result.size = function () {
			var el = isVIEWPORT ? Hamster.getWin() : Hamster.get(element);
			return { width: el.outerWidth(), height: el.outerHeight() };
		}

		return result;
	};

	// fix jQuery 1.7.2 offset
	// document.body 的 position 是 absolute 或 relative 时
	// jQuery.offset 方法无法正确获取 body 的偏移值
	//   -> http://jsfiddle.net/afc163/gMAcp/
	// jQuery 1.9.1 已经修正了这个问题
	//   -> http://jsfiddle.net/afc163/gMAcp/1/
	function getOffset (element) {
		var box = element.getBoundingClientRect(),
        	docElem = document.documentElement;

	    // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
	    return {
	        left: box.left + (window.pageXOffset || docElem.scrollLeft) -
	              (docElem.clientLeft || document.body.clientLeft  || 0),
	        top: box.top  + (window.pageYOffset || docElem.scrollTop) -
	             (docElem.clientTop || document.body.clientTop  || 0)
	    };
	};

	// 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
	function posConverter (pos) {
		pos.x = xyConverter(pos.x, pos, 'width');
		pos.y = xyConverter(pos.y, pos, 'height');
		return pos;
	};

	// 处理 x, y 值，都转化为数字
	function xyConverter (x, pos, type) {

	    x = x + '';

	    // 处理 px
	    x = x.replace(/px/gi, '');

	    // 处理 alias
	    if (/\D/.test(x)) {
	        x = x.replace(/(?:top|left)/gi, '0%')
	             .replace(/center/gi, '50%')
	             .replace(/(?:bottom|right)/gi, '100%');
	    }

	    // 将百分比转为像素值
	    if (x.indexOf('%') !== -1) {
	        //支持小数
	        x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
	            return pos.size()[type] * (d / 100.0);
	        });
	    }

	    // 处理类似 100%+20px 的情况
	    if (/[+\-*\/]/.test(x)) {
	        try {
	            // eval 会影响压缩
	            // new Function 方法效率高于 for 循环拆字符串的方法
	            // 参照：http://jsperf.com/eval-newfunction-for
	            x = (new Function('return ' + x))();
	        } catch (e) {
	            throw new Error('Invalid position value: ' + x);
	        }
	    }

	    // 转回为数字
	    return numberize(x);
	};

	function numberize (s) {
		return parseFloat(s, 10) || 0;
	};

	// 获取 offsetParent 的位置
	function getParentOffset(element) {
	    var parent = element.offsetParent();

	    // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
	    // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
	    // 转为 document.body
	    if (parent[0] === document.documentElement) {
	        parent = $(document.body);
	    }

	    // 修正 ie6 下 absolute 定位不准的 bug
	    if (Hamster.browser.isIE6) {
	        parent.css('zoom', 1);
	    }

	    // 获取 offsetParent 的 offset
	    var offset;

	    // 当 offsetParent 为 body，
	    // 而且 body 的 position 是 static 时
	    // 元素并不按照 body 来定位，而是按 document 定位
	    // http://jsfiddle.net/afc163/hN9Tc/2/
	    // 因此这里的偏移值直接设为 0 0
	    if (parent[0] === document.body &&
	        parent.css('position') === 'static') {
	            offset = { top:0, left: 0 };
	    } else {
	        offset = getOffset(parent[0]);
	    }

	    // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
	    offset.top += numberize(parent.css('border-top-width'));
	    offset.left += numberize(parent.css('border-left-width'));

	    return offset;
	};

	return {

		singleton: true,

		__normalize: normalize,

		__posConverter: posConverter,

		// 将目标元素相对于基准元素进行定位
		// 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
		pin: function (pin, base) {

			// 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
			pin = this.__normalize(pin);
			base = this.__normalize(base);

			if (pin.element === VIEWPORT || pin.element._id === 'VIEWPORT') {
				return;
			}

			// 设定目标元素的 position 为绝对定位
    		// 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
			var pinElement = Hamster.get(pin.element);

			if (pinElement.css('position') !== 'fixed' || Hamster.browser.isIE6) {
				pinElement.css('position', 'absolute');
				isPinFixed = false;
			} else {
				isPinFixed = true;
			}

			// 将位置属性归一化为数值
			pin = this.__posConverter(pin);
			base = this.__posConverter(base);

			var parentOffset = getParentOffset(pinElement);
			var baseOffset = base.offset();

			pinElement.css({
				top: baseOffset.top + base.y - pin.y - parentOffset.top,
				left: baseOffset.left + base.x - pin.x - parentOffset.left
			});
		},

		center: function (pinElement, baseElement) {
			this.pin({
				element: pinElement, x: '50%', y: '50%' 
			}, {
				element: baseElement, x: '50%', y: '50%' 
			});
		}

	}

}, function () {

	Hamster.Element.pin = Hamster.dom.Position.pin;
	
	Hamster.Element.center = Hamster.dom.Position.center;

});

Hamster.define('Hamster.dom.Helper', function() {

    var afterbegin = 'afterbegin',
        afterend = 'afterend',
        beforebegin = 'beforebegin',
        beforeend = 'beforeend',
        bbValues = ['BeforeBegin', 'previousSibling'],
        aeValues = ['AfterEnd', 'nextSibling'],
        bb_ae_PositionHash = {
            beforebegin: bbValues,
            afterend: aeValues
        },
        fullPositionHash = {
            beforebegin: bbValues,
            afterend: aeValues,
            afterbegin: ['AfterBegin', 'firstChild'],
            beforeend: ['BeforeEnd', 'lastChild']
        };

    function range () {
        return !!document.createRange;
    }

    function CreateContextualFragment () {
        var range = range() ? document.createRange() : false;
        return range && !!range.createContextualFragment;
    }

    return {
        
        singleton: true,

        alternateClassName: ['Hamster.DomHelper'],

        emptyTags: /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,

        confRe: /^(?:tag|children|cn|html|tpl|tplData)$/i,
        
        endRe: /end/i,

        attributeTransform: { cls : 'class', htmlFor : 'for' },

        closeTags: {},

        detachedDiv: document.createElement('div'),

        decamelizeName: function () {
            var camelCaseRe = /([a-z])([A-Z])/g,
                cache = {};

            function decamel (match, p1, p2) {
                return p1 + '-' + p2.toLowerCase();
            }

            return function (s) {
                return cache[s] || (cache[s] = s.replace(camelCaseRe, decamel));
            };
        }(),

        generateMarkup: function(spec, buffer) {
            var me = this,
                specType = typeof spec,
                attr, val, tag, i, closeTags;

            if (specType === "string" || specType === "number") {
                buffer.push(spec);
            } else if (Hamster.isArray(spec)) {
                for (i = 0; i < spec.length; i++) {
                    if (spec[i]) {
                        me.generateMarkup(spec[i], buffer);
                    }
                }
            } else {
                tag = spec.tag || 'div';
                buffer.push('<', tag);

                for (attr in spec) {
                    if (spec.hasOwnProperty(attr)) {
                        val = spec[attr];
                        if (val !== undefined && !me.confRe.test(attr)) {
                            if (typeof val === "object") {
                                buffer.push(' ', attr, '="');
                                me.generateStyles(val, buffer, true).push('"');
                            } else {
                                buffer.push(' ', me.attributeTransform[attr] || attr, '="', val, '"');
                            }
                        }
                    }
                }

                if (me.emptyTags.test(tag)) {
                    buffer.push('/>');
                } else {
                    buffer.push('>');

                    if ((val = spec.tpl)) {
                        val.applyOut(spec.tplData, buffer);
                    }
                    if ((val = spec.html)) {
                        buffer.push(val);
                    }
                    if ((val = spec.cn || spec.children)) {
                        me.generateMarkup(val, buffer);
                    }

                    closeTags = me.closeTags;
                    buffer.push(closeTags[tag] || (closeTags[tag] = '</' + tag + '>'));
                }
            }

            return buffer;
        },
 
        generateStyles: function (styles, buffer, encode) {
            var a = buffer || [],
                name, val;

            for (name in styles) {
                if (styles.hasOwnProperty(name)) {
                    val = styles[name];
                    name = this.decamelizeName(name);
                    if (encode && Hamster.String.hasHtmlCharacters(val)) {
                        val = Hamster.String.htmlEncode(val);
                    }
                    a.push(name, ':', val, ';');
                }
            }

            return buffer || a.join('');
        },

        markup: function(spec) {
            if (typeof spec === "string") {
                return spec;
            }

            var buf = this.generateMarkup(spec, []);
            return buf.join('');
        },

        createContextualFragment: function(html){
            var div = this.detachedDiv,
                fragment = document.createDocumentFragment(),
                length, childNodes;

            div.innerHTML = html;
            childNodes = div.childNodes;
            length = childNodes.length;

            while (length--) {
                fragment.appendChild(childNodes[0]);
            }
            return fragment;
        },

        createDom: function(o, parentNode){
            var me = this,
                markup = me.markup(o),
                div = me.detachedDiv;

            div.innerHTML = markup;

            return div.firstChild;
        },

 
        insertHtml: function(where, el, html) {
            var me = this,
                hashVal,
                range,
                rangeEl,
                setStart,
                frag;

            where = where.toLowerCase();

            if (el.insertAdjacentHTML) {

                if (me.ieInsertHtml) {
                    frag = me.ieInsertHtml(where, el, html);
                    if (frag) {
                        return frag;
                    }
                }

                hashVal = fullPositionHash[where];
                if (hashVal) {
                    el.insertAdjacentHTML(hashVal[0], html);
                    return el[hashVal[1]];
                }
            } else {
                if (el.nodeType === 3) {
                    where = where === afterbegin ? beforebegin : where;
                    where = where === beforeend ? afterend : where;
                }
                range = CreateContextualFragment() ? el.ownerDocument.createRange() : undefined;
                setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
                if (bb_ae_PositionHash[where]) {
                    if (range) {
                        range[setStart](el);
                        frag = range.createContextualFragment(html);
                    } else {
                        frag = this.createContextualFragment(html);
                    }
                    el.parentNode.insertBefore(frag, where === beforebegin ? el : el.nextSibling);
                    return el[(where === beforebegin ? 'previous' : 'next') + 'Sibling'];
                } else {
                    rangeEl = (where === afterbegin ? 'first' : 'last') + 'Child';
                    if (el.firstChild) {
                        if (range) {
                            try {
                                range[setStart](el[rangeEl]);
                                frag = range.createContextualFragment(html);
                            } catch (e) {
                                frag = this.createContextualFragment(html);
                            }
                        } else {
                            frag = this.createContextualFragment(html);
                        }

                        if (where === afterbegin) {
                            el.insertBefore(frag, el.firstChild);
                        } else {
                            el.appendChild(frag);
                        }
                    } else {
                        el.innerHTML = html;
                    }
                    return el[rangeEl];
                }
            }
            Hamster.Error({
                className: "Hamster.dom.Helper",
                methodName: "insertHtml",
                error: 'Illegal insertion point reached: "' + where + '"'
            });
        },
 
        before: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, beforebegin);
        },
 
        after: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, afterend);
        },
        
        append: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, beforeend);
        },

        prepend: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, afterbegin);
        },
 
        overwrite: function(el, html, returnElement) {
            var me = this,
                newNode;

            el = Hamster.get(el)[0];
            html = me.markup(html);

            if (me.ieOverwrite) {
                // hook for IE table hack - impl in ext package override
                newNode = me.ieOverwrite(el, html);
            }
            if (!newNode) {
                el.innerHTML = html;
                newNode = el.firstChild;
            }
            return returnElement ? Hamster.get(newNode) : newNode;
        },

        doInsert: function(el, o, returnElement, where) {
            var me = this,
                newNode;

            el = Hamster.get(el)[0];

            if ('innerHTML' in el) {
                newNode = me.insertHtml(where, el, me.markup(o));
            } else {
                newNode = me.createDom(o, null);

                if (el.nodeType === 3) {
                    where = where === afterbegin ? beforebegin : where;
                    where = where === beforeend ? afterend : where;
                }
                if (bb_ae_PositionHash[where]) {
                    el.parentNode.insertBefore(newNode, where === beforebegin ? el : el.nextSibling);
                } else if (el.firstChild && where === afterbegin) {
                    el.insertBefore(newNode, el.firstChild);
                } else {
                    el.appendChild(newNode);
                }
            }

            return returnElement ? Hamster.get(newNode) : newNode;
        },
 
        createTemplate: function(o) {
            return new Hamster.tpl.Base(this.markup(o));
        },
 
        createHtml: function(spec) {
            return this.markup(spec);
        },

        parse: function (spec) {
            return this.createHtml(spec)
        }
    };
    
});
// Hamster.dom.kit.IframeShim
Hamster.define('Hamster.dom.kit.IframeShim', {

	alternateClassName: 'Hamster.dom.IframeShim',

	constructor: function (target) {
		if (!Hamster.browser.isIE6) {
			return this;
		}
		this.target = Hamster.get(target).eq(0);
		return this;
	},

	sync: function () {
		var target = this.target;
		var iframe = this.iframe;

		if (!Hamster.browser.isIE6 || !target.length) {
			return this;
		}

		var height = target.outerHeight(),
			width = target.outerWidth();

		// 如果目标元素隐藏，则 iframe 也隐藏
    	// jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
    	// http://api.jquery.com/hidden-selector/
		if (!height || !width || target.is(':hidden')) {
			iframe && iframe.hide();
		} else {
			// 第一次显示时才创建：as lazy as possible
			iframe || (iframe = this.iframe = this.__create());
			iframe.css({ width: width, height: height });
			Hamster.dom.Position.pin(Hamster.getDom(iframe), Hamster.getDom(target));
			iframe.show();
		}
		return this;
	},

	destroy: function () {
		if (!Hamster.browser.isIE6) {
			return;
		}
		if (this.iframe) {
			this.iframe.remove();
			delete this.iframe;
		}
		delete this.target;
	},

	__create: function () {
		var css = {
			display: 'none',
			border: 'none',
			opacity: 0,
			position: 'absolute'
		};
		// 如果 target 存在 zIndex 则设置
		var zIndex = this.target.css('zIndex');
		if (zIndex && zIndex > 0) {
			css.zIndex = zIndex - 1;
		}
		return Hamster.DomHelper.before(this.target, {
			tag: 'iframe',
			// 不加的话，https 下会弹警告
			src: 'javascript:\'\'', 
			frameborder: 0,
			style: Hamster.Object.toStringBy(css, ':', ";")
		}, true);
	}

});
// Hamster.dom.kit.Sticky
Hamster.define('Hamster.dom.kit.Sticky', {

	statics: {

		prefixs: ["-webkit-", "-ms-", "-o-", "-moz-", ""]

	},

	alternateClassName: 'Hamster.dom.Sticky',

	mixins: {

        event: Hamster.util.Event
    
    },

	inited: false,

	origin: { top: 0, left: 0, styles: {} },

	guid: Hamster.uniqueId(),

	top: null,

	bottom: null,

	fixed: false,

	ie6: true,

	__scrollFn: Hamster.EMPTY_FUNCTION,

	// config -- > {top: 0, bottom: 0, fixed: false, ie6: true}
	// config -- > number --> {top: 10}
	constructor: function (element, config, unSupportIe6) {
		this.element = Hamster.get(element);
		if (Hamster.isNumber(config)) {
			config = {top: config};
		} 
		Hamster.apply(this, config);
		this.ie6 = !(!!unSupportIe6);
		this.mixins.event.constructor.call(this);
		this.render();
		return this;
	},

	beforeRender: function () {
		var offset = this.element.offset();
		this.origin.top = offset.top;
		this.origin.left = offset.left;

		if (this.fixed) {
			this.top = this.origin.top;
			this.bottom = null;
		}

		Hamster.Object.each((this.origin.styles = {
			position: null,
			top: null,
			bottom: null,
			left: null,
			zIndex: null
		}), function (name, value) {
			this.origin.styles[name] = this.element.css(name);
		}, this);
	},

	render: function () {
		if (Hamster.isEmpty(this.element) || this.inited || 
				(!this.ie6 && Hamster.browser.ieIE6)) {
			return this;
		}
		this.beforeRender();
		this.onRender();
		this.afterRender();
		return this;
	},	

	onRender: function () {
		if (Hamster.features.has('PositionSticky') && !this.fixed) {
			this.__scrollFn = this.__supportSticky;
			var temp = "";
			Hamster.Array.forEach(this.statics().prefixs, function (name) {
				temp += 'position:' + name + 'sticky;';
			});
			if (!Hamster.isEmpty(this.top)) {
				temp += 'top:' + this.top + 'px;';
			}
			if (!Hamster.isEmpty(this.bottom)) {
				temp += 'bottom:' + this.bottom + 'px';
			}
			Hamster.getDom(this.element).style.cssText += temp;
		} 
		else if (Hamster.features.has('PositionFixed')) {
			this.__scrollFn = this.__supportFixed;
		} 
		else {
			var parent = this.element[0], has;
	        while (parent && parent != document && !has) {
	            var position = Hamster.get(parent).css('position');
	            if (parent.nodeType == 1 && (position == 'absolute' || position == 'relative')) {
	                has = parent;
	            }
	            parent = parent.parentNode;
	        }
	        if (!Hamster.isEmpty(has)) {
	        	Hamster.Error('在IE6下使用Hamster.dom.Fixed时，element的所有父级节点不能存在position的值为relative和absolute的情况');
	        }

			this.__scrollFn = this.__supportAbsolute;
			Hamster.DomHelper.append(Hamster.getHead(), {
				tag: 'style',
				type: 'text/css',
				html: '* html { background: url(null) no-repeat fixed; }'
			});
		}
		this.__scrollFn.call(this);
	},

	afterRender: function () {
		var resize_name = "resize.sticky." + this.guid;
		var scroll_name = "scroll.sticky." + this.guid;
		Hamster.getWin().on(resize_name, Hamster.Function.createThrottled(this.__win_resize, 120, this));
		Hamster.getWin().on(scroll_name, Hamster.Function.bind(this.__win_scroll, this));
		this.inited = true;
	},

	__win_scroll: function () {
		if (!this.element.is(':visible')) {
			return;
		}
		this.__scrollFn.call(this);
	},

	__win_resize: function () {
		this.adjust();
	},

	__getTopBottomStatus: function (offsetTop, scrollTop) {
		var top = false, bottom = false;
		scrollTop = scrollTop || Hamster.getDoc().scrollTop();

		if (!Hamster.isEmpty(this.top)) {
			top = offsetTop - scrollTop <= this.top;
		}
		if (!Hamster.isEmpty(this.bottom)) {
			bottom = scrollTop + Hamster.getWin().height() - offsetTop - this.element.outerHeight() <= this.bottom;
		}
		return { top: top, bottom: bottom }
	},

	__supportFixed: function () {
		var status = this.__getTopBottomStatus(this.origin.top);
		if (!this.sticked && status.top || status.bottom) {
			this.__createPlaceholder();
			this.element.css(Hamster.apply({
				position: 'fixed',
				left: this.origin.left,
                zIndex: this.origin.styles.zIndex == 'auto' ? 99999 : this.origin.styles.zIndex
			}, status.top ? {
				top: this.top
			} : {
				bottom: this.bottom
			}));
			this.sticked = true;
			this.trigger('sticky');
		} else if (this.sticked && !status.top && !status.bottom) {
			this.__restore();
		}

	},

	__supportSticky: function () {
		var status = this.__getTopBottomStatus(this.element.offset().top);
		if (!this.sticked && status.top || status.bottom) {
			this.sticked = true;
			this.trigger('sticky');
		} else if (this.sticked && !status.top && !status.bottom) {
			this.sticked = false;
			this.trigger('normal');
		}	
	},

	__supportAbsolute: function () {
		var scrollTop = Hamster.getDoc().scrollTop();
		var status = this.__getTopBottomStatus(this.origin.top, scrollTop);
		if (status.top || status.bottom || this.fixed) {
			if (!this.sticked) {
				this.__createPlaceholder();
				this.sticked = true;
				this.trigger('sticky');
			}
			this.element.css({
				position: 'absolute',
                left: this.origin.left,                
				top: this.fixed ? this.origin.top + scrollTop : (status.top ? (this.top + scrollTop) : 
					(scrollTop + Hamster.getWin().height() - this.bottom - this.element.outerHeight())),
                zIndex: this.origin.styles.zIndex == 'auto' ? 99999 : this.origin.styles.zIndex
			});
		} else if (this.sticked && !status.top && !status.bottom) {
			this.__restore();
		}
	},

	__createPlaceholder: function () {
		var need = false;
		var position = this.element.css('position');
		
		if (position === 'static' || position === 'relative') {
			need = true;
		}
		if (this.element.css('display') !== 'block') {
			need = false;
		}

		if (need) {
			this.placeholder = Hamster.DomHelper.after(this.element, {
				tag: 'div',
				style: {
					visibility: 'hidden',
					margin: 0,
					padding: 0
				} 
			}, true);
			this.placeholder.width(this.element.outerWidth(true)).height(this.element.outerHeight(true)).css('float', this.element.css('float'));
		}
	},

	__removePlaceholder: function () {
		this.placeholder && this.placeholder.remove();
	},

	// 重置
	__restore: function () {
		this.__removePlaceholder();
		this.element.css(this.origin.styles);
		this.sticked = false;
		this.trigger('normal');
	},

	destroy: function () {
		this.__restore();
		var resize_name = "resize.sticky." + this.guid;
		var scroll_name = "scroll.sticky." + this.guid;
		Hamster.getWin().off(resize_name);
		Hamster.getWin().off(scroll_name);
		this.trigger('destroy');
		this.inited = false;
	},

	adjust: function () {
		if (!Hamster.features.has('PositionSticky')) {
			this.__restore();
			var offset = this.element.offset();
			this.origin.top = offset.top;
			this.origin.left = offset.left;
		}
		this.__scrollFn.call(this);
	}
});

Hamster.define('Hamster.tpl.Base', {

    mixins: {
        event: Hamster.util.Event
    },

    uses: ['Hamster.dom.Helper'],

    isTemplate: true,

    scope: null,

    compiled: false,

    disableFormats: false,

    html: Hamster.emptyString,

    re: /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,

    constructor: function (config) {
        var args = arguments,
            length = args.length,
            buffer = [],
            i = 0,
            value;

        if (length > 1) {
            for (; i < length; i++) {
                value = args[i];
                if (typeof value == 'object') {
                    Hamster.apply(this, value);
                } else {
                    buffer.push(value);
                }
            }
            this.html = buffer.join('');
        } else {
            if (Hamster.isArray(config) || Hamster.isString(config)) {
                this.html = Hamster.Array.toArray(config).join('');
            } else {
                if (Hamster.isArray(config.html)) {
                    config.html = config.html.join('');
                } else if (Hamster.isString(config.localTarget)) {
                    config.html = this._parseElementTemplateContent(config.localTarget);
                }
                Hamster.apply(this, config);
            }
        }
        this.mixins.event.constructor.call(this, config);

        this.scope = this.scope || this;
        this.compiled && this.compile();
    },

    _parseElementTemplateContent: function (id) {
        var element = Hamster.get('#' + id).hide();
        if (Hamster.isEmpty(element)) {
            return Hamster.dom.Helper.parse({tag: 'div'});
        }
        return element.html();
    },

    apply: function (values) {
        var me = this,
            useFormat = this.disableFormats !== true,
            compiled = this.compiled,
            fm = Hamster.util.Format,
            tpl = this.scope;

        if (compiled) {
            return compiled(values).join('');
        }

        function formatFn(m, name, format, args) {
            if (format && useFormat) {
                if (args) {
                    args = [values[name]].concat(Hamster.functionFactory('return [' + args + ']')());
                } else {
                    args = [values[name]];
                }
                if (format.substr(0, 5) == 'this.') {
                    return tpl[format.substr(5)].apply(tpl, args);
                } else {
                    return fm[format].apply(fm, args);
                }
            } else {
                return values[name] !== undefined ? values[name] : Hamster.emptyString;
            }
        }

        var ret = this.html.replace(this.re, formatFn);
        return ret
    },

    applyTemplate: function () {
        return this.apply.apply(this, arguments);
    },

    applyOther: function (values, other) {
        var compiled = this.compiled;
        if (compiled) {
            other.push.apply(other, compiled(values));
        } else {
            other.push(this.apply(values));
        }
        return other;
    },

    compileARe: /\\/g,

    compileBRe: /(\r\n|\n)/g,

    compileCRe: /'/g,

    compile: function () {
        var me = this,
            fm = Hamster.util.Format,
            useFormat = this.disableFormats !== true,
            tpl = this.scope,
            body, bodyReturn;

        function compileFn(m, name, format, args) {
            if (format && useFormat) {
                args = args ? ',' + args : "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                } else {
                    format = 'tpl.' + format.substr(5) + '(';
                }
            } else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }

        this.html = bodyReturn = this.html.replace(this.compileARe, '\\\\').replace(this.compileBRe, '\\n').replace(this.compileCRe, '\\').replace(this.re, compileFn);
        eval("this.compiled = function (values) { return ['" + bodyReturn + "']; }");
        return this;
    },

    prepend: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    before: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    after: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnElement) {
        var newNode = Hamster.dom.Helper.insertHtml(where, Hamster.getDom(el), this.apply(values));
        return returnElement ? Hamster.get(newNode) : newNode;
    },

    overwrite: function(el, values, returnElement) {
        var newNode = Hamster.dom.Helper.overwrite(Hamster.getDom(el), this.apply(values));
        return returnElement ? Hamster.get(newNode) : newNode;
    }

});
Hamster.define('Hamster.tpl.TemplateParser', {

    useFormat: false,

    definitions: false,

    constructor: function (config) {
        Hamster.apply(this, config);
    },

    doTpl: Hamster.emptyFn,

    parse: function (str) {
        var me = this,
            len = str.length,
            aliases = {
                elseif: 'elif'
            },
            topRe = me.topRe,
            actionsRe = me.actionsRe,
            index, stack, s, m, t, prev, frame, subMatch, begin, end, actions,
            prop;

        me.level = 0;
        me.stack = stack = [];

        for (index = 0; index < len; index = end) {
            topRe.lastIndex = index;
            m = topRe.exec(str);

            if (!m) {
                me.doText(str.substring(index, len));
                break;
            }

            begin = m.index;
            end = topRe.lastIndex;

            if (index < begin) {
                me.doText(str.substring(index, begin));
            }

            if (m[1]) {
                end = str.indexOf('%}', begin + 2);
                me.doEval(str.substring(begin + 2, end));
                end += 2;
            } else if (m[2]) {
                end = str.indexOf(']}', begin + 2);
                me.doExpr(str.substring(begin + 2, end));
                end += 2;
            } else if (m[3]) {
                me.doTag(m[3]);
            } else if (m[4]) {
                actions = null;
                while ((subMatch = actionsRe.exec(m[4])) !== null) {
                    s = subMatch[2] || subMatch[3];
                    if (s) {
                        s = Hamster.String.htmlDecode(s);
                        t = subMatch[1];
                        t = aliases[t] || t;
                        actions = actions || {};
                        prev = actions[t];

                        if (typeof prev == 'string') {
                            actions[t] = [prev, s];
                        } else if (prev) {
                            actions[t].push(s);
                        } else {
                            actions[t] = s;
                        }
                    }
                }

                if (!actions) {
                    if (me.elseRe.test(m[4])) {
                        me.doElse();
                    } else if (me.defaultRe.test(m[4])) {
                        me.doDefault();
                    } else {
                        me.doTpl();
                        stack.push({
                            type: 'tpl'
                        });
                    }
                } else if (actions['if']) {
                    me.doIf(actions['if'], actions);
                    stack.push({
                        type: 'if'
                    });
                } else if (actions['switch']) {
                    me.doSwitch(actions['switch'], actions);
                    stack.push({
                        type: 'switch'
                    });
                } else if (actions['case']) {
                    me.doCase(actions['case'], actions);
                } else if (actions['elif']) {
                    me.doElseIf(actions['elif'], actions);
                } else if (actions['for']) {
                    ++me.level;

                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doFor(actions['for'], actions);
                    stack.push({
                        type: 'for',
                        actions: actions
                    });
                } else if (actions['foreach']) {
                    ++me.level;

                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doForEach(actions['foreach'], actions);
                    stack.push({
                        type: 'foreach',
                        actions: actions
                    });
                } else if (actions.exec) {
                    me.doExec(actions.exec, actions);
                    stack.push({
                        type: 'exec',
                        actions: actions
                    });
                }
            } else if (m[0].length === 5) {
                stack.push({
                    type: 'tpl'
                });
            } else {
                frame = stack.pop();
                me.doEnd(frame.type, frame.actions);
                if (frame.type == 'for' || frame.type == 'foreach') {
                    --me.level;
                }
            }
        }
    },

    topRe: /(?:(\{\%)|(\{\[)|\{([^{}]+)\})|(?:<tpl([^>]*)\>)|(?:<\/tpl>)/g,

    actionsRe: /\s*(elif|elseif|if|for|foreach|exec|switch|case|eval|between)\s*\=\s*(?:(?:"([^"]*)")|(?:'([^']*)'))\s*/g,

    propRe: /prop=(?:(?:"([^"]*)")|(?:'([^']*)'))/,

    defaultRe: /^\s*default\s*$/,

    elseRe: /^\s*else\s*$/

});
Hamster.define('Hamster.tpl.TemplateCompiler', {

    extend: Hamster.tpl.TemplateParser,

    useEval: true,

    useIndex: true,

    propNameRe: /^[\w\d\$]*$/,

    definitions: [],

    fnArgs: 'out, values, parent, xindex, xcount, xkey',

    constructor: function () {
        this.callParent(arguments);
        this.callFn = '.call(this,' + this.fnArgs + ')';
    },

    compile: function (tpl) {
        var me = this,
            code = me.generate(tpl);

        var ret = me.useEval ? me.evalTpl(code) : (new Function('Hamster', code))(Hamster);
        return ret
    },

    generate: function (tpl) {
        var me = this,
            definitions = 'var fm=Hamster.util.Format,ts=Object.prototype.toString;',
            code;

        me.maxLevel = 0;

        me.body = [
                'var c0=values, a0=' + me.createArrayTest(0) + ', p0=parent, n0=xcount, i0=xindex, k0, v;\n'
        ];

        if (me.definitions) {
            if (typeof me.definitions === 'string') {
                me.definitions = [me.definitions, definitions];
            } else {
                me.definitions.push(definitions);
            }
        } else {
            me.definitions = [definitions];
        }
        me.switches = [];

        me.parse(tpl);

        me.definitions.push(
                (me.useEval ? '$=' : 'return') + ' function (' + me.fnArgs + ') {',
            me.body.join(''),
            '}'
        );

        code = me.definitions.join('\n');

        me.definitions.length = me.body.length = me.switches.length = 0;
        delete me.definitions;
        delete me.body;
        delete me.switches;

        return code;
    },

    doText: function (text) {
        var me = this,
            out = me.body;

        text = text.replace(me.aposRe, "\\'").replace(me.newLineRe, '\\n');
        if (me.useIndex) {
            out.push('out[out.length]=\'', text, '\'\n');
        } else {
            out.push('out.push(\'', text, '\')\n');
        }
    },

    doExpr: function (expr) {
        var out = this.body;
        out.push('if ((v=' + expr + ') != null) out');
        if (this.useIndex) {
            out.push('[out.length]=v+\'\'\n');
        } else {
            out.push('.push(v+\'\')\n');
        }
    },

    doTag: function (tag) {
        var expr = this.parseTag(tag);
        if (expr) {
            this.doExpr(expr);
        } else {
            this.doText('{' + tag + '}');
        }
    },

    doElse: function () {
        this.body.push('} else {\n');
    },

    doEval: function (text) {
        this.body.push(text, '\n');
    },

    doIf: function (action, actions) {
        var me = this;
        if (action === '.') {
            me.body.push('if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('if (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },

    doElseIf: function (action, actions) {
        var me = this;

        if (action === '.') {
            me.body.push('else if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('} else if (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('} else if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },

    doSwitch: function (action) {
        var me = this;

        if (action === '.') {
            me.body.push('switch (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('switch (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('switch (', me.addFn(action), me.callFn, ') {\n');
        }
        me.switches.push(0);
    },

    doCase: function (action) {
        var me = this,
            cases = Hamster.isArray(action) ? action : [action],
            n = me.switches.length - 1,
            match, i;

        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }

        for (i = 0, n = cases.length; i < n; ++i) {
            match = me.intRe.exec(cases[i]);
            cases[i] = match ? match[1] : ("'" + cases[i].replace(me.aposRe, "\\'") + "'");
        }

        me.body.push('case ', cases.join(': case '), ':\n');
    },

    doDefault: function () {
        var me = this,
            n = me.switches.length - 1;

        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }

        me.body.push('default:\n');
    },

    doEnd: function (type, actions) {
        var me = this,
            L = me.level - 1;

        if (type == 'for' || type == 'foreach') {
            if (actions.exec) {
                me.doExec(actions.exec);
            }
            me.body.push('}\n');
            me.body.push('parent=p', L, ';values=r', L + 1, ';xcount=n' + L + ';xindex=i', L, '+1;xkey=k', L, ';\n');
        } else if (type == 'if' || type == 'switch') {
            me.body.push('}\n');
        }
    },

    doFor: function (action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L - 1,
            parentAssignment;

        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        } else {
            s = me.addFn(action) + me.callFn;
        }

        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }

        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }

        me.body.push('i', L, '=0,n', L, '=0,c', L, '=', s, ',a', L, '=', me.createArrayTest(L), ',r', L, '=values,p', L, ',k', L, ';\n',
            'p', L, '=parent=', parentAssignment, '\n',
            'if (c', L, '){if(a', L, '){n', L, '=c', L, '.length;}else if (c', L, '.isMixedCollection){c', L, '=c', L, '.items;n', L, '=c', L, '.length;}else if(c', L, '.isStore){c', L, '=c', L, '.data.items;n', L, '=c', L, '.length;}else{c', L, '=[c', L, '];n', L, '=1;}}\n',
            'for (xcount=n', L, ';i', L, '<n' + L + ';++i', L, '){\n',
            'values=c', L, '[i', L, ']');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }
        me.body.push('\n',
            'xindex=i', L, '+1\n');

        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("', actions.between, '"); } \n');
        }
    },

    doForEach: function (action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L - 1,
            parentAssignment;

        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        } else {
            s = me.addFn(action) + me.callFn;
        }

        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }

        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }

        me.body.push('i', L, '=-1,n', L, '=0,c', L, '=', s, ',a', L, '=', me.createArrayTest(L), ',r', L, '=values,p', L, ',k', L, ';\n',
            'p', L, '=parent=', parentAssignment, '\n',
            'for(k', L, ' in c', L, '){\n',
            'xindex=++i', L, '+1;\n',
            'xkey=k', L, ';\n',
            'values=c', L, '[k', L, '];');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }

        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("', actions.between, '"); } \n');
        }
    },

    createArrayTest: ('isArray' in Array) ? function (L) {
        return 'Array.isArray(c' + L + ')';
    } : function (L) {
        return 'ts.call(c' + L + ')==="[object Array]"';
    },

    doExec: function (action, actions) {
        var me = this,
            name = 'f' + me.definitions.length;

        me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
            ' try { with(values) {',
                '  ' + action,
            ' }} catch(e) {',
            '   Hamster.log("XTemplate Error: " + e.message);',
            '}',
            '}');

        me.body.push(name + me.callFn + '\n');
    },

    addFn: function (body) {
        var me = this,
            name = 'f' + me.definitions.length;

        if (body === '.') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                ' return values',
                '}');
        } else if (body === '..') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                ' return parent',
                '}');
        } else {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                ' try { with(values) {',
                    '  return(' + body + ')',
                ' }} catch(e) {',
                '   Hamster.log("XTemplate Error: " + e.message);',
                '}',
                '}');
        }

        return name;
    },

    parseTag: function (tag) {
        var me = this,
            m = me.tagRe.exec(tag),
            name, format, args, math, v;

        if (!m) {
            return null;
        }

        name = m[1];
        format = m[2];
        args = m[3];
        math = m[4];

        if (name == '.') {
            if (!me.validTypes) {
                me.definitions.push('var validTypes={string:1,number:1,boolean:1};');
                me.validTypes = true;
            }
            v = 'validTypes[typeof values] || ts.call(values) === "[object Date]" ? values : ""';
        } else if (name == '#') {
            v = 'xindex';
        } else if (name == '$') {
            v = 'xkey';
        } else if (name.substr(0, 7) == "parent.") {
            v = name;
        } else if (isNaN(name) && name.indexOf('-') == -1 && name.indexOf('.') != -1) {
            v = "values." + name;
        } else {
            v = "values['" + name + "']";
        }

        if (math) {
            v = '(' + v + math + ')';
        }

        if (format && me.useFormat) {
            args = args ? ',' + args : "";
            if (format.substr(0, 5) != "this.") {
                format = "fm." + format + '(';
            } else {
                format += '(';
            }
        } else {
            return v;
        }

        return format + v + args + ')';
    },

    evalTpl: function ($) {
        eval($);
        return $;
    },

    newLineRe: /\r\n|\r|\n/g,

    aposRe: /[']/g,

    intRe: /^\s*(\d+)\s*$/,

    tagRe: /^([\w-\.\#\$]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?$/

});
Hamster.define('Hamster.tpl.Template', {

    extend: Hamster.tpl.Base,

    scope: null,

    compiled: false,

    disableFormats: false,

    definitions: false,

    html: Hamster.emptyString,

    emptyObj: {},

    apply: function (values, parent) {
        return this.applyOther(values, [], parent).join('')
    },

    applyOther: function (values, out, parent) {
        var compiler;

        if (!this.fn) {
            compiler = new Hamster.tpl.TemplateCompiler({
                useFormat: this.disableFormats !== true,
                definitions: this.definitions
            });
            this.fn = compiler.compile(this.html);
        }

        try {
            this.fn.call(this.scope, out, values, parent || this.emptyObj, 1, 1);
        } catch (e) {
            Hamster.Error({
                className: "Hamster.XTemplate",
                methodName: "applyOther",
                error: e.message
            })
        }

        return out;
    },

    compile: function () {
        return this
    }

});
Hamster.define('Hamster.component.TemplateCompile', {

    singleton: true,

    tpl: function (content, scope) {
        return new Hamster.tpl.Template({
            html: content,
            compile: true,
            disableFormats: false,
            scope: scope
        })
    },

    ejs: function (content, scope) {
        return function (data) {
            return ejs.render(content, data);
        }
    },

    handlebars: function (content, scope) {
        return function (data) {
            var helpers = {};
            for (var key in Handlebars.helpers) {
                helpers[key] = Handlebars.helpers[key];
            }
            for (var key in scope) {
                helpers[key] = scope[key];
            }
            return Handlebars.compile(content)(data, {
                helpers: helpers
            });
        }
    }

});
Hamster.define('Hamster.component.TemplateFactory', {

    statics: {

        TEMPLATE_SCOPE_END_PREFIX: 'TemplateHelpers'

    },

    singleton: true,

    pools: {},

    register: function (pro, templates) {
        var unloaded = [];
        Hamster.Object.each(templates, function (key, item) {
            item.name = key;
            this.push2Pools(pro, [item]);
            if (item.id) {
                item.content = this.parseElementTemplateContent(item.id);
            }
            if (item.content) {
                this.setContent(pro, item.name, item.content);
            } else if (!Hamster.isEmpty(item.path) && !this.isLoaded(pro, item.name)) {
                unloaded.push(item);
            }
        }, this);
        this.proxy(pro, unloaded);
    },

    parseElementTemplateContent: function (id) {
        var element = Hamster.get('#' + id).hide();
        if (Hamster.isEmpty(element)) {
            return Hamster.dom.Helper.parse({tag: 'div'});
        }
        return element.html();
    },

    push2Pools: function (pro, templates) {
        var name = pro.$className,
            manager;

        if (!(manager = this.pools[name])) {
            manager = this.pools[name] = new Hamster.util.HashMap({
                getKey: function (item) {
                    return item.name;
                }
            });
        }
        Hamster.Array.forEach(templates, function (template, i) {
            if (Hamster.isEmpty(manager.get(template.name))) {
                manager.push(template.name, template);
            }
        }, this);
    },

    proxy: function (pro, templates, params, callback) {
        templates = Hamster.isArray(templates) ? templates : [templates];
        if (Hamster.isEmpty(templates)) {
            return;
        }
        if (Hamster.isEmpty(Hamster.Setting.TEMPLATE_SERVER_URL)) {
            Hamster.Array.forEach(templates, function (tpl) {
                this.setContent(pro, tpl.name, Hamster.loadTextFile(tpl.path));
            }, this);
        } else {
            var proxyConfig = {
                async: false,
                type: Hamster.Setting.TEMPLATE_SERVER_METHOD || "GET",
                url: Hamster.Setting.TEMPLATE_SERVER_URL
            }, me = this;
            proxyConfig.data = Hamster.apply({
                templates: Hamster.util.JSON.encode(templates)
            }, params || {});
            var call_fn = function (data) {
                if (Hamster.isFunction(callback)) {
                    data = callback.call(pro, data);
                }
                Hamster.Object.each(data, function (name, content) {
                    this.setContent(pro, name, content);
                }, me);
            };
            Hamster.DOM_QUERY.ajax(proxyConfig).done(call_fn);
        }
    },

    compile: function (pro, name, content) {
        var scope_end_prefix = this.statics().TEMPLATE_SCOPE_END_PREFIX;
        var compiler = Hamster.component.TemplateCompile[pro.templateType || Hamster.Setting.TEMPLATE_TYPE];
        var compile;

        if (Hamster.isEmpty(compiler)) {
            compiler = Hamster.component.TemplateCompile[Hamster.Setting.TEMPLATE_TYPE];
        }

        if (Hamster.isString(content) || Hamster.isArray(content)) {
            var scope = pro[name + scope_end_prefix] || pro;
            content = Hamster.isArray(content) ? content.join('') : content;
            compile = compiler(content, scope);
        } else if (Hamster.isFunction(content)) {
            compile = content;
        }
        if (Hamster.isEmpty(compile)) {
            compile = function () {
                return Hamster.dom.Helper.parse({tag: 'div'});
            }
        }
        pro.__$setCompileTemplate(name, compile);
    },

    setContent: function (pro, name, content) {
        var template = this.get(pro, name);
        this.compile(pro, name, content);
        return template.content = content;
    },

    isLoaded: function (pro, name) {
        var template = this.get(pro, name);
        return !Hamster.isEmpty(template.content);
    },

    get: function (pro, name) {
        var manager = this.pools[pro.$className];
        if (Hamster.isEmpty(manager)) {
            return null;
        }
        return manager.get(name);
    }

});

//定义组件基类
Hamster.define('Hamster.component.Component', {

    alternateClassName: ['Hamster.Component', 'Hamster.ViewController'],

    statics: {

        GENERATE_ID_PREFIX: 'Hamster_COMPONENT_',

        getGenerateID: function () {
            return Hamster.uniqueId(this.GENERATE_ID_PREFIX);
        }

    },

    extend: Hamster.Base,

    mixins: {

        event: Hamster.util.Event

    },

    elements: {},

    events: {},

    delegates: {},

    templates: {},

    listeners: {},

    config: {
        
        target: null,

        renderTo: null,   

        autoRender: true 
    
    },

    isComponent: true,

    //类的初始化
    constructor: function (config) {

        var statics = this.statics();

        if (Hamster.isEmpty(config)) {
            config = {};
        }

        Hamster.apply(this, config);

        this.initialConfig = config;

        this.__$name = statics.getGenerateID();

        this.mixins.event.constructor.call(this, config);
        
        this.setting();

        this.initTemplates();

        if (this.autoRender) {
            this.render();
        }

        return this;
    },

    setting: Hamster.emptyFn,

    beforeRender: function () {
        var target = this.target;
        this.el = this.el || {};
        if (target) {
            this.el.target = Hamster.get(target);
        } else if (this.tpl.main) {
            this.el.target = this.applyTemplate('main');
        }
        if (Hamster.isEmpty(this.el.target)) {
            Hamster.Error('the el.target is undefined');
        }
        Hamster.Element.id(this.el.target);
    },

    render: function (renderTo) {
        if (this.rendered) {
            this.destroy(false);
            this.destroyed = false;
            this.rendered = false;
            this.render();
            return;
        }

        if (!this.rendered && (this.trigger('beforerender', this) !== false)) {
            this.beforeRender();
            this.onRender(renderTo);
            this.afterRender();
        }
    },

    onRender: function (renderTo) {
        renderTo = Hamster.get(renderTo || this.renderTo);
        if (renderTo && renderTo.length > 0) {
            if (Hamster.isFunction(this.renderToFn)) {
                this.renderToFn(this.el.target, renderTo);
            } else {
                renderTo.append(this.el.target);
            }
        }

        this.applyElements();
        this.initEvents();
        this.initDelegates();
        this.trigger('render', this);
    },

    afterRender: function () {
        this.trigger('afterrender', this);        
        //this.domain();
        this.main();
        this.rendered = true;
    },

    //提供给子类覆盖的初始化方法
    main: Hamster.emptyFn,
    //domain: Hamster.emptyFn,

    renderToFn: null,

    initTemplates: function () {
        
        var tpls = this.templates, applyFn;
        if (typeof tpls === 'string') {
            tpls = { main: tpls };
        } else if (Hamster.isObject(tpls)) {
            tpls = Hamster.apply({}, this.templates, {});
        }

        Hamster.Object.each(tpls, function (name, tpl) {
            if (Hamster.isString(tpl)) {
                tpls[name] = Hamster.String.has(tpl, '.') ?
                    {name: name, path: tpl} : 
                    {name: name, id: tpl};
            } else if (Hamster.isArray(tpl) || Hamster.isFunction(tpl)) {
                tpls[name] = {name: name, content: tpl};
            }
            applyFn = 'apply' + Hamster.String.firstUpperCase(name) + 'Template';
            this[applyFn] = function (data, isHtml) {
                return this.applyTemplate(name, data, isHtml);
            }
        }, this);
        this.tpl = {};
        Hamster.component.TemplateFactory.register(this, tpls);
    },

    __$setCompileTemplate: function (name, compile) {
        return this.tpl[name] = compile;
    },

    applyTemplate: function (name, data, isHtml) {
        var template = this.tpl[name];
        if (name == 'main') {
            data = Hamster.apply({}, this.getMainTplData());
        }
        var html = template.isTemplate ? template.apply(data) : template.call(this, data);
        return isHtml ? html : Hamster.get(html);
    },

    // type 的类型为：append、prepend、after、before、overwrite
    applyTemplateTo: function (name, data, el, type, isHtml) {
        var template = this.tpl[name];
        if (!template.isTemplate) {
            var html = template.call(this, data);
            var ret = isHtml ? html : Hamster.get(html);
            if (type == 'overwrite') {
                type = 'html';
            }
            el[type](html);
            return ret;
        }
        return template[type](el, data, isHtml);
    },

    getMainTplData: function () {
        return {};
    },

    applyElements: function (elements) {
        Hamster.Object.each(elements || this.elements || {}, function (name, selector) {
            this.element(name, selector, true);
        }, this);
    },

    element: function (name, selector, ignoreEvents) {
        var elements, index = -1, content = this.el;

        if (Hamster.isEmpty(selector)) {
            return;
        }
        
        if (Hamster.isString(selector)) {
            index = selector.indexOf('@');
            elements = index < 0 ? content.target.find(selector) :
                content[selector.substr(0, index)].find(selector.substr(index + 1));
        } else {
            if (selector.jquery) {
                elements = selector;
            } else {
                elements = Hamster.get(selector);
            }
        }

        this.__event_cache = this.__event_cache || {};

        var cache = this.__event_cache[name] || {};

        if (Hamster.isEmpty(content[name])) {
            content[name] = elements;
        } else {
            content[name] = content[name].add(elements);
        }

        if (!ignoreEvents) {
            Hamster.Object.each(cache, function (type, handlers) {
                Hamster.Array.forEach(handlers || [], function (handler) {
                    this.mon(elements, type, handler);
                }, this);
            }, this);
        }

        return elements;
    },

    __$eventReg: /([a-z]+)\s+([a-zA-Z0-9_-]+)(\s+\{([^\{\}]+)\})?/,

    initEvents: function (events) {
        events = events || Hamster.apply({}, this.events);
        if (Hamster.isEmpty(events)) {
            return;
        }

        Hamster.Object.each(events, function (name, handler) {
            var regObj = name.match(this.__$eventReg);

            var name = regObj[2];
            var type = regObj[1];
            var selector = regObj[4];
            var target;

            if (!Hamster.isEmpty(selector)) {
                this.applyElements((function () {
                    var selector_option = {};
                    selector_option[name] = selector;
                    return selector_option;
                })())
            } 
            if (!Hamster.isEmpty(target = this.el[name])) {
                var cache = this.__event_cache[name] = this.__event_cache[name] || {};
                cache[type] = cache[type] || [];
                cache[type].push(handler);
                this.mon(target, type, handler);
            }
        }, this);
    },

    mon: function (target, type, handler, scope) {
        var me = this;

        if (Hamster.isString(handler)) {
            handler = this[handler];
        }

        if (Hamster.isString(target)) {
            target = this.el[target];
        }

        if (type == Hamster.EventType.HOVER) {
            var over, out;
            if (Hamster.isObject(handler) && (Hamster.isFunction(handler.over) || Hamster.isFunction(handler.out))) {
                over = handler.over;
                out = handler.out;
            } else if (Hamster.isArray(handler)) {
                over = handler[0];
                out = handler[1];
            }
            target.hover(function (e) {
                over.call(scope || me, e, Hamster.get(this), me);
            }, function (e) {
                out.call(scope || me, e, Hamster.get(this), me);
            });
            return this;
        }

        if (!Hamster.isFunction(handler) || Hamster.isEmpty(target)) {
            return;
        }

        target.bind(type || Hamster.EventType.CLICK, function (e) {
            return handler.call(scope || me, e, Hamster.get(this), me);
        });

        return this;
    },

    unmon: function (target, type) {
        target = Hamster.isString(target) ? this.el[target] : target;
        if (Hamster.isEmpty(target)) {
            return;
        }
        if (Hamster.isEmpty(type)) {
            target.unbind();
        } else {
            target.unbind(type);
        }
        return this;
    },

    initDelegates: function () {
        var delegates = Hamster.apply({}, this.delegates);
        Hamster.Object.each(delegates, function (selector, handler) {
            this.don(selector, handler);
        }, this);
    },

    __$delegateReg: /([a-z]+)\s+\{([^\{\}]+)\}/,

    don: function (name, handler, scope) {
        var me = this;
        handler = this[handler];
        if (!Hamster.isFunction(handler)) {
            return;
        }

        var regObj = name.match(this.__$delegateReg);
        var type = Hamster.EventType.CLICK, selector;

        if (Hamster.isEmpty(regObj)) {
            selector = name;
        } else {
            type = regObj[1];
            selector = regObj[2];
        }

        this.el.target.delegate(selector, type, function (e) {
            var target = Hamster.get(e.target);
            if (!target.is(selector)) {
                target = target.closest(selector).eq(0);
            }
            if (handler.call(scope || me, e, target, me) === false) {
                e.stopPropagation();
                return false;
            }
            return true;
        })
    },

    undon: function (selector, type) {
        this.el.target.undelegate(selector, type || Hamster.EventType.CLICK);
    },

    beforeDestroy: function () {
        Hamster.Object.each(this.__event_cache, function (name, events) {
            var elements = this.el[name];
            elements && elements.jquery && elements.unbind();
            delete this.__event_cache[name];
        }, this);
        this.el.target.undelegate();
        Hamster.Object.each(this.tpl, function (name) {
            delete this.tpl[name];
        }, this);
        this.tpl = null;
    },

    destroy: function (retain) {
        if (this.destroyed || this.trigger('beforedestroy', this) === false) {
            return;
        }
        this.beforeDestroy();
        this.onDestroy();
        this.afterDestroy(retain);
    },

    onDestroy: function () {
        Hamster.Object.each(this.el || {}, function (name, el) {
            if (name == 'target') {
                return;
            }
            if (el.jquery) {
                el.remove();
            } else if (Hamster.isArray(el)) {
                Hamster.Array.forEach(el, function (e) {
                    e.remove();
                }, this);
            } else if (Hamster.isObject(el)) {
                Hamster.Object.each(el, function (n, e) {
                    e.remove();
                }, this);
            }
            delete this.el[name];
        }, this);
        this.trigger('destroy', this);
    },

    afterDestroy: function (retain) {
        this.trigger('afterdestroy', this);
        if (this.rendered && this.el.target && !this.target) {
            this.el.target.remove();
            this.el.target = null;
        }
        this.off();
        this.destroyed = true;
        if (!retain) {
            for (var pro in this) {
                if (this.hasOwnProperty(pro)) {
                    delete this[pro];
                }
            }
        }
    }

});
// Hamster.component.Widget
Hamster.define('Hamster.component.Widget', {

	alternateClassName: ['Hamster.UI', 'Hamster.Widget'],

	extend: Hamster.Component,

	config: {

		baseCls: Hamster.EMPTY_STRING

	},

	beforeRender: function () {
		this.callParent(arguments);
		this.initUpdateForConfig('baseCls');
	},

	updateBaseCls: function (cls) {
		this.el.target.addClass(cls);
	}

});
Hamster.define('Hamster.app.Session', {

	// 是否开启session过期监听功能
    sessionMonitor: false,

    // session失效时间，单位为分钟
    sessionExpirationMinutes: 5,

    // 监听session存在的事件名称
    sessionEventTypes: ['mouseover', 'keydown'], 

    constructor: function (config) {
    	Hamster.apply(this, config);
    },   

	initSessionMonitor: function () {
		if (!this.sessionMonitor) {
			return;
		}
        var last_time_setTimeout, me = this;
        this.__session_last_time = new Date();
        this.sessionSetInterval();
        Hamster.getDoc().on(this.sessionEventTypes.join(' '), function () {
            clearTimeout(last_time_setTimeout);
            last_time_setTimeout = setTimeout(function () {
                me.__session_last_time = new Date();
            }, 200);
        });
    },

    sessionSetInterval: function () {
        this.__session_intervalID = setInterval(Hamster.bind(function () {
			var now = new Date();
	        var diff = now - this.__session_last_time;
	        var diff_mins = (diff / 1000 / 60);
	        if (diff_mins >= this.sessionExpirationMinutes) {
	            clearInterval(this.__session_intervalID);
	            this.sessionExpiration();
	        }
        }, this), 5000);
    },

    sessionExpiration: function () {
        this.trigger('session_expiration');
    }

});
Hamster.define('Hamster.app.Viewport', {

    alternateClassName: ['Hamster.Viewport'],

    isViewport: true,

    extend: Hamster.ViewController,

    mixins: {

        session: Hamster.app.Session

    },

    target: document.body,

    routes: {},

    fragments: {},

    constructor: function (config) {
        if (Hamster.isObject(config) && config.fragments) {
            delete config.fragments;
        }
        this.callParent(arguments);
        this.mixins.session.constructor.call(this, arguments);
    },

    setRoute: function (route, callback) {
        if (!this.router) {
            this.routes[route] = callback;
            return;
        }
        this.router.set(route, callback);
    },

    navigate: function (fragment, options) {
        Hamster.util.History.navigate(fragment, options);
        return this;
    },

    afterRender: function () {
        var me = this;
        this.callParent(arguments);

        this.statics().fragments.eachKey(function (name, config) {
            var fragment = Hamster.define(Hamster.apply(config, {viewport: me}));
            me.fragments[name] = new fragment();
        });

        this.router = Hamster.create('Hamster.util.Router', {
            scope: this,
            routes: this.routes
        });
        this.initSessionMonitor();
    }

}, function () {

    this.addInheritableStatics({

        initialized: false,

        viewport: null,

        fragments: new Hamster.util.MixedCollection(),

        create: function (config) {
            var me = this;
            var className = this.getName();
            var alternateClassName = this.prototype.alternateClassName;
            if (!Hamster.isEmpty(alternateClassName)) {
                className = alternateClassName[0];
            }
            if (this.initialized || this.viewport) {
                Hamster.Error('[' + className + '] the viewport is already initialized');
            }
            Hamster.getDoc().ready(function () {
                me.viewport = new (Hamster.define(Hamster.apply({extend: className}, config)));
            });
            this.initialized = true;
        },

        fragment: function (name, config) {
            this.fragments.add(name, config);
        }

    });

    Hamster.viewport = Hamster.Viewport.create;

});
