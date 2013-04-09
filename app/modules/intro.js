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

        serialize: function() {
            return {
                model: this.model
            };
        },

        events: {
            "click .skip-intro" : "skipIntro"
        },

        canPlay: false,

        initialize: function( config ) {
            this.model = Intro.Items.get( config.id );
            this.model.hash = Math.floor(Math.random()*1000) + "";
        },

        afterRender: function() {
            var $videoEl, $skipLink;

            clearTimeout( this.introTimer );

            //introDelay = App.firstVisit() ? 7000 : 1000;
            introDelay = 4000;

            this.$video = Popcorn("#reinvention-intro video");

            this.$loaderEl = this.$(".loader");
            this.$videoEl = this.$("video");
            this.$skipLink = this.$(".skip-intro");

            this.spinLoader();

            // when video is ready to play, fade out the loader and play
            // delay if if it your first visit determined by App.firstVisit()
            // TODO: animate the loader circle
            if ( this.canPlay ) {
                this.startVideo();
            } else {
                this.$video.on("canplaythrough", function() {
                    this.startVideo();
                }.bind(this) );
            }
            
            this.$video.cue( 56.5, function() {
                    VideoPos.positionVideo($videoEl, { animate: true });
                    // this class will ensure full-bleed video positioning is retained on window resize
                    this.$videoEl.addClass("full-bleed");
            });

            // Go to the first act when the intro is over.
            this.$video.on("ended", function() {
                App.goto( 1, "story" );
            });

            this.centerIntroVideo();

            App.DOM.$window.on("resize", function() {
                this.centerIntroVideo();
            }.bind(this) );

            App.on("kill_player", this.quitIntro, this);

            // Trick the navigation to hidden state.
            Nav.mousemove({ pageY: 101 });
        },

        startVideo: function() {
            this.canPlay = true;

            this.introTimer = setTimeout( function() {

                this.$loaderEl.fadeOut(1000, function() {
                    this.progressPie.stop();
                }.bind(this));
                this.$skipLink.fadeIn(1000);

                this.$videoEl.animate({
                    opacity: 1
                }, 1000, function() {
                    if (App.isCurrent( 1, "intro" ) ) {
                        this.$video.play();
                    }
                }.bind( this) );

            }.bind(this) , introDelay );

        },

        quitIntro: function() {
            clearTimeout( this.introTimer );
            // no idea why this works but if the video hasn't played it won't work upon returning to the view.
            // (readystate would be 0 forever)
            this.$video.play().destroy();
            delete( this.$video );
            App.off("kill_player", this.quitIntro, this);
        },

        spinLoader: function() {
            var pieCanvas, timeAtStart, introDelay;

            timeAtStart = new Date().getTime();

            pieCanvas = this.$("#intro-loading-pie").get(0);

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

        centerIntroVideo: function() {
            if ( !this.$el.find("video").hasClass("full-bleed") ) {
                // if the video hasn't been set to full-bleed, set
                // the correct margins to pull the video into the center
                this.$el.find("video").css({
                    marginLeft: "-" + (parseInt( this.$el.css("width"), 10 ) / 4) + "px",
                    marginTop: "-" + (parseInt( this.$el.css("height"), 10 ) / 4) + "px"
                });
            }
        },

        skipIntro: function() {
            App.goto( 1, "story" );
        }
    });

    Intro.Items.add({ id: 1 });

    return Intro;
});
