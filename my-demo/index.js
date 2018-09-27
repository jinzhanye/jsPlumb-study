// jsPlumb.bind('ready', function () {
//   // do something
// });
//  jsPlumb.ready是jsPlumb.bind ready 的一个语法糖
jsPlumb.ready(() => {
    class DragFlow {
        constructor() {
            this.connectorHoverStyle = {
                // lineWidth: 4,
            };
            this.endPointHoverStyle = {};
            this.sourceEndPoint = {
                // 端点（锚点）的样式声明（Dot 圆点样式）
                endpoint: 'Dot',
                paintStyle: {
                    //控制线条大小
                    strokeWidth: 3,
                    //控制圆半径
                    radius: 10,
                    stroke: "#fff",
                },
                isSource: true,
                // cornerRadius 线条拐角半径
                // gap 控制端口与线条之间的距离
                // stub 控制源点与目标点，拐角到点之间的距离
                //      如果只指定一个数字，则指定的是源点到拐角之间的距离，目标点到拐角的距离为自动
                connector: ["Flowchart"],
                // connector: ["Flowchart", {stub: [60,50], alwaysRespectStubs:true,gap:10,cornerRadius: 5}],
                // dragOptions: {},
            };
            this.targetEndpoint = {
                endpoint: 'Dot',
                paintStyle: {
                    strokeWidth: 3,
                    radius: 10,
                    stroke: "#333",
                },
                isTarget: true,
                connector: ["Flowchart", { gap: 10, cornerRadius: 5 }],
            };

            this.jsPlumbInstance = null;
            this.init();
        }

        init() {
            // overlays 在  jsPlumb.connect, jsPlumb.addEndpoint or jsPlumb.makeSource 这几个方法下各有适用
            // 初始化时用 ConnectionOverlays
            this.jsPlumbInstance = jsPlumb.getInstance({
                ConnectionOverlays: [//附加到每条连线的CSS样式
//             width，箭头尾部的宽度
//             length，从箭头的尾部到头部的距离
//             location，位置，建议使用0～1之间，当作百分比，便于理解
//             direction，方向，默认值为1（表示向前），可选-1（表示向后）
//             foldback，折回，也就是尾翼的角度，默认0.623，当为1时，为正三角
//             paintStyle，样式对象
                    ["Arrow", {//在线条上添加箭头
                        //[0,1]的小数 >1的整数 <0的整数

                        //0到1之间的小数控制label在线条上的位置

                        //>1的整数 表示沿源点绝对定位x个px
                        //<0的整数 表示沿目标点折回绝对定位x个px
                        location: 1,
                        //控制箭头大小
                        width: 20,
                        length: 20,
                        id: 'arrow',
                        foldback: 1

                        //             PlainArrow：箭头形状为三角形
                        // 只是Arrow的foldback为1时的例子，参数与Arrow相同
                        //
                        // Diamond：棱形
                        // 同样是Arrow的foldback为2时的例子，参数与Arrow相同
                    }], ["Label", {// 在线条上添加标签
                        label: 'foo',
                        location: 0.5,
                        //用来移除该ConnectionOverlays，或者设置ConnectionOverlays是否可见
                        id: "label",
                        //线条dom的 class = "jtk-overlay aLabel"
                        cssClass: "aLabel",
                        // cssClass，Label的可选css
                        // labelStyle，标签外观的可选参数：font，适应canvas的字体大小参数；color，标签文本的颜色；padding，标签的可选填充，比例而不是px；borderWidth，标签边框的可选参数，默认为0；borderStyle，颜色等边框参数
                        // 也可以使用getLabel，和setLabel，来获取和设置label的文本,可传函数

                        //控制label是否可见，默认为true
                        // visible: false,
                    }]
                ],
                ReattachConnections: true,//是否重新连接使用鼠标分离的线
                deleteEndpointsOnDetach: false,//如果设置为true，则删除连线时端点会被删除
                Container: 'flowchart-demo'
            });
            const instance = this.jsPlumbInstance;

            instance.shouldFireEvent = function () {
                // console.log('*********shouldFireEvent*********');
                // console.log(arguments);
                // 如果绑定shouldFireEvent方法，则需要返回一个Boolean转型后不为false的值才会让事件触发
                return true;
            };

            instance.bind('manageElement', function () {
                console.log('********* manageElement *********');
                console.log(arguments);
            });

            // instance.batch(function () {
            // 拖动功能
            // instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
            // });

            instance.bind('connectionDrag', function (connection) {
                console.log(connection.id + '被拖动中');
            });

            //线条拖拽完毕事件，不管位置有没有发生变化
            instance.bind("connectionDragStop", function (connection) {
                console.log("connection " + connection.id + " was dragged");
            });

            // 点击连线事件
            instance.bind("click", function (conn, originalEvent) {
                if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")) {
                    // 官网文档太不靠谱了！！！！，这是源码暴露的方法，
                    // 官网文档那个detach不能用！！！！源码都没有暴露这个方法好吗！！！！
                    instance.deleteConnection(conn);
                }
            });

            instance.bind('connection', function (info) {
                //当连接成功后，将箭头上的label改为连接ID
                // info.connection.getOverlay("label").setLabel(info.connection.id);
                console.log('********* connection *********');
            });
            instance.bind('connectionMoved', function (params) {
                console.log(params.connection.id + '位置发生变化');
            });

            instance.fire('jsPlumbDemoNodeAdded', instance);
        }

        addEndPoint(selectorId) {
            const self = this;

            function addEndPointForEach(arr, endPointConfig, selectorId) {
                return function () {
                    arr.forEach((anchor) => {
                        let UUID;
                        if (Array.isArray(anchor)) {
                            UUID = selectorId + 'Bottom';
                        } else {
                            UUID = selectorId + anchor;
                        }

                        // el, params, referenceParams
                        debugger;
                        let endpoint = self.jsPlumbInstance.addEndpoint(selectorId, endPointConfig, {
                            anchor,
                            uuid: UUID
                        });
                        endpoint.bind('click', function (endpoint) {
                            console.log('you clicked on ', endpoint);
                        });
                    });
                }
            }

            function deal(selectorId) {
                // 静态anchor总共有9个
                // Top (also aliased as TopCenter)
                // TopRight
                // Right (also aliased as RightMiddle)
                // BottomRight
                // Bottom (also aliased as BottomCenter)
                // BottomLeft
                // Left (also aliased as LeftMiddle)
                // TopLeft
                // Center

                // [ 0.5, 1, 0, 1, 0, 50 ] 在Bottom的基础上，向y轴下移50px
                addEndPointForEach(['Top'], self.sourceEndPoint, selectorId)();
                // addEndPointForEach(['Left', 'Right'], self.targetEndpoint, selectorId)();
            }


            if (typeof selectorId === 'string') {
                deal(selectorId);
            } else if (Array.isArray(selectorId)) {
                selectorId.forEach((selectorId) => {
                    deal(selectorId);
                });
            }
        }

        connect(uuids) {
            debugger;
            this.jsPlumbInstance.connect({ uuids, editable: true });
        }
    }


    (function main() {
        let dragFlowChart = new DragFlow();
        dragFlowChart.addEndPoint(['flowchartWindow1']);
        // dragFlowChart.addEndPoint(['flowchartWindow1', 'flowchartWindow2']);
        // dragFlowChart.addEndPoint('flowchartWindow3');
        // dragFlowChart.connect(['flowchartWindow3Bottom', 'flowchartWindow1Left']);
    }());
});
