define([
    "app",
    "modules/nav",
    "modules/videopos",
    "progress"
], function( App, Nav, VideoPos, ProgressCircle ) {

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
            var $video, $audio, $videoEl, pieCanvas, progressPie, timeAtStart, introDelay;

            introDelay = App.firstVisit() ? 7000 : 1000;

            $video = Popcorn("#reinvention-intro video");
            $audio = Popcorn("#reinvention-intro audio");

            $loaderEl = $("#reinvention-intro .loader");
            $videoEl = $("#reinvention-intro video");

            // todo: break pie stuff out
            timeAtStart = new Date().getTime();
            console.log(timeAtStart);

            pieCanvas = this.$("#pie").get(0);

            progressPie = new ProgressCircle({
                canvas: pieCanvas,
                minRadius: 0, // Inner radius of the innermost circle
                arcWidth: 30, // Width of each circle
                gapWidth: 0, // Space between adjacent circles
                centerX: 53, // X coordinate of the circle center
                centerY: 53 // Y coordinate of the circle center
            });

            progressPie.addEntry({
                fillColor: 'rgba(255, 0, 137, 0.75)',
                progressListener: function() {
                    var currentTime = new Date().getTime(),
                        elapsed = currentTime - timeAtStart;
                        console.log(elapsed);

                        if (elapsed >= introDelay) {
                            progressPie.stop();
                            return 1;
                        }

                    return elapsed / introDelay; // between 0 and 1
                }
            });

            progressPie.start(33);


            // when video is ready to play, fade out the loader and play
            // delay if if it your first visit determined by App.firstVisit()
            // TODO: animate the loader circle
            $video.on("canplaythrough", function() {

                _.delay( function() {
                    $loaderEl.fadeOut(1000);

                    $videoEl.animate({
                        opacity: 1
                    }, 1000, function() {
                        $video.play();
                    });
                }, introDelay );
            });

            function skipIntro() {
                App.goto( 1, "story" );
            }

            // Set up "Skip Intro" from 8s-12s.
            // Jump when the video ends.
            $video.register({
                start: 8,
                end: 12,
                onStart: function() {
                    this.on( "click", skipIntro );
                },
                onEnd: function() {
                    this.off( "click", skipIntro );
                }
            }).on( "ended", skipIntro );

            // Begin playing the Billboard loop at 1:10 (70s)
            $video.cue( 70, function() {
                $audio.play();
            });

            // Pause the intro video at 1:11 (71s)
            $video.cue( 71, function() {
                $video.pause();

                // Any single mousemovement will restart the video
                // and stop the looping audio
                App.DOM.$body.one("mousemove", function() {

                    // animate video to full-bleed
                    VideoPos.positionVideo($videoEl, { animate: true });
                    // this class will ensure full-bleed video positioning is retained on window resize
                    $videoEl.addClass("full-bleed");

                    $video.play();
                    $audio.volumeOut( 500, function() {
                        this.pause();
                    });
                } );
            });

            this.centerIntroVideo();

            App.DOM.$window.on("resize", function() {
                this.centerIntroVideo();
            }.bind(this) );

            // Trick the navigation to hidden state.
            Nav.mousemove({ pageY: 101 });
        },

        centerIntroVideo: function() {
            if ( !this.$el.find("video").hasClass("full-bleed") ) {
                // if the video hasn't been set to full-bleed, set
                // the correct margins to pull the video into the center
                this.$el.find("video").css({
                    marginLeft: "-" + (parseInt( this.$el.css("width"), 10 ) / 4) + "px",
                    marginTop: "-" + (parseInt( this.$el.css("height"), 10 ) / 4) + "px"
                });
            }
        }
    });

    Intro.Items.add({ id: 1 });

    return Intro;
});
