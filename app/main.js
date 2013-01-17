require([
    "app",

    "router",

    "modules/nav"
],

function( App, Router, Nav ) {

    App.router = new Router();

    Backbone.history.start({
        root: App.root
    });
});
