/* 创建及操作anchor相关代码 */
;(function () {

    "use strict";

    var root = this,
        _ju = root.jsPlumbUtil,
        _jp = root.jsPlumb;

    //
    // manages anchors for all elements.
    //
    _jp.AnchorManager = function (params) {
        var self = this,
            jsPlumbInstance = params.jsPlumbInstance;
    };

    /**
     * Anchors model a position on some element at which an Endpoint may be located.  They began as a first class citizen of jsPlumb, ie. a user
     * was required to create these themselves, but over time this has been replaced by the concept of referring to them either by name (eg. "TopMiddle"),
     * or by an array describing their coordinates (eg. [ 0, 0.5, 0, -1 ], which is the same as "TopMiddle").  jsPlumb now handles all of the
     * creation of Anchors without user intervention.
     */
    _jp.Anchor = function (params) {
        this.x = params.x || 0;
        this.y = params.y || 0;
        this.elementId = params.elementId;
        this.cssClass = params.cssClass || "";
        this.userDefinedLocation = null;
        this.orientation = params.orientation || [0, 0];
        this.lastReturnValue = null;
        this.offsets = params.offsets || [0, 0];
        this.timestamp = null;

        _ju.EventGenerator.apply(this);

        this.compute = function (params) {
            // xy[0] 表示left
            // xy[1] 表示top
            var xy = params.xy,
                // wh[0] width
                // wh[1] height
                wh = params.wh,
                timestamp = params.timestamp;

            if (params.clearUserDefinedLocation) {
                this.userDefinedLocation = null;
            }

            if (timestamp && timestamp === this.timestamp) {
                return this.lastReturnValue;
            }

            if (this.userDefinedLocation != null) {
                this.lastReturnValue = this.userDefinedLocation;
            } else {
                // 这句非常重要，上面三个if的作用是？？
                // x,y 区间[0,1]
                // offsets 区间无限制
                this.lastReturnValue = [xy[0] + (this.x * wh[0]) + this.offsets[0],
                    xy[1] + (this.y * wh[1]) + this.offsets[1]];
            }

            this.timestamp = timestamp;
            return this.lastReturnValue;
        }
    };

    _ju.extend(_jp.Anchor, _ju.EventGenerator, {
        equals: function (anchor) {
            if (!anchor) {
                return false;
            }
            var ao = anchor.getOrientation(),
                o = this.getOrientation();
            return this.x === anchor.x && this.y === anchor.y && this.offsets[0] === anchor.offsets[0] && this.offsets[1] === anchor.offsets[1] && o[0] === ao[0] && o[1] === ao[1];
        },
        getUserDefinedLocation: function () {
            return this.userDefinedLocation;
        },
        setUserDefinedLocation: function (l) {
            this.userDefinedLocation = l;
        },
        clearUserDefinedLocation: function () {
            this.userDefinedLocation = null;
        },
        getOrientation: function () {
            return this.orientation;
        },
        getCssClass: function () {
            return this.cssClass;
        }
    });
}).call(typeof window !== 'undefined' ? window : this);
