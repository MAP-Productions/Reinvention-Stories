require([],
function() {

    var nav, isHidden, isLocked, last;

    isLocked = false;
    last = 0;

    function mousemove( event ) {
        // Upvars declared in enclosing scope
        nav = $("#reinvention-menu");
        isHidden = nav.hasClass("hidden");

        if ( last > 100 && event.pageY <= 100 ) {
            isLocked = false;
        }

        if ( isLocked ) {
            return;
        }

        if ( event.pageY > 100 ) {
            if ( !isHidden ) {
                isLocked = true;
                nav.fadeOut( 400, function() {
                    $(this).addClass("hidden");
                    isLocked = false;
                });
            }
        } else {
            if ( isHidden ) {
                isLocked = true;
                nav.fadeIn( 200, function() {
                    $(this).removeClass("hidden");
                    isLocked = false;
                });
            }
        }
    }

    $(document).on( "mousemove", mousemove );

    mousemove({ pageY: 99 });

    return {
        mousemove: mousemove
    };
});
