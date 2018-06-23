/* This file contains the SVG renderers. */
;(function () {
    "use strict";
    var root = this, _jp = root.jsPlumb, _ju = root.jsPlumbUtil;

    var svgAttributeMap = {
            "stroke-linejoin": "stroke-linejoin",
            "stroke-dashoffset": "stroke-dashoffset",
            "stroke-linecap": "stroke-linecap"
        },
        STROKE_DASHARRAY = "stroke-dasharray",
        DASHSTYLE = "dashstyle",
        LINEAR_GRADIENT = "linearGradient",
        RADIAL_GRADIENT = "radialGradient",
        DEFS = "defs",
        FILL = "fill",
        STOP = "stop",
        STROKE = "stroke",
        STROKE_WIDTH = "stroke-width",
        STYLE = "style",
        NONE = "none",
        JSPLUMB_GRADIENT = "jsplumb_gradient_",
        LINE_WIDTH = "strokeWidth",
        ns = {
            svg: "http://www.w3.org/2000/svg"
        },
        _attr = function (node, attributes) {
            for (var i in attributes) {
                node.setAttribute(i, "" + attributes[i]);
            }
        },
        // 创建svg元素，例如 圆
        _node = function (name, attributes) {
            attributes = attributes || {};
            attributes.version = "1.1";
            attributes.xmlns = ns.svg;
            return _jp.createElementNS(ns.svg, name, null, null, attributes);
        },
        // left:d[0] , top:d[1]
        _pos = function (d) {
            return "position:absolute;left:" + d[0] + "px;top:" + d[1] + "px";
        };

    var SvgComponent = function (params) {
        var pointerEventsSpec = params.pointerEventsSpec || "all", renderer = {};

        _jp.jsPlumbUIComponent.apply(this, params.originalArgs);
        this.canvas = null;
        this.path = null;
        this.svg = null;
        this.bgCanvas = null;

        var clazz = params.cssClass + " " + (params.originalArgs[0].cssClass || ""),
            svgParams = {
                "style": "",
                "width": 0,
                "height": 0,
                "pointer-events": pointerEventsSpec,
                "position": "absolute"
            };

        if (params.useDivWrapper) {
            // 创建一个div元素,该div就是endpoint的容器
            this.canvas = _jp.createElement("div", {position: "absolute"});
            // 设置这个div定位top:0,left:0  width:1,height:1
            _ju.sizeElement(this.canvas, 0, 0, 1, 1);
            this.canvas.class = clazz;
        } else {
            // TODO
        }

        // params.originalArgs[0].parent ??
        // 将div容器添加到container容器
        params._jsPlumb.appendElement(this.canvas, params.originalArgs[0].parent);
        if (params.useDivWrapper) {
            // 将svg元素添加到div容器
            this.canvas.appendChild(this.svg);
        }

        var displayElements = [this.canvas];
        this.getDisplayElements = function () {
            return displayElements;
        };

        this.appendDisplayElement = function (el) {
            displayElements.push(el);
        };

        this.paint = function (style, anchor, extents) {
            if (style != null) {
                // p表示position
                // x即left,y即top
                var xy = [this.x, this.y], wh = [this.w, this.h], p;
                // TODO
                if (extents != null) {
                }

                if (params.useDivWrapper) {
                    // 定位div容器
                    _ju.sizeElement(this.canvas, xy[0], xy[1], wh[0], wh[1]);
                    // 还原定位？？
                    xy[0] = 0;
                    xy[1] = 0;
                    // p 为 position:absolute;left:0px;top:0px;
                    p = _pos([0, 0]);
                } else {
                    p = _pos([xy[0], xy[1]]);
                }

                // 将circle元素追加到svg元素内
                renderer.paint.apply(this, arguments);

                // 给svg元素设置宽高，使之可见
                // svg在一个div容器内，svg内有一个circle元素
                _attr(this.svg, {
                    "style": p, // position:absolute;left:0px;top:0px
                    "width": wh[0] || 0,
                    "height": wh[1] || 0,
                });
            }
        };

        return {
            renderer: renderer
        }
    };

// ******************************* /svg segments *****************************************************

    /*
     * Base class for SVG endpoints.
     */
    var SvgEndpoint = _jp.SvgEndpoint = function (params) {
        var _super = SvgComponent.apply(this, [
            {
                cssClass: params._jsPlumb.endpointClass,
                originalArgs: arguments,
                pointerEventsSpec: "all", // ??
                useDivWrapper:true, // 这个属性非常重要！
                _jsPlumb: params._jsPlumb,
            }
        ]);

        _super.renderer.paint = function (style) {
            var s = _jp.extend({}, style);

            if (this.node == null) {
                // makeNode生成一个圆元素
                this.node = this.makeNode(s);
                // 在svg容器内加入元素
                this.svg.appendChild(this.node);
            }
        }.bind(this);
    };

    _ju.extend(SvgEndpoint, SvgComponent);

    /*
    * SVG Dot Endpoint
    */
    _jp.Endpoints.svg.Dot = function () {
        _jp.Endpoints.Dot.apply(this, arguments);
        // 给endpoint绑定canvas
        SvgEndpoint.apply(this, arguments);
        this.makeNode = function (style) {
            return _node("circle", {
                "cx": this.w / 2,
                "cy": this.h / 2,
                "r": this.radius
            });
        };
    };
    _ju.extend(_jp.Endpoints.svg.Dot, [_jp.Endpoints.Dot, SvgEndpoint]);

}).call(typeof window !== 'undefined' ? window : this);
