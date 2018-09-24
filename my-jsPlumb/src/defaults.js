/* This file contains the default Connectors, Endpoint and Overlay definitions. */
;(function () {

    "use strict";
    var root = this, _jp = root.jsPlumb, _ju = root.jsPlumbUtil, _jg = root.Biltong;

    /*
    Class: UIComponent
    Superclass for Connector and AbstractEndpoint.
    */
    var AbstractComponent = function () {
        this.resetBounds = function () {
            this.bounds = {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity};
        };
        this.resetBounds();
    };

    // ********************************* ENDPOINT TYPES *******************************************************************

    _jp.Endpoints.AbstractEndpoint = function (params) {
        AbstractComponent.apply(this, arguments);
        var compute = this.compute = function (anchorPoint, orientation, endpointStyle, connectorPaintStyle) {
            var out = this._compute.apply(this, arguments);
            this.x = out[0];
            this.y = out[1];
            this.w = out[2];
            this.h = out[3];
            this.bounds.minX = this.x;
            this.bounds.minY = this.y;
            this.bounds.maxX = this.x + this.w;
            this.bounds.maxY = this.y + this.h;
            return out;
        };
        return {
            compute: compute,
            cssClass: params.cssClass
        };
    };
    _ju.extend(_jp.Endpoints.AbstractEndpoint, AbstractComponent);

    /**
     * Endpoints.Dot 构造方法
     * @param params {Object}  radius - radius of the endpoint.  defaults to 10 pixels.
     * @constructor
     */
    _jp.Endpoints.Dot = function (params) {
        this.type = "Dot";
        var _super = _jp.Endpoints.AbstractEndpoint.apply(this, arguments);
        params = params || {};
        this.radius = params.radius || 10; // 默认半径为10
        this.defaultOffset = 0.5 * this.radius;// ??
        this.defaultInnerRadius = this.radius / 3;// ??

        /**
         *  计算endpoint的坐标及宽高
         * @param anchorPoint
         * @param orientation
         * @param endpointStyle
         * @param connectorPaintStyle
         * @returns {*[]}
         * @private
         */
        this._compute = function (anchorPoint, orientation, endpointStyle, connectorPaintStyle) {
            this.radius = endpointStyle.radius || this.radius;// 上面提到的默认半径为10
            var x = anchorPoint[0] - this.radius,
                y = anchorPoint[1] - this.radius,
                w = this.radius * 2,// 10 * 2 = 20
                h = this.radius * 2;

            return [x, y, w, h, this.radius];
        };
    };

    _ju.extend(_jp.Endpoints.Dot, _jp.Endpoints.AbstractEndpoint);

}).call(typeof window !== 'undefined' ? window : this);

