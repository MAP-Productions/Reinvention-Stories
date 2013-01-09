define([
    "app"

], function( App ) {

    var Story = App.module();

    Story.Model = Backbone.Model.extend({
        defaults: {
            isAvailable: false
        },
        url: function() {
            return "http://alpha.zeega.org/api/items/" + this.id;
        },
        parse: function( obj ) {
            var data = obj.items[ 0 ];

            // API requests are coming up empty handed :(
            if ( !data ) {
                console.warn(
                    "Zeega API failed to respond with project data. Requested from: ", this.url()
                );
            }


            return data;
        },
        initialize: function() {
            // Push all new Story.Model instances into
            // the Story.Items collection
            Story.Items.add( this );

            this.set( "isAvailable", true );
        }
    });

    Story.Collection = Backbone.Collection.extend({
        model: Story.Model
    });

    Story.Items = new Story.Collection();

    // Story.Items.from( array )
    //  array of ids
    //  array of objects with id property
    //
    Story.Items.from = function( marks ) {
        if ( marks.length ) {
            marks.forEach(function( story ) {
                // Do some param hockey... this let's us get away with
                // passing either an array of ids or an array of objects
                // with a single id property, set to the value of the
                // matching story marker
                story = typeof story === "object" ?
                    story : { id: story };

                ( new Story.Model(story) ).fetch();
            });
        }
    };

    return Story;
});
