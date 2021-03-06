/*!
 * resolve-plugins-sync <https://github.com/tunnckoCore/resolve-plugins-sync>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* eslint-disable max-len */

'use strict'

const test = require('mukla')
const towie = require('./fixtures/foo-plugin-two')
const quxie = require('./fixtures/foo-plugin-quxie')
const resolve = require('./index')

test('1. return empty array if falsey values or no `plugins` given', (done) => {
  test.strictEqual(resolve().length, 0)
  test.strictEqual(resolve('').length, 0)
  test.strictEqual(resolve(false).length, 0)
  test.strictEqual(resolve([null, false]).length, 0)
  done()
})

test('2. resolve single argument string as `plugins`', (done) => {
  const result = resolve('foo-plugin-one', { prefix: './fixtures/' })
  test.strictEqual(result.length, 1)
  test.strictEqual(result[0].name, 'one')
  done()
})

test('3. resolve if each item in `plugins` is string (+ opts.prefix)', (done) => {
  const res = resolve(['foo-plugin-one', 'foo-plugin-two'], {
    prefix: './fixtures/',
  })
  test.strictEqual(res.length, 2)

  const plugin1 = res[0]
  const plugin2 = res[1]

  test.strictEqual(plugin1.name, 'one')
  test.strictEqual(plugin1.body, 'abc')
  test.strictEqual(plugin2.name, 'two')
  test.strictEqual(plugin2.body, 'foo bar')
  done()
})

test('4. resolve if item in `plugins` is array', (done) => {
  const res = resolve(
    [
      ['one', { a: 'b' }],
      [quxie, { xx: 'yy' }],
      ['two', { hoo: 'raay' }],
      ['quxie'],
      [towie],
      [{ name: 'barry' }],
    ],
    {
      prefix: './fixtures/foo-plugin-',
    }
  )

  test.strictEqual(res.length, 6)

  test.strictEqual(res[0].name, 'one')
  test.strictEqual(res[0].opts.a, 'b')
  test.strictEqual(res[0].filename, undefined)

  test.strictEqual(res[1].name, 'quxie')
  test.strictEqual(res[1].opts.xx, 'yy')

  test.strictEqual(res[2].name, 'two')
  test.strictEqual(res[2].opts.hoo, 'raay')
  test.strictEqual(res[2].filename, undefined)

  test.strictEqual(res[3].name, 'quxie')
  test.strictEqual(res[3].opts, undefined)
  test.strictEqual(res[3].filename, undefined)

  test.strictEqual(res[4].name, 'two')
  test.strictEqual(res[4].opts, undefined)

  test.strictEqual(res[5].name, 'barry')
  done()
})

test('5. resolve if item in `plugins` is string, function or object', (done) => {
  const plugins = resolve(['./fixtures/foo-plugin-one', towie, { name: 'bar' }])

  test.strictEqual(plugins.length, 3)
  test.strictEqual(plugins[0].name, 'one')
  test.strictEqual(plugins[1].name, 'two')
  test.strictEqual(plugins[1].filename, undefined)
  test.strictEqual(plugins[2].name, 'bar')
  test.strictEqual(plugins[2].filename, undefined)
  done()
})

test('6. throw err if item is array and 1st arg is not string, object or fn', (done) => {
  function fixture () {
    resolve([[123, { a: 'b' }]])
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /First item of array should/)
  test.throws(fixture, /be function, string or object/)
  done()
})

test('7. throw err if item is not array, string, function or object', (done) => {
  function fixture () {
    resolve([123])
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /Plugin item should be/)
  test.throws(fixture, /function, string, object or array/)
  done()
})

test('8. opts.first for browserify-style transforms where 1st is `filename`, 2nd is `opts`', (done) => {
  const actual = resolve([['one', { ccc: 'aaa' }], ['two', { zzz: 'xxx' }]], {
    prefix: './fixtures/foo-plugin-',
    first: 'some/example/filepath.js',
  })

  test.strictEqual(actual.length, 2)
  test.strictEqual(actual[0].opts.ccc, 'aaa')
  test.strictEqual(actual[0].filename, 'some/example/filepath.js')
  test.strictEqual(actual[1].opts.zzz, 'xxx')
  test.strictEqual(actual[1].filename, 'some/example/filepath.js')
  done()
})

test('9. if passed opts.args respect it more than per plugin options', (done) => {
  const ret = resolve([[towie, { x: 'b' }], './fixtures/foo-plugin-one'], {
    args: ['haha', { hello: 'world' }],
  })

  test.strictEqual(ret.length, 2)

  test.strictEqual(ret[0].name, 'two')
  test.strictEqual(ret[0].filename, ret[1].filename)
  test.strictEqual(ret[0].opts.hello, ret[1].opts.hello)
  done()
})

test('10. should allow to resolve object when item is string', (done) => {
  const res = resolve(['./fixtures/foo-qux.js'])
  test.deepStrictEqual(res[0], { name: 'quxie-foo', boogie: 'haha' })
  done()
})

test('11. load real eslint configs', (done) => {
  const res = resolve(
    [
      'standard-tunnckocore',
      'eslint-config-standard',
      ['standard-jsx'],
      'standard-react',
      // todo: uncomment when `get-installed-path` #22 & `global-modules` #8
      // 'airbnb-base',
    ],
    {
      prefix: 'eslint-config-',
    }
  )

  // todo: uncomment when support Yarn Global
  // test.strictEqual(res.length, 5)
  test.strictEqual(res.length, 4)
  test.strictEqual(typeof res[0], 'object')
  test.deepStrictEqual(res[0].plugins, ['fp', 'jsdoc'])
  test.ok(res[0].env)
  test.ok(res[0].rules)
  test.ok(res[0].extends)

  // the `-jsx` config
  test.ok(res[2].rules)
  test.ok(res[2].plugins)
  test.ok(res[2].rules['jsx-quotes'])
  test.ok(res[2].parserOptions)
  test.ok(res[2].parserOptions.ecmaFeatures.jsx === true)

  // todo: uncomment when support Yarn Global
  // test.ok(res[4])
  // test.ok(res[4].extends)
  // test.ok(res[4].parserOptions)
  done()
})
