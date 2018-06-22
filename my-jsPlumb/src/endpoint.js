/* endpoints模块代码 */
;(function () {
    "use strict";
    var root = this, _jp = root.jsPlumb, _ju = root.jsPlumbUtil;

    _jp.Endpoint = function (params) {
        var _jsPlumb = params._jsPlumb,
            _newConnection = params.newConnection,
            _newEndpoint = params.newEndpoint;

        this.idPrefix = "_jsplumb_e_";
        this.defaultLabelLocation = [0.5, 0.5];
        // ????
        this.defaultOverlayKeys = ["Overlays", "EndpointOverlays"];
        // 借用构造方法继承OverlayCapableJsPlumbUIComponent非共享属性
        _jp.OverlayCapableJsPlumbUIComponent.apply(this, arguments);

        this.prepareAnchor = function (anchorParams) {
            // a即anchor
            var a = this._jsPlumb.instance.makeAnchor(anchorParams, this.elementId, _jsPlumb);
            a.bind('anchorChanged', function (currentAnchor) {
                // 在endpoint对象上的anchorChanged事件
                this.fire('anchorChanged', {endpoint: this, anchor: currentAnchor});
                // TODO
                // _updateAnchorClass();
            }.bind(this));
            return a;
        };

        // TODO setPreparedAnchor
        this.setPreparedAnchor = function (anchor, doNotRepaint) {
            // this._jsPlumb.instance.continuousAnchorFactory.clear(this.elementId);
            this.anchor = anchor;

            // _updateAnchorClass();

            // if (!doNotRepaint) {
            //     this._jsPlumb.instance.repaint(this.elementId);
            // }

            return this;
        };

        // TODO
        this.prepareEndpoint = function (ep, typeId) {
            /**
             *
             * @param t
             * @param p {Object} params,endpoint参数
             * @private
             */
            var _e = function (t, p) {
                // renderMode为"svg"
                var rm = _jsPlumb.getRenderMode();
                // 见源码 line 14111 附近
                // Endpoints.svg.Dot
                // Endpoints.svg.Rectangle
                // Endpoints.svg.Image
                // Endpoints.svg.Label
                // Endpoints.svg.Custom
                if (_jp.Endpoints[rm][t]) {
                    return new _jp.Endpoints[rm][t](p);
                }
                if (!_jsPlumb.Defaults.DoNotThrowErrors) {
                    throw {msg: "jsPlumb: unknown endpoint type '" + t + "'"};
                }
            };

            var endpointArgs = {
                _jsPlumb: this._jsPlumb.instance,
                cssClass: params.cssClass,
                container: params.container,
                tooltip: params.tooltip, // ??
                connectorTooltip: params.connectorTooltip, // ??
                endpoint: this
            };

            var endpoint;

            if (_ju.isString(ep)) {
                endpoint = _e(ep, endpointArgs);
            }
            else if (_ju.isArray(ep)) {
                endpointArgs = _ju.merge(ep[1], endpointArgs);
                endpoint = _e(ep[0], endpointArgs);
            }
            else {
                endpoint = ep.clone();
            }

            // assign a clone function using a copy of endpointArgs. this is used when a drag starts: the endpoint that was dragged is cloned,
            // and the clone is left in its place while the original one goes off on a magical journey.
            // the copy is to get around a closure problem, in which endpointArgs ends up getting shared by
            // the whole world.
            //var argsForClone = jsPlumb.extend({}, endpointArgs);
            endpoint.clone = function () {
                // TODO this, and the code above, can be refactored to be more dry.
                if (_ju.isString(ep)) {
                    return _e(ep, endpointArgs);
                }
                else if (_ju.isArray(ep)) {
                    endpointArgs = _ju.merge(ep[1], endpointArgs);
                    return _e(ep[0], endpointArgs);
                }
            }.bind(this);

            endpoint.typeId = typeId;
            return endpoint;
        };

        this.setEndpoint = function (ep, doNotRepaint) {
            var _ep = this.prepareEndpoint(ep);
            this.setPreparedEndpoint(_ep, true);
        };

        this.setPreparedEndpoint = function (ep, doNotRepaint) {
            if (this.endpoint != null) {
                // TODO
                // this.endpoint.cleanup();
                // this.endpoint.destroy();
            }
            this.endpoint = ep;
            this.type = this.endpoint.type;
            this.canvas = this.endpoint.canvas;
        };

        /**
         *  为当前endpoint绑定anchor
         * @param anchorParams
         * @param doNotRepaint
         * @returns {root.jsPlumb.Endpoint}
         */
        this.setAnchor = function (anchorParams, doNotRepaint) {
            // 构造一个或多个anchor
            var a = this.prepareAnchor(anchorParams);
            // 将anchor绑定到endpoint
            this.setPreparedAnchor(a, doNotRepaint);
            return this;
        };

        this.paint = function (params) {
            params = params || {};
            // var timestamp = params.timestamp,
        };

        this.getTypeDescriptor = function () {
            return "endpoint";
        };
        this.isVisible = function () {
            return this._jsPlumb.visible;
        };

        this.repaint = this.paint;
        // TODO Drag ....

        // ep默认为"DOT"
        var ep = params.endpoint || this._jsPlumb.instance.Defaults.Endpoint || _jp.Defaults.Endpoint;
        // 先对ep进行一些处理，然后绑定this.endpoint = ep
        this.setEndpoint(ep, true);
        // _jsPlumb.Defaults.Anchor 的值是 "Bottom" 见line 6348
        var anchorParamsToUse = params.anchor ? params.anchor : params.anchors ? params.anchors : (_jsPlumb.Defaults.Anchor || "Top");
        this.setAnchor(anchorParamsToUse, true);

        // TODO finally, set type if it was provided
        // var type = [ "default", (params.type || "")].join(" ");
        // this.addType(type, params.data, true);
        this.canvas = this.endpoint.canvas;
        this.canvas._jsPlumb = this;
    };

    // 继承OverlayCapableJsPlumbUIComponent共享属性
    _ju.extend(_jp.Endpoint, _jp.OverlayCapableJsPlumbUIComponent, {
        // 以下方法均未阅读
        setVisible: function (v, doNotChangeConnections, doNotNotifyOtherEndpoint) {
            this._jsPlumb.visible = v;
            if (this.canvas) {
                this.canvas.style.display = v ? "block" : "none";
            }
            this[v ? "showOverlays" : "hideOverlays"]();
            if (!doNotChangeConnections) {
                for (var i = 0; i < this.connections.length; i++) {
                    this.connections[i].setVisible(v);
                    if (!doNotNotifyOtherEndpoint) {
                        var oIdx = this === this.connections[i].endpoints[0] ? 1 : 0;
                        // only change the other endpoint if this is its only connection.
                        if (this.connections[i].endpoints[oIdx].connections.length === 1) {
                            this.connections[i].endpoints[oIdx].setVisible(v, true, true);
                        }
                    }
                }
            }
        },
        getAttachedElements: function () {
            return this.connections;
        },
        applyType: function (t, doNotRepaint) {
            this.setPaintStyle(t.endpointStyle || t.paintStyle, doNotRepaint);
            this.setHoverPaintStyle(t.endpointHoverStyle || t.hoverPaintStyle, doNotRepaint);
            if (t.maxConnections != null) {
                this._jsPlumb.maxConnections = t.maxConnections;
            }
            if (t.scope) {
                this.scope = t.scope;
            }
            _jp.extend(this, t, typeParameters);
            if (t.cssClass != null && this.canvas) {
                this._jsPlumb.instance.addClass(this.canvas, t.cssClass);
            }
            _jp.OverlayCapableJsPlumbUIComponent.applyType(this, t);
        },
        isEnabled: function () {
            return this._jsPlumb.enabled;
        },
        setEnabled: function (e) {
            this._jsPlumb.enabled = e;
        },
        cleanup: function () {
            var anchorClass = this._jsPlumb.instance.endpointAnchorClassPrefix + (this._jsPlumb.currentAnchorClass ? "-" + this._jsPlumb.currentAnchorClass : "");
            _jp.removeClass(this.element, anchorClass);
            this.anchor = null;
            this.endpoint.cleanup(true);
            this.endpoint.destroy();
            this.endpoint = null;
            // drag/drop
            this._jsPlumb.instance.destroyDraggable(this.canvas, "internal");
            this._jsPlumb.instance.destroyDroppable(this.canvas, "internal");
        },
        setHover: function (h) {
            if (this.endpoint && this._jsPlumb && !this._jsPlumb.instance.isConnectionBeingDragged()) {
                this.endpoint.setHover(h);
            }
        },
        isFull: function () {
            return this._jsPlumb.maxConnections === 0 ? true : !(this.isFloating() || this._jsPlumb.maxConnections < 0 || this.connections.length < this._jsPlumb.maxConnections);
        },
        /**
         * private but needs to be exposed.
         */
        isFloating: function () {
            return this.anchor != null && this.anchor.isFloating;
        },
        isConnectedTo: function (endpoint) {
            var found = false;
            if (endpoint) {
                for (var i = 0; i < this.connections.length; i++) {
                    if (this.connections[i].endpoints[1] === endpoint || this.connections[i].endpoints[0] === endpoint) {
                        found = true;
                        break;
                    }
                }
            }
            return found;
        },
        getConnectionCost: function () {
            return this._jsPlumb.connectionCost;
        },
        setConnectionCost: function (c) {
            this._jsPlumb.connectionCost = c;
        },
        areConnectionsDirected: function () {
            return this._jsPlumb.connectionsDirected;
        },
        setConnectionsDirected: function (b) {
            this._jsPlumb.connectionsDirected = b;
        },
        setElementId: function (_elId) {
            this.elementId = _elId;
            this.anchor.elementId = _elId;
        },
        setReferenceElement: function (_el) {
            this.element = _jp.getElement(_el);
        },
        setDragAllowedWhenFull: function (allowed) {
            this.dragAllowedWhenFull = allowed;
        },
        equals: function (endpoint) {
            return this.anchor.equals(endpoint.anchor);
        },
        getUuid: function () {
            return this._jsPlumb.uuid;
        },
        computeAnchor: function (params) {
            return this.anchor.compute(params);
        }
    });

}).call(typeof window !== 'undefined' ? window : this);
