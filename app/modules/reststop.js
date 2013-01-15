define([
    "app",
    "dom",
    "moment",

    "json!data/reststops.json"

], function( App, DOM, moment, reststops ) {

    var Reststop,
        TWITTER_USER = "jquerybot";

    Reststop = App.module();

    Reststop.templates = {
        post: _.template("<div class='post'><div class='body'><%=text%></div><div class='name'><%=from_user_name%></div>|<div class='date'><%=created_at%></div></div>")
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
            this.model = Reststop.Items.get( config.id );
        },

        afterRender: function() {
            $.ajax({
                type: "GET",
                url: "http://search.twitter.com/search.json?q=" + TWITTER_USER + "&rpp=100&result_type=recent&callback=?",
                dataType: "jsonp",
                success: function( data ) {
                    console.log( data );
                    data.results.filter( isValid ).slice(0, 25).forEach( draw );

                    console.log( data.results.filter( isValid ) );
                }
            });
        }
    });

    // TEMPORARY IMPLEMENTATION
    //
    // TODO: Refactor this to a constructor
    //
    //
    function isValid( tweet ) {
        return tweet.from_user.toLowerCase() === TWITTER_USER &&
            [ "RT", "@" ].every(function( prefix ) {
                return tweet.text.indexOf( prefix ) === -1;
            });
    }
    function draw( tweet ) {
        var $div, $reststop, color, size, coords, style;

        $reststop = $("#reinvention-reststop");
        $div = $("<div>");
        color = "magenta";
        size = 50;
        coords = {
            x: ( Math.random() * ( (DOM.doc.width() - 300) - 20 ) + 20 ).toFixed(),
            y: ( Math.random() * ( (DOM.doc.height() - 150) - 110 ) + 110 ).toFixed()
        };
        style = {
            position: "absolute",
            left: coords.x + "px",
            top: coords.y + "px",
            display: "none",
            width: 50 + "px",
            height: size + "px",
            backgroundColor: color,
            opacity: 0.25,
            zIndex: 995
        };

        $div.css( style );
        $div.appendTo( $reststop ).fadeIn( 100 ).delay( 1000 ).animate({
            opacity: 0.25
        }, 400 );

        $div.on("mouseover mouseleave", function( event ) {

            if ( event.type === "mouseover" ) {

                $(this).css({ zIndex: 999 }).animate({
                    width: "300px",
                    height: "150px",
                    opacity: 1
                }, 200, function() {

                    // TODO: Refactor to use template
                    $(this).html(
                        Reststop.templates.post(
                            Abstract.merge({}, tweet, {

                                created_at: moment( new Date( tweet.created_at ) ).from(
                                    moment( new Date() )
                                )

                            })
                        )
                    );
                });

            } else {
                $(this).empty().animate( style, 400, function() {
                    $(this).empty();
                });
            }
        });
    }



    return Reststop;
});
