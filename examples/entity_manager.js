import { Components } from '../lib/components'
import { ContiguousStorage } from '../lib/contiguous_storage'
import { EntityManager } from '../lib/entity_manager'
import { message } from '../lib/message'

module.exports = function() {
  var count = arguments.length
  if (count > 32) throw new RangeError(message("too_many_components", 32))

  var Cs = new Array(count)
  for (var i = 0; i < Cs.length; i++) {
    Cs[i] = arguments[i]
  }

  var components = new Components(Cs)
  var storage = new ContiguousStorage(components)

  return new EntityManager(components, storage)
}
