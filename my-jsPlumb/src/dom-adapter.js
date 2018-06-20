;(function () {

    var root = this, _ju = root.jsPlumbUtil;

    root.jsPlumb.extend(root.jsPlumbInstance.prototype, {
        createElement: function (tag, style, clazz, atts) {
            return this.createElementNS(null, tag, style, clazz, atts);
        },
        /**
         *
         * @param ns
         * @param tag
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
                op = (relativeToRoot  || (container != null && (el !== container && el.offsetParent !== container))) ?  el.offsetParent : null,
                _maybeAdjustScroll = function(offsetParent) {
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
