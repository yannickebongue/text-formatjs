/*! text-resources | 0.0.6 | 2017-02-14 */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.CalendarData = module.require("./calendar-data");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.CalendarData["en-GB"] = {
        firstDayOfWeek: "2",
        minimalDaysInFirstWeek: "4"
    };
    return global.CalendarData;
});

(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.CurrencyNames = module.require("./currency-names");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.CurrencyNames["en-GB"] = {
        EUR: "\u20ac",
        GBP: "\xa3"
    };
    return global.CurrencyNames;
});

(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.FormatData = module.require("./format-data");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.FormatData["en-GB"] = {
        DateTimePatterns: [ "HH:mm:ss 'o''clock' z", "HH:mm:ss z", "HH:mm:ss", "HH:mm", "EEEE, d MMMM yyyy", "dd MMMM yyyy", "dd-MMM-yyyy", "dd/MM/yy", "{1} {0}" ],
        DateTimePatternChars: "GyMdkHmsSEDFwWahKzZ"
    };
    return global.FormatData;
});