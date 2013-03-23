define([
    "app",
    "leaflet",
    "modules/icon",
    "modules/tumblr"
], function( App, L, Icon, Tumblr ) {

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
            return response.items;
        }
    });

    Map.View = Backbone.LayoutView.extend({
        template : 'map/basemap',
        afterRender: function() {
            var tumblrNewsView;

            this.leafletMap = L.map('mapView').setView( Map.center, 14 );

            this.collection.fetch({
                success: function(collection, response) {
                    console.log(response);
                    this.createMarkers(collection);
                }.bind(this)
            });

            // add tile layer
            L.tileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-0ik131wz/{z}/{x}/{y}.png').addTo( this.leafletMap );

            // add tumblr feed view
            tumblrNewsView = new Tumblr.View();
            this.insertView("", tumblrNewsView);
            tumblrNewsView.render();
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
                        e.target.setStyle({
                            radius: 8
                        });
                        this.leafletMap.closePopup();
                    }.bind(this) );

                    icon.on("click", function(event){

                        App.router.navigate("#story/" + item.get("id"), { trigger : true } );


                    });

                }


            }.bind(this) );
        }
    });


    return Map;
});
