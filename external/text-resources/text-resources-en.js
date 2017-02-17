/*! text-resources | 0.0.6 | 2017-02-14 */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.CalendarData = module.require("./calendar-data");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.CalendarData["en"] = {};
    return global.CalendarData;
});

(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.FormatData = module.require("./format-data");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.FormatData["en"] = {
        NumberPatterns: [ "#,##0.###;-#,##0.###", "\xa4#,##0.00;-\xa4#,##0.00", "#,##0%" ],
        DateTimePatternChars: "GyMdkHmsSEDFwWahKzZ"
    };
    return global.FormatData;
});

(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.LocaleNames = module.require("./locale-names");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.LocaleNames["en"] = {};
    return global.LocaleNames;
});