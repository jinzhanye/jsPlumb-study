jsPlumb.ready(() => {
    console.log('initialize successful');
    console.log('document.readyState:', document.readyState);
    console.log('global jsPlumb instance*****:,', jsPlumb);

    let firstInstance = jsPlumb.getInstance();
    console.log('firstInstance******:', firstInstance);

    // [x, y, dx, dy] [0, 1, 1, 1]表示锚点在左下方，但方向在右下方
    // let a1 = firstInstance.makeAnchor([0, 1, 1, 1], null, firstInstance);
    // let a2 = firstInstance.makeAnchor([0, 1, 1, 1], null, firstInstance);
    // 方向默认为[0,0]
    // let a3 = firstInstance.makeAnchor([0, 1], null, firstInstance);
    // var anchorParams = {
    //     x: specimen[0],
    //     y: specimen[1],
    //     orientation: (specimen.length >= 4) ? [specimen[2], specimen[3]] : [0, 0],
    //     offsets: (specimen.length >= 6) ? [specimen[4], specimen[5]] : [0, 0],
    //     elementId: elementId,
    //     jsPlumbInstance: _currentInstance,
    //     cssClass: specimen.length === 7 ? specimen[6] : null
    // };
    // console.log(a1);
    // console.log(a3);
    // console.log(a1 === a2);
    let endpoint = firstInstance.addEndpoint('flowchartWindow4');
    console.log(endpoint);
});
