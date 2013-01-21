define([
    "app",
    "tweet",
    "moment",

    "modules/data",
    "text!templates/reststop/answer.html"

], function( App, Tweet, Moment, Data, answer ) {

    var Reststop,
        TWITTER_USER = "rwaldron";

    Reststop = App.module();

    Reststop.templates = {
        answer: _.template( answer )
    };

    Reststop.Model = Backbone.Model.extend({
        defaults: {
            id: null,
            // The view is preloaded to the first question
            question: 0,
            type: "reststop"
        },

        initialize: function( reststop ) {
            this.set(
                Abstract.merge( reststop, Data.from("reststops").byId( reststop.id ) )
            );
            this.collection.add( this );
        }
    });

    Reststop.Collection = Backbone.Collection.extend({
        model: Reststop.Model
    });

    Reststop.Items = new Reststop.Collection();

    Reststop.Model.prototype.collection = Reststop.Items;

    Reststop.Views.Item = Backbone.View.extend({
        manage: true,

        template: "reststop/item",

        events: {
            "click [name='shuffle']": "ask",
            "submit #reststop-question-form": "submit"
        },

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( config ) {
            this.model = Reststop.Items.get( config.id );
        },

        beforeRender: function() {
            console.log( "Reststop.Views.Item: beforeRender" );
            Answer.isValid.knownIds = new Set();
        },
        afterRender: function() {
            var interval = setInterval(function() {
                // If the current view |id| has change
                if ( App.isCurrent( this ) ) {
                    clearInterval(interval);
                } else {
                    Answer.request();
                }
            }.bind(this), 2e5);

            // Make an initial request for existing answer submissions
            Answer.request();

            this.ask();
        },

        submit: function( event ) {
            event.preventDefault();

            console.log( "submit the form" );
        },

        ask: function() {
            var questions, current, index;

            questions = this.model.get("questions");
            current = this.model.get("question");
            index = (function() {
                var k = 0;

                do {
                    k = Math.round( Math.random() * questions.length - 1 );
                } while ( k === current );

                return k;
            }());

            if ( !questions[ index ] ) {
                index = 0;
            }

            this.model.set( "question", index );

            $(".reststop-question h1").html(
                questions[ index ]
            );
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
            x: ( Math.random() * ( (App.DOM.$document.width() - 475) - 20 ) + 20 ).toFixed(),
            y: ( Math.random() * ( (App.DOM.$document.height() - 200) - 110 ) + 110 ).toFixed()
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


        this.created = Moment(
            new Date( tweet.created_at )
        );

        this.$answer = $(
            $.parseHTML(
                Reststop.templates.answer(
                    Abstract.merge({}, tweet, {
                        relative: this.created.from( Date.now() ),
                        formal: this.created.format("MMMM D, YYYY")
                    })
                ).trim()
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

        Answer.Rendered.push( this.$answer );
    }

    Answer.prototype.conceal = function( options ) {
        Answer.conceal( options );

        return this;
    };

    Answer.prototype.reveal = function() {
        this.conceal({ except: this.$answer });

        this.$answer.appendTo( this.$reststop ).fadeIn();

        return this;
    };

    // Cache of all jQuery objects
    Answer.Rendered = [];

    // Validation for tweets
    Answer.isValid = function( tweet ) {
        return !Answer.isValid.knownIds.has( tweet.id );
    };

    Answer.conceal = function( options ) {
        options = options || {};
        options.except = options.except ?
            (Array.isArray(options.except) ? options.except : [ options.except ]) :
            [];

        Answer.Rendered.forEach(function( answer ) {
            if ( options.except.indexOf( answer ) === -1 ) {
                answer.fadeOut( 200 , function() {
                    answer.remove();
                });
            }
        }, this );
    };


    // Use by Answer.isValid to filter already-seen tweets
    Answer.isValid.knownIds = new Set();

    // Request tweets from twitter API. These are used to
    // populate the reststop view with mousesensitive "points"
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

    // Answer factory
    Answer.create = function( tweet ) {
        return new Answer( tweet );
    };

    return Reststop;
});
