define([
    "app",
    "modules/data"

], function( App, Data ) {

    var Story, ZEEGA_URL;

    Story = App.module();
    ZEEGA_URL = "http://alpha.zeega.org/api/items/";


    Story.Model = Backbone.Model.extend({
        defaults: {
            isAvailable: false,
            id: null,
            type: "story"
        },
        url: function() {
            return ZEEGA_URL + this.id;
        },
        parse: function( obj ) {
            return obj.items[ 0 ];
        },
        initialize: function( story ) {
            this.set(
                _.extend( story, Data.from("stories").byId( story.id ) )
            );
            this.collection.add( this );
        }
    });

    Story.create = function( story ) {
        new Story.Model( story );
    };

    Story.Collection = Backbone.Collection.extend({
        model: Story.Model
    });

    Story.Items = new Story.Collection();

    Story.Model.prototype.collection = Story.Items;

    Story.Views.Item = Backbone.View.extend({

        template: "story/item",

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( config ) {
            this.model = Story.Items.get( config.id );
        },

        beforeRender: function() {
            console.log( "Story.Views.Item: beforeRender" );
        },

        afterRender: function() {
            // http://alpha.zeega.org/74868
            // http://alpha.zeega.org/__ID__
            var config, id, act, data, zp, isLast;

            config = {
                target: "#reinvention-story",
                autoplay: true,
                window_fit: true
            };

            id = this.model.get("id");
            act = this.model.get("act");
            data = this.model.get("text");

            // Sometimes the Zeega Project data hasn't returned soon enough,
            // in these cases, provide the url instead. This will give the
            // Zeega-Player instance the info it needs to request the data
            // and build a player.
            config[ !data ? "url" : "data" ] = !data ?
                this.model.url() : data;

            zp = new Zeega.player( config );
            isLast = false;

            // TODO: Remove this when the ended event issue is solved.
            window.zp = zp;

            zp.on("deadend_frame", function() {
                isLast = true;
            });

            zp.on("ended", function() {
                console.log( "ended" );

                if ( isLast ) {
                    App.goto( act, "road" );
                }
            });
        }
    });

    return Story;
});
