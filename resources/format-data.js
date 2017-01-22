( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.FormatData = {
        "": {
            "MonthNames": [ "January", "February", "March", "April", "May",
                "June", "July", "August", "September",
                "October", "November", "December", "" ],
            "MonthAbbreviations": [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct", "Nov", "Dec", "" ],
            "DayNames": [ "Sunday", "Monday", "Tuesday", "Wednesday",
                "Thursday", "Friday", "Saturday" ],
            "DayAbbreviations": [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
            "AmPmMarkers": [ "AM", "PM" ],
            "Eras": [ "BC", "AD" ],
            "NumberPatterns": [ "#,##0.###;-#,##0.###", "\u00a4 #,##0.00;-\u00a4 #,##0.00", "#,##0%" ],
            "NumberElements": [ ".", ",", ";", "%", "0", "#", "-", "E", "\u2030", "\u221e", "\ufffd" ],
            "DateTimePatterns": [ "h:mm:ss a z", "h:mm:ss a z", "h:mm:ss a", "h:mm a",
                "EEEE, MMMM d, yyyy", "MMMM d, yyyy",
                "MMM d, yyyy", "M/d/yy", "{1} {0}" ],
            "DateTimePatternChars": "GyMdkHmsSEDFwWahKzZ"
        }
    };

    return global.FormatData;

} ) );
