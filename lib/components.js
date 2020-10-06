import { message } from './message'

class Components
{
  constructor(Cs)
  {
    this._count = Cs.length
    this._types = Cs
  }

  index(C) {
    for (var i = 0; i < this._types.length; i++) {
      if (this._types[i] === C) return i
    }

    throw new TypeError(message("unknown_component", C))
  }

  mask(C) {
    return 1 << this.index(C)
  }

  get count() { return this._count }
}

module.exports = Components
