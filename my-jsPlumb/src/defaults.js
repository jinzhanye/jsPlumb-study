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

        this._compute = function (anchorPoint, orientation, endpointStyle, connectorPaintStyle) {

        };
    };

    _ju.extend(_jp.Endpoints.Dot, _jp.Endpoints.AbstractEndpoint);

}).call(typeof window !== 'undefined' ? window : this);

