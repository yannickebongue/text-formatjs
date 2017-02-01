( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.FormatData = module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.FormatData[ "it" ] = {
        "MonthNames": [ "gennaio", "febbraio", "marzo", "aprile", "maggio",
            "giugno", "luglio", "agosto", "settembre",
            "ottobre", "novembre", "dicembre", "" ],
        "MonthAbbreviations": [ "gen", "feb", "mar", "apr", "mag", "giu", "lug",
            "ago", "set", "ott", "nov", "dic", "" ],
        "DayNames": [ "domenica", "lunedì", "martedì", "mercoledì",
            "giovedì", "venerdì", "sabato" ],
        "DayAbbreviations": [ "dom", "lun", "mar", "mer", "gio", "ven", "sab" ],
        "Eras": [ "BC", "dopo Cristo" ],
        "NumberElements": [ ",", ".", ";", "%", "0", "#", "-", "E", "\u2030", "\u221e", "\ufffd" ],
        "DateTimePatterns": [ "H.mm.ss z", "H.mm.ss z", "H.mm.ss", "H.mm",
            "EEEE d MMMM yyyy", "d MMMM yyyy",
            "d-MMM-yyyy", "dd/MM/yy", "{1} {0}" ],
        "DateTimePatternChars": "GyMdkHmsSEDFwWahKzZ"
    };

    return global.FormatData;

} );
