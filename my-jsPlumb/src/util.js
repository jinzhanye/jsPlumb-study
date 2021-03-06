/* This file contains utility functions that run in both browsers and headless.*/
;(function () {

    var _isa = function (a) {
            return Object.prototype.toString.call(a) === "[object Array]";
        },
        _isnum = function (n) {
            return Object.prototype.toString.call(n) === "[object Number]";
        },
        _iss = function (s) {
            return typeof s === "string";
        },
        _isb = function (s) {
            return typeof s === "boolean";
        },
        _isnull = function (s) {
            return s == null;
        },
        _iso = function (o) {
            return o == null ? false : Object.prototype.toString.call(o) === "[object Object]";
        },
        _isd = function (o) {
            return Object.prototype.toString.call(o) === "[object Date]";
        },
        _isf = function (o) {
            return Object.prototype.toString.call(o) === "[object Function]";
        },
        _isNamedFunction = function (o) {
            return _isf(o) && o.name != null && o.name.length > 0;
        },
        _ise = function (o) {
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        };

    var root = this;
    root.jsPlumbUtil = {
        isArray: _isa,
        isString: _iss,
        isBoolean: _isb,
        isNull: _isnull,
        isObject: _iso,
        isDate: _isd,
        isFunction: _isf,
        isEmpty: _ise,
        isNumber: _isnum,
        clone: function (a) {
            if (_iss(a)) {
                return "" + a;
            }
            else if (_isb(a)) {
                return !!a;
            }
            else if (_isd(a)) {
                return new Date(a.getTime());
            }
            else if (_isf(a)) {
                return a;
            }
            else if (_isa(a)) {
                var b = [];
                for (var i = 0; i < a.length; i++) {
                    b.push(this.clone(a[i]));
                }
                return b;
            }
            else if (_iso(a)) {
                var c = {};
                for (var j in a) {
                    c[j] = this.clone(a[j]);
                }
                return c;
            }
            else {
                return a;
            }
        },
        /**
         * 属性从b合并到a，collations为可选参数，作用未知
         * @param a { Object } merge into
         * @param b {Object} merge from
         * @param collations
         * @returns {*}
         */
        merge: function (a, b, collations) {
            // first change the collations array - if present - into a lookup table, because its faster.
            var cMap = {}, ar, i;
            collations = collations || [];
            for (i = 0; i < collations.length; i++) {
                cMap[collations[i]] = true;
            }

            var c = this.clone(a);
            for (i in b) {
                if (c[i] == null) {
                    c[i] = b[i];
                }
                else if (_iss(b[i]) || _isb(b[i])) {
                    if (!cMap[i]) {
                        c[i] = b[i]; // if we dont want to collate, just copy it in.
                    }
                    else {
                        ar = [];
                        // if c's object is also an array we can keep its values.
                        ar.push.apply(ar, _isa(c[i]) ? c[i] : [ c[i] ]);
                        ar.push.apply(ar, _isa(b[i]) ? b[i] : [ b[i] ]);
                        c[i] = ar;
                    }
                }
                else {
                    if (_isa(b[i])) {
                        ar = [];
                        // if c's object is also an array we can keep its values.
                        if (_isa(c[i])) {
                            ar.push.apply(ar, c[i]);
                        }
                        ar.push.apply(ar, b[i]);
                        c[i] = ar;
                    }
                    else if (_iso(b[i])) {
                        // overwite c's value with an object if it is not already one.
                        if (!_iso(c[i])) {
                            c[i] = {};
                        }
                        for (var j in b[i]) {
                            c[i][j] = b[i][j];
                        }
                    }
                }

            }
            return c;
        },
        /**
         * 将[value]与map[key]映射
         * @param map
         * @param key
         * @param value
         * @param insertAtStart 在value数组头部插入value
         * @returns {*}
         */
        addToList: function (map, key, value, insertAtStart) {
            // map:{
            //   'eventName':[handlerList]
            // }
            var l = map[value];
            // 若容器为空先初始化容器
            if (l == null) {
                l = [];
                map[key] = l;
            }
            l[insertAtStart ? "unshift" : "push"](value);
            return l;
        },
        //
        // extends the given obj (which can be an array) with the given constructor function, prototype functions, and
        // class members, any of which may be null.
        //
        extend: function (child, parent, _protoFn) {
            var i;
            parent = _isa(parent) ? parent : [parent];

            for (i = 0; i < parent.length; i++) {
                for (var j in parent[i].prototype) {
                    if (parent[i].prototype.hasOwnProperty(j)) {
                        child.prototype[j] = parent[i].prototype[j];
                    }
                }
            }

            var _makeFn = function (name, protoFn) {
                return function () {
                    for (i = 0; i < parent.length; i++) {
                        if (parent[i].prototype[name]) {
                            parent[i].prototype[name].apply(this, arguments);
                        }
                    }
                    return protoFn.apply(this, arguments);
                };
            };

            var _oneSet = function (fns) {
                for (var k in fns) {
                    child.prototype[k] = _makeFn(k, fns[k]);
                }
            };

            if (arguments.length > 2) {
                for (i = 2; i < arguments.length; i++) {
                    _oneSet(arguments[i]);
                }
            }

            return child;
        },
        uuid: function () {
            return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }));
        },
    };

    root.jsPlumbUtil.EventGenerator = function () {
        // 以下声明的是属性用闭包进行私有化，每个jsPlumb实例都有一份
        var _listeners = {},
            // _listeners 是jsPlumb相关事件容器，结构如下
            // _listeners = {
            //     'eventName':[eventHandlers]
            // }
            eventsSuspended = false,
            // tick用于标识递归调用
            tick = false,
            // 不捕获eventsToDieOn列表里为true的事件相应的事件处理器抛出的错误，使之能够冒泡。而列表外的事件则捕获异常，输出日志
            eventsToDieOn = {"ready": true},
            // 延迟队列
            queue = [];

        /**
         * 绑定事件监听器
         * @param event
         * @param listener
         * @param insertAtStart
         * @returns {jsPlumbInstance}
         */
        this.bind = function (event, listener, insertAtStart) {
            var _one = function (evt) {
                root.jsPlumbUtil.addToList(_listeners, evt, listener, insertAtStart);
                listener.__jsPlumb = listener.__jsPlumb || {};
                listener.__jsPlumb[root.jsPlumbUtil.uuid()] = evt;
            };

            if (typeof event === "string") {
                _one(event);
            }
            else if (event.length != null) {
                for (var i = 0; i < event.length; i++) {
                    _one(event[i]);
                }
            }

            return this;
        };

        /**
         * 触发事件
         * @param event {String} 事件名称
         * @param value
         * @param originalEvent {Object} 原生事件对象
         * @returns {root.jsPlumbUtil.EventGenerator}
         */
        this.fire = function (event, value, originalEvent) {
            if (!tick) {
                tick = true;
                if (!eventsSuspended && _listeners[event]) {
                    var l = _listeners[event].length, i = 0, _gone = false, ret = null;
                    if (!this.shouldFireEvent || this.shouldFireEvent(event, value, originalEvent)) {
                        while (!_gone && i < l && ret !== false) {
                            // doing it this way rather than catching and then possibly re-throwing means that an error propagated by this
                            // method will have the whole call stack available in the debugger.
                            // 不捕获eventsToDieOn列表里为true的事件相应的事件处理器抛出的错误，使之能够冒泡。而列表外的事件则捕获异常，输出日志
                            if (eventsToDieOn[event]) {
                                _listeners[event][i].apply(this, [value, originalEvent]);
                            }
                            else {
                                try {
                                    // 如果事件处理器返回false，则同一事件的其他处理器不用执行
                                    ret = _listeners[event][i].apply(this, [value, originalEvent]);
                                } catch (e) {
                                    root.jsPlumbUtil.log("jsPlumb: fire failed for event " + event + " : " + e);
                                }
                            }
                            i++;
                            // 有可能在触发事件过程中_listeners或者_listeners[event]变为空
                            if (_listeners == null || _listeners[event] == null) {
                                _gone = true;
                            }
                        }
                    }
                }
                tick = false;
                // 执行延迟队列里的任务
                _drain();
            } else {
                // 若果处于递归状态，则先将该次处理放到延迟队列
                queue.unshift(arguments);
            }
            return this;
        };

        var _drain = function () {
            var n = queue.pop();
            if (n) {
                this.fire.apply(this, n);
            }
        }.bind(this);

        this.unbind = function (eventOrListener, listener) {

            if (arguments.length === 0) {
                _listeners = {};
            }
            else if (arguments.length === 1) {
                if (typeof eventOrListener === "string") {
                    delete _listeners[eventOrListener];
                }
                else if (eventOrListener.__jsPlumb) {
                    var evt;
                    for (var i in eventOrListener.__jsPlumb) {
                        evt = eventOrListener.__jsPlumb[i];
                        root.jsPlumbUtil.remove(_listeners[evt] || [], eventOrListener);
                    }
                }
            }
            else if (arguments.length === 2) {
                root.jsPlumbUtil.remove(_listeners[eventOrListener] || [], listener);
            }

            return this;
        };

        this.getListener = function (forEvent) {
            return _listeners[forEvent];
        };
        this.setSuspendEvents = function (val) {
            eventsSuspended = val;
        };
        this.isSuspendEvents = function () {
            return eventsSuspended;
        };
        this.silently = function (fn) {
            this.setSuspendEvents(true);
            try {
                fn();
            }
            catch (e) {
                root.jsPlumbUtil.log("Cannot execute silent function " + e);
            }
            this.setSuspendEvents(false);
        };
        this.cleanupListeners = function () {
            for (var i in _listeners) {
                _listeners[i] = null;
            }
        };
    };

    root.jsPlumbUtil.EventGenerator.prototype = {
        cleanup: function () {
            this.cleanupListeners();
        }
    };

    if (typeof exports !== "undefined") {
        exports.jsPlumbUtil = root.jsPlumbUtil;
    }

}).call(typeof window !== 'undefined' ? window : this);
