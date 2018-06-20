;(function () {
    "use strict";
    var root = this, _jp = root.jsPlumb, _ju = root.jsPlumbUtil;

    _jp.Endpoint = function (params) {
        var _jsPlumb = params._jsPlumb,
            _newConnection = params.newConnection,
            _newEndpoint = params.newEndpoint;

        this.idPrefix = "_jsplumb_e_";
        this.defaultLabelLocation = [ 0.5, 0.5 ];
        // TODO ??
        this.defaultOverlayKeys = ["Overlays", "EndpointOverlays"];

        this.paint = function (params) {
            params = params || {};
            // var timestamp = params.timestamp,
        }
    }
}).call(typeof window !== 'undefined' ? window : this);
