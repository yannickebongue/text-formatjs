/*! text-resources | 0.0.6 | 2017-02-14 */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        global.CurrencyNames = module.require("./currency-names");
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(this, function(global) {
    global.CurrencyNames["en-US"] = {
        USD: "$"
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
    global.FormatData["en-US"] = {
        NumberPatterns: [ "#,##0.###;-#,##0.###", "\xa4#,##0.00;(\xa4#,##0.00)", "#,##0%" ]
    };
    return global.FormatData;
});