- addEndpoint，jsPlumb.js

````js
this.addEndpoint = function (el, params, referenceParams) {
    referenceParams = referenceParams || {};
    var p = jsPlumb.extend({}, referenceParams);
    jsPlumb.extend(p, params);
    p.endpoint = p.endpoint || _currentInstance.Defaults.Endpoint;
    p.paintStyle = p.paintStyle || _currentInstance.Defaults.EndpointStyle;

    var results = [],
        // 被 endpoint 附着的 element
        inputs = (_ju.isArray(el) || (el.length != null && !_ju.isString(el))) ? el : [ el ];
    // 从开头到这里为获取基础配置信息
    for (var i = 0, j = inputs.length; i < j; i++) {
        p.source = _currentInstance.getElement(inputs[i]);
        _ensureContainer(p.source);

        var id = _getId(p.source), e = _newEndpoint(p, id); // 根据配置生成 endpoint 对象

        // ensure element is managed.
        var myOffset = _manage(id, p.source).info.o;
        _ju.addToList(endpointsByElement, id, e);

        if (!_suspendDrawing) {
            // 绘制 endpoint
            e.paint({
                // 计算 anchor 位置
                anchorLoc: e.anchor.compute({ xy: [ myOffset.left, myOffset.top ], wh: sizes[id], element: e, timestamp: _suspendedAt }),
                timestamp: _suspendedAt
            });
        }

        results.push(e);
    }
    // 返回添加后的 endpoint
    return results.length === 1 ? results[0] : results;
};
````

- _newEndpoint，位置 jsPlumb.js

````js
/*
 factory method to prepare a new endpoint.  this should always be used instead of creating Endpoints
 manually, since this method attaches event listeners and an id.
 */
_newEndpoint = function (params, id) {
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
    ep.id = "ep_" + _idstamp();
    _manage(_p.elementId, _p.source);

    if (!jsPlumb.headless) {
        _currentInstance.getDragManager().endpointAdded(_p.source, id);
    }

    return ep;
}
````

其中 `_manage(_p.elementId, _p.source)` 计算当前 element 的尺寸和位置信息

````js
// check if a given element is managed or not. if not, add to our map. if drawing is not suspended then
// we'll also stash its dimensions; otherwise we'll do this in a lazy way through updateOffset.
var _manage = _currentInstance.manage = function (id, element, _transient) {
    if (!managedElements[id]) {
        managedElements[id] = {
            el: element,
            endpoints: [],
            connections: []
        };

        managedElements[id].info = _updateOffset({ elId: id, timestamp: _suspendedAt });
        if (!_transient) {
            _currentInstance.fire("manageElement", { id:id, info:managedElements[id].info, el:element });
        }
    }

    return managedElements[id];
};
````

`_updateOffset({ elId: id, timestamp: _suspendedAt })` 

````js
getOffset: function (el, relativeToRoot, container) {
    el = jsPlumb.getElement(el);
    container = container || this.getContainer();
    var out = {
            left: el.offsetLeft,
            top: el.offsetTop
        },
        op = (relativeToRoot || (container != null && (el !== container && el.offsetParent !== container))) ? el.offsetParent : null,
        _maybeAdjustScroll = function (offsetParent) {
            if (offsetParent != null && offsetParent !== document.body && (offsetParent.scrollTop > 0 || offsetParent.scrollLeft > 0)) {
                out.left -= offsetParent.scrollLeft;
                out.top -= offsetParent.scrollTop;
            }
        }.bind(this);

    while (op != null) {
        out.left += op.offsetLeft;
        out.top += op.offsetTop;
        // 减去多余的 scrollTop 与 scrollLeft
        _maybeAdjustScroll(op);
        op = relativeToRoot ? op.offsetParent :
            op.offsetParent === container ? null : op.offsetParent;
    }

    // if container is scrolled and the element (or its offset parent) is not absolute or fixed, adjust accordingly.
    if (container != null && !relativeToRoot && (container.scrollTop > 0 || container.scrollLeft > 0)) {
        var pp = el.offsetParent != null ? this.getStyle(el.offsetParent, "position") : "static",
            p = this.getStyle(el, "position");
        if (p !== "absolute" && p !== "fixed" && pp !== "absolute" && pp !== "fixed") {
            out.left -= container.scrollLeft;
            out.top -= container.scrollTop;
        }
    }
    return out;
}
````

