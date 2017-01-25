( function() {
    var global = this;

    function Format() {}

    Format.Field = function Field( name ) {
        this.name = name;
    };

    Format.Field.prototype.constructor = Format.Field;

    Format.Field.prototype.toString = function() {
        return this.constructor.name + "(" + this.name + ")";
    };

    global.Format = Format;

    return Format;

} )();