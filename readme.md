# openinghours

> Parses a schema.org openingHours string into a human-readable format.

Schema.org [defines a format for open hours](https://schema.org/openingHours). Basically when a store, business, location, etc. is open. It's a useful format for storing in a database as a string and then parsing for various uses.

According to [schema.org]((https://schema.org/openingHours)):

Opening hours can be specified as a weekly time range, starting with days, then times per day. Multiple days can be listed with commas ',' separating each day. Day or time ranges are specified using a hyphen '-'.

- Days are specified using the following two-letter combinations: Mo, Tu, We, Th, Fr, Sa, Su.
- Times are specified using 24:00 time. For example, 3pm is specified as 15:00.
- For example: `Tu,Th 16:00-20:00` corresponds to `Tuesdays and Thursdays 4-8pm`.
- If a business is open 7 days a week, then it can be specified as `Mo-Su`.

One addition I've made to allow multiple sets of openingHours to be included in a single string. This is convenient for storing multiple openingHours in a single column in a database.

## Notes

The format for the `openingHours` string a picky. You can't included extra spaces (e.g. like around the hypen) since spaces are used as a separator.
