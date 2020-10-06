class Entity
{
  constructor(manager, id) {
    this._manager = manager
    this._id = id
  }

  add(C) {
    this._manager._add(this._id, C)
  }

  remove(C) {
    this._manager._remove(this._id, C)
  }

  has(C) {
    return this._manager._has(this._id, C)
  }

  get(C) {
    return this._manager._get(this._id, C)
  }

  destroy() {
    return this._manager._destroy(this._id)
  }

  get id() { return this._id }

  get valid() { return this._manager.valid(this) }

}

module.exports = Entity
