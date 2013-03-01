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
            "thumbnail_url" : "http:\/\/static.zeega.org\/community\/items\/0\/41337\/502d0dd2ddb07.jpg",   
            "media_geo_latitude" : Map.center[0],
            "media_geo_longitude" : Map.center[1]
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

        createMarkers: function(collection) { // we must pass in context as this is called from the response of the collection's fetch

            collection.each( function(item) {
                var latlng, marker, iconTypes, iconLabel, icon;

                 // In case lat and lng are undefined, just pick a random point close to the center
                latlng = [
                    item.get('media_geo_latitude') ? item.get('media_geo_latitude') : Map.center[0] + ( ( Math.random() * 0.04 ) - 0.02 ),
                    item.get('media_geo_longitude') ? item.get('media_geo_longitude') : Map.center[1] + ( ( Math.random() * 0.04 ) - 0.02 )
                ];

                console.log( "get icon!", item.get("icon") );

                // Figure out which icon to use
                if ( !item.get( "icon" ) ) {

                    // Parse tags to check for icon to be used
                    iconTypes = _.filter( item.get("tags"), function( tag ){
                        return tag.indexOf("icon-") === 0;
                    });

                    if( iconTypes.length > 0 ){
                        iconLabel = iconTypes[ 0 ].substring( 5 );
                    } else {
                        iconLabel = "standard";
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

                    icon.bindPopup("<img src='" + item.get("thumbnail_url") + "' width='144' height='144'>");
                }


            }.bind(this) );
        }
    });


    return Map;
});
