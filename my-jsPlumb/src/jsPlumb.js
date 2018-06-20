;(function () {

    "use strict";

    var root = this;

    var _ju = root.jsPlumbUtil,
        // tap与click两者都会在点击时触发，但是在手机WEB端，click会有 200~300 ms。
        events = ["tap", "dbltap", "click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "contextmenu"];

    var jsPlumbInstance = root.jsPlumbInstance = function (_defaults) {
        this.version = "<% pkg.version %>";
        // 将开发者传入的参数覆盖到Defaults
        if (_defaults) {
            jsPlumb.extend(this.Defaults, _defaults);
        }

        this.logEnabled = this.Defaults.LogEnabled;
        this._connectionTypes = {};
        this._endpointTypes = {};
        // 继承事件处理类
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
            // TODO
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

            };

            var _addOneDelegate = function (eventId, selector, fn) {

            };

            var _oneDelegate = function (id) {

            };

            for (var i = 0; i < events.length; i++) {
                _oneDelegate(events[i]);
            }

            // managed elements
            for (var elId in managedElements) {

            }
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

        this.bind = function (event, fn) {
            if ('ready' === event && initialized) {
                fn();
            } else {
                _bb.apply(_currentInstance, [event, fn]);
            }
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
            };
// --------------------- end makeSource/makeTarget ----------------------------------------------

        this.ready = function (fn) {
            _currentInstance.bind('ready', fn);
        };

        this.connectorClass = "jtk-connector";
        this.draggingClass = "jtk-dragging";// CONVERTED
        this.Anchors = {};

        this.Anchors = {};
        this.Connectors = {"svg": {}};
        // 锚点div容器内的svg容器相关配置
        this.Endpoints = {"svg": {}};
        this.Overlays = {"svg": {}};
        // ConnectorRenderers存放渲染所需要的方法
        this.ConnectorRenderers = {};
        this.SVG = "svg";

        // --------------------------- jsPlumbInstance public API ---------------------------------------------------------

        this.addEndPoint = function (el, params, referenceParams) {
            referenceParams = referenceParams || {};
            var p = jsPlumb.extend({}, referenceParams);
            jsPlumb.extend(p, params);
            p.endpoint = p.endpoint || _currentInstance.Defaults.Endpoint;
            p.paintStyle = p.paintStyle || _currentInstance.Defaults.EndpointStyle;

            var results = [],
                // 统一用数组处理
                inputs = (_ju.isArray(el) || (el.length != null && !_ju.isString(el))) ? el : [el];

            for (var i = 0, len = inputs.length; i < len; i++) {
                p.source = _currentInstance.getElement(inputs[i]);
                _ensureContainer(p.source);
                var id = _getId(p.source);
                var e = _newEndpoint(p, id);

                var myOffset = _manage(id, p.source).info.o;
                // endpointsByElement[id] = [e]
                _ju.addToList(endpointsByElement, id, e);

                if (!_suspendDrawing) {
                    e.paint({
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

        /*
         factory method to prepare a new endpoint.  this should always be used instead of creating Endpoints
         manually, since this method attaches event listeners and an id.
         */
        _newEndpoint = function (params, id) {
            // TODO _currentInstance.Defaults.EndpointType??
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

            }

            return ep;
        }
    };

    jsPlumbInstance.prototype.Defaults = {
        Anchor: "Bottom",
        Anchors: [null, null],
        ConnectionsDetachable: true,
        ConnectionOverlays: [],
        Connector: "Bezier",
        Container: null,
        DoNotThrowErrors: false,
        DragOptions: {},
        DropOptions: {},
        Endpoint: "Dot",
        EndpointOverlays: [],
        Endpoints: [null, null],
        EndpointStyle: {fill: "#456"},
        EndpointStyles: [null, null],
        EndpointHoverStyle: null,
        EndpointHoverStyles: [null, null],
        HoverPaintStyle: null,
        LabelStyle: {color: "black"},
        LogEnabled: false,
        Overlays: [],
        MaxConnections: 1,
        PaintStyle: {"stroke-width": 4, stroke: "#456"},
        ReattachConnections: false,
        RenderMode: "svg",
        Scope: "jsPlumb_DefaultScope"
    };

// --------------------- static instance + module registration -------------------------------------------

    // create static instance and assign to window if window exists.
    var jsPlumb = new jsPlumbInstance();
    // 将一个jsPlumb绑定到全局，root即window
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
     * 遍历DOM对象
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
