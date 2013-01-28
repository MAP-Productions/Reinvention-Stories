require([
    "app",
    "router",
    "modules/act",
    "modules/nav"
],

function( App, Router, Act ) {

    var $window, $document, $body, fullscreen, commands;

    // Initialize App-wide router instance.
    App.router = new Router();

    // Create the "goto" api now that App.router is initialized
    App.goto = function( act, type ) {
        var args = type === "intro" ?
            [ 1, "intro", 1 ] :
            Act.Items.get( act ).next( type );

        App.router.go.apply( null, args );
    };

    Backbone.history.start({
        root: App.root
    });

    // Cache frequently used DOM elements in jQuery collections
    $window = $(window);
    $document = $(document);
    $body = $("body");

    // Expose DOM cache on App.DOM for App-wide access
    App.DOM = {
        $window: $window,
        $document: $document,
        $body: $body
    };

    commands = {
        fullscreen: function() {
            // FullScreen API unprefixed via unprefix.js
            // document.getElementById("fullscreen").requestFullScreen(
            //     Element.ALLOW_KEYBOARD_INPUT
            // );
            document.body.requestFullScreen(
                Element.ALLOW_KEYBOARD_INPUT
            );

        }
    };

    App.DOM.$window.on("resize", function() {
        // TODO:
        // When the window is resized, so to should any video currently
        // being displayed in the reinvention viewport.
        var $video = $("#reinvention-viewport").find("video");
        console.log( $video );
    });

    App.DOM.$body.on("click", "[data-command]", function( event ) {
        var $this, command;

        event.preventDefault();

        $this = $(this);
        command = commands[ $this.data("command") ];

        if ( command ) {
            command();
        }
    });


});
