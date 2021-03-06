# resolve-plugins-sync [![NPM version](https://img.shields.io/npm/v/resolve-plugins-sync.svg?style=flat)](https://www.npmjs.com/package/resolve-plugins-sync) [![NPM monthly downloads](https://img.shields.io/npm/dm/resolve-plugins-sync.svg?style=flat)](https://npmjs.org/package/resolve-plugins-sync) [![npm total downloads][downloads-img]][downloads-url]

> Synchronously resolve plugins / transforms / presets just like Babel and Browserify does it, using CommonJS `require` builtin. For example, useful for loading complex configs from `package.json` file.

[![code climate][codeclimate-img]][codeclimate-url]
[![standard code style][standard-img]][standard-url]
[![linux build status][travis-img]][travis-url]
[![windows build status][appveyor-img]][appveyor-url]
[![coverage status][coveralls-img]][coveralls-url]
[![dependency status][david-img]][david-url]

You might also be interested in [always-done](https://github.com/hybridables/always-done#readme).

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Background](#background)
  * [What and Why?](#what-and-why)
  * [Resolution](#resolution)
- [API](#api)
  * [resolvePluginsSync](#resolvepluginssync)
- [Related](#related)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install
Install with [npm](https://www.npmjs.com/)

```
$ npm install resolve-plugins-sync --save
```

or install using [yarn](https://yarnpkg.com)

```
$ yarn add resolve-plugins-sync
```

## Usage
> For more use-cases see the [tests](test.js)

```js
const resolvePluginsSync = require('resolve-plugins-sync')

// fake
const baz = require('tool-plugin-baz')
const qux = require('tool-plugin-qux')

const result = resolvePluginsSync([
  'foo',
  ['bar', { some: 'options here' }],
  [baz, { a: 'b' }],
  qux
], {
  prefix: 'tool-plugin-'
})
```

## Background

### What and Why?
Because we need. Because many famous tools do exact same thing. They use same kind
of resolution of their presets, plugins, transforms and whatever you wanna call it.
This one is pretty configurable and small. Most of this resolution can be seen in the
users `package.json`s configs.

For example `browserify.transform` field in package.json

```json
{
  "browserify": {
    "transform": [
      "babel",
      ["uglifyify", {
        "compress": true
      }]
    ]
  }
}
```

And because both [babel][] and [browserify][] uses same resolution things may gone more wild.

Let's take this example

```json
{
  "browserify": {
    "transform": [
      ["babel", {
        "presets": [
          ["es2015", {
            "modules": false
          }]
        ],
        "plugins": [
          ["react", { "some": "more options" }]
          "add-module-exports"
        ]
      }],
      ["uglifyify", {
        "compress": true
      }]
    ]
  }
}
```

And so on, and so on... infinite nesting. That's just freaking crazy, right?

That's all about what this package does - you give it an array and it does such thing - in case with Browserify if they use this package they should pass `browserify.transform` as first argument.

It's so customizable that it match to all their needs - both for Babel plugins/presets/transforms and Browserify transforms. The [browserify][] transforms are a bit different by all others. They accept `filename, options` signature. And so, because they don't accept `options` as first argument, like Babel's transforms or like Rollup's plugins, we need a bit configuration to make things work for Browserify.

That's why this package has `opts` object through which you can pass `opts.first` to set first argument for the plugin/transform function. Another thing that you can do is to pass `opts.args` if you want more control over the passed arguments to the plugin/transform function.

### Resolution

How we resolve plugins? Resolving algorithm has 4 steps. You should know that in the following paragraphs `item` means each element in the passed array to `resolvePluginsSync()`.

**1)** If item is `string`, it tries to require it from
locally installed dependencies, calls it and you can pass
a `opts.prefix` which will be prepended to the item string.
Think for it like `rollup-plugin-`, `babel-plugin-`, `gulp-`
and etc. You may want to see the comments for `resolveFromString` inside the source code.

**2)** If item is `function`, it will call it and if you
want to pass arguments to it you can pass `opts.args` array
or `opts.first`. If `opts.args` is passed it calls that
item function with `.apply`. If `opts.first` is passed
it will pass it as first argument to that function.

**3)** If item is `object`, nothing happens, it just returns it
in the `result` array.

**4)** If item is `array`, then there are few possible
scenarios (see comments for `resolveFromArray` inside the source code):
  - if 1st argument is string - see 1
  - if 1st argument is function - see 2
  - if 2nd argument is object it will be passed to
  that resolve function from 1st argument

## API

### [resolvePluginsSync](index.js#L58)

> Babel/Browserify-style resolve of a `plugins` array
and optional `opts` options object, where
each "plugin" (item in the array) can be
1) string, 2) function, 3) object or 4) array.
Useful for loading complex and meaningful configs like
exactly all of them - Babel, ESLint, Browserify. It would
be great if they use that package one day :)
The [rolldown][] bundler already using it as default
resolution for resolving [rollup][] plugins. :)

**Params**

