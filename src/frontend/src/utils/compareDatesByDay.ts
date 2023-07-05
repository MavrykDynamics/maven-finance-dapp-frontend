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
