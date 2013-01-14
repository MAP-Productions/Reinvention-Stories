define([
    "app",

    "json!data/roads.json"

], function( App, roads ) {

    var Road;

    Road = App.module();


    function roadById( id ) {
        var i = 0,
            length = roads.length;

        for ( ; i < length; i++ ) {
            if ( roads[ i ].id === id ) {
                return roads[ i ];
            }
        }
        return null;
    }

    Road.Model = Backbone.Model.extend({
        defaults: {
            id: null,
            profiles: null
        },

        initialize: function( road ) {
            this.set(
                _.extend( road, roadById( road.id ) )
            );
            Road.Items.add( this );
        }
    });

    Road.Collection = Backbone.Collection.extend({
        model: Road.Model
    });

    Road.Items = new Road.Collection();

    Road.Views.Item = Backbone.View.extend({
        manage: true,

        template: "road/item",

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( config ) {
            this.model = Road.Items.get( config.id );
        },

        beforeRender: function() {
        },

        afterRender: function() {
            console.log( "Road.Views.Item: afterRender" );

            new ScrollableCueset(
                Abstract.merge({ selector: "#video" }, this.model.attributes )
            );

            // console.log( this.model.attributes );

            //
            //
            // 1. Load profiles
            //
            // 2. add scrolling media handlers
            //
            //
            //
            //
        }
    });


    return Road;
});
