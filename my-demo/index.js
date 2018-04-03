jsPlumb.ready(() => {
    class DragFlow {
        constructor() {
            this.connectorHoverStyle = {
                lineWidth: 4,
            };
            this.endPointHoverStyle = {};
            this.sourceEndPoint = {
                endpoint: 'Dot',
                paintStyle: {
                    //控制线条大小
                    strokeWidth: 6,
                    //控制圆半径
                    radius: 10,
                    stroke: "#fff",
                },
                isSource: true,
                connector: ['FlowChar'],
            };
            this.targetEndpoint = {
                endpoint: 'Dot',
                paintStyle: {
                    //控制线条大小
                    strokeWidth: 6,
                    //控制圆半径
                    radius: 10,
                    stroke: "#000",
                },
                target: true,
                connector: ['FlowChar']
            };

            this.jsPlumbInstance = null;
            this.init();
        }

        init() {
            this.jsPlumbInstance = jsPlumb.getInstance({
                DragOptions: {cursor: 'pointer'},
                deleteEndpointsOnDetach: false,
                Container: 'flowchart-demo'
            });

            const instance = this.jsPlumbInstance;

            instance.batch(function () {
                console.log('batch');

            });

            instance.bind('connectionDrag', function (connection) {
                console.log(connection.id + '被拖动中');
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
                    arr.forEach((position) => {
                        const UUID = selectorId + position;
                        // el, params, referenceParams
                        self.jsPlumbInstance.addEndpoint(selectorId, endPoint, {anchor: position, uuid: UUID});
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
            this.jsPlumbInstance.connect({uuids, editable: true});
        }
    }


    (function main() {
        let dragFlowChart = new DragFlow();
        dragFlowChart.addEndPoint(['flowchartWindow1', 'flowchartWindow2']);
        dragFlowChart.addEndPoint('flowchartWindow3');
        // dragFlowChart.connect(['flowchartWindow3Bottom', 'flowchartWindow1Left']);
    }());
});