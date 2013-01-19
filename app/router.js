define([
    "app",

    "modules/intro",
    "modules/act",
    "modules/story",
    "modules/road",
    "modules/reststop",
    "modules/session",

    // Data
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

    Object.keys( Act.Types ).forEach(function( key ) {
        Act.Types[ key.toLowerCase() ] = Act.Types[ key ];
    });


    // Spin up the app with some sortof-bootstrapped data!
    Data.get("acts").forEach( Act.create );

    Router = Backbone.Router.extend({
        initialize: function() {
            App.useLayout("main");
        },

        routes: {
            "": "index",
            ":act": "show",
            ":act/:type/:id": "show"
        },

        go: function() {
            return ( this !== App.router ? App.router : this ).navigate(
                [].slice.call(arguments).join("/"), true
            );
        },

        index: function() {
            this.go( 1, "intro", 1 );
        },

        show: function( act, type, id ) {
            var key, view;

            // Support "default" Act urls.
            //
            //      eg. /#1, /#2, /#3
            //
            if ( type === undefined && id === undefined ) {

                type = "story";
                id = Act.Items.get(act).get("story").get("id");

                // If there is no information available for
                // an Act, default to "Act 1, Story"
                if ( id === null ) {
                    act = 1;
                    type = "story";
                    id = Act.Items.get(1).get("story").get("id");

                    // Immediately redirect to Act 1 Story
                    this.go( act, type, id );
                    return;
                }
            }

            if ( [ "intro", "road", "reststop", "story" ].indexOf(type) > -1 ) {

                // Prevent attempts to re-render the current view: if this
                // type and id are already in the viewport, do nothing.
                if ( App.isCurrent( id, type ) ) {
                    console.log( "Prevent attempts to re-render the current view" );
                    return;
                }

                // Update the current view type and id
                Abstract.merge( App.current, {
                    act: +act,
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
