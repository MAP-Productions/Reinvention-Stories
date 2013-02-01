define([
    "app"
], function( App ) {
    function positionVideo($el) {
        var left, top, width, height,
            windowDims = {
                x : App.DOM.$window.width(),
                y : App.DOM.$window.height()
            },
            windowRatio = windowDims.x / windowDims.y,
            videoRatio = 16/9;

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

        $el.css({
            left: left,
            top: top,
            width: width,
            height: height
        });
    }

    return {
        positionVideo: positionVideo
    };
});