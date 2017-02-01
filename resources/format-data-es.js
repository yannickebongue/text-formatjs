( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.FormatData = module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.FormatData[ "es" ] = {
        "MonthNames": [ "enero", "febrero", "marzo", "abril", "mayo",
            "junio", "julio", "agosto", "septiembre",
            "octubre", "noviembre", "diciembre", "" ],
        "MonthAbbreviations": [ "ene", "feb", "mar", "abr", "may", "jun", "jul",
            "ago", "sep", "oct", "nov", "dic", "" ],
        "DayNames": [ "domingo", "lunes", "martes", "miércoles", "jueves",
            "viernes", "sábado" ],
        "DayAbbreviations": [ "dom", "lun", "mar", "mié", "jue", "vie", "sáb" ],
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "\u00A4#,##0.00;(\u00A4#,##0.00)",
            "#,##0%" ],
        "NumberElements": [ ",", ".", ";", "%", "0", "#", "-", "E", "\u2030", "\u221e", "\ufffd" ],
        "DateTimePatterns": [ "HH'H'mm'' z", "H:mm:ss z", "H:mm:ss", "H:mm",
            "EEEE d' de 'MMMM' de 'yyyy",
            "d' de 'MMMM' de 'yyyy", "dd-MMM-yyyy",
            "d/MM/yy", "{1} {0}" ],
        "DateTimePatternChars": "GyMdkHmsSEDFwWahKzZ"
    };

    return global.FormatData;

} );
