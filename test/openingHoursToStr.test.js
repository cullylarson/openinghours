import {openingHoursToHuman} from '../esm/'

test('Handles an empty string well.', () => {
    expect(openingHoursToHuman('')).toEqual([])
})

test('Handles non-string values well.', () => {
    expect(openingHoursToHuman(false)).toEqual([])
    expect(openingHoursToHuman(0)).toEqual([])
    expect(openingHoursToHuman(null)).toEqual([])
    expect(openingHoursToHuman(undefined)).toEqual([])
    expect(openingHoursToHuman({a: 'A'})).toEqual([])
    expect(openingHoursToHuman([1, 2])).toEqual([])
})

// Useful to handle these in case someone uses this library to parse a string as someone is typing
test('Handles malformed values well.', () => {
    const result = openingHoursToHuman('Mo;')
    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday all day')

    const result2 = openingHoursToHuman('Mo;  ')
    expect(result2.length).toBe(1)
    expect(result2[0].human).toEqual('Monday all day')

    const result3 = openingHoursToHuman('Mo-')
    expect(result3.length).toBe(1)
    expect(result3[0].human).toEqual('Monday all day')

    const result4 = openingHoursToHuman('Mo 8-')
    expect(result4.length).toBe(1)
    expect(result4[0].human).toEqual('Monday 8 a.m.')

    const result5 = openingHoursToHuman('Mo-Fr 8:00-17:30; Sa 9:00-')
    expect(result5.length).toBe(2)
    expect(result5[0].human).toEqual('Monday - Friday 8 a.m. - 5:30 p.m.')
    expect(result5[1].human).toEqual('Saturday 9 a.m.')

    const result6 = openingHoursToHuman('Mo 8:')
    expect(result6.length).toBe(1)
    expect(result6[0].human).toEqual('Monday 8 a.m.')

    // zero-pads minutes
    const result7 = openingHoursToHuman('Mo 8:3')
    expect(result7.length).toBe(1)
    expect(result7[0].human).toEqual('Monday 8:30 a.m.')

    // gets rid of invalid days
    const result8 = openingHoursToHuman('Mo-W 8')
    expect(result8.length).toBe(1)
    expect(result8[0].human).toEqual('Monday 8 a.m.')

    // gets rid of invalid days
    const result9 = openingHoursToHuman('M')
    expect(result9.length).toBe(1)
    expect(result9[0].human).toEqual('')
})

test('Formats a single day with no time.', () => {
    const result = openingHoursToHuman('Mo')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday all day')
})

test('Formats a single day and time.', () => {
    const result = openingHoursToHuman('Mo 2:00')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 2 a.m.')
})

test('Formats a single day and time with no minutes.', () => {
    const result = openingHoursToHuman('Mo 2')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 2 a.m.')
})

test('Formats a multiple days.', () => {
    const result = openingHoursToHuman('Mo,Tu 2:00-8:00')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday, Tuesday 2 - 8 a.m.')
})

test('Formats a multiple days with a range.', () => {
    const result = openingHoursToHuman('Mo,We,Fr-Su 2:00-8:00')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday, Wednesday, Friday - Sunday 2 - 8 a.m.')
})

test('Formats a multiple days and hours with ranges.', () => {
    const result = openingHoursToHuman('Mo,We,Fr-Su 1:00,3:00-8:00,13:01-13:05')

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday, Wednesday, Friday - Sunday 1 a.m., 3 - 8 a.m., 1:01 - 1:05 p.m.')
})

