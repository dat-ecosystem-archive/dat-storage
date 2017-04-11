var raf = require('random-access-file')
var multi = require('multi-random-access')
var messages = require('append-tree/messages')
var stat = require('hyperdrive/lib/messages').Stat
var path = require('path')

module.exports = function (dir) {
  var meta = '.dat'

  return {
    metadata: function (name) {
      return raf(path.join(dir, meta, 'metadata', name))
    },
    content: function (name, archive) {
      if (name === 'data') return createStorage(archive, dir)
      return raf(path.join(dir, meta, 'content', name))
    }
  }
}

function createStorage (archive, dir) {
  var latest = false // DUMMY flag so i can future proof this
  var head = null
  var storage = multi({limit: 64}, locate)

  archive.on('append', onappend)

  return storage

  function onappend (name, opts) {
    if (head) head.end = archive.content.byteLength

    var v = latest ? '' : '.' + archive.metadata.length

    head = {
      start: archive.content.byteLength,
      end: Infinity,
      storage: raf(path.join(dir, name + v))
    }

    storage.add(head)
  }

  function locate (offset, cb) {
    archive.ready(function (err) {
      if (err) return cb(err)

      find(archive.metadata, offset, function (err, node, st, index) {
        if (err) return cb(err)
        if (!node) return cb(new Error('Could not locate data'))

        var v = latest ? '' : '.' + index

        cb(null, {
          start: st.byteOffset,
          end: st.byteOffset + st.size,
          storage: raf(path.join(dir, node.name + v))
        })
      })
    })
  }
}

function get (metadata, btm, seq, cb) {
  if (seq < btm) return cb(null, -1, null)

  // TODO: this can be done a lot faster using the hypercore internal iterators, expose!
  var i = seq
  while (!metadata.has(i) && i > btm) i--
  if (!metadata.has(i)) return cb(null, -1, null)

  metadata.get(i, {valueEncoding: messages.Node}, function (err, node) {
    if (err) return cb(err)
    if (!node.value) return get(btm, i - 1, cb) // TODO: check the index instead for fast lookup
    cb(null, i, node)
  })
}

function find (metadata, bytes, cb) {
  var top = metadata.length - 1
  var btm = 1
  var mid = Math.floor((top + btm) / 2)

  get(metadata, btm, mid, function loop (err, actual, node) {
    if (err) return cb(err)
    if (!node) return cb(null, null, null, -1)

    var st = stat.decode(node.value)

    var start = st.byteOffset
    var end = st.byteOffset + st.size

    if (start <= bytes && bytes < end) return cb(null, node, st, actual)
    if (top <= btm) return cb(null, null, null, -1)

    var oldMid = mid

    if (bytes < start) {
      top = mid
      mid = Math.floor((top + btm) / 2)
    } else {
      btm = mid
      mid = Math.floor((top + btm) / 2)
    }

    if (mid === oldMid) {
      if (btm < top) mid++
      else return cb(null, null, null, -1)
    }

    get(metadata, btm, mid, loop)
  })
}
