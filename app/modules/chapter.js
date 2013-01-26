define([
    "app",
    "modules/act",
    "modules/story",
    "modules/time",
    "text!templates/chapter/list.html"
], function( App, Act, Story, time, list ) {

    function getChapters( project ) {
        return project.frames.map(function( frame ) {
            return {
                id: frame.id,
                title: frame.layers[0].attr.title,
                cue_out: frame.layers[0].attr.cue_out,
                smpte: time.smpte(frame.layers[0].attr.cue_out)
            };
        });
    }

    function ChapterMenu( act, project ) {
        this.act = act;
        this.chapters = getChapters( project );
        this.duration = time.smpte(
            this.chapters.reduce(function( val, chap ) {
                return val + chap.cue_out;
            }, 0)
        );

        this.html = ChapterMenu.template( this );

        ChapterMenu.Rendered.push( this );
    }

    ChapterMenu.template = _.template( list );
    ChapterMenu.Rendered = [];

    return ChapterMenu;
});
