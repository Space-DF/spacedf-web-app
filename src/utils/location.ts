export const getUserLocation = async (): Promise<[number, number]> => {
  try {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      throw new Error('Geolocation not supported')
    }

    return await new Promise<[number, number]>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          resolve([longitude, latitude])
        },
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      )
    })
  } catch (error) {
    throw error
  }
}
