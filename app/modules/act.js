define([
    "app",

    "modules/intro",
    "modules/story",
    "modules/road",
    "modules/reststop"

],
function( App, Intro, Story, Road, Reststop ) {

    var Act = App.module();

    // Make [[Get]] property accessible constructors
    Act.Types = {
        Intro: Intro,
        Story: Story,
        Road: Road,
        Reststop: Reststop
    };

    // These keys are used by the Act menu click handler to execute handler
    // instructions based on route data.
    Object.keys( Act.Types ).forEach(function( key ) {
        Act.Types[ key.toLowerCase() ] = Act.Types[ key ];
    });

    Act.Model = Backbone.Model.extend({
        defaults: {
            id: null
        },
        initialize: function( act ) {
            var dict, constructor;

            dict = act;

            act.data.forEach(function( config ) {
                var constructor, model;

                // Capture reference to the model constructor
                // -- Cached for readability below
                constructor = Act.Types[ config.type ].Model;

                // Initialize a new model from this constructor type
                model = new constructor( config.data );

                // Set the newly constructed model instance to the
                // matching property...
                dict[ config.type.toLowerCase() ] = model;

                // Some Act.Types require remote data to populate models.
                // Loaded data will be annotated with a boolean flag
                if ( config.data.fetch ) {
                    model.fetch();
                }

            }, this );

            // Set the contents of the initialized |dict| as the model property values
            // for the newly created Act model instance.
            this.set( dict );

            // Add the model to the collection for View building
            Act.Items.add( this );
        }
    });

    Act.create = function( act ) {
        new Act.Model( act );
    };

    Act.Collection = Backbone.Collection.extend({
        model: Act.Model
    });

    Act.Items = new Act.Collection();

    Act.Views.Item = Backbone.View.extend({
        manage: true,

        template: "act/item",

        tagName: "li",

        data: function() {
            return {
                model: this.model
            };
        },

        beforeRender: function() {
            // console.log( "Act.Views.Item: beforeRender" );
        },

        afterRender: function() {
            // console.log( "Act.Views.Item: afterRender" );
        }
    });

    Act.Views.List = Backbone.View.extend({
        // manage: true,
        template: "act/list",

        className: "act-wrapper",

        events: {
            click: "run"
        },


        reset: function() {
            $("#reinvention-viewport").empty();
        },

        run: function( event ) {

            // console.log( "Act.Views.Item:run" );

            // // // TODO:
            // // //
            // // //      This should be moved to its own abstraction, elsewhere in the
            // // //      program.
            // // //
            // // //
            // var routeExpr, href, data, config;

            // routeExpr = Backbone.Router.prototype._routeToRegExp( ":act/:type/:id" );
            // href = $(event.target).attr("href") || $(event.target).prop("href");
            // data = routeExpr.exec( href.slice(2) );

            // // Handle disabled menu items
            // if ( data === null ) {
            //     return;
            // }

            // config = [ "path", "act", "type", "id" ].reduce(function( initial, val ) {
            //     initial[ val ] = data.shift();
            //     return initial;
            // }, {});


            // if ( App.current.type === config.type && App.current.id === +config.id ) {
            //     console.log( "leaving." );
            //     return;
            // }

            // Abstract.assign( App.current, {
            //     type: config.type,
            //     id: +config.id
            // });


            // // this.reset();

            // App.layout.setViews({

            //     "#reinvention-viewport": new Act.Types[ config.type ].Views.Item({
            //         id: +config.id
            //     })

            // }).render();
        },
        beforeRender: function() {
            // Prior to rendering the Act.View.Lists, render
            // the Act.Views.Item nodes.
            Act.Items.each(function( act ) {
                this.insertView(
                    "ul", new Act.Views.Item({ model: act })
                );
            }, this);
        },

        initialize: function() {

        }
    });

    return Act;
});
