define([
    "app"

], function( App ) {

    var Intro = App.module();

    Intro.Model = Backbone.Model.extend({
        defaults: {
            id: 1,
            video: "Intro"
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
                App.router.go( "act", 1, "story", 1 );
            }

            $pop.code({
                start: 8,
                end: 12,
                onStart: function() {
                    this.on( "click", handler );
                },
                onEnd: function() {
                    this.off( "click", handler );
                }
            });
        }
    });

    Intro.Items.add({ id: 1 });

    return Intro;
});
