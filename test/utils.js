import chai from 'chai';
let expect = chai.expect;
import { arrayCreate, arrayExpand, arrayFill, typedArrayExpand } from "../lib/utils.js"

describe("utils", function() {
  describe("arrayCreate", function() {
    it("creates a fixed array", function() {
      chai.expect(arrayCreate(100)).to.have.length(100)
    })
    it("fills the array", function() {
      expect(arrayCreate(4, 0)).to.eql([0, 0, 0, 0])
    })
    it("fills the array with nulls", function() {
      expect(arrayCreate(4, null)).to.eql([null, null, null, null])
    })
  })

  describe("arrayExpand", function() {
    it("expands the specified array", function() {
      var arr = arrayCreate(2, 0)
      expect(arrayExpand(arr, 4, 1)).to.eql([0, 0, 1, 1])
    })
  })

  describe("arrayFill", function() {
    it("fills the array", function() {
      var arr = arrayCreate(3, 0)
      expect(arrayFill(arr, 1, 0, 3)).to.eql([1, 1, 1])
    })
    it("can expand the array", function() {
      var arr = arrayCreate(3, 0)
      expect(arrayFill(arr, 1, 2, 4)).to.eql([0, 0, 1, 1])
    })
  })

  describe("typedArrayExpand", function() {
    it("expands the specified typed array", function() {
      var arr = new Uint8Array([1, 1])
      var out = typedArrayExpand(arr, 4)

      expect(out).to.be.instanceof(Uint8Array)
      expect(out).to.deep.equals(new Uint8Array([1, 1, 0, 0]))
    })
  })
})
