;(function () {

    "use strict";
    var root = this, _jp = root.jsPlumb, _ju = root.jsPlumbUtil,
        _jk = root.Katavorio, _jg = root.Biltong;

    _jp.extend(root.jsPlumbInstance.prototype, {
        getElement: function (el) {
            if (el == null) {
                return null;
            }
            // here we pluck the first entry if el was a list of entries.
            // this is not my favourite thing to do, but previous versions of
            // jsplumb supported jquery selectors, and it is possible a selector
            // will be passed in here.
            el = typeof el === "string" ? el : el.length != null && el.enctype == null ? el[0] : el;
            return typeof el === "string" ? document.getElementById(el) : el;
        },
    });

    var ready = function (f) {
        var _do = function () {
            // 若文档加载就绪就进行jsPlumb初始化，否则异步递归回调_do尝试初始化jsPlumb
            if (/interactive|complete|loaded/.test(document.readyState) && typeof (document.body) !== "undefined" && document.body != null) {
                f();
            } else {
                setTimeout(_do, 9);
            }
        };
        _do();
    };
    ready(_jp.init);
}).call(typeof window !== 'undefined' ? window : this);

