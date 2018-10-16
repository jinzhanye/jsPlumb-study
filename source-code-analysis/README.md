# Jsplumb 源码分析
## 启动流程
关键是为了等到页面加载进入 `interactive | complete | loaded` 这几种状态之后才可以执行ready的事件处理器。
因为到达 `iteractive` 阶段文档才被解析完毕,才可以进行 Dom 操作
```js
// line 6381
var jsPlumb = new jsPlumbInstance();
// line 6382 将一个 jsPlumb 实例绑定到全局，root 即 window
root.jsPlumb = jsPlumb;

// line 14584，即ready(jsPlumb.init);
ready(_jp.init);
// ready 是一个轮询，直到 domReady 才执行开发者传入的 f 函数
var ready = function (f) {
    var _do = function () {
        if (/complete|loaded|interactive/.test(document.readyState) && typeof(document.body) !== "undefined" && document.body != null) {
            f();
        }
        else {
            setTimeout(_do, 9);
        }
    };

    _do();
};

// 开发者手动调用ready方法，绑定ready事件处理器
jsPlumb.ready(()=> {
    // do something
});
```

## 继承关系
基本上所有的类都会继承EventGenerator

window.jsPlumb JsPlumbInstance的一个全局实例

Anchor --line 10015--> EventGenerator

- jsPlumbInstance
jsPlumbInstance ------> EventGenerator

jsPlumbInstance依赖jsPlumbUIComponent
this.jsPlumbUIComponent = jsPlumbUIComponent;

- jsPlumbUIComponent
Abstract superclass for Endpoint, Connection, Connector and Overlay.
在jsPlumb.js，150行左右的代码量
jsPlumbUIComponent ----> EventGenerator

- endpoint.js
EndPoint --line 7547--> OverlayCapableJsPlumbUIComponent -> JsPlumbUIComponent -> EventGenerator

- default.js
Endpoints.Dot() ----> Endpoints.AbstractEndpoint(获取endpoint边界值) ---->  AbstractComponent(重设endpoint边界值)

文档提到Endpoints.Dot继承Endpoint是错误的

- render-svg.js
Endpoints.svg.Dot --多继承--> Endpoints.Dot,SvgEndpoint(生成圆元素，在svg容器加入圆元素) -----> SvgComponent(生成div容器，在div容器加入svg元素，绑定到endpoint.canvas)
在endpoint.js的this.prepareEndpoint中new _jp.Endpoints['svg']['Dot']
setPreparedEndpoint方法中的提及，最终endpoint.endpoint = Endpoints['svg']['Dot']()

````js
var anchorParams = {
    x: specimen[0], y: specimen[1],
    orientation: (specimen.length >= 4) ? [ specimen[2], specimen[3] ] : [0, 0],
    offsets: (specimen.length >= 6) ? [ specimen[4], specimen[5] ] : [ 0, 0 ],
    elementId: elementId,
    jsPlumbInstance: _currentInstance,
    cssClass: specimen.length === 7 ? specimen[6] : null
};
````

## 事件
DOM事件
- on
- off

jsPlumb对象事件
- bind
- fire

fire用于触发bind绑定的事件， 没有trigger方法触发on绑定的事件


View驱动Model

jsPlumb内部是这样使用的：例如on与bind同时绑定mousemove、mouseon、mouseout等事件，
在on的callback中fire相应的事件
on -> fire -> bind

##
__jsPlumb
Anchor 是jsPlumb的一等公民！
