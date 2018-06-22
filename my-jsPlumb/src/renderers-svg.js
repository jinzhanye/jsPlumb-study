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
        _node = function (name, attributes) {
            attributes = attributes || {};
            attributes.version = "1.1";
            attributes.xmlns = ns.svg;
            return _jp.createElementNS(ns.svg, name, null, null, attributes);
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

        this.paint = function (style, anchor, extents) {
            if (style != null) {
                var xy = [this.x, this.y], wh = [this.w, this.h], p;
                if (params.useDivWrapper) {

                } else {

                }

                renderer.paint.apply(this, arguments);

                _attr(this.svg, {
                    "style": p,
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
        var _super = SvgComponent.apply(this, [{
            _jsPlumb: params._jsPlumb
        }]);

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
