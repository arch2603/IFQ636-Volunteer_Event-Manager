export const formatTime = time => {
  if (!time) return ''
  const [hourText, minutes] = time.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const dispHour = hour % 12 || 12
  return `${dispHour}:${minutes} ${suffix}`
}
