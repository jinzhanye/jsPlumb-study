- getBoundingClientRect 是当前元素到页面的距离
- offsetXX 是当前元素到 offsetParent 的距离
- 利用以下接口获取元素的长宽(计算包括border)
````js
// CONVERTED
getSize: function (el) {
    return [el.offsetWidth, el.offsetHeight];
},
// CONVERTED
getWidth: function (el) {
    return el.offsetWidth;
},
// CONVERTED
getHeight: function (el) {
    return el.offsetHeight;
},
````
