import * as fp from 'lodash/fp'

// TODO: need a deep merge? i.e. to update below:
// state.items[itemIndex].attributes[attributeId].selectedIndex
// something like updateIn() in immutable

/**
 * This should be used to update the immutable objects
 * @param {{}} object
 * @param {{}} newFields
 * @return {{}}
 */
export function updateObject<T> (object: T, newFields: Partial<T>): T {
  return { ...object, ...newFields }
}

/**
 * This should be used to update the immutable array
 * @param {Array} array
 * @param {number} index
 * @param {T} item
 * @return {Array}
 */
export function updateListItem<T> (
    array: T[], index: number, item: T): T[] {
  array = array.slice()
  array[index] = item
  return array
}

/**
 * This should be used to update the immutable array
 * with multiple items, less .slice() call needed
 * @param {Array} array
 * @param {Array} indices
 * @param {Array} items
 * @return {Array}
 */
export function updateListItems<T> (
  array: T[], indices: number[], items: T[]): T[] {
  array = array.slice()
  for (let i = 0; i < indices.length; i++) {
    array[indices[i]] = items[i]
  }
  return array
}

/**
 * Add an item to an array
 * @param {Array} items
 * @param {T} item
 * @return {Array}
 */
export function addListItem<T> (items: T[], item: T): T[] {
  return items.concat([item])
}

/**
 * Remove fields from an object
 * @param {T} target
 * @param {keyof T} fields
 * @return {T}
 */
export function removeObjectFields<T> (
    target: T, fields: Array<keyof T>): T {
  target = { ...target }
  for (const f of fields) {
    delete target[f]
  }
  return target
}

interface IdSingle {
  /** ID */
  id: number
}

/**
 * remove list items by item id
 * @param {T[]} items
 * @param {number[]} ids
 * @return {T[]}
 */
export function removeListItemsById (items: IdSingle[],
                                     ids: number[]): IdSingle[] {
  return fp.remove(
      (item: IdSingle) => fp.indexOf(item.id, ids) >= 0)(items)
}

/**
 * Remove list items by equivalence
 * @param {T[]} items
 * @param {T[]} a
 * @return {T[]}
 */
export function removeListItems<T> (items: T[], a: T[]): T[] {
  return fp.remove((item) => fp.indexOf(item, a) >= 0, items)
}
