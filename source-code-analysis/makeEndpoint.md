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
            // 减去多余的 scrollTop 与 scrollLeft
            if (offsetParent != null && offsetParent !== document.body && (offsetParent.scrollTop > 0 || offsetParent.scrollLeft > 0)) {
                out.left -= offsetParent.scrollLeft;
                out.top -= offsetParent.scrollTop;
            }
        }.bind(this);

    while (op != null) {
        out.left += op.offsetLeft;
        out.top += op.offsetTop;
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
},
````



- compute 计算 endpoint 的位置(绝对定位)

````js
e.paint({
    // 计算 anchor 位置
    anchorLoc: e.anchor.compute({ xy: [ myOffset.left, myOffset.top ], wh: sizes[id], element: e, timestamp: _suspendedAt }),
    timestamp: _suspendedAt
});

{
    x:
    y:
    w:
    h:
}

````

- createElement svgContainer、circle
- appendChild in container
- 设置宽高
