define([
    "app",
    "modules/chapter",
    "modules/nav",
    "modules/data"

], function( App, Chapter, Nav, Data ) {

    var Story, zeegaUrl, controls;

    Story = App.module();

    zeegaUrl = "http://alpha.zeega.org/api/items/";

    controls = {
        player: {
            play: "play",
            pause: "pause",
            prev: "cuePrev",
            next: "cueNext"
        },
        toggles: {
            play: "pause",
            pause: "play"
        }
    };

    Story.Model = Backbone.Model.extend({
        defaults: {
            isAvailable: false,
            id: null,
            type: "story"
        },
        url: function() {
            return zeegaUrl + this.id;
        },
        parse: function( obj ) {
            return obj.items[ 0 ];
        },
        initialize: function( story ) {
            this.set(
                Abstract.merge( story, Data.from("stories").byId( story.id ) )
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

        events: {
            "click .control": "control",
            "click .chapter": "jump"
        },

        initialize: function( config ) {
            this.model = Story.Items.get( config.id );

            // The zeega player, timeline and chapters menu
            // will be assigned and rendered during the
            // afterRender phase of the view.
            this.zeega = null;
            this.timeline = null;
            this.chapters = null;
        },

        beforeRender: function() {
            console.log( "Story.Views.Item: beforeRender" );
        },

        afterRender: function() {
            // http://alpha.zeega.org/74868
            // http://alpha.zeega.org/__ID__
            var config, id, act, data, isLast;

            config = {
                target: "#reinvention-story",
                autoplay: true,
                window_fit: true
            };

            id = this.model.get("id");
            act = this.model.get("act");
            data = this.model.get("text");
            isLast = false;

            // Sometimes the Zeega Project data hasn't returned soon enough,
            // in these cases, provide the url instead. This will give the
            // Zeega-Player instance the info it needs to request the data
            // and build a player.
            config[ !data ? "url" : "data" ] = !data ?
                this.model.url() : data;

            // Initialize a new Zeega.player instance with the |config| objecr
            this.zeega = new Zeega.player( config );

            // Bind all necessary events to newly initialized zeega.player instance
            this.zeega.on("deadend_frame", function() {
                isLast = true;
            });

            this.zeega.on("ended", function() {
                console.log( "ended" );
                App.goto( act, "road" );
                if ( isLast ) {
                    App.goto( act, "road" );
                }
            });

            this.zeega.on("media_timeupdate", this.progress.bind(this));

            this.zeega.on("data_loaded", Chapter.List.create.bind(this));

            console.log( this.zeega );

            // Capture the timeline node for this view.
            this.timeline = $("[data-timeline]");

            // Trick the navigation into opening
            Nav.mousemove({ pageY: 10 });

        },

        control: function( event ) {
            var $elem, control, action, toggles;

            event.preventDefault();

            $elem = $(event.currentTarget);
            control = $elem.data("controls");
            action = controls.player[ control ];
            toggles = controls.toggles[ control ];

            if ( action && this.zeega[ action ] ) {
                // Dispatch the control action (play, pause, cueNext, cuePrev )
                // to the Zeega player that is currently playing
                this.zeega[ action ]();
            }

            // If this is a toggle action, update the UI
            if ( toggles ) {
                $elem.addClass("displaynone");
                $("[data-controls='" + toggles + "']")
                    .removeClass("displaynone");
            }
        },

        jump: function( event ) {
            event.preventDefault();

            this.zeega.cueFrame( $(event.currentTarget).attr("id") );
        },

        progress: function( event ) {
            this.timeline.css({
                width: ((event.current_time / event.duration) * 100) + "%"
            });
        }
    });

    return Story;
});
