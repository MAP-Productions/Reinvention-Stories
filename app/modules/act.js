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
        },

        playlist: function() {
            return [ "story", "road", "reststop" ].reduce(function( initial, key ) {
                //
                // |this| === this.attributes
                //
                initial[ key ] = [ this[ key ].get("act"), key, this[ key ].get("id") ];

                return initial;
            }.bind( this.attributes ), {});

        },

        next: function( type ) {
            return this.playlist()[ type ];
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
        // manage: true,

        template: "act/item",

        tagName: "div",

        className: "menu-section icons",

        data: function() {
            return {
                model: this.model
            };
        }
    });

    Act.Views.List = Backbone.View.extend({
        keep: true,
        // manage: true,
        className: "act-wrapper",

        beforeRender: function() {
            // Prior to rendering the Act.View.Lists, render
            // the Act.Views.Item nodes.
            Act.Items.each(function( act ) {
                this.insertView(
                    "ul", new Act.Views.Item({ model: act })
                );
            }, this);
        }
    });

    return Act;
});
