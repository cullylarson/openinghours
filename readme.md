# openinghours

> Parses a schema.org openingHours string into a human-readable format.

```
npm install @cullylarson/openinghours
```

```
import {openingHoursToHuman} from '@cullylarson/openinghours'

console.log(openingHoursToHuman('Mo-Fr 9:00-17:00')[0].human)
// Monday - Friday 9 a.m. - 5 p.m.
```

```
import {openingHoursToHuman} from '@cullylarson/openinghours'

export default () => {
    const results = openingHoursToHuman('Mo-Fr 9:00-17:00')

    return (
        <>
            results.map(result => (<time itemprop="openingHours" datetime={result.openingHours}>{result.human}</time>))
        </>
    )
}
```

Schema.org [defines a format for open hours](https://schema.org/openingHours). Basically when a store, business, location, etc. is open. It's a useful format for storing in a database as a string and then parsing for various uses.

According to [schema.org]((https://schema.org/openingHours)):

Opening hours can be specified as a weekly time range, starting with days, then times per day. Multiple days can be listed with commas ',' separating each day. Day or time ranges are specified using a hyphen '-'.

- Days are specified using the following two-letter combinations: Mo, Tu, We, Th, Fr, Sa, Su.
- Times are specified using 24:00 time. For example, 3pm is specified as 15:00.
- For example: `Tu,Th 16:00-20:00` corresponds to `Tuesday and Thursday 4-8pm`.
- If a business is open 7 days a week, then it can be specified as `Mo-Su`.

One addition I've made is to allow multiple sets of openingHours to be included in a single string. This is convenient for storing multiple openingHours in a single column in a database.

## Notes

1. The format for the `openingHours` string is picky. You can't included extra spaces (e.g. like around the hypen) since spaces are used as a separator. For example, this doesn't work `Mo-Fr 8:00 - 17:00` because of the spaces around the hyphens in the time portion of the string. It should be: `Mo-Fr 8:00-17:00`

1. I don't know if the schema.org spec allows for this, but this library allows you to not include the zero padding on the hour and it allows you to leave out the minutes (will assume they are `00`). For example, `Mo 8-17` would still parse to `Monday 8 a.m. - 5 p.m.`.

## Usage:

### openingHoursToHuman

A couple examples with an explanation after.

**Example 1:**

```
import {openingHoursToHuman} from '@cullylarson/openinghours'

const results = openingHoursToHuman('Mo-Fr 9:00-17:00')
```

Would produce:

```
[
  {
    "openingHours": "Mo-Fr 9:00-17:00",
    "human": "Monday - Friday 9 a.m. - 5 p.m."
  }
]
```

**Example 2:**

```
import {openingHoursToHuman} from '@cullylarson/openinghours'

const results = openingHoursToHuman('Mo 1-3; Tu; We 9:00-13:00; Th; Fr; Sa; Su 14:00-19:34')
```

Would produce:

```
[
  {
    "openingHours": "Mo 1-3",
    "human": "Mon 1 - 3 a.m."
  },
  {
    "openingHours": "Tu",
    "human": "Tue all day"
  },
  {
    "openingHours": "We 9:00-13:00",
    "human": "Wed 9 a.m. - 1 p.m."
  },
  {
    "openingHours": "Th",
    "human": "Thu all day"
  },
  {
    "openingHours": "Fr",
    "human": "Fri all day"
  },
  {
    "openingHours": "Sa",
    "human": "Sat all day"
  },
  {
    "openingHours": "Su 14:00-19:34",
    "human": "Sun 2 - 7:34 p.m."
  }
]
```

Notice that each "set" of openingHours (i.e. separatored by `;`) gets its own item in the results array. Each item in the array has `openingHours` (the original openingHours string that produced the result) and `human` (the human-readable version of the openingHours string).

### openingHoursToDetails

Parses the openingHours string and produces a result as an object, rather than a human-readable string. Useful if you want to pull specific data out. It is used by the `openingHoursToHuman` function. It is not currently documented or directly tested (just indirectly by testing `openingHoursToHuman`).

```
import {openingHoursToDetails} from '@cullylarson/openinghours'

const results = openingHoursToDetails('Mo 1-3; Tu; We 9:00-13:00; Th; Fr; Sa; Su 14:00-19:34')
```

## Options:

Here are the default options. See [test/openingHoursToStr.test.js](test/openingHoursToStr.test.js) for examples.

```
{
    dayNames: {
        Mo: 'Monday',
        Tu: 'Tuesday',
        We: 'Wednesday',
        Th: 'Thursday',
        Fr: 'Friday',
        Sa: 'Saturday',
        Su: 'Sunday',
    },
    am: ' a.m.',
    pm: ' p.m.',
    hourFormat: 'h',
    includeZeroMinutes: false,
    includeFirstAmPmInRangeIfSame: false,
    allDayTerm: 'all day',
    multiItemSeparator: ';',
    dayHourSeparator: ' ',
    multiDaySeparator: ', ',
    dayRangeSeparator: ' - ',
    multiHourSeparator: ', ',
    hourRangeSeparator: ' - ',
}
```

### dayNames

Use to change the names of the human-readable days produced.

### am, pm

Change the value of the human-radable am/pm string produced. Set to empty string to turn off am/pm.

### hourFormat

Can be one of the following:

- **h** — 1, 2, ..., 11, 12
- **hh** — 01, 02, ..., 11, 12
- **H** — 0, 1, 2, ..., 23. No am/pm is added to this format. You may want to set `includeZeroMinutes` to true for this format.
- **HH** — 00, 01, 02, ..., 23. No am/pm is added to this format. You may want to set `includeZeroMinutes` to true for this format.

### includeZeroMinutes

Whether to include the minutes if they are zero. For example, if set to true you might get somethign like `8:00 a.m.`. If set to false, will get `8 a.m.`.

### includeFirstAmPmInRangeIfSame

Whether to include am/pm on the first item in a range if both items have the same am/pm value. For example, if set to true, a range might look like: `2 - 4 p.m.`. If set to false, the same range would be: `2 p.m. - 4 p.m.`.

This has no effect on the am/pm if the am/pm values are the different for each value (e.g. `9 a.m. - 5 p.m.`, the am/pm for both will always be incldued).

### allDayTerm

If no hour range is provided, will output this text. For example: `Mo` would produce `Monday all day`.

### multiItemSeparator

If you want to allow multiple openingHours items to be included in a single string, this is the separator. For example: `Mo 1:00-3:00; We 9:00-13:00`. This is the separator in the openingHours string; it has not affect on the format of the human-readable output.

### dayHourSeparator

The separator string used between the day and hour values. For example, if set to ` from `, might produce: `Monday - Friday from 9 a.m. - 5 p.m.`

### multiDaySeparator

If multiple days are provided in the openingHours string, this is the separator used between them. For example, if openingHours is `Mo, We, Fr 6-8`, and the `multiDaySeparator` is set to ` and `, woudl produce: `Monday and Wednesday and Friday 6 - 8 a.m.`.

### dayRangeSeparator

If a day range is provided in the openingHours string, this is the separator used between them. For example, if openingHours is `Mo-Fr 6-8`, and the `dayRangeSeparator` is set to ` to `, would produce: `Monday to Friday 6 - 8 a.m.`.

### multiHourSeparator

If multiple hours are provided in the openingHours string, this is the separator used between them. For example, if openingHours is `Mo 6,9`, and the `multiHourSeparator` is set to ` and `, woudl produce: `Monday 6 a.m. and 8 a.m.`.

### hourRangeSeparator

If an hour range is provided in the openingHours string, this is the separator used between them. For example, if openingHours is `Mo 6-8`, and the `hourRangeSeparator` is set to ` to `, would produce: `Monday 6 to 8 a.m.`.
