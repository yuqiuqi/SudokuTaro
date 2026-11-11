import {
  courtyardObjects,
  objectIsAvailable,
  type CourtyardObjectId,
} from './objects'
export type Atmosphere = 'day' | 'dusk' | 'rain'
export type WorldMotion = 'ambient' | 'still'
export type CourtyardWorld = {
  version: 1
  atmosphere: Atmosphere
  motion: WorldMotion
  favoriteObjectId: CourtyardObjectId | null
}
export function createCourtyardWorld(): CourtyardWorld {
  return {
    version: 1,
    atmosphere: 'dusk',
    motion: 'ambient',
    favoriteObjectId: null,
  }
}
export function isCourtyardWorld(raw: unknown): raw is CourtyardWorld {
  if (!raw || typeof raw !== 'object') return false
  const w = raw as CourtyardWorld
  return (
    w.version === 1 &&
    ['day', 'dusk', 'rain'].includes(w.atmosphere) &&
    ['ambient', 'still'].includes(w.motion) &&
    (w.favoriteObjectId === null ||
      courtyardObjects.some((o) => o.id === w.favoriteObjectId))
  )
}
export function selectAtmosphere(
  w: CourtyardWorld,
  value: string,
): CourtyardWorld {
  return ['day', 'dusk', 'rain'].includes(value) && value !== w.atmosphere
    ? {...w, atmosphere: value as Atmosphere}
    : w
}
export function setWorldMotion(
  w: CourtyardWorld,
  value: string,
): CourtyardWorld {
  return ['ambient', 'still'].includes(value) && value !== w.motion
    ? {...w, motion: value as WorldMotion}
    : w
}
export function setFavoriteObject(
  w: CourtyardWorld,
  id: string | null,
  unlockedThrough: number,
): CourtyardWorld {
  return id === w.favoriteObjectId ||
    (id !== null && !objectIsAvailable(id, unlockedThrough))
    ? w
    : {...w, favoriteObjectId: id as CourtyardObjectId | null}
}
