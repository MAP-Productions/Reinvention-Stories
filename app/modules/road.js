define([
    "app",

    "json!data/roads.json"

], function( App, roads ) {

    var Road;

    Road = App.module();

    Reinvention.Roads = new Map();

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

            // TODO:
            //
            // Reinvention.Roads.forEach(function() ... reset all roads )


        },

        afterRender: function() {
            var scrollable;

            console.log(
                "Road.Views.Item: afterRender (video container), create ScrollableCueset"
            );

            scrollable = new ScrollableCueset(
                Abstract.merge({ selector: "#video" }, this.model.attributes )
            );


            // Reinvention.Roads.set( this, scrollable );
        }
    });


    return Road;
});
