/*! text-resources | 0.0.6 | 2017-02-14 */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.CalendarData = module.require("./calendar-data");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.CalendarData["es-ES"] = {
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
    global.CurrencyNames["es-ES"] = {
        ESP: "Pts",
        EUR: "\u20ac"
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
    global.FormatData["es-ES"] = {
        NumberPatterns: [ "#,##0.###;-#,##0.###", "#,##0 \xa4;-#,##0 \xa4", "#,##0%" ]
    };
    return global.FormatData;
});