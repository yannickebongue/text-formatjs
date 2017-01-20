( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.FormatData[ "en-GB" ] = {
        "DateTimePatterns": [ "HH:mm:ss 'o''clock' z", "HH:mm:ss z", "HH:mm:ss",
            "HH:mm", "EEEE, d MMMM yyyy", "dd MMMM yyyy",
            "dd-MMM-yyyy", "dd/MM/yy", "{1} {0}" ],
        "DateTimePatternChars": "GyMdkHmsSEDFwWahKzZ"
    };

    return global.FormatData[ "en-GB" ];

} ) );
