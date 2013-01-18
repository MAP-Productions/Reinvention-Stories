require([],
function() {

    var $nav, isRolledup, isLocked, last;

    isLocked = false;
    last = 0;

    function mousemove( event ) {
        event = event || { pageY: 0 };

        // Upvars declared in enclosing scope
        $nav = $("#reinvention-menu");
        isRolledup = $nav.hasClass("rolledup");

        if ( last > 100 && event.pageY <= 100 ) {
            isLocked = false;
        }

        if ( isLocked ) {
            return;
        }

        if ( event.pageY > 100 ) {
            if ( !isRolledup ) {
                isLocked = true;
                $nav.addClass("rolledup").animate({
                    top: "-77px"
                }, 500, function() {
                    isLocked = false;
                });
            }
        } else {
            if ( isRolledup ) {
                isLocked = true;
                $nav.removeClass("rolledup").animate( {
                    top: 0
                }, 500, function() {
                    isLocked = false;
                });
            }
        }
    }

    $(document).on( "mousemove", mousemove );

    // Trigger the mousemove with a fake event.pageY = 99 to hold the menu open.
    // NOTE: this is note straight forward, because the the transition timer
    // is buried in CSS
    setTimeout( mousemove, 2000 );



    return {
        mousemove: mousemove
    };
});
