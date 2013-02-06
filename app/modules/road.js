define([
    "app",

    "modules/data",

    "modules/videopos"

], function( App, Data, VideoPos ) {

    var Road;

    Road = App.module();

    Road.Model = Backbone.Model.extend({
        defaults: {
            id: null,
            type: "road"
        },
        initialize: function( road ) {
            this.set(
                Abstract.merge( road, Data.from("roads").byId( road.id ) )
            );
            this.collection.add( this );
        }
    });

    Road.Collection = Backbone.Collection.extend({
        model: Road.Model
    });

    Road.Items = new Road.Collection();

    Road.Model.prototype.collection = Road.Items;

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

        afterRender: function() {
            var act, id, scs;

            VideoPos.positionVideo( this.$("video") );

            act = this.model.get("act");
            id = this.model.get("id");

            scs = new ScrollableCueset(
                Abstract.merge( {}, this.model.attributes )
            );

            // hide loader when the video can play
            scs.video.on("canplaythrough", function() {
                this.$(".road-loading").fadeOut(1000);
            }.bind(this) );

            // Jump to the reststop
            scs.video.on("ended", function() {
                App.goto( act, "reststop" );
            });
        }
    });


    return Road;
});
