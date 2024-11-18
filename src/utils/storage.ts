'use client'

export function getFromLocalStorage<T>(key: string): T | null {
  if (!localStorage) return null
  const storedValue = localStorage.getItem(key)
  if (storedValue) {
    try {
      // Try to parse the stored value, if it's JSON
      return JSON.parse(storedValue) as T
    } catch (e) {
      // If parsing fails, return the raw string value
      return storedValue as unknown as T
    }
  }
  return null
}

export function setToLocalStorage<T>(key: string, value: T): void {
  try {
    // Convert value to a JSON string if it's an object
    const valueToStore =
      typeof value === 'object' ? JSON.stringify(value) : value
    localStorage.setItem(key, valueToStore as string)
  } catch (e) {
    console.error('Failed to set item to localStorage:', e)
  }
}

export function deleteFromLocalStorage(key: string): void {
  localStorage.removeItem(key)
}
