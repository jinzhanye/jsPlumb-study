/*jsPlumb核心代码*/
;(function () {

    "use strict";

    var root = this;

    var _ju = root.jsPlumbUtil,
        // tap与click两者都会在点击时触发，但是在手机WEB端，click会有 200~300 ms。
        events = ["tap", "dbltap", "click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "contextmenu"],

// ------------------------------ BEGIN jsPlumbUIComponent --------------------------------------------
        jsPlumbUIComponent = root.jsPlumbUIComponent = function (params) {
            _ju.EventGenerator.apply(this, arguments);

            var self = this,
                a = arguments,
                idPrefix = self.idPrefix,
                id = idPrefix + (new Date()).getTime();

            this._jsPlumb = {
                instance: params._jsPlumb,
                parameters: params.parameters || {},
                paintStyle: null,
                hoverPaintStyle: null,
                paintStyleInUse: null,
                hover: false,
                beforeDetach: params.beforeDetach,
                beforeDrop: params.beforeDrop,
                overlayPlacements: [],
                hoverClass: params.hoverClass || params._jsPlumb.Defaults.HoverClass,
                types: [],
                typeCache: {}
            };
        };

    _ju.extend(root.jsPlumbUIComponent, _ju.EventGenerator, {
        getParameter: function (name) {
            return this._jsPlumb.parameters[name];
        },

        setParameter: function (name, value) {
            this._jsPlumb.parameters[name] = value;
        },

        getParameters: function () {
            return this._jsPlumb.parameters;
        },

        setParameters: function (p) {
            this._jsPlumb.parameters = p;
        },

        getClass: function () {
            return jsPlumb.getClass(this.canvas);
        },

        hasClass: function (clazz) {
            return jsPlumb.hasClass(this.canvas, clazz);
        },

        addClass: function (clazz) {
            jsPlumb.addClass(this.canvas, clazz);
        },

        removeClass: function (clazz) {
            jsPlumb.removeClass(this.canvas, clazz);
        },

        updateClasses: function (classesToAdd, classesToRemove) {
            jsPlumb.updateClasses(this.canvas, classesToAdd, classesToRemove);
        },
        // ........
    });
// ------------------------------ END jsPlumbUIComponent --------------------------------------------


    var jsPlumbInstance = root.jsPlumbInstance = function (_defaults) {
        this.version = "2.6.9";
        if (_defaults) {
            // 属性拷贝
            jsPlumb.extend(this.Defaults, _defaults);
        }

        this.logEnabled = this.Defaults.LogEnabled;
        this._connectionTypes = {};
        this._endpointTypes = {};
        // 借用EventGenerator构造方法，继承事件处理方法
        _ju.EventGenerator.apply(this);
        var _currentInstance = this,
            _bb = _currentInstance.bind,
            _initialDefaults = {},
            _zoom = 1;

        _currentInstance.restoreDefaults = function () {
            _currentInstance.Defaults = jsPlumb.extend({}, _initialDefaults);
            return _currentInstance;
        };

        var _container, _containerDelegations = [];
        this.unbindContainer = function () {

        };
        /**
         *
         * @param c {String | Object} selector or jQueryObject
         */
        this.setContainer = function (c) {
            // TODO
            // this.unbindContainer();

            // 获取原生DOM对象
            c = this.getELement(c);
            // move existing connections and endpoints, if any.
            // TODO 以下两个方法的作用是??
            // this.select().each(function (conn) {
            //     conn.moveParent(c);
            // });
            // this.selectEndpoints().each(function (ep) {
            //     ep.moveParent(c);
            // });

            // set container.
            var previousContainer = _container;
            _container = c;
            _containerDelegations.length = 0;
            var eventAliases = {
                "endpointclick": "endpointClick",
                "endpointdblclick": "endpointDblClick"
            };

            var _oneDelegateHandler = function (id, e, componentType) {
                // e.srcElement是e.target的一个别名，只在老版本IE有效
                var t = e.srcElement || e.target;
                // 依次从 父节点 -> 当前节点 -> 祖父节点 搜索__jsPlumb对象
                var jp = (t && t.parentNode ? t.parentNode.__jsPlumb : null) ||// 父节点
                    (t ? t.__jsPlumb : null) ||// 当前节点
                    (t && t.parentNode && t.parentNode.parentNode ? t.parentNode.parentNode._jsPlumb : null);// 祖父节点

                if (jp) {
                    jp.fire(id, jp, e);
                    // TODO
                    // jsplumb also fires every event coming from components/overlays. That's what the test for `jp.component` is for.
                    // var alias
                }
            };

            /**
             * 添加事件代理
             * @param eventId 事件名称
             * @param selector 代理节点的selector
             * @param fn 回调方法
             * @private
             */
            var _addOneDelegate = function (eventId, selector, fn) {
                _containerDelegations.push([eventId, fn]);
                // 监听_container上的eventId事件，selector作代理节点
                _currentInstance.on(_container, eventId, selector, fn);
            };

            var _oneDelegate = function (id) {
                _addOneDelegate(id, '.jtk-endpoint', function (e) {
                    _oneDelegateHandler(id, e, 'endpoint');
                });
            };
            // 将events列表的事件都代理到当前container上
            for (var i = 0; i < events.length; i++) {
                _oneDelegate(events[i]);
            }

            // 将元素从旧container移动新的container
            for (var elId in managedElements) {
                var el = managedElements[elId].el;
                if (el.parentNode === previousContainer) {
                    previousContainer.removeChild(el);
                    _container.appendChild(el);
                }
            }
        };


        this.getContainer = function () {
            return _container;
        };

        this.bind = function (event, fn) {
            if ('ready' === event && initialized) {
                fn();
            } else {
                _bb.apply(_currentInstance, [event, fn]);
            }
        };

        /**
         *  修改当前jsPlumb实例默认配置
         * @param d {Object} 配置对象
         * @returns {jsPlumb} jsPlumb对象
         */
        _currentInstance.importDefaults = function (d) {
            for (var i in d) {
                _currentInstance.Defaults[i] = d[i];
            }

            if (d.Container) {
                _currentInstance.setContainer(d.Container);
            }

            return _currentInstance;
        };

        // 恢复默认配置
        _currentInstance.restoreDefaults = function () {
            _currentInstance.Defaults = jsPlumb.extend({}, _initialDefaults);
            return _currentInstance;
        };

        var log = null,
            initialized = false,
            // map of element id -> endpoint lists. an element can have an arbitrary
            // number of endpoints on it, and not all of them have to be connected
            // to anything.
            endpointsByElement = {},// 以元素id作为key对应endpoint endpointsByElement[elId] = [endPoints]
            endpointsByUUID = {}, //  以元素的uuid作为key对应endpoint
            managedElements = {},
            // managedElements是一个元素容器
            // managedElements[elId] = {
            //     el: element,
            //     endpoints: [],
            //     connections: []
            // };
            offsets = {},//offsets[elId] = {{left: el.offsetLeft, top: el.offsetTop}}
            offsetTimestamps = {},// 计算offset时的时间戳
            sizes = [],// line 7000 保存元素的宽与高 sizes[elId] = [ el.offsetWidth, el.offsetHeight ] offsetWidth = width + padding + border
            _suspendDrawing = false,
            _suspendedAt = null,
            _curIdStamp = 1,
            _idstamp = function () {
                return "" + _curIdStamp++;
            },
            /**
             * appends an element to some other element, which is calculated as follows:
             * 1. if Container exists, use that element.
             * 2. if the 'parent' parameter exists, use that.
             * 3. otherwise just use the root element.
             * @param el {Object} 原生DOM对象
             * @param parent 未知
             * @private
             */
            _appendElement = function (el, parent) {
                if (_container) {
                    _container.appendChild(el);
                }
                else if (!parent) {
                    this.appendToRoot(el);
                }
                else {
                    this.getElement(parent).appendChild(el);
                }
            }.bind(this),

            /*
             factory method to prepare a new endpoint.  this should always be used instead of creating Endpoints
             manually, since this method attaches event listeners and an id.
             */
            _newEndpoint = function (params, id) {
                // .Defaults.EndpointType 在源码中有其他地方也未见使用，这是留给开发者自己配置的？？
                // jsPlumb.Endpoint是一个Endpoint构造方法，见源码line 7393
                var endpointFunc = _currentInstance.Defaults.EndpointType || jsPlumb.Endpoint;
                var _p = jsPlumb.extend({}, params);
                _p._jsPlumb = _currentInstance;
                _p.newConnection = _newConnection;
                _p.newEndpoint = _newEndpoint;
                _p.endpointsByUUID = endpointsByUUID;
                _p.endpointsByElement = endpointsByElement;
                _p.fireDetachEvent = fireDetachEvent;
                _p.elementId = id || _getId(_p.source);
                var ep = new endpointFunc(_p);
                // 生成唯一id
                ep.id = "ep_" + _idstamp();
                //
                _manage(_p.elementId, _p.source);
                if (!jsPlumb.headless) {
                    // 记录当前endpoint与document的距离
                    _currentInstance.getDragManager().endpointAdded(_p.source, id);
                }

                return ep;
            },

            _getId = function (element, uuid, doNotCreateIfNotFound) {

            };

        var _ensureContainer = function (candidate) {

        };

        var _getContainerFromDefaults = function () {
            if (_currentInstance.Defaults.Container) {
                _currentInstance.setContainer(_currentInstance.Defaults.Container);
            }
        };

        var _manage = _currentInstance.manage = function (id, element, _transient) {
            if (!managedElements[id]) {
                managedElements[id] = {
                    el: element,
                    endpoints: [],
                    connections: []
                };

                managedElements[id].info = _updateOffset({elId: id, timestamp: _suspendedAt});
                // 非瞬时态就触发manageElement事件？？,查看源码调用_manage的地方_transient都不传参，也就是说，这个事件一定会触发
                if (!_transient) {
                    _currentInstance.fire('manageElement', {id: id, info: managedElements[id].info, el: element});
                }
            }

            return managedElements[id];
        };

        /**
         * 计算传入元素的offset与size，并缓存这些值。如果开发者传入'offset'，则直接返回这个值，否则重新进行计算
         * 当params.recalc为true时，也需要重新进行计算
         * @param params {Object}
         * @private
         * @returns {Object} {o: offsets[params,elId], s: sizes[params,elId]}
         */
        var _updateOffset = this.updateOffset = function (params) {

            var timestamp = params.timestamp,
                recalc = params.recalc,// 是不需要重新计算
                offset = params.offset,
                elId = params.elId,
                s;

            if (_suspendDrawing && !timestamp) {
                timestamp = _suspendedAt;
            }
            if (!recalc) {// 直接从缓存或者开发者传入的参数里读取，不需要重新计算偏移
                // TODO 为什么比较timestamp??
                if (timestamp && timestamp === offsetTimestamps[elId]) {
                    return {o: params.offset || offsets[elId], s: sizes[elId]};
                }
            }

            if (recalc || (!offset && offsets[elId] == null)) {// 重新计算offset
                s = managedElements[elId] ? managedElements[elId].el : null;
                if (s != null) {
                    // 缓存
                    sizes[elId] = _currentInstance.getSize(s);
                    offsets[elId] = _currentInstance.getOffset(s);
                    offsetTimestamps[elId] = timestamp;
                }
            } else {
                offsets[elId] = offset || offsets[id];
                if (sizes[elId] == null) {
                    s = managedElements[elId].el;
                    if (s != null) {
                        sizes[elId] = _currentInstance.getSize(s);
                    }
                }
                offsetTimestamps[elId] = timestamp;
            }
            // 求右侧偏移量
            // 为什么不直接用getBoundingClientRect求？？
            if (offsets[elId] && !offsets[elId].right) {
                offsets[elId].right = offsets[elId].left + sizes[elId][0];
                offsets[elId].bottom = offsets[elId].top + sizes[elId][1];
                offsets[elId].width = sizes[elId][0];
                offsets[elId].height = sizes[elId][1];
                // 中央点的x与y坐标
                offsets[elId].centerx = offsets[elId].left + (offsets[elId].width / 2);
                offsets[elId].centery = offsets[elId].top + (offsets[elId].height / 2);
            }

            return {o: offsets[elId], s: sizes[elId]};
        };

        /**
         * callback from the current library to tell us to prepare ourselves (attach
         * mouse listeners etc; can't do that until the library has provided a bind method)
         */
        this.init = function () {
            if (!initialized) {
                // 将一些事件委托到container上
                _getContainerFromDefaults();
                // 绑定锚点管理类实例
                _currentInstance.anchorManager = new root.jsPlumb.AnchorManager({jsPlumbInstance: _currentInstance});
                initialized = true;
                _currentInstance.fire('ready', _currentInstance);
            }
        }.bind(this);

        this.log = log;
        this.jsPlumbUIComponent = jsPlumbUIComponent;

        /*
         * Creates an anchor with the given params.
         *
         *
         * Returns: The newly created Anchor.
         * Throws: an error if a named anchor was not found.
         */
        this.makeAnchor = function () {
            var pp, _a = function (t, p) {
                if (root.jsPlumb.Anchors[t]) {
                    return new root.jsPlumb.Anchors[t](p);
                }
                if (!_currentInstance.Defaults.DoNotThrowErrors) {
                    throw {msg: "jsPlumb: unknown anchor type '" + t + "'"};
                }
            };
            if (arguments.length === 0) {
                return null;
            }

            var specimen = arguments[0],
                elementId = arguments[1],
                jsPlumbInstance = arguments[2],
                newAnchor = null;

            // if it appears to be an anchor already...
            // 如果它看起来已经像个锚点？？
            if (specimen.compute && specimen.getOrientation) {
                return specimen;
            } else if (typeof specimen === "string") {
                // TODO
            } else if (_ju.isArray(specimen)) {
                if (_ju.isArray(specimen[0]) || _ju.isString(specimen[0])) {
                    // TODO
                } else {
                    var anchorParams = {
                        x: specimen[0],
                        y: specimen[1],
                        orientation: (specimen.length >= 4) ? [specimen[2], specimen[3]] : [0, 0],
                        offsets: (specimen.length >= 6) ? [specimen[4], specimen[5]] : [0, 0],
                        elementId: elementId,
                        jsPlumbInstance: _currentInstance,
                        cssClass: specimen.length === 7 ? specimen[6] : null
                    };
                    newAnchor = new root.jsPlumb.Anchor(anchorParams);
                    newAnchor.clone = function () {
                        return new root.jsPlumb.Anchor(anchorParams);
                    };
                }
            }

            if (!newAnchor.id) {
                newAnchor.id = "anchor_" + _idstamp();
            }
            return newAnchor;
        };
// --------------------- end makeSource/makeTarget ----------------------------------------------

        this.ready = function (fn) {
            _currentInstance.bind('ready', fn);
        };

        this.connectorClass = "jtk-connector";
        this.draggingClass = "jtk-dragging";// CONVERTED

        this.Anchors = {};
        this.Connectors = {"svg": {}};
        // 锚点div容器内的svg容器相关配置
        this.Endpoints = {"svg": {}};
        this.Overlays = {"svg": {}};
        // ConnectorRenderers存放渲染所需要的方法
        this.ConnectorRenderers = {};
        this.SVG = "svg";

        // --------------------------- jsPlumbInstance public API ---------------------------------------------------------


        /**
         * 传入一个el则返回一个endpoint对象，传入多个el则返回endpoint数组
         * 在方法内部params会与referenceParams合并，referenceParams只是用来为开发者提供便利的数据共享
         * @param el
         * @param params
         * @param referenceParams
         * @returns {Array}
         */
        this.addEndPoint = function (el, params, referenceParams) {
            referenceParams = referenceParams || {};
            var p = jsPlumb.extend({}, referenceParams);
            jsPlumb.extend(p, params);
            p.endpoint = p.endpoint || _currentInstance.Defaults.Endpoint;// 默认为"Dot"
            p.paintStyle = p.paintStyle || _currentInstance.Defaults.EndpointStyle; // 默认为{fill: "#456"}，即填充绿色

            var results = [],
                // 统一用数组处理传入的元素
                inputs = (_ju.isArray(el) || (el.length != null && !_ju.isString(el))) ? el : [el];

            for (var i = 0, len = inputs.length; i < len; i++) {
                p.source = _currentInstance.getElement(inputs[i]);
                _ensureContainer(p.source);
                var id = _getId(p.source);
                // 创建一个endpoint
                var e = _newEndpoint(p, id);
                // _manage 做了两件事
                // 1.将el放到全局元素容器，以id作为key， managedElements[id] = el
                // 2.计算el相对于container的位置
                // myOffset = {
                //     height: 62,
                //     width: 62,
                //     bottom: 393,
                //     left: 317,
                //     right: 379,
                //     top: 331,
                //     centerx: 348, el的几何中心x坐标
                //     centery: 362, el的几何中心y坐标
                // };
                var myOffset = _manage(id, p.source).info.o;
                // endpointsByElement为全局endpoint容器
                // endpointsByElement[id] = [e]
                _ju.addToList(endpointsByElement, id, e);

                if (!_suspendDrawing) {
                    e.paint({
                        // e.anchor.compute 计算anchor的坐标
                        // anchorLoc = [left,top]
                        anchorLoc: e.anchor.compute({
                            xy: [myOffset.left, myOffset.top],
                            wh: sizes[id],
                            element: e,
                            timestamp: _suspendedAt
                        }),
                        timestamp: _suspendedAt
                    });
                }

                // ensure element is managed.
                results.push(e);
            }

            return results.length === 1 ? results[0] : results;
        };

        this.connect = this.connect = function (params, referenceParams) {

        };
        this.getId = _getId;

        this.appendElement = _appendElement;
    };

    // 使全局jsPlumb构造方法继承_ju.EventGenerator.prototype上的方法与extend等方法
    _ju.extend(root.jsPlumbInstance, _ju.EventGenerator, {
        extend: function (o1, o2, names) {
            var i;
            if (names) {
                for (i = 0; i < names.length; i++) {
                    o1[names[i]] = o2[names[i]];
                }
            }
            else {
                for (i in o2) {
                    o1[i] = o2[i];
                }
            }

            return o1;
        },
    });

    // jsPlumb实例继承这些默认配置
    jsPlumbInstance.prototype.Defaults = {
        // Bottom即BottomCenter的位置
        Anchor: "Bottom",
        Anchors: [null, null],
        ConnectionsDetachable: true,
        ConnectionOverlays: [],
        Connector: "Bezier",
        Container: null,
        DoNotThrowErrors: false,
        DragOptions: {},
        DropOptions: {},
        // Dot 圆点
        Endpoint: "Dot",
        EndpointOverlays: [],
        Endpoints: [null, null],
        // endpoint填充为墨绿色
        EndpointStyle: {fill: "#456"},
        EndpointStyles: [null, null],
        EndpointHoverStyle: null,
        EndpointHoverStyles: [null, null],
        HoverPaintStyle: null,
        LabelStyle: {color: "black"},
        // jsPlumb内部有log机制，默认不输出log
        LogEnabled: false,
        Overlays: [],
        MaxConnections: 1,
        // stroke-width 控制边缘宽度，stroke 控制边缘颜色
        PaintStyle: {"stroke-width": 4, stroke: "#456"},
        ReattachConnections: false,
        RenderMode: "svg",
        Scope: "jsPlumb_DefaultScope"
    };

// --------------------- static instance + module registration -------------------------------------------

    // create static instance and assign to window if window exists.
    var jsPlumb = new jsPlumbInstance();
    // 将一个jsPlumb实例绑定到全局，root即window
    root.jsPlumb = jsPlumb;
    jsPlumb.getInstance = function (_defaults, overrideFns) {
        var j = new jsPlumbInstance(_defaults);
        if (overrideFns) {
            for (var ovf in overrideFns) {
                j[ovf] = overrideFns[ovf];
            }
        }
        j.init();
        return j;
    };
    /**
     * 工具方法：遍历DOM对象
     * @param spec {String | Array | Object}
     * @param fn {Function} callback
     */
    jsPlumb.each = function (spec, fn) {
        if (spec == null) {
            return;
        }
        if (typeof spec === "string") {
            fn(jsPlumb.getElement(spec));
        }
        else if (spec.length != null) {
            for (var i = 0; i < spec.length; i++) {
                fn(jsPlumb.getElement(spec[i]));
            }
        }
        else {
            fn(spec);
        } // assume it's an element.
    };
    // CommonJS
    if (typeof exports !== 'undefined') {
        exports.jsPlumb = jsPlumb;
    }

// --------------------- end static instance + AMD registration -------------------------------------------
// define方法是否存在都没有判断，哪来AMD registration ？？
}).call(typeof  window !== 'undefined' ? window : this);// 兼容浏览器和node
