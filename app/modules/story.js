define([
    "app",
    "modules/chapter",
    "modules/nav",
    "modules/data",
    "modules/time"

], function( App, ChapterMenu, Nav, Data, time ) {

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
                Abstract.merge( story, Data.from("stories").byId( story.id ), {
                    zeega: null
                })
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

            // The zeega player and timeline are rendered
            // during the afterRender phase of the view.
            // this.zeega is a reference to this.model.get("zeega")
            this.zeega = this.model.get("zeega");
            this.timeline = null;
        },

        beforeRender: function() {
            console.log( "Story.Views.Item: beforeRender" );
        },

        afterRender: function() {
            // http://alpha.zeega.org/74868
            // http://alpha.zeega.org/__ID__
            var config, id, act, data, isLast, $timeline, createChapterMenu;

            config = {
                target: "#reinvention-story",
                autoplay: true,
                cover: "vertical",
                windowRatio: 16/9,
                debugEvents: true
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



            if ( !this.zeega ) {
                // Initialize a new Zeega.player instance with the |config| objecr
                this.zeega = new Zeega.player( config );

                this.zeega.on("frame_rendered", function( frame ) {
                    this.showHide.showBriefly();
                    $(".chapter").removeClass("active").filter("#" + frame.id).addClass("active");
                }.bind(this));

                this.zeega.on("deadend_frame", function() {
                    isLast = true;
                });

                this.zeega.on("ended", function() {
                    if ( isLast ) {
                        App.goto( act, "road" );
                        isLast = false;
                    }
                });

                $timeline = $("[data-timeline]");

                this.zeega.on("media_timeupdate", function( frame ) {
                    // Update the window-width progress bar
                    $timeline.css({
                        width: (frame.current_time / frame.duration) * 100 + "%"
                    });

                    // Update the current time display for this chapter/frame
                    $(".chapter.active [data-time]").html( time.smpte(frame.current_time) );
                }.bind(this));

                this.model.set({
                    zeega: this.zeega
                });

            } else {
                // Previously rendered Zeega player layout elements can
                // be directly appended.
                $("#reinvention-story").append(this.zeega.Layout.el);
            }



            createChapterMenu = function() {
                this.menu = new ChapterMenu( act, this.zeega.getProjectData() );

                this.$el.find(".acts-chapters").html(
                    this.menu.html
                );
            }.bind(this);

            // TODO: Now that this works correctly, DRY-out and refactor
            if ( data ) {
                createChapterMenu();
            } else {
                this.zeega.on("data_loaded", createChapterMenu );
            }

            // Trick the navigation into opening
            Nav.mousemove({ pageY: 10 });

            // todo: unbind when leaving view
            _.bindAll(this, "showHide.mousemove");
            App.DOM.$body.on('mousemove', this.showHide.mousemove);
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

            // Pause the currently playing frame.
            //this.zeega.pause();

            // Cue a jump to the frame being requested
            this.zeega.cueFrame( $(event.currentTarget).attr("id") );

            // Once that frame is rendered, play the frame.
            /*
            this.zeega.on("frame_rendered", function() {
                console.log('frame_rendered bound after jump function');
                this.zeega.play();
            }.bind(this));
            */
        },

        // handle mouse movement to open/close bottom chapter nav
        showHide: (function() {
            var chapterNavHidden = false,
                hideAfter = 3000, // how long after triggering to hide chapter nav
                hideTimer,
                mousemove = function(e) {
                    var windowDims = {
                            x: window.innerWidth,
                            y: window.innerHeight
                        },
                        pxFromBottom = windowDims.y - e.pageY,
                        triggerHeight = 50; // how many pixels at the bottom of the screen trigger the nav

                        if (pxFromBottom < triggerHeight && chapterNavHidden) {
                            clearTimeout(hideTimer);
                            showChapterNav();
                        } else if (pxFromBottom > triggerHeight && !chapterNavHidden) {
                            hideTimer = setTimeout(hideChapterNav, hideAfter);
                        }

                },

                showBriefly = function() {
                    showChapterNav();
                    hideTimer = setTimeout(hideChapterNav, hideAfter);
                };

                showChapterNav = function() {
                    chapterNavHidden = false;

                    this.$("#reinvention-story-controls").stop().animate({
                        opacity: 1
                    }, 500);
                    this.$("#act-bug").stop().animate({
                        opacity: 0
                    }, 500);

                },

                hideChapterNav = function() {
                    chapterNavHidden = true;

                    this.$("#reinvention-story-controls").stop().animate({
                        opacity: 0
                    }, 500);
                    this.$("#act-bug").stop().animate({
                        opacity: 1
                    }, 500);
                };

            return {
                mousemove: mousemove,
                showBriefly: showBriefly
            };
        }())

        // ,

        // progress: function( event ) {
        //     this.timeline.width(
        //         event.current_time / event.duration * 720
        //       );


        //     this.timeline.css({
        //         width: ((event.current_time / event.duration) * 100) + "%"
        //     });
        // }
    });


    // TODO: Define Chapter here, similar to the way Answers are defined for reststops

    return Story;
});
