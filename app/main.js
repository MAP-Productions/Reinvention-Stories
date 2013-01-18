require([
    "app",
    "router"
],

function( App, Router ) {

    var $window, $document, $body, controls;


    App.router = new Router();

    Backbone.history.start({
        root: App.root
    });


    $window = $(window);
    $document = $(document);
    $body = $("body");


    controls = {
        play: "play",
        pause: "pause",
        prev: "cuePrev",
        next: "cueNext"
    };

    $body.on("click", "[data-controls]", function( event ) {
        event.preventDefault();

        App.global.zeega[ controls[ $(this).data("controls") ] ]();
    });





    // console.log( "Backbone.history", Backbone.history );
    // console.log( "Main:", App );

    /*
    ---DISABLED---

    Backbone routing is disabled to allow regular fragment urls to work the way
    they should. For example:

        http://localhost/#act/1/road/1

    Should open:

        Act 1's Road

    ...........................................................................
    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    DOM.doc.on( "click", "a[href]:not([data-bypass])", function( evt ) {
        // var href, root;

        // // Get the absolute anchor href.
        // href = {
        //     prop: $(this).prop("href"),
        //     attr: $(this).attr("href")
        // };

        // // Get the absolute root.
        // root = location.protocol + "//" + location.host + App.root;

        // // Ensure the root is part of the anchor href, meaning it's relative.
        // if ( href.prop.slice( 0, root.length ) === root ) {
        //     // Stop the default event to ensure the link will not cause a page
        //     // refresh.
        //     evt.preventDefault();

        //     // `Backbone.history.navigate` is sufficient for all Routers and will
        //     // trigger the correct events. The Router's internal `navigate` method
        //     // calls this anyways.  The fragment is sliced from the root.
        //     Backbone.history.navigate( href.attr, true );
        // }
    });
    */



});