利用 `offsetLeft、offsetTop` 计算出当前元素到 `offsetParent` 的偏移量 

````js
offsets[elId].right = offsets[elId].left + sizes[elId][0];
offsets[elId].bottom = offsets[elId].top + sizes[elId][1];
offsets[elId].width = sizes[elId][0];
offsets[elId].height = sizes[elId][1];
offsets[elId].centerx = offsets[elId].left + (offsets[elId].width / 2);
offsets[elId].centery = offsets[elId].top + (offsets[elId].height / 2);
````

计算当前元素到 `offsetParent` 各个方位的距离。及计算当前元素几何中心。

````js
myOffset = {
    bottom: 552,
    centerx: 103,
    centery: 521,
    height: 62,
    left: 72,
    right: 134,
    top: 490,
    width: 62,
}

e.paint({
    // 计算 anchor 位置
    anchorLoc: e.anchor.compute({ xy: [ myOffset.left, myOffset.top ], wh: sizes[id], element: e, timestamp: _suspendedAt }),
    timestamp: _suspendedAt
});
````

`anchor.compute` 利用 `anchor` 的参数及 `myOffset` 计算出 `anchor` 的 `x、y` 坐标

````js
this.compute = function (params) {
    // ......
    var xy = params.xy, wh = params.wh, timestamp = params.timestamp;
    // ......
    else {
        this.lastReturnValue = [xy[0] + (this.x * wh[0]) + this.offsets[0], xy[1] + (this.y * wh[1]) + this.offsets[1]];
    }
    // ......
    return this.lastReturnValue;
};
````


````js
this.paint = function (style, anchor, extents) {
    if (style != null) {

        var xy = [this.x, this.y], wh = [this.w, this.h], p;
        if (extents != null) {
            if (extents.xmin < 0) {
                xy[0] += extents.xmin;
            }
            if (extents.ymin < 0) {
                xy[1] += extents.ymin;
            }
            wh[0] = extents.xmax + ((extents.xmin < 0) ? -extents.xmin : 0);
            wh[1] = extents.ymax + ((extents.ymin < 0) ? -extents.ymin : 0);
        }

        if (params.useDivWrapper) {
            _ju.sizeElement(this.canvas, xy[0], xy[1], wh[0], wh[1]);
            xy[0] = 0;
            xy[1] = 0;
            p = _pos([0, 0]);
        }
        else {
            p = _pos([xy[0], xy[1]]);
        }
        // createElement svgContainer、circle
        // appendChild in container
        renderer.paint.apply(this, arguments);
        // this.svg是svg节点对象
        // 设置宽高
        _attr(this.svg, {
            "style": p,
            "width": wh[0] || 0,
            "height": wh[1] || 0
        });
    }
};

_super.renderer.paint = function (style) {
    var s = _jp.extend({}, style);
    // .....
    if (this.node == null) {
        this.node = this.makeNode(s);
        this.svg.appendChild(this.node);
    }
    // .....
}.bind(this);
````

````js
/*
 * SVG Dot Endpoint
 */
_jp.Endpoints.svg.Dot = function () {
    _jp.Endpoints.Dot.apply(this, arguments);
    SvgEndpoint.apply(this, arguments);
    this.makeNode = function (style) {
        return _node("circle", {
            "cx": this.w / 2,
            "cy": this.h / 2,
            "r": this.radius
        });
    };
};
_node = function (name, attributes) {
    attributes = attributes || {};
    attributes.version = "1.1";
    attributes.xmlns = ns.svg;
    return _jp.createElementNS(ns.svg, name, null, null, attributes);
},
````
