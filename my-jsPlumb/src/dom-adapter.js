;(function () {

    var root = this, _ju = root.jsPlumbUtil;

    var DragManager = function (_currentInstance) {
        var _draggables = {},
            _dlist = [],
            _delements = {},
            //  保存孩子节点到父节点的距离
            // _delements[pid][id] = {
            //    id: id,
            //    offset: {
            //        left: cLoc.left - pLoc.left,
            //        top: cLoc.top - pLoc.top
            //     }
            //  };
            _elementsWithEndpoints = {},// 存放元素的endpoint数量 _elementsWithEndpoints[elId] = endpointsCount
            // elementids mapped to the draggable to which they belong.
            // _draggablesForElements[elId] = parentId;
            _draggablesForElements = {};

        this.endpointAdded = function (el, id) {
            id = id || _currentInstance.getId(el);

            var b = document.body,
                p = el.parentNode;

            _elementsWithEndpoints[id] = _elementsWithEndpoints[id] ? _elementsWithEndpoints[id] + 1 : 1;

            while (p != null && p !== b) {
                var pid = _currentInstance.getId(p, null, true);
                if (pid && _draggables[pid]) {
                    var pLoc = _currentInstance.getOffset(p);

                    if (_delements[pid][id] == null) {
                        var cLoc = _currentInstance.getOffset(el);
                        _delements[pid][id] = {
                            id: id,
                            offset: {
                                left: cLoc.left - pLoc.left,
                                top: cLoc.top - pLoc.top
                            }
                        };
                        _draggablesForElements[id] = pid;
                    }
                    break;
                }
                p = p.parentNode;
            }
        };

    };
    root.jsPlumb.extend(root.jsPlumbInstance.prototype, {
        getDragManager: function () {
            if (this.dragManager == null) {
                this.dragManager = new DragManager(this);
            }

            return this.dragManager;
        },

        createElement: function (tag, style, clazz, atts) {
            return this.createElementNS(null, tag, style, clazz, atts);
        },
        /**
         *
         * @param ns 命名空间
         * @param tag html标签
         * @param style {Object} style样式
         * @param clazz {String} className
         * @param atts {Object} 元素属性
         */
        createElementNS: function (ns, tag, style, clazz, atts) {
            var e = ns == null ? document.createElement(tag) : document.createElementNS(ns, tag);
            var i;
            style = style || {};
            for (i in style) {
                e.style[i] = style[i];
            }

            if (clazz) {
                e.className = clazz;
            }

            atts = atts || {};
            for (i in atts) {
                e.setAttribute(i, "" + atts[i]);
            }

            return e;
        },
        /**
         * 如果开发者传入relativeToRoot，则返回元素相对于根节点的偏移量，传入container同理
         * 如果只传入el则不作计算简单地返回offsetLeft、offsetTop
         * @param el
         * @param relativeToRoot
         * @param container
         * @returns {{left: number, top: number}}
         */
        getOffset: function (el, relativeToRoot, container) {
            el = jsPlumb.getElement(el);
            container = container || this.getContainer();
            var out = {
                    left: el.offsetLeft,
                    top: el.offsetTop
                },
                // 判断该相对于哪个元素作为相对元素计算
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
        /**
         * gets the size for the element, in an array : [ width, height ].
         */
        // CONVERTED
        getSize: function (el) {
            return [el.offsetWidth, el.offsetHeight];
        },
        // CONVERTED
        getWidth: function (el) {
            return el.offsetWidth;
        },
        // CONVERTED
        getHeight: function (el) {
            return el.offsetHeight;
        },
        getRenderMode: function () {
            return "svg";
        }
    });
}).call(typeof window !== 'undefined' ? window : this);
