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
            ":act/:type/:id": "show"
        },

        go: function() {
            console.log( "GO", [].slice.call(arguments).join("/") );
            return this.navigate(
                [].slice.call(arguments).join("/"), true
            );
        },

        index: function() {
            this.show( 1, "intro", 1 );
        },

        show: function( act, type, id ) {
            console.log( "SHOW", act, type, id );
            var Type, layout, view, model, isNew, html;

            layout = {};
            isNew = false;

            if ( [ "intro", "road", "reststop", "story" ].indexOf(type) > -1 ) {
                Type = Act.Types[ type ];
                model = Type.Items.get(id);
                view = model.get("view");

                if ( !view ) {
                    isNew = true;
                }

                console.log( "Type: ", type );

                if ( App.cache[ App.current.type + App.current.id ] ) {

                    $("#reinvention-viewport").html(
                        App.cache[ App.current.type + App.current.id ]
                    );
                    return;
                }

                Abstract.assign( App.current, {
                    id: +id,
                    type: type
                });

                layout = App.layout.setViews({
                    "#reinvention-viewport": view || new Type.Views.Item({ id: id })
                });

                if ( view ) {
                    layout.render();
                }
            }
        },

        reset: function() {
            $("#reinvention-viewport").empty();
        }
    });

    return Router;
});
