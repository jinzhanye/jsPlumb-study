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
