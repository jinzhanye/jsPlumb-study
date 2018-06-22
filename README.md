# jsPlumb入门

## 引入 
官方推荐引入jsplumbtoolkit-defaults.css

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
//selectorId 端点所附着的容器的id
//endPoint 端点对象
//anchor 上下左右等多个位置
//uuid 连接两个端点时使用
jsPlumbInstance.addEndpoint(selectorId, endPoint, {anchor: position, uuid: UUID});
````

### 端点(endpoint)与锚(anchor)
锚定义的是端点。例如一个端点可能在容器的上下左右等不同位置，是由锚决定的。

### anchor

BottomLeft 表示为 [0,1,0,1,x,x] 

第一个[0,1]表示坐标，第二个[0,1]表示方向由[0,0]到[0,1]，即方向向下
最后两个x表示offset，待研究

````            
                    -1
                    | 
                    |
                    |
                    |
 -1 ----------------0-------------------> 1 
                    |
                    |
                    |
                   \|/
                     1
````

内置静态anchor总共有9个

- Top (also aliased as TopCenter)
- TopRight
- Right (also aliased as RightMiddle)
- BottomRight
- Bottom (also aliased as BottomCenter)
- BottomLeft
- Left (also aliased as LeftMiddle)
- TopLeft
- Center

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
