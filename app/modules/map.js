define([
    "app",
    "leaflet",
    "modules/icon"
], function( App, L, Icon ) {

    var Map;

    Map = App.module();

    Map.center = [39.749434,-84.195786];

    Map.zeegaCollectionId = 89649;

    Map.Model = Backbone.Model.extend({
        defaults: {
            icon: null,
            latlng: null
        }
    });

    Map.Collection = Backbone.Collection.extend({
        model: Map.Model,
        url: function() {
            return 'zeegaapi/items/' + Map.zeegaCollectionId + "/items";
        },
        parse: function(response) {
            //return response.items[0].child_items;
            return response.items   ;
        }
    });

    Map.View = Backbone.LayoutView.extend({
        template : 'map/basemap',
        afterRender: function() {
            this.leafletMap = L.map('mapView').setView( Map.center, 14 );

            this.collection.fetch({
                success: function(collection, response) {
                    console.log(response);
                    this.createMarkers(collection);
                }.bind(this)
            });

            // add tile layer
            L.tileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-0ik131wz/{z}/{x}/{y}.png').addTo( this.leafletMap );
        },

        createMarkers: function(collection) {

            collection.each( function(item) {
                var latlng, marker, iconTypes, iconLabel, icon;

                // If icon is set, it's already on the map
                if ( item.get( "icon" ) === null ) {

                    // In case lat and lng were undefined, just pick a random point close to the map center
                    latlng = [
                        item.get("media_geo_latitude") ? item.get("media_geo_latitude") : Map.center[0] + ( ( Math.random() * 0.04 ) - 0.02 ),
                        item.get("media_geo_longitude") ? item.get("media_geo_longitude") : Map.center[1] + ( ( Math.random() * 0.04 ) - 0.02 )
                    ];

                    console.log( item.get("media_geo_longitude") );

                    // Parse tags to check for icon to be used
                    iconTypes = _.filter( item.get("tags"), function( tag ){
                        return tag.indexOf("icon-") === 0;
                    });

                    if( iconTypes.length > 0 ){
                        iconLabel = iconTypes[ 0 ].substring( 5 );
                    } else {
                        iconLabel = "stories";
                    }

                    // Generate an Icon based on the label
                    icon = new Icon({ latlng: latlng, use: iconLabel }).addTo( this.leafletMap );

                    // Update the item model, these properties will signify
                    // to later render() calls that these marks do not need
                    // to be rendered to icons
                    item.set({
                        latlng: latlng,
                        icon: icon
                    });

                    icon.on("mouseover", function(event) {
                        var point, popup;

                        point = event.target;

                        point.setStyle({
                            radius: 12
                        });

                        popup = new L.popup({
                            minWidth: 100,
                            maxWidth: 100,
                            closeButton: false,
                            offset: new L.Point(85,11)

                        });
                        
                        popup.setLatLng([ point.getLatLng().lat, point.getLatLng().lng ])
                            .setContent( item.get("title") )
                            .openOn( this.leafletMap );
                        
                    }.bind(this) );

                    icon.on("mouseout", function(e) {
                        this.setStyle({
                            radius: 8
                        });
                    });

                    icon.on("click", function(event){

                        var point = e.target;

                        var story = this.collection.get( point.get("id") );
                            
                        
                        //App.router.navigate("#story/" + story.id, { silent : true });
                        // By binding the click handler here, we create an
                        // upvar for |mark|

                        

                        // Tasks Controlled by this event...
                        //
                        // 1. Remove existing player (unless it is the same story)
                        //
                        // 2. Load a story into a zeega player
                        //
                        //      2.A. If the story is not yet fetched, then wait until it is
                        //
                        // 3. Move the mini-map pointer
                        //
                        //      3.A. Not sure how this is actually going to work?
                        //          The only way to draw these is to use a canvas,
                        //          but the canvas will overlay across the entire
                        //          viewport—which means it will intercept click events.
                        //
                        //

                        // Remove the previously rendered Player
                        // TODO: Make this conditional
                        $(".ZEEGA-player").remove();

                        

                        // If the Story.Model has already been requested.
                        // This is sort of pointless right now since the
                        // |data| property is being rejected by Zeega.player
                        //
                        // TODO: Investigate this failure.
                        //
                        if ( story && story.get("isAvailable") ) {

                            new Zeega.player({
                                controls: {
                                  arrows: true,
                                  playpause: true,
                                  close: false
                                },
                                autoplay: true,
                                // data: story.attributes,
                            
                                //
                                target: "#zeega-player",
                                //
                                //  TODO: Investigate why passing previously requested data
                                //  doesn't work.
                                url: story.url()
                            });

                            $(".surface-player").addClass("center");

                            $(".player-title").text( story.get( "title" ) );

                            $(".share-twitter").attr("href", "https://twitter.com/intent/tweet?original_referer=http://sonictrace.org/%23story/" + story.get("id") + "&text=Sonic%20Trace%3A%20" + story.get( "title" ) + "&url=http://sonictrace.org/%23story/" + story.get( "id" ) );
                            $(".share-fb").attr("href", "http://www.facebook.com/sharer.php?u=http://sonictrace.org/%23story/" + story.get("id") );
                            $(".share-email").attr("href", "mailto:friend@example.com?subject=Check out this story on Sonic Trace!&body=http://sonictrace.org/%23story/" + story.get("id") );


                        }

                    });

                }


            }.bind(this) );
        }
    });


    return Map;
});
