define([
    "app"

], function( App ) {

    var Reststop;

    Reststop = App.module();

    Reststop.Model = Backbone.Model.extend({
        defaults: {
            isAvailable: false,

            // |profiles| is an object of data pro
            profiles: null
        },
        // ,
        // url: function() {
            // return "http://alpha.zeega.org/api/items/" + this.id;
        // },
        // parse: function( obj ) {
        //     var data = obj.items[ 0 ];

        //     // API requests are coming up empty handed :(
        //     if ( !data ) {
        //         console.warn(
        //             "Zeega API failed to respond with project data. Requested from: ", this.url()
        //         );
        //     }


        //     return data;
        // },
        initialize: function() {
            // Push all new Reststop.Model instances into
            // the Reststop.Items collection
            Reststop.Items.add( this );
        }
    });

    Reststop.Collection = Backbone.Collection.extend({
        model: Reststop.Model
    });

    // Keep
    Reststop.Items = new Reststop.Collection();


    return Reststop;
});
