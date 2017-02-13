# Text Format

[![npm Version][npm-badge]][npm]

`text-formatjs` is a javascript library for formatting locale-sensitive information such as dates, messages and numbers.

`text-formatjs` defines a programming interface for formatting locale-sensitive objects into `String`s (the `format` method) and for parsing `String`s back into objects (the `parse` method). The library provides a set of javascript modules based on java classes defined in `java.text` and `java.util` packages.

Here we have the most important javascript modules to be used for formatting data:

 - `locale`: Represents a specific geografical, political or cultural region.
 - `format`: The base module for formatting locale-sensitive information.
 - `number-format`: The base module for formatting numbers.
 - `decimal-format`: Extends the `number-format` module for formatting decimal numbers.
 - `choice-format`: Allows you to attach a format to a range of numbers. It is generally used in a `Message-format` for handling plurals.
 - `date-format`: The base module for date/time formatting submodules which formats and parses dates or time in a language-independent manner.
 - `simple-date-format`: A `date-format` module for formatting and parsing dates in a locale-sensitive manner.
 - `message-format`: Provides a means to produce concatenated messages in a language-neutral way. To be used to construct messages displayed for end users.

There are also other modules provided to help the formats module to complete their functionalities:

 - `resource-bundle`: Implements the logic to return resource bundle files provided by the [`text-resources`][text-resources-npm] library.
 - `currency`: Represents a currency identified by its ISO 4217 currency code.
 - `field-position`: A simple module used by `format` and its submodules to identify fields in formatted output.
 - `parse-position`: A simple module used by `format` and its submodules to keep track of the current position during parsing.
 - `date-format-symbols`: A module for encapsulating localizable date-time formatting data, such as the names of the months, the names of the days of the week, and the time zone data.
 - `decimal-format-symbols`: Represents the set of symbols (such as the decimal separator, the grouping separator, and so on) needed by DecimalFormat to format numbers.

## Installation

### Loading text-formatjs in a browser

```html
<!-- text-resources for default locale -->
<script src="path/to/text-resources/text-resources.js"></script>

<!-- text-resources for specific locale (Optional) -->
<script src="path/to/text-resources/text-resources-en.js"></script>
<script src="path/to/text-resources/text-resources-en-GB.js"></script>
<script src="path/to/text-resources/text-resources-en-US.js"></script>
<script src="path/to/text-resources/text-resources-fr.js"></script>
<script src="path/to/text-resources/text-resources-fr-FR.js"></script>

<!-- text-formatjs library -->
<script src="path/to/text-formatjs/text-format.js"></script>
```

### Loading text-formatjs in Node.js

```javascript
require("text-formatjs");
```

_Note: This call will load the text resources for all the supported language of the current release of the `text-resources` library_

## Usage

After loading the text-formatjs library, a set of javascript objects are available in the global context.

### Formatting numbers

Use the `NumberFormat` object method factory:

```javascript
NumberFormat.getInstance().format(12436.736);       // -> '12,436.736'
NumberFormat.getCurrencyInstance().format(1500);    // -> '$1,500.00'
NumberFormat.getIntegerInstance().format(0.75);     // -> '1'
NumberFormat.getPercentInstance().format(0.6);      // -> '60%'
```

Create a new `DecimalFormat` object instance:

```javascript
new DecimalFormat("#,##0.###").format(12.345678);   // -> '12.346'
new DecimalFormat("#,##0%").format(1/3);            // -> '33%'
new DecimalFormat("\u00A4#,##0.00;(\u00A4#,##0.00")
    .format(-35);                                   // -> '($35.00)'
```

### Formatting dates and times

Use the `DateFormat` object factory:

```javascript
DateFormat.getInstance().format(new Date());        // -> '2/3/17 4:55:20 PM'
DateFormat.getDateInstance().format(new Date());    // -> 'Feb 3, 2017'
DateFormat.getTimeInstance().format(new Date());    // -> '4:55:20 PM'
DateFormat.getDateTimeInstance()
    .format(new Date());                            // -> 'Feb 3, 2017 4:55:20 PM'
```

Create a new `SimpleDateFormat` object instance:

```javascript
new SimpleDateFormat("M/d/yy").format(new Date());  // -> '2/3/17'
new SimpleDateFormat("EEEE, MMMM d, yyyy")
    .format(new Date());                            // -> 'Friday, February 3, 2017'
new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    .format(new Date());                            // -> '2017-02-03T17:09:08.779+01:00'
```

### Formatting messages

Example 1

```javascript
var planet = 7;
var event = "a disturbance in the Force";
MessageFormat.format(
    "At {1,time} on {1,date}, there was {2} on planet {0,number,integer}.",
    planet, new Date(), event);

// -> 'At 9:05:47 PM on Feb 3, 2017, there was a disturbance in the Force on planet 7.'
```

Example 2

```javascript
var form = new MessageFormat( "The disk \"{1}\" contains {0}.", new Locale( "en", "US" ) );
var fileLimits = [ 0, 1, 2 ];
var fileParts = [ "no files", "one file", "{0,number} files" ];
var fileForm = new ChoiceFormat( fileLimits, fileParts );
var fileCounts = [ 0, 1, 2, 3, 1273 ];
form.setFormatByArgumentIndex( 0, fileForm );
fileCounts.forEach( function( fileCount ) {
    form.format( [ fileCount, "MyDisk" ] );
} );

// -> 'The disk "MyDisk" contains no files.'
// -> 'The disk "MyDisk" contains one file.'
// -> 'The disk "MyDisk" contains 2 files.'
// -> 'The disk "MyDisk" contains 3 files.'
// -> 'The disk "MyDisk" contains 1,273 files.'
```

## Learn more

For further information about how to use the text-formatjs library, see

 - The Java Tutorials > Internationalization > Formatting  
 <http://docs.oracle.com/javase/tutorial/i18n/format/index.html>
 
## License

Copyright (c) 2016 Yannick Ebongue

Released under the MIT License (see [LICENSE.txt](LICENSE.txt))


[npm]: https://www.npmjs.org/package/text-formatjs
[npm-badge]: https://img.shields.io/npm/v/text-formatjs.svg?style=flat-square
[text-resources-npm]: https://www.npmjs.org/package/text-resources

