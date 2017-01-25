( function() {
    var global = this;

    global.FormatData[ "fr" ] = {
        "MonthNames": [ "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre",
            "novembre", "décembre", "" ],
        "MonthAbbreviations": [ "janv.", "févr.", "mars", "avr.", "mai", "juin",
            "juil.", "août", "sept.", "oct.", "nov.",
            "déc.", "" ],
        "DayNames": [ "dimanche", "lundi", "mardi", "mercredi", "jeudi",
            "vendredi", "samedi" ],
        "DayAbbreviations": [ "dim.", "lun.", "mar.", "mer.", "jeu.", "ven.",
            "sam." ],
        "Eras": [ "BC", "ap. J.-C." ],
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "#,##0.00 \u00A4;-#,##0.00 \u00A4",
            "#,##0 %" ],
        "NumberElements": [ ",", "\u00a0", ";", "%", "0", "#", "-", "E", "\u2030", "\u221e", "\ufffd" ],
        "DateTimePatterns": [ "HH' h 'mm z", "HH:mm:ss z", "HH:mm:ss", "HH:mm",
            "EEEE d MMMM yyyy", "d MMMM yyyy",
            "d MMM yyyy", "dd/MM/yy", "{1} {0}" ],
        "DateTimePatternChars": "GaMjkHmsSEDFwWxhKzZ"
    };

    return global.FormatData[ "fr" ];

} )();
