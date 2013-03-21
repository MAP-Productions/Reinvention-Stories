define([
    "app",
    "modules/userstory",
    "modules/videopos",
    "progress"
], function( App, UserStory, VideoPos, ProgressCircle ) {

    var Contribute;

    Contribute = App.module();


    Contribute.View = Backbone.LayoutView.extend({
        template: "contribute/contribute",

        className: "contribute-view",

        afterRender: function() {
            var $bg = this.$(".contribute-bg"), imageData;

            VideoPos.positionVideo( $bg );
            
            App.DOM.$window.on( "resize", function() {
                VideoPos.positionVideo( $bg );
            });

            // create new user story model
            this.storyModel = new UserStory.Model();

            // create array to store uploaded image URLs
            this.imageUrls = [];

            // setup loading spinner
            this.spinner = new ProgressCircle({
                canvas: this.$("#contribute-loading-pie").get(0),
                minRadius: 0, // Inner radius of the innermost circle
                arcWidth: 30, // Width of each circle
                gapWidth: 0, // Space between adjacent circles
                centerX: 53, // X coordinate of the circle center
                centerY: 53 // Y coordinate of the circle center
            });

            this.bindCharCounters();

        },

        events: {
            "click .next" : "validateSection",
            "click .prev" : "prevSection",
            "change .add-photo input" : "imageUpload"
        },

        bindCharCounters: function() {
            this.$("textarea").on("keyup", function(e) {
                var chars = $(this).val().length;
                
                $(this)
                    .parents(".content")
                    .siblings(".char-count")
                    .find(".chars").text( chars );

            });
        },

        validateSection: function() {
            var activeSection = this.$(".active-section"),
                activeId = activeSection.attr("id"),
                inputs = activeSection.find("input[type='text'], textarea"),
                valid = true;

            inputs.each( function(i,v) {
                if ( $(this).val().length === 0 ) {
                    $(this).addClass("invalid");
                    valid = false;
                } else {
                    $(this).removeClass("invalid");
                }
            });

            if ( valid ) {
                if ( activeSection .hasClass("last-section") ) {
                    // on the last section, submit
                   this.submitStory();
                } else {
                    // not on the last section, go to next section
                    this.nextSection();
                }
            }
            
        },

        nextSection: function() {
            var current = this.$(".active-section"),
                next = current.next(".contribute-section"),
                windowWidth = App.DOM.$body.width();

            // send the current section off to the left of the screen
            current.removeClass("active-section").animate( {
                left: windowWidth * -1
            }, function() {
                $(this).hide();
            } );

            // position the next section to the right of the viewport and make it visible
            next.addClass("active-section").css({
                left: windowWidth
            }).show();

            // slide the next section into position
            next.animate( {
                left: 0
            } );

            this.updateNavAndArrows();

        },

        prevSection: function() {
            var current = this.$(".active-section"),
                prev = current.prev(".contribute-section"),
                windowWidth = App.DOM.$body.width();

            // We need to check if there is anything previons in case they
            // hit the previous arrow very fast while it is fading out.
            if ( prev.length > 0) {

                // send the current section off to the right of the screen
                current.removeClass("active-section").animate( {
                    left: windowWidth
                }, function() {
                    $(this).hide();
                } );

                // position the next section to the left of the viewport and make it visible
                prev.addClass("active-section").css({
                    left: windowWidth * -1
                }).show();

                // slide the next section into position
                prev.animate( {
                    left: 0
                } );

                this.updateNavAndArrows();

            }
        },

        updateNavAndArrows: function() {
            var index = this.$(".active-section").index(".contribute-section");

            // show or hide previous arrow (next arrow is used for submission, so it stays always)
            if ( this.$(".active-section").prev(".contribute-section").length > 0 ) {
                this.$(".prev").fadeIn();
            } else {
                this.$(".prev").fadeOut();
            }

            // activate the correct section name in the list
            this.$(".contribute-nav li").eq( index ).addClass("active")
                .siblings().removeClass("active");


        },

        imageUpload: function(event) {
            var fileInput = event.target, imageData;
            
            imageData = new FormData();
            
            imageData.append( "file", fileInput.files[0] );

            $.ajax({
                url: "upload/upload.php",
                data: imageData,
                dataType: "json",
                processData: false,
                contentType: false,
                type: 'POST',
                success: function( data ) {

                    $(fileInput).parent('span').css({
                        "background-image" : "url(" + data.url + ")",
                        "background-size" : "cover"
                    });
                    this.imageUrls[ $(fileInput).index("input[type='file']") ] = data.url;

                    console.log(this.imageUrls);
                }.bind(this)
            });
        },

        submitStory: function() {

            this.showLoading();

            this.storyModel.setTitle( this.$("#storyname").val() );
            this.storyModel.setAuthor( this.$("#name").val() );
            this.storyModel.setNeighborhood( this.$("#from").val() );
            this.storyModel.setStory( 0, this.$("#whowereyou").val() );
            this.storyModel.setStory( 1, this.$("#whathappened").val() );
            this.storyModel.setStory( 2, this.$("#whoareyounow").val() );

            _.each(this.imageUrls, function( value, index ) {
                this.storyModel.setImage( index, value );
            }.bind(this) );

            this.storyModel.save( {}, {
                success: function() {
                    this.showThanks();
                }.bind(this)
            });

        },

        showLoading: function() {
            var timeAtStart = new Date().getTime();

            this.$(".loading-overlay").show();

            // start progress spinner
            this.spinner.addEntry({
                fillColor: 'rgba(255, 0, 137, 0.75)',
                progressListener: function() {
                    var elapsed =  new Date().getTime() - timeAtStart;

                    return (elapsed % 1500) / 1500;
                }
            });

            this.spinner.start(33);
        },

        hideLoading: function() {
            this.spinner.stop();
            this.$(".loading-overlay").hide();
        },

        showThanks: function(model, response, options) {
            this.hideLoading();
            //console.log("Zeega created. ID is " + response.items[0].id + "." );
            console.log( response );
            this.$(".loading-overlay").hide();
            this.$(".active-section").fadeOut();
            this.$(".arrow").fadeOut();
            this.$(".contribute-thanks").fadeIn();
        }

    });

    return Contribute;
});
