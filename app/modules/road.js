define([
    "app",

    "modules/data",

    "modules/videopos",

    "progress"

], function( App, Data, VideoPos, ProgressCircle ) {

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

        events: {
            "click .next-stop" : "gotoRestStop"
        },

        initialize: function( config ) {
            this.model = Road.Items.get( config.id );
        },

        afterRender: function() {
            var act, id, scs, length;

            VideoPos.positionVideo( this.$("video") );

            act = this.model.get("act");
            id = this.model.get("id");

            scs = new ScrollableCueset(
                Abstract.merge( {}, this.model.attributes )
            );

            // get the length once, after metadata has loaded
            scs.video.on("loadedmetadata", function() {
                length = scs.video.duration();
            }.bind(this) );

            this.spinLoader();

            // hide loader when the video can play
            scs.video.on("canplaythrough", function() {
                this.$(".road-loading").fadeOut(1000, function() {
                    this.progressPie.stop();
                }.bind(this) ) ;
            }.bind(this) );

            // show reststop link teaser if you have seen the whole video
            // the "ended" event never fires so we need to do it this way
            scs.video.on("timeupdate", function(e) {
                if (scs.video.currentTime() >= (Math.floor(length) - 1)  ) {
                    this.$(".next-stop").fadeIn(1000);
                }
            }.bind(this) );
        },

        spinLoader: function() {
            var pieCanvas, timeAtStart, introDelay;

            timeAtStart = new Date().getTime();

            pieCanvas = this.$("#road-loading-pie").get(0);

            this.progressPie = new ProgressCircle({
                canvas: pieCanvas,
                minRadius: 0, // Inner radius of the innermost circle
                arcWidth: 30, // Width of each circle
                gapWidth: 0, // Space between adjacent circles
                centerX: 53, // X coordinate of the circle center
                centerY: 53 // Y coordinate of the circle center
            });

            this.progressPie.addEntry({
                fillColor: 'rgba(255, 0, 137, 0.75)',
                progressListener: function() {
                    var elapsed =  new Date().getTime() - timeAtStart;

                    return (elapsed % 1500) / 1500;
                }
            });

            this.progressPie.start(33);
        },

        gotoRestStop: function() {
            App.goto( this.model.get("act"), "reststop" );
        }


    });


    return Road;
});
