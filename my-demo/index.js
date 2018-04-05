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
                connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
                dragOptions: {},
            };
            this.targetEndpoint = {
                endpoint: 'Dot',
                paintStyle: {
                    strokeWidth: 3,
                    radius: 10,
                    stroke: "#333",
                },
                target: true,
                connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
            };

            this.jsPlumbInstance = null;
            this.init();
        }

        init() {
            this.jsPlumbInstance = jsPlumb.getInstance({
                DragOptions: {//设置拖拽元素参数
                    cursor: 'pointer',
                    zIndex: 2000
                },
                ConnectionOverlays: [//附加到每条连线的CSS样式
                    //在线条上添加箭头
                    ["Arrow", {location: 1}],
                    //在线条上添加标签
                    ["Label", {
                        //？？
                        location: 0.1,
                        //？？
                        id: "label",
                        //线条dom的 class = "jtk-overlay aLabel"
                        cssClass: "aLabel"
                    }]
                ],
                ReattachConnections: true,//是否重新连接使用鼠标分离的线
                deleteEndpointsOnDetach: false,//如果设置为true，则删除连线时端点会被删除
                Container: 'flowchart-demo'
            });
            const instance = this.jsPlumbInstance;

            instance.batch(function () {
                console.log('batch');
                instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {grid: [20, 20]});
            });

            instance.bind('connectionDrag', function (connection) {
                console.log(connection.id + '被拖动中');
            });

            ///线条拖拽完毕事件，不管位置有没有发生变化
            instance.bind("connectionDragStop", function (connection) {
                console.log("connection " + connection.id + " was dragged");
            });

            //删除连接事件
            instance.bind("click", function (conn, originalEvent) {
                console.log('delete fire');
                if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")) {
                    // 官网文档太不靠谱了！！！！，这是源码暴露的方法，
                    // 官网文档那个detach不能用！！！！源码都没有暴露这个方法好吗！！！！
                    instance.deleteConnection(conn);
                }
            });

            instance.bind('connection', function (info) {
                //当连接成功后，将箭头上的label改为连接ID
                info.connection.getOverlay("label").setLabel(info.connection.id);
                console.log('connection');
            });
            instance.bind('connectionMoved', function (params) {
                console.log(params.connection.id + '位置发生变化');
            });

            instance.fire('jsPlumbDemoNodeAdded', instance);
        }

        addEndPoint(selectorId) {
            const self = this;

            function addEndPointForEach(arr, endPoint, selectorId) {
                return function () {
                    arr.forEach((anchor) => {
                        const UUID = selectorId + anchor;
                        // el, params, referenceParams
                        self.jsPlumbInstance.addEndpoint(selectorId, endPoint, {anchor: anchor, uuid: UUID});
                    });
                }
            }

            function deal(selectorId) {
                addEndPointForEach(['Top', 'Bottom'], self.sourceEndPoint, selectorId)();
                addEndPointForEach(['Left', 'Right'], self.targetEndpoint, selectorId)();
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
            //利用uuid连接
            //editable??
            this.jsPlumbInstance.connect({uuids: uuids, editable: true});
        }
    }


    (function main() {
        let dragFlowChart = new DragFlow();
        dragFlowChart.addEndPoint(['flowchartWindow1', 'flowchartWindow2']);
        dragFlowChart.addEndPoint('flowchartWindow3');
        dragFlowChart.connect(['flowchartWindow3Bottom', 'flowchartWindow1Left']);
    }());
});