* `array` **{Array|String}**: of "plugins/transforms/presets" or single string, which is arrayified so returned `result` is always an array    
* `opts` **{Object}**: optional custom configuration    
* ``opts.prefix`` **{String}**: useful like `babel-plugin-` or `rollup-plugin-`    
* ``opts.context`` **{Any}**: custom context to be passed to plugin function, using the `.apply` method    
* ``opts.first`` **{Any}**: pass first argument for plugin function, if it is given, then it will pass plugin options as 2nd argument, that's useful for browserify-like transforms where first argument is `filename`, second is transform `options`    
* ``opts.args`` **{Array}**: pass custom arguments to the resolved plugin function, if given - respected more than `opts.first`    
* `returns` **{Array}**: `result` resolved plugins, always an array  

**Example**

```jsx
const resolve = require('resolve-plugins-sync')

// fake
const baz = require('tool-plugin-baz')
const qux = require('tool-plugin-qux')

resolve([
  'foo',
  ['bar', { some: 'options here' }],
  [baz, { a: 'b' }],
  qux
], {
  prefix: 'tool-plugin-'
})
```

## Related
- [always-done](https://www.npmjs.com/package/always-done): Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement… [more](https://github.com/hybridables/always-done#readme) | [homepage](https://github.com/hybridables/always-done#readme "Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement for [async-done][] - pass 100% of its tests plus more")
- [minibase](https://www.npmjs.com/package/minibase): Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing… [more](https://github.com/node-minibase/minibase#readme) | [homepage](https://github.com/node-minibase/minibase#readme "Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing [base][] plugins.")
- [try-catch-core](https://www.npmjs.com/package/try-catch-core): Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and… [more](https://github.com/hybridables/try-catch-core#readme) | [homepage](https://github.com/hybridables/try-catch-core#readme "Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and used in higher-level libs such as [always-done][] to handle completion of anything.")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/resolve-plugins-sync/issues/new).  
Please read the [contributing guidelines](CONTRIBUTING.md) for advice on opening issues, pull requests, and coding standards.  
If you need some help and can spent some cash, feel free to [contact me at CodeMentor.io](https://www.codementor.io/tunnckocore?utm_source=github&utm_medium=button&utm_term=tunnckocore&utm_campaign=github) too.

**In short:** If you want to contribute to that project, please follow these things

1. Please DO NOT edit [README.md](README.md), [CHANGELOG.md](CHANGELOG.md) and [.verb.md](.verb.md) files. See ["Building docs"](#building-docs) section.
2. Ensure anything is okey by installing the dependencies and run the tests. See ["Running tests"](#running-tests) section.
3. Always use `npm run commit` to commit changes instead of `git commit`, because it is interactive and user-friendly. It uses [commitizen][] behind the scenes, which follows Conventional Changelog idealogy.
4. Do NOT bump the version in package.json. For that we use `npm run release`, which is [standard-version][] and follows Conventional Changelog idealogy.

Thanks a lot! :)

## Building docs
Documentation and that readme is generated using [verb-generate-readme][], which is a [verb][] generator, so you need to install both of them and then run `verb` command like that

```
$ npm install verbose/verb#dev verb-generate-readme --global && verb
```

_Please don't edit the README directly. Any changes to the readme must be made in [.verb.md](.verb.md)._

## Running tests
Clone repository and run the following in that cloned directory

```
$ npm install && npm test
```

## Author
**Charlike Mike Reagent**

+ [github/tunnckoCore](https://github.com/tunnckoCore)
+ [twitter/tunnckoCore](https://twitter.com/tunnckoCore)
+ [codementor/tunnckoCore](https://codementor.io/tunnckoCore)

## License
Copyright © 2016-2017, [Charlike Mike Reagent](https://i.am.charlike.online). MIT

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on October 10, 2017._  
_Project scaffolded using [charlike][] cli._

[always-done]: https://github.com/hybridables/always-done
[async-done]: https://github.com/gulpjs/async-done
[babel]: https://babeljs.io/
[base]: https://github.com/node-base/base
[browserify]: https://github.com/substack/node-browserify
[charlike]: https://github.com/tunnckoCore/charlike
[commitizen]: https://github.com/commitizen/cz-cli
[dezalgo]: https://github.com/npm/dezalgo
[once]: https://github.com/isaacs/once
[rolldown]: https://github.com/rolldown/rolldown
[rollup]: https://github.com/rollup/rollup
[standard-version]: https://github.com/conventional-changelog/standard-version
[verb-generate-readme]: https://github.com/verbose/verb-generate-readme
[verb]: https://github.com/verbose/verb

[downloads-url]: https://www.npmjs.com/package/resolve-plugins-sync
[downloads-img]: https://img.shields.io/npm/dt/resolve-plugins-sync.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/resolve-plugins-sync
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/resolve-plugins-sync.svg

[travis-url]: https://travis-ci.org/tunnckoCore/resolve-plugins-sync
[travis-img]: https://img.shields.io/travis/tunnckoCore/resolve-plugins-sync/master.svg?label=linux

[appveyor-url]: https://ci.appveyor.com/project/tunnckoCore/resolve-plugins-sync
[appveyor-img]: https://img.shields.io/appveyor/ci/tunnckoCore/resolve-plugins-sync/master.svg?label=windows

[coveralls-url]: https://coveralls.io/r/tunnckoCore/resolve-plugins-sync
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/resolve-plugins-sync.svg

[david-url]: https://david-dm.org/tunnckoCore/resolve-plugins-sync
[david-img]: https://img.shields.io/david/tunnckoCore/resolve-plugins-sync.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

