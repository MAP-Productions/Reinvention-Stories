define([
    "app",

    "modules/data"


], function( App, Data ) {

    var UserStory;

    UserStory = App.module();
    
    UserStory.zeegaUrl = "/post.php";

    UserStory.Model = Backbone.Model.extend({

        initialize: function() {
            this.set(
                Data.from("userstory").byIndex( 0 )
            );
        },

        url: function() {
            return UserStory.zeegaUrl;
        },

        setTitle: function( title ) {
            var content, newContent;

            //retrieve template
            content = $(this.get("text").layers[ 0 ].attr.content);
            
            //update template content with neighborhood
            content.html(title);

            //retrieve html and update user story data
            newContent = content.wrap("<div/>").parent().html();
            this.attributes.text.layers[ 0 ].attr.content = newContent;

        },
        
        setAuthor: function( author ) {
            var content, newContent;

            //retrieve template
            content = $(this.get("text").layers[ 1 ].attr.content);
            
            //update template content with neighborhood
            content.html(author);

            //retrieve html and update user story data
            newContent = content.wrap("<div/>").parent().html();
            this.attributes.text.layers[ 1 ].attr.content = newContent;

        },

        setNeighborhood: function( neighborhood ) {
            var content, newContent;

            //retrieve template
            content = $(this.get("text").layers[ 2 ].attr.content);
            
            //update template content with neighborhood
            content.html(neighborhood);

            //retrieve html and update user story data
            newContent = content.wrap("<div/>").parent().html();
            this.attributes.text.layers[ 2 ].attr.content = newContent;

        },

        // index starts at 0
        setStory: function( index, story ) {
            
            var startIndex = 3,
                content, newContent;

            //retrieve template
            content = $(this.get("text").layers[ startIndex + index ].attr.content);
            
            //update template content with neighborhood
            content.html( story );

            //retrieve html and update user story data
            newContent = content.wrap("<div/>").parent().html();
            this.attributes.text.layers[ startIndex + index ].attr.content = newContent;

        },

        // index starts at 0
        setImage: function ( index, url ) {
            //image layers are indexed at 6,7,8
            var startIndex = 6;

            // set all subsequent image layers to use same image
            // allows for upload of 1, 2 or 3 distinct images
            for( var i = 0; i++; i < 3 - index ) {
                this.attributes.text.layers[ index + startIndex ].attr.uri = url;
                this.attributes.text.layers[ index + startIndex ].attr.attribution_uri = url;
            }
        },

        // adds email to project description for use by Project admin
        setEmail: function ( email ) {
            this.set( "description" , email );

        }



    });


    return UserStory;
});
