require([
    "app",
    "router",
    "modules/nav"
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

    App.DOM = {
        $window: $window,
        $document: $document,
        $body: $body
    };


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
});
