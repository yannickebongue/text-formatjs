( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.FormatData[ "en" ] = {
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "\u00a4#,##0.00;-\u00a4#,##0.00",
            "#,##0%" ],
        "DateTimePatternChars": "GyMdkHmsSEDFwWahKzZ"
    };

    return global.FormatData[ "en" ];

} ) );
