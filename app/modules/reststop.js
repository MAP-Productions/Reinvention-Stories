define([
    "app",
    "dom",
    "moment",

    "json!data/reststops.json",
    "text!templates/reststop/answer.html"

], function( App, DOM, moment, reststops, answer ) {

    var Reststop,
        priv = new WeakMap(),
        TWITTER_USER = "rwaldron";

    Reststop = App.module();

    Reststop.templates = {
        answer: _.template( answer )
    };

    // TODO:
    //
    // Refactor this and roadById into a single
    // abstract lookup function.
    function restById( id ) {
        var i = 0,
            length = reststops.length;

        for ( ; i < length; i++ ) {
            if ( reststops[ i ].id === id ) {
                return reststops[ i ];
            }
        }
        return null;
    }

    Reststop.Model = Backbone.Model.extend({
        defaults: {
            id: null,
            profiles: null
        },

        initialize: function( reststop ) {
            this.set(
                _.extend( reststop, restById( reststop.id ) )
            );
            console.log( this );
            Reststop.Items.add( this );
        }
    });

    Reststop.Collection = Backbone.Collection.extend({
        model: Reststop.Model
    });

    Reststop.Items = new Reststop.Collection();

    Reststop.Views.Item = Backbone.View.extend({
        manage: true,

        template: "reststop/item",

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( config ) {
            console.log( "Reststop.Views.Item: initialize" );
            this.model = Reststop.Items.get( config.id );
        },

        afterRender: function() {
            var id, interval;

            id = $("#reinvention-reststop").data("view");

            // Request tweets every 20s
            interval = setInterval(function() {
                if ( $("#reinvention-reststop").data("view") !== id ) {
                    clearInterval(interval);
                } else {
                    Answer.request();
                }
            }, 2e5);

            // Initial request...
            Answer.request();
        }
    });


    function Answer( tweet ) {
        // Add this tweet's id to the known set of valid ids.
        // ... This will be used to prevent duplicates in the future.
        Answer.isValid.knownIds.add( tweet.id );

        //  TODO: make the resttop an arbitrary element from an arbtrary selector
        this.$reststop = $("#reinvention-reststop");
        this.$point = $("<div>");
        this.coords = {
            x: ( Math.random() * ( (DOM.doc.width() - 300) - 20 ) + 20 ).toFixed(),
            y: ( Math.random() * ( (DOM.doc.height() - 150) - 110 ) + 110 ).toFixed()
        };
        this.style = {
            left: this.coords.x + "px",
            top: this.coords.y + "px",
            zIndex: 995
        };

        this.$point.css( this.style ).addClass( "reststop-point" );

        this.$point.appendTo( this.$reststop ).delay( 1000 ).animate({
            opacity: 0.25
        }, 200 );


        this.created = moment(
            new Date( tweet.created_at )
        );

        this.$answer = $(
            $.parseHTML(
                Reststop.templates.answer( tweet ).trim()
            )
        ).css( this.style );


        this.$point.on("mouseover mouseleave click", function( event ) {

            if ( event.type === "click" ) {
                this.reveal();

            } else {
                this.$point.show();

                this.$point.finish().animate({
                    opacity: event.type === "mouseover" ? 1 : 0.25
                }, 200);
            }
        }.bind(this));

        // Save a private copy of the tweet data
        priv.set( this, Abstract.assign({}, tweet) );

        Answer.Rendered.push( this.$answer );
    }

    Answer.prototype.reveal = function() {
        // console.log( Answer.Rendered.length );
        console.log( priv.get( this ) );

        // Hide Other answers
        Answer.Rendered.forEach(function( answer ) {
            if ( answer !== this.$answer ) {
                answer.fadeOut( 200 , function() {
                    answer.remove();
                });
            }
        }, this );

        this.$answer.appendTo( this.$reststop ).fadeIn();

        return this;
    };

    // Cache of all jQuery object
    Answer.Rendered = [];


    Answer.isValid = function( tweet ) {
        return !Answer.isValid.knownIds.has( tweet.id );// &&
        //     [ "RT", "@" ].every(function( prefix ) {
        //         return tweet.text.indexOf( prefix ) === -1;
        //     });
    };

    Answer.isValid.knownIds = new Set();

    Answer.request = function() {
        return $.ajax({
            type: "GET",
            url: "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=" + TWITTER_USER + "&count=20&callback=?",
            dataType: "jsonp",
            success: function( data ) {
                // console.log( data );
                data.filter( Answer.isValid ).slice(0, 25).forEach( Answer.create );
            }
        });
    };

    Answer.create = function( tweet ) {
        return new Answer( tweet );
    };


    return Reststop;
});
