## 组成

## jsPlumbUtil
jsPlumbUtil是官方文档没有写的，在源码中看到的

- uuid 生成id 

在事件触发前可绑定的钩子方法 jsPlumbInstance.shouldFireEvent

## 启动流程
关键是为了等到页面加载进入complete|loaded|interactive这几种状态之后才可以执行ready的事件处理器
```js
// line 6381
var jsPlumb = new jsPlumbInstance();
// line 6382 将一个jsPlumb绑定到全局，root即window
root.jsPlumb = jsPlumb;
// line 14584，即ready(jsPlumb.init);
ready(_jp.init);
// 开发者手动调用ready方法，绑定ready事件处理器
jsPlumb.ready(()=> {
    // do something
});
// 等到页面加载状态为complete|loaded|interactive时ready(_jp.init);内部调用init，取出ready事件处理器执行
```

为什么开发者不能用new jsPlumb实例，而需要使用jsPlumb.getInstance()获取？
jsPlumb.getInstance内部会new jsPlumb实例，同时做一些其他处理

## 继承关系
事件类 
EndPoint --line 7400--> OverlayCapableJsPlumbUIComponent -> JsPlumbUIComponent -> EventGenerator

Anchor --line 10015--> EventGenerator

jsPlumbInstance持有jsPlumbUIComponent
this.jsPlumbUIComponent = jsPlumbUIComponent;

default.js
Endpoints.Dot ----> Endpoints.AbstractEndpoint ---->  AbstractComponent

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

line 10896  全局属性 Infinity 是一个数值，表示无穷大。
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Infinity
````js
    var AbstractComponent = function () {
        this.resetBounds = function () {
            this.bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        };
        this.resetBounds();
    };
````
