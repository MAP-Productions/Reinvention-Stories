define([
    "app"

], function( App ) {

    var Profile = App.module();

    {
        icon,

    }
    Profile.Model = Backbone.Model.extend({
        defaults: {
            icon: null,
            time: null,
            media: null,

            // Reference to the Street.Model
            street: null
        },
        initialize: function() {
            // Push all new Profile.Model instances into
            // the Profile.Items collection
            Profiles.Items.add( this );

            this.set( "isAvailable", true );
        }
    });

    Profile.Collection = Backbone.Collection.extend({
        model: Profile.Model
    });

    Profile.Items = new Profile.Collection();

    // Profile.Items.from( array )
    //  array of ids
    //  array of objects with id property
    //
    Profile.Items.from = function( marks ) {
        if ( marks.length ) {
            marks.forEach(function( Profile ) {
                // Do some param hockey... this let's us get away with
                // passing either an array of ids or an array of objects
                // with a single id property, set to the value of the
                // matching Profile marker
                Profile = typeof Profile === "object" ?
                    Profile : { id: Profile };

                ( new Profile.Model(Profile) ).fetch();
            });
        }
    };

    return Profile;
});
