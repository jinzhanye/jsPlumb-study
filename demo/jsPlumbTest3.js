jsPlumb.ready(function () {


    var DragFlow = function () {
        var connectorPaintStyle = {
                lineWidth: 4,
                strokeStyle: "#61B7CF",
                joinstyle: "round",
                outlineColor: "#000",
                outlineWidth: 2
            },
            connectorHoverStyle = {
                lineWidth: 4,
                strokeStyle: "#216477",
                outlineWidth: 2,
                outlineColor: "#000"
            },
            endpointHoverStyle = {
                fillStyle: "#216477",
                strokeStyle: "#216477"
            },
            sourceEndpoint = {
                // 端点（锚点）的样式声明（Dot 圆点样式）
                endpoint: "Dot",
                paintStyle: {
                    strokeStyle: "#7AB02C",
                    //[stroke] Stroke style, in valid CSS format (a hex code, name, or rgb value). You can use stroke on Endpoints to define a border.
                    stroke: "#567567",
                    // [strokeWidth] Integer optional
                    // Width of the stroked line (for Connectors this is the Connector itself; for Endpoints it is the outline)
                    strokeWidth: 2,
                    fillStyle: "#000",
                    radius: 7,
                    lineWidth: 3
                },
                isSource: true,

                //Flowchart连接样式
                connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
                // connectorStyle: connectorPaintStyle,
                hoverPaintStyle: endpointHoverStyle,
                connectorHoverStyle: connectorHoverStyle,
                dragOptions: {},
                // overlays: [
                //     ["Label", {
                //         location: [0.5, 1.5],
                //         label: "Drag",
                //         cssClass: "endpointSourceLabel"
                //     }]
                // ]
            },
            targetEndpoint = {
                endpoint: "Dot",
                paintStyle: {
                    strokeStyle: "#7AB02C",
                    stroke: "#000",
                    strokeWidth: 2,
                    fillStyle: "#000",
                    radius: 7,
                    lineWidth: 3
                },
                isTarget: true,
                connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
                hoverPaintStyle: endpointHoverStyle,
                connectorHoverStyle: connectorHoverStyle,
            };
        // 初始化，返回流程图的对象
        this.init = function (_id) {
            //1.实例化jsPlumb
            var instance = jsPlumb.getInstance({
                DragOptions: {//设置拖拽元素参数
                    cursor: 'pointer',
                    zIndex: 2000
                },
                ConnectionOverlays: [//附加到每个连接的默认重叠
                    ["Arrow", {location: 1}],
                    ["Label", {
                        location: 0.1,
                        id: "label",
                        cssClass: "aLabel"
                    }]
                ],
                ReattachConnections: true,//是否重新连接使用鼠标分离的线
                deleteEndpointsOnDetach: false,//如果设置为true，则删除连线时端点会被删除
                Container: "flowchart-demo"//容器元素id
            });

            instance.doWhileSuspended(function () {
                console.log('doWhileSuspended');
                instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {grid: [20, 20]});
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

            //连接事件
            instance.bind("connection", function (info) {
                info.connection.getOverlay("label").setLabel(info.connection.id);
                //当连接成功后，将箭头上的label改为连接ID
                console.log("connection");
            });


            //线条拖拽中事件
            instance.bind("connectionDrag", function (connection) {
                console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
            });

            ///线条拖拽完毕事件，不管位置有没有发生变化
            instance.bind("connectionDragStop", function (connection) {
                console.log("connection " + connection.id + " was dragged");
            });

            ///线条拖拽完毕事件，位置有发生变化
            instance.bind("connectionMoved", function (params) {
                console.log("connection " + params.connection.id + " was moved");
            });

            // 立即生效
            instance.fire("jsPlumbDemoNodeAdded", instance);

            return instance;

        };
        /**
         * [addEndpoint 添加端点]
         * @param {[type]} _instance      [流程图对象，必传]
         * @param {[type]} _id            [目标块id 可以是字符串或者id数组，必传]
         * @param {[type]} _sourceAnchors [起点位置，数组，可不传]
         * @param {[type]} _targetAnchors [终点位置，数组，可不传]
         */
        this.addEndpoint = function (_instance, _id, _sourceAnchors, _targetAnchors) {
            if (!_sourceAnchors) {
                //源端（锚）点位置
                _sourceAnchors = ["Top", "Bottom"];
            }
            if (!_targetAnchors) {
                //目标端（锚）点位置
                _targetAnchors = ["Left", "Right"];
            }

            var deal = function (_id) {
                for (var i = 0; i < _sourceAnchors.length; i++) {
                    var sourceUUID = _id + _sourceAnchors[i];
                    _instance.addEndpoint(_id, sourceEndpoint, {anchor: _sourceAnchors[i], uuid: sourceUUID});
                }
                for (var j = 0; j < _targetAnchors.length; j++) {
                    var targetUUID = _id + _targetAnchors[j];
                    _instance.addEndpoint(_id, targetEndpoint, {anchor: _targetAnchors[j], uuid: targetUUID});
                }
            }

            if (typeof _id == 'string') {
                deal(_id);
            } else if (typeof _id == 'object') {
                $.each(_id, function (i, _id) {
                    deal(_id);
                });
            }

        };
        this.connect = function (_instance, _uuids) {
            _instance.connect({uuids: _uuids, editable: true});
        };
    };

    var instance = new DragFlow();
    var instanceInit = instance.init();

    instance.addEndpoint(instanceInit, ['flowchartWindow1', 'flowchartWindow2']);
    instance.addEndpoint(instanceInit, 'flowchartWindow3');

    instance.connect(instanceInit, ["flowchartWindow3Bottom", "flowchartWindow1Left"]);
});
