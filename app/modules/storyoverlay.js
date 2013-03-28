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
            "click .fullscreen" : "goFullScreen",
            "click .share" : "showShareIcons"
        },

        afterRender: function() {
            this.player = new Zeega.player({
                controls: {
                    arrows: true,
                    playpause: true,
                    close: false
                },
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

            // kill player when App's kill_player event is triggered (when switching to another view)
            App.on( "kill_player", function() {
                this.player.destroy();
            }.bind(this) );

            $(".story-player").fadeIn();

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
        }

    });

    return StoryOverlay;
});