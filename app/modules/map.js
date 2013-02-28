define([
    "app",
    "leaflet"
], function( App, L ) {

    var Map;

    Map = App.module();

    Map.zeegaCollectionId = 53567; // temp AMM data

    Map.Model = Backbone.Model.extend({
        defaults: {
            "thumbnail_url" : "http:\/\/static.zeega.org\/community\/items\/0\/41337\/502d0dd2ddb07.jpg",
            "media_geo_latitude" : 39.749434,
            "media_geo_longitude" : -84.195786
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
            //this.leafletMap = L.map('mapView').setView([39.749434,-84.195786], 13);
            this.leafletMap = L.map('mapView').setView([30.262626,-97.739182], 13); // temp just so we can see our temp data

            this.collection.fetch({
                success: function(collection, response) {
                    console.log(response);
                    this.plotCollection(collection);
                }.bind(this)
            });

            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo( this.leafletMap );
        },

        plotCollection: function(collection) { // we must pass in context as this is called from the response of the collection's fetch
            console.log("THIS" + this);
            collection.each( function(item) {
                console.log(item);
                var marker, placeInfo;

                placeInfo = {
                    lat: item.get('media_geo_latitude'),
                    long: item.get('media_geo_longitude'),
                    image: item.get("thumbnail_url")
                };

                marker = new L.marker( [ placeInfo.lat, placeInfo.long ] ).addTo( this.leafletMap );

                marker.bindPopup("<img src='" + placeInfo.image + "' width='144' height='144'>");
            }.bind(this) );
        }
    });


    return Map;
});
