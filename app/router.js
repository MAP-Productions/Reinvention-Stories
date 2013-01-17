define([
    "app",

    "modules/intro",
    "modules/act",
    "modules/story",
    "modules/road",
    "modules/reststop",
    "modules/session",

    // Data
    "json!data/acts.json"

],

function( App, Intro, Act, Story, Road, Reststop, Session, acts ) {
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
    acts.forEach( Act.create );

    Router = Backbone.Router.extend({
        initialize: function() {

            var collections = {
                acts: Act.Items
            };

            // Ensure the router has references to the collections.
            _.extend( this, collections );

            App.useLayout("main").setViews({
                // 1. Introductory Video

                // 2. Main scene:
                ".acts": new Act.Views.List()

            }).render();
        },

        routes: {
            "": "index",

            "act/:act/:type/:id": "show"
            // routes to view specific story via URL
        },

        go: function() {
            return this.navigate(
                Array.from(arguments).join("/"), true
            );
        },

        index: function() {
            // If first visit, show introductory video
            if ( Session.get("isFirst") ) {

                this.intro();
            } else {
                console.log( "Index: (non-first)" );
            }
        },

        show: function( act, type, id ) {
            // act, type, id
            //
            // reinvention-viewport
            // console.log( App.layout.setViews() );

            if ( type === "road" ) {
                App.layout.setViews({
                    "#reinvention-viewport": new Road.Views.Item({ id: id })
                });
            }

            if ( type === "reststop" ) {
                App.layout.setViews({
                    "#reinvention-viewport": new Reststop.Views.Item({ id: id })
                });
            }

        },

        intro: function() {
            // render the intro view
            console.log( "Render the intro view" );
        }
    });

    // Required, return the module for AMD compliance.
    return Router;
});
