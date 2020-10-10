import { ContiguousStorage } from './contiguous_storage.js'
import { Entity } from './entity.js'
import { arrayCreate, arrayExpand, typedArrayExpand } from './utils.js'

var INITIAL_CAPACITY = 1024
var ENTITY_DEAD = 0
var ENTITY_ALIVE = 1

export class EntityManager
{
  constructor(components) {
    // Components storages
    this._components = components
    this._storage = new ContiguousStorage(components, components.count)

    // Entities storages
    this._entityFlag = new Uint8Array(INITIAL_CAPACITY)
    this._entityMask = new Uint32Array(INITIAL_CAPACITY)
    this._entityInst = arrayCreate(INITIAL_CAPACITY, null)

    this._entityPool = []
    this._entityCounter = 0
  }

  create() {
    var id
    if (this._entityPool.length > 0) {
      id = this._entityPool.pop()
    } else {
      id = this._entityCounter++
      this._entityInst[id] = new Entity(this, id)
      this._accomodate(id)
    }

    var entity = this._entityInst[id]
    this._entityFlag[id] = ENTITY_ALIVE

    return entity
  }

  get(id) {
    return this._entityInst[id]
  }

  query() {
    var mask = 0
    for (var i = 0; i < arguments.length; i++) {
      mask |= this._components.mask(arguments[i])
    }

    if (mask === 0) {
      return []
    }

    var result = []
    for (var id = 0; id < this._entityCounter; id++) {
      if (this._entityFlag[id] === ENTITY_ALIVE && (this._entityMask[id] & mask) === mask) {
        result.push(this._entityInst[id])
      }
    }

    return result
  }

  valid(entity) {
    var id = entity._id
    return this._entityFlag[id] === ENTITY_ALIVE && this._entityInst[id] === entity
  }

  _accomodate(id) {
    var capacity = this._entityFlag.length
    if (capacity <= id) {
      capacity *= 2

      this._entityFlag = typedArrayExpand(this._entityFlag, capacity)
      this._entityMask = typedArrayExpand(this._entityMask, capacity)
      this._entityInst = arrayExpand(this._entityInst, capacity, null)
      this._storage.resize(capacity)
    }
  }

  _add(id, component) {
    var ctor = component.constructor
    var index = this._components.index(ctor)
    this._entityMask[id] |= 1 << index
    this._storage.set(id, index, component)
  }

  _remove(id, C) {
    var index = this._components.index(C)
    this._entityMask[id] &= ~(1 << index)
    this._storage.delete(id, index)
  }

  _has(id, C) {
    var mask = this._components.mask(C)
    return (this._entityMask[id] & mask) !== 0
  }

  _get(id, C) {
    var index = this._components.index(C)
    return this._storage.get(id, index)
  }

  _destroy(id) {
    if (this._entityFlag[id] === ENTITY_ALIVE) {
      this._entityFlag[id] = ENTITY_DEAD
      this._entityMask[id] = 0
      this._entityPool.push(id)
      this._storage.destroy(id)
    }
  }

  get capacity() { return this._entityFlag.length }

}
