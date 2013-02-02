
define([
    "app"
], function( App ) {
    // centers a video for full-bleed
    // $el : video to position
    // options : only one, { animate: true/false }
    function positionVideo($el, options) {
        var left, top, width, height,
            windowDims = {
                x : App.DOM.$window.width(),
                y : App.DOM.$window.height()
            },
            defaults = {
                animate: false
            },
            windowRatio = windowDims.x / windowDims.y,
            videoRatio = 16/9;

        options = _.extend(defaults, options);

        if ( windowRatio > videoRatio ) {
            left = 0;
            top = ( windowDims.y - ( windowDims.x * ( 1 / videoRatio ) ) ) / 2;
            height = windowDims.x * ( 1 / videoRatio );
            width = "100%";
        } else if ( videoRatio > windowRatio ) {
            left = ( windowDims.x - ( windowDims.y * videoRatio ) ) / 2;
            top = 0;
            height = "100%";
            width = windowDims.y * ( videoRatio );
        }

        console.log (windowDims);

        if (options.animate) {
             $el.animate({
                left: left,
                top: top,
                width: width,
                height: height,
                margin: 0
            }, 1500);
        } else {
            $el.css({
                left: left,
                top: top,
                width: width,
                height: height,
                margin: 0
            });
        }
    }

    return {
        positionVideo: positionVideo
    };
});