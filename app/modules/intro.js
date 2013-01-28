define([
    "app",
    "modules/nav"
], function( App, Nav ) {

    var Intro = App.module();

    Intro.Model = Backbone.Model.extend({
        defaults: {
            id: 1,
            video: "Intro",
            type: "intro"
        }
    });

    Intro.Collection = Backbone.Collection.extend({
        model: Intro.Model
    });

    Intro.Items = new Intro.Collection();

    Intro.Views.Item = Backbone.View.extend({

        template: "intro/item",

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( config ) {
            this.model = Intro.Items.get( config.id );
        },

        afterRender: function() {
            var $pop = Popcorn("#reinvention-intro video");

            function handler() {
                App.goto( 1, "story" );
            }

            // Set up "Skip Intro" from 8s-12s.
            // Jump when the video ends.
            $pop.register({
                start: 8,
                end: 12,
                onStart: function() {
                    this.on( "click", handler );
                },
                onEnd: function() {
                    this.off( "click", handler );
                }
            }).on( "ended", handler );

            // Pause the intro video at 1:35 (95s)
            $pop.cue( 95, function() {
                this.pause();
            });

            // Set the correct margins to pull the video into the center
            this.$el.find("video").css({
                marginLeft: "-" + (parseInt( this.$el.css("width"), 10 ) / 4) + "px",
                marginTop: "-" + (parseInt( this.$el.css("height"), 10 ) / 4) + "px"
            });
        }
    });

    Intro.Items.add({ id: 1 });

    return Intro;
});
