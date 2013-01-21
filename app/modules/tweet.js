require([],

function() {

    var Tweet;

    /*
    Documents...


    https://dev.twitter.com/discussions/2877
    https://dev.twitter.com/docs/intents
    https://dev.twitter.com/docs/intents/events




    "text"
    Pre-prepared, properly UTF-8 & percent-encoded Tweet body text. Users will still be able to edit the pre-prepared text. This field has a potential of 140 characters maximum, but consider the implications of other parameters like url and via.

    var encoded = encodeURIComponent("This is a valid tweet");


    Open: "https://twitter.com/intent/tweet?text=" + encoded;


    ISSUES/NOTES

    - Current __JavaScript__ API (Tweet Intents) doesn't allow a client
        to post from an arbitrary user (on behalf of ...?).

        This directly contradicts the feature needed for posting from "Reststop"


    - JS Client shortcomings may be resolved with a server proxy


     */


    return {};
});
