define([],
function() {

    var $nav, $navContent, triggerHeight, isRolledup, isLocked, initialOpen, last;

    isLocked = false;
    initialOpen = true;
    last = -1;
    triggerHeight = 100; // distance from top of screen that triggers nav opening

    $nav = $("#reinvention-menu");
    $navContent = $nav.find(".menu-content");

    function mousemove( event ) {

        event = event || { pageY: 0 };

        // Upvars declared in enclosing scope
        
        isRolledup = $nav.hasClass("rolledup");

        if ( isLocked || initialOpen ) {
            last = event.pageY;
            return;
        }

        if ( event.pageY > triggerHeight ) {
            if ( !isRolledup ) {
                /* hide nav, fade out content */
                isLocked = true;
                $nav.addClass("rolledup").animate({
                    top: "-77px"
                }, 500, function() {
                    isLocked = false;
                });
                $navContent.fadeOut(500);
            }
        } else {
            if ( isRolledup ) {
                /* show nav, fade in content */
                isLocked = true;
                $nav.removeClass("rolledup").animate({
                    top: 0
                }, 500, function() {
                    isLocked = false;
                });
                $navContent.fadeIn(500);
            }
        }

        last = event.pageY;
    }

    function startHiding() {
        initialOpen = false;

        if ( last < 0 || last > triggerHeight ) {
            mousemove({ pageY: 2000 }); // force close
        }
    }

    $(document).on( "mousemove", mousemove );

    // Trigger the mousemove with a fake event.pageY = 99 to hold the menu open.
    // NOTE: this is note straight forward, because the the transition timer
    // is buried in CSS
    setTimeout( startHiding, 2000 );



    return {
        mousemove: mousemove
    };
});
