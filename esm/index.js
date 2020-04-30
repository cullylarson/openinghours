const defaultOptions = {
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

const trim = x => x.trim()

const normalizeDayCase = x => {
    const letters = x
        .toLowerCase()
        .split('')

    letters[0] = letters[0].toUpperCase()

    return letters.join('')
}

const dayTimeSep = /\s+/

const dayToDetails = dayStr => dayStr
    .trim()
    .split('-')
    .map(normalizeDayCase)

const daysToDetails = daysStr => daysStr
    .trim()
    .split(',')
    .map(dayToDetails)

const hourToDetails = hourStr => hourStr
    .trim()
    .split('-')

const hoursToDetails = hoursStr => {
    if(!hoursStr) return []

    return !hoursStr
        ? []
        : hoursStr
            .trim()
            .split(',')
            .map(hourToDetails)
}

const oneOpeningHoursToDetails = options => openingHours => {
    const [daysStr, hoursStr] = openingHours
        .trim()
        .split(dayTimeSep)
        .map(trim)

    return {
        openingHours: openingHours.trim(),
        days: daysToDetails(daysStr),
        hours: hoursToDetails(hoursStr),
    }
}

export const openingHoursToDetails = (openingHours, options) => {
    options = {...defaultOptions, ...options}

    return openingHours
        .trim()
        .split(options.multiItemSeparator)
        .map(oneOpeningHoursToDetails(options))
}

const formatDay = options => day => {
    return day
        .map(x => options.dayNames[x])
        .join(options.dayRangeSeparator)
}

const formatDays = (options, days) => {
    return days
        .map(formatDay(options))
        .join(options.multiDaySeparator)
}

const padZero = x => x.length === 2 ? x : '0' + x

// eslint-disable-next-line camelcase
const formatHour_h = (options, hour) => {
    const hourInt = parseInt(hour)

    return hourInt < 12
        ? String(hourInt)
        : hourInt === 12
            ? String(hourInt)
            : String(hourInt - 12)
}

// eslint-disable-next-line camelcase
const formatHour_hh = (options, hour) => {
    const hourInt = parseInt(hour)

    return hourInt <= 12
        ? padZero(String(hourInt))
        : padZero(String(hourInt - 12))
}

// eslint-disable-next-line camelcase
const formatHour_H = (_, hour) => {
    const hourInt = parseInt(hour)

    return String(hourInt)
}

// eslint-disable-next-line camelcase
const formatHour_HH = (_, hour) => padZero(hour)

const formatHourToFn = {
    h: formatHour_h,
    hh: formatHour_hh,
    H: formatHour_H,
    HH: formatHour_HH,
}

const isAm = time => {
    const [hour] = time.split(':').map(trim)

    return parseInt(hour) < 12
}

const getAmPm = (options, isFirstInRangeOfSame, hour) => {
    const amPm = isAm(hour) ? options.am : options.pm

    // the format doesn't allow am/pm
    if(!['h', 'hh'].includes(options.hourFormat)) return ''
    else if(isFirstInRangeOfSame) {
        return options.includeFirstAmPmInRangeIfSame
            ? amPm
            : ''
    }
    else {
        return amPm
    }
}

const formatMinutes = (options, minutes) => {
    const minutesInt = parseInt(minutes)

    return minutesInt !== 0 || options.includeZeroMinutes
        ? ':' + minutes
        : ''
}

const formatIndividualHour = (options, isFirstInRangeOfSame, hourStr) => {
    const [hours, minutes = '00'] = hourStr
        .split(':')
        .map(trim)

    const hoursFormatted = formatHourToFn[options.hourFormat]
        ? formatHourToFn[options.hourFormat](options, hours)
        : hours

    return hoursFormatted
        + formatMinutes(options, minutes)
        + getAmPm(options, isFirstInRangeOfSame, hours)
}

const formatHour = options => hour => {
    const hasMulti = hour.length > 1

    // use Set to determine how many unique values of am/pm
    const allSameAmPm = hasMulti && new Set(hour.map(isAm)).size === 1

    return hour
        .map((x, i) => formatIndividualHour(options, allSameAmPm && i === 0, x))
        .join(options.hourRangeSeparator)
}

const formatHours = (options, hours) => {
    return !hours.length
        ? options.allDayTerm
        : hours
            .map(formatHour(options))
            .join(options.multiHourSeparator)
}

const formatOneSet = options => set => {
    return {
        openingHours: set.openingHours,
        human: [formatDays(options, set.days), formatHours(options, set.hours)].join(options.dayHourSeparator),
    }
}

export const openingHoursToHuman = (openingHours, options) => {
    options = {...defaultOptions, ...options}

    return openingHoursToDetails(openingHours, options)
        .map(formatOneSet(options))
}
