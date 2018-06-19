# jsPlumb入门

## 加载
````
jsPlumb.ready(() => {
	//jsPlumb加载完成，开始使用相关功能
	
	//jsPlumb.getInstance ......
}
````

## 容器
一个jsPlumb实例对应一个容器作用域，通过元素id设置容器

````
let jsPlumbInstance = jsPlumb.getInstance({
    DragOptions: {cursor: 'pointer'},
    deleteEndpointsOnDetach: false,
    //'flowchart-demo'为元素id
    Container: 'flowchart-demo'
});
````

## 添加端点
addEndpoint是jsPlumb提供的API，用于为容器内的元素添加端点

````
//selectorId 容器内的元素id，endPoint
//endPoint
//anchor 上下左右等多个位置
//uuid 连接两个端点时使用
jsPlumbInstance.addEndpoint(selectorId, endPoint, {anchor: position, uuid: UUID});
````

## 端点

````
let targetEndpoint = {
    //端点样式，'Dot'表示端点为空心圆点
    endpoint: 'Dot',
    //端点样式
    paintStyle: {
        //线条大小
        strokeWidth: 6,
        //圆半径
        radius: 10,
        //圆边颜色
        stroke: "#000",
    },
    target: true,
    //流程图
    connector: ['FlowChar']
};
````

## 连接端点

````
jsPlumbInstance.connect({uuids:[sourceEndPointUUID,targetEndPointUUID], editable: true});
````

## 事件
