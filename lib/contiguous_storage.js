import { arrayCreate, arrayExpand, arrayFill } from './utils'

class ContiguousStorage
{
  constructor(components, capacity) {
    if (capacity === void 0) {
      capacity = 0
    }

    this._count = components.count
    this._components = arrayCreate(this._count * capacity, null)
  }

  get(id, index) {
    return this._components[this._count * id + index]
  }

  set(id, index, component) {
    this._components[this._count * id + index] = component
  }

  delete(id, index) {
    this.set(id, index, null)
  }

  destroy(id) {
    arrayFill(this._components, null, this._count * id, this._count * (id + 1))
  }

  resize(capacity) {
    arrayExpand(this._components, this._count * capacity, null)
  }
}

module.exports = ContiguousStorage
