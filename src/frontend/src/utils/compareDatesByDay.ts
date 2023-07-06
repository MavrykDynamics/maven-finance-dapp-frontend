/**
 * Compare two dates without time (ex. Wed Jul 05 2023 14:12:59 === Wed Jul 05 2023 16:12:59 ==> true)
 * @param date1 - the first date
 * @param date2 - the second date
 * @returns "1" if date1 > date 2 | "-1" if date1 < date2 | "0" if date1 === date2 
 */
export const compareDatesByDay = (date1: Date, date2: Date) => {
  const day1 = date1.getDate()
  const month1 = date1.getMonth()
  const year1 = date1.getFullYear()

  const day2 = date2.getDate()
  const month2 = date2.getMonth()
  const year2 = date2.getFullYear()

  if (year1 !== year2) {
    return year1 - year2
  }
  if (month1 !== month2) {
    return month1 - month2
  }
  return day1 - day2
}
