require([],
function() {

    var nav, isHidden, isLocked, last;

    isLocked = false;
    last = 0;

    function mousemove( event ) {
        // Upvars declared in enclosing scope
        nav = $("#reinvention-menu");
        isHidden = nav.hasClass("rolledup");

        if ( last > 100 && event.pageY <= 100 ) {
            isLocked = false;
        }

        if ( isLocked ) {
            return;
        }

        if ( event.pageY > 100 ) {
            if ( !isHidden ) {
                isLocked = true;
                nav.addClass("rolledup");
                nav.animate( {
                    top: '-77px'
                }, 500, function() {
                    isLocked = false;
                });
            }
        } else {
            if ( isHidden ) {
                isLocked = true;
                nav.removeClass("rolledup");
                nav.animate( {
                    top: 0
                }, 500, function() {
                    isLocked = false;
                });
            }
        }
    }

    $(document).on( "mousemove", mousemove );

    _.delay( function() {
        mousemove({ pageY: 99 });
    }, 2000 );

    return {
        mousemove: mousemove
    };
});
