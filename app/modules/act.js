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
            $(".ZEEGA-player").remove();
            $("#reinvention-viewport").empty();
        },

        run: function( event ) {
            // TODO:
            //
            //      This should be moved to its own abstraction, elsewhere in the
            //      program.
            //
            //
            var routeExpr, data, config, Type, view, model;

            routeExpr = Backbone.Router.prototype._routeToRegExp( "/:act/:type/:id" );
            data = routeExpr.exec(
                ( $(event.target).attr("href") || $(event.target).prop("href") ).slice(1)
            );

            config = [ "path", "act", "type", "id" ].reduce(function( initial, val ) {
                initial[ val ] = data.shift();
                return initial;
            }, {});

            console.log( "RUN", config.act, config.type, config.id );

            if ( App.current.type === config.type && App.current.id === +config.id ) {
                return;
            }

            App.cache[ App.current.type + App.current.id ] = $("#reinvention-viewport").children(0).detach();


            Abstract.assign( App.current, {
                id: +config.id,
                type: config.type
            });


            Type = Act.Types[ config.type ];
            model = Type.Items.get(config.id);
            view = model.get("view");

            delete App.layout.views["#reinvention-viewport"];


            if ( !view ) {

                this.reset();

                App.layout.setViews({

                    "#reinvention-viewport": new Type.Views.Item({
                        id: config.id
                    })

                }).render();
            }




            // console.log( "Act.Views.Item:run", href );
            // console.log( this.model );
            // [ "story", "road", "reststop" ].forEach(function( model ) {
            //     console.log( model, this.model.get( model ).get("id") );
            // }, this);
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