test('Does not include first am/pm if includeFirstAmPmInRangeIfSame is false.', () => {
    const result = openingHoursToHuman('Mo 6-8', {
        includeFirstAmPmInRangeIfSame: false,
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 6 - 8 a.m.')
})

test('Does include first am/pm if includeFirstAmPmInRangeIfSame is true.', () => {
    const result = openingHoursToHuman('Mo 6-8', {
        includeFirstAmPmInRangeIfSame: true,
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 6 a.m. - 8 a.m.')
})

test('Always includes am/pm if not range, no matter includeFirstAmPmInRangeIfSame.', () => {
    const result1 = openingHoursToHuman('Mo 8', {
        includeFirstAmPmInRangeIfSame: true,
    })

    const result2 = openingHoursToHuman('Mo 8', {
        includeFirstAmPmInRangeIfSame: false,
    })

    expect(result1[0].human).toEqual('Monday 8 a.m.')
    expect(result2[0].human).toEqual('Monday 8 a.m.')
})

test('Gets details for a complext day and time string.', () => {
    const result = openingHoursToHuman('Mo-Tu 8:10-16:25,17:00-18:07; We,Fr 12:05-14:05; Th-Fr,Sa 6:03-7:30; Su')

    expect(result.length).toBe(4)
    expect(result[0].openingHours).toEqual('Mo-Tu 8:10-16:25,17:00-18:07')
    expect(result[0].human).toEqual('Monday - Tuesday 8:10 a.m. - 4:25 p.m., 5 - 6:07 p.m.')
    expect(result[1].openingHours).toEqual('We,Fr 12:05-14:05')
    expect(result[1].human).toEqual('Wednesday, Friday 12:05 - 2:05 p.m.')
    expect(result[2].openingHours).toEqual('Th-Fr,Sa 6:03-7:30')
    expect(result[2].human).toEqual('Thursday - Friday, Saturday 6:03 - 7:30 a.m.')
    expect(result[3].openingHours).toEqual('Su')
    expect(result[3].human).toEqual('Sunday all day')
})

test('Formats hours using "h" format.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        hourFormat: 'h',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 9 a.m. - 5 p.m.')
})

test('Formats hours using "hh" format.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        hourFormat: 'hh',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 09 a.m. - 05 p.m.')
})

test('Includes zero minutes if includeZeroMinutes', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        includeZeroMinutes: true,
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 9:00 a.m. - 5:00 p.m.')
})

test('Formats hours using "H" format.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        hourFormat: 'H',
        includeZeroMinutes: true,
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 9:00 - 17:00')
})

test('Formats hours using "HH" format.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        hourFormat: 'HH',
        includeZeroMinutes: true,
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 09:00 - 17:00')
})

test('Uses custom AM.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        am: 'AM',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 9AM - 5 p.m.')
})

test('Uses custom PM.', () => {
    const result = openingHoursToHuman('Mo 9:00-17:00', {
        pm: 'PM',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday 9 a.m. - 5PM')
})

test('Uses custom allDayTerm.', () => {
    const result = openingHoursToHuman('Mo', {
        allDayTerm: 'the whole day',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday the whole day')
})

test('Uses custom dayNames.', () => {
    const result = openingHoursToHuman('Mo 1-3; Tu; We 9:00-13:00; Th; Fr; Sa; Su 14:00-19:34', {
        dayNames: {
            Mo: 'Mon',
            Tu: 'Tue',
            We: 'Wed',
            Th: 'Thu',
            Fr: 'Fri',
            Sa: 'Sat',
            Su: 'Sun',
        },
    })

    expect(result.length).toBe(7)
    expect(result[0].human).toEqual('Mon 1 - 3 a.m.')
    expect(result[1].human).toEqual('Tue all day')
    expect(result[2].human).toEqual('Wed 9 a.m. - 1 p.m.')
    expect(result[3].human).toEqual('Thu all day')
    expect(result[4].human).toEqual('Fri all day')
    expect(result[5].human).toEqual('Sat all day')
    expect(result[6].human).toEqual('Sun 2 - 7:34 p.m.')
})

test('Uses custom dayHourSeparator.', () => {
    const result = openingHoursToHuman('Mo 1-3', {
        dayHourSeparator: ': ',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday: 1 - 3 a.m.')
})

test('Uses custom multiDaySeparator.', () => {
    const result = openingHoursToHuman('Mo,Tu 1-3', {
        multiDaySeparator: ' | ',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday | Tuesday 1 - 3 a.m.')
})

test('Uses custom dayRangeSeparator.', () => {
    const result = openingHoursToHuman('Mo-We 1-3', {
        dayRangeSeparator: '...',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday...Wednesday 1 - 3 a.m.')
})

test('Uses custom hourRangeSeparator.', () => {
    const result = openingHoursToHuman('Mo-We 1-3', {
        hourRangeSeparator: '...',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday - Wednesday 1...3 a.m.')
})

test('Uses custom multiHourSeparator.', () => {
    const result = openingHoursToHuman('Mo-We 1-3,5-13', {
        multiHourSeparator: ' | ',
    })

    expect(result.length).toBe(1)
    expect(result[0].human).toEqual('Monday - Wednesday 1 - 3 a.m. | 5 a.m. - 1 p.m.')
})
