define([
    "app"
], function( App ) {
    
    var StoryOverlay;

    StoryOverlay = App.module();

    StoryOverlay.View = Backbone.LayoutView.extend({
        template: "story-overlay",

        className: "story-player",

        events: {
            "click .player-close" : "closeStory",
            "click .back-to-map" : "closeStory",
            "click .next-story" : "closeStory",
            "click .fullscreen" : "goFullScreen",
            "click .share" : "showShareIcons",
            "click .next": "next",
            "click .prev": "prev"
        },

        afterRender: function() {

            if ( !this.player ) {
                this.player = new Zeega.player({
                    controls: false,
                    autoplay: true,
                    target: "#story-zeega-player",
                    url: "/zeegaapi/items/" + this.id,
                    windowRatio: 16/9
                });

                // update share URLs
                this.player.on("sequence_enter", function(info) {
                    $(".share-twitter").attr("href", "https://twitter.com/intent/tweet?original_referer=http://reinventionstories.org/%23story/" + this.id + "&text=Reinvention%20Stories%3A%20" + this.player.project.get( "title" ) + "&url=http://reinventionstories.org/%23story/" + this.id );
                    $(".share-fb").attr("href", "http://www.facebook.com/sharer.php?u=http://reinventionstories.org/%23story/" + this.id );
                    $(".share-email").attr("href", "mailto:friend@example.com?subject=Check out this story on Reinvention Stories!&body=http://reinventionstories.org/%23story/" + this.id );
                }.bind(this) );

                // bind progress bar for playback time display
                this.player.on('media_timeupdate', this.updateTimeline, this );

                // update arrows
                this.player.on("frame_play", this.updateArrowState, this);

                // kill player when App's kill_player event is triggered (when switching to another view)
                App.on( "kill_player", function() {
                    this.player.destroy();
                }.bind(this) );

                this.getNextStoryLink();
            }

        },

        closeStory: function() {
            this.player.destroy();
            this.remove();
        },

        goFullScreen: function() {
            var $playerElem = this.$(".ZEEGA-player").get(0);

            if ($playerElem.requestFullscreen) {
              $playerElem.requestFullscreen();
            } else if ($playerElem.mozRequestFullScreen) {
              $playerElem.mozRequestFullScreen();
            } else if ($playerElem.webkitRequestFullscreen) {
              $playerElem.webkitRequestFullscreen();
            }
        },

        showShareIcons: function(event) {
            this.$(".share .icons").toggle();
        },

        next: function() {
            this.player.cueNext();
            return false;
        },

        prev: function() {
            this.player.cuePrev();
            return false;
        },

        updateArrowState: function( info ) {
            switch(info._connections) {
                case "l":
                    this.activateArrow("prev");
                    this.disableArrow("next");
                    break;
                case "r":
                    this.disableArrow("prev");
                    this.activateArrow("next");
                    break;
                case "lr":
                    this.activateArrow("prev");
                    this.activateArrow("next");
                    break;
                default:
                    this.disableArrow("prev");
                    this.disableArrow("next");
            }
        },

        activateArrow: function(className) {
            this.$("."+ className +".disabled").removeClass("disabled");
        },

        disableArrow: function(className) {
            this.$("."+ className).addClass("disabled");
        },

        updateTimeline: function( info ) {
          var elapsed, duration;

          if ( info.cue_in && info.cue_out ) {
            duration = info.cue_out - info.cue_in;
            elapsed = info.current_time - info.cue_in;
          } else if ( info.cue_out ) {
            duration = info.cue_out;
            elapsed = info.current_time;
          } else {
            duration = info.duration;
            elapsed = info.current_time;
          }

          this.$('.timeline-indicator').css('width', (elapsed / duration * 100) + "%");

        },

        _convertTime: function( seconds ) {
            var m = Math.floor( seconds / 60 );
            var s = Math.floor( seconds % 60 );
            if ( s < 10 ) {
                s = "0" + s;
            }
            return m + ":" + s;
        },

        getNextStoryLink : function() {
            var collection, currentIndex, nextId;

            collection = App.views["map-0"].collection;

            if ( collection.length > 0 ) {
                // collection has fetched already

                // finds the current story model's index in the collection
                currentIndex = collection.indexOf( collection.get( { id: this.id } ) );

                if (currentIndex < (collection.length - 1) ) {
                    nextId = collection.at( currentIndex + 1 ).get("id");
                } else {
                    nextId = null;
                }

                if (nextId !== null) {
                    this.$(".next-story").attr( "href", "/#story/" + nextId ).show();
                }


            } else {

                // if the collection hasn't fetched yet, try again when it has
                collection.bind("reset", this.getNextStoryLink, this );

            }
        }

    });

    return StoryOverlay;
});