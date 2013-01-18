define([
    "app",

    "modules/intro",
    "modules/act",
    "modules/story",
    "modules/road",
    "modules/reststop",
    "modules/session",

    // Data
    // "json!data/acts.json"
    "modules/data"

],

function( App, Intro, Act, Story, Road, Reststop, Session, Data ) {
    var Router;

    // window.Session = window.Session || Session;

    // If this is the first visit, there will be no record of any
    // prior visits. For this visit, set "isFirst" to |true|.
    // Subsequent visits will see a valid "isFirst" record and will
    // therefore be set to false.
    // Session.set(
    //     "isFirst", Session.get("isFirst") === undefined ? true : false
    // );



    // Spin up the app with some sortof-bootstrapped data!
    Data.get("acts").forEach( Act.create );

    Router = Backbone.Router.extend({
        initialize: function() {
            App.useLayout("main");
        },

        routes: {
            "": "index",
            ":act/:type/:id": "show"
        },

        go: function() {
            // if ( this !== App.router ) {
            //     return App.router.go.apply( App.router, arguments );
            // }
            return ( this !== App.router ? App.router : this ).navigate(
                [].slice.call(arguments).join("/"), true
            );
        },

        index: function() {
            this.go( 1, "intro", 1 );
        },

        show: function( act, type, id ) {
            // console.log( "SHOW", act, type, id );
            var key, view;

            if ( [ "intro", "road", "reststop", "story" ].indexOf(type) > -1 ) {

                // If this type and id are already in the viewport,
                // do nothing.
                if ( App.isCurrent( id, type ) ) {
                    console.log( "Prevent attempts to re-render the current view" );
                    return;
                }

                // Update the current view type and id
                Abstract.merge( App.current, {
                    id: +id,
                    type: type
                });

                // Create the key to either reference or define (or both)
                // any cached or caching views.
                key = [ type, id ].join("-");

                // Reuse or create a new view, as needed
                view = App.views[ key ] ? App.views[ key ] :
                    new Act.Types[ type ].Views.Item({ id: id });

                // Cache or "Re-cache" the view for later
                App.views[ key ] = view;

                App.layout.setViews({
                    "#reinvention-viewport": view
                }).render();
            }
        }
    });

    return Router;
});
