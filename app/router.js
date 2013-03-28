define([
    "app",

    "modules/intro",
    "modules/act",
    "modules/story",
    "modules/road",
    "modules/reststop",
    "modules/map",
    "modules/storyoverlay",
    "modules/contribute",
    "modules/session",

    // Data
    "modules/data"
],

function( App, Intro, Act, Story, Road, Reststop, Map, StoryOverlay, Contribute, Session, Data ) {
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
            console.log("initialize router");
            App.useLayout("main");
        },

        routes: {
            "": "index",
            "share": "share",
            "get-involved": "involved",
            "map": "map",
            "contribute": "contribute",
            "story/:id" : "story",
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

        share: function() {
            App.trigger("pause_player");

            $(".modal-overlay, .share-modal")
                .removeClass("displaynone");

            $(".close-modal").one("click", function() {
                App.trigger("kill_player");
                $(".modal-overlay, .share-modal").addClass("displaynone");
                console.log("LASTCONTENT: ", App.router.lastContent);
                if ( _.isUndefined(App.router.lastContent) ) {
                     App.router.navigate( "", { trigger: true } );
                }
                else {
                    App.router.navigate( App.router.lastContent, { trigger: true } );
                }
            });
        },

        involved: function() {
            App.trigger("pause_player");


            $('#email-submit').unbind("click").bind("click", function(){

                var url = "https://docs.google.com/forms/d/17H_UdbzwnMr4FJQ1rq305Z6EYvHf2lCrsilBPRGY7l8/viewform?entry.4343096=";
                url = url + $("#email-input").val();
                window.open(url);

            });

            $(".modal-overlay, .email-modal")
                .removeClass("displaynone");

            $(".close-modal").one("click", function() {
                App.trigger("kill_player");
                $(".modal-overlay, .share-modal").addClass("displaynone");
                console.log("LASTCONTENT: ", App.router.lastContent);
                if ( _.isUndefined(App.router.lastContent) ) {
                     App.router.navigate( "", { trigger: true } );
                }
                else {
                    App.router.navigate( App.router.lastContent, { trigger: true } );
                }
            });
        },

        show: function( act, type, id ) {
            var key, view;

            // save lastContent so we can return from a modal
            App.router.lastContent = Backbone.history.getFragment();

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

                // Emit the kill_player event if loading a view other than story.
                // The Zeega player instance created in the story view will destroy.
                // This prevents problems.
                if ( [ "intro", "road", "reststop" ].indexOf(type) > -1 ) {
                    App.trigger("kill_player");
                }

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
        },


        // Actual map view startup happens in renderMapView();
        map: function() {
            var view, key;

            // save lastContent so we can return from a modal
            App.router.lastContent = Backbone.history.getFragment();

            // Emit the kill_player event.
            // The Zeega player instance created in the story view will destroy.
            // This prevents problems.
            App.trigger("kill_player");


            // Prevent attempts to re-render the current view: if this
            // type and id are already in the viewport, do nothing.
            if ( App.isCurrent( 0, "map" ) ) {
                console.log( "Prevent attempts to re-render the current view" );
                return;
            }

            this.renderMapView();

        },

        story: function( id ){
            var storyView;

            // save lastContent so we can return from a modal
            App.router.lastContent = Backbone.history.getFragment();

            // The story modal can only be accessed from the map or hitting the route directly.
            // If the map is the current view in #main, don't render it again.
            // If the map is not the current view it means you came in directly, so render the map
            // so it is visible in the background.
            if ( !App.isCurrent( 0, "map" ) ) {
               this.renderMapView();
            }

            // insert story overlay view
            storyView = new StoryOverlay.View({ id: id });
            App.layout.insertView( "#reinvention-viewport", storyView );
            storyView.render();



        },

        contribute: function() {
            var view, key;

            // save lastContent so we can return from a modal
            App.router.lastContent = Backbone.history.getFragment();

            // Emit the kill_player event.
            // The Zeega player instance created in the story view will destroy.
            // This prevents problems.
            App.trigger("kill_player");

            // Prevent attempts to re-render the current view: if this
            // type and id are already in the viewport, do nothing.
            if ( App.isCurrent( 0, "contribute" ) ) {
                console.log( "Prevent attempts to re-render the current view" );
                return;
            }

            // Update the current view type and id.
            // Faking this for the contribute view.
            Abstract.merge( App.current, {
                id: 0,
                type: "contribute"
            });

            // Create the key to either reference or define (or both)
            // any cached or caching views.
            key = "contribute-0";

            // Reuse or create a new view, as needed
            view = App.views[ key ] ? App.views[ key ] :
               new Contribute.View();

            // Cache or "Re-cache" the view for later
            App.views[ key ] = view;

            App.layout.setViews({
                "#reinvention-viewport": view
            }).render();

        },

        renderMapView: function() {
            // Update the current view type and id.
            // Faking this for the map view.
            Abstract.merge( App.current, {
                id: 0,
                type: "map"
            });

            // Create the key to either reference or define (or both)
            // any cached or caching views.
            key = "map-0";

            // Reuse or create a new view, as needed
            view = App.views[ key ] ? App.views[ key ] :
               new Map.View({
                    collection: new Map.Collection()
               });

            // Cache or "Re-cache" the view for later
            App.views[ key ] = view;

            App.layout.setViews({
                "#reinvention-viewport": view
            }).render();
        }
    });
    return Router;
});
