# Metalsmith Metadata Files [![NPM version](https://img.shields.io/npm/v/metalsmith-metadata-files.svg)](https://www.npmjs.org/package/metalsmith-metadata-files)

[![Build Status](https://img.shields.io/travis/kalamuna/metalsmith-metadata-files/master.svg)](https://travis-ci.org/kalamuna/metalsmith-metadata-files)
[![Dependency Status](https://david-dm.org/kalamuna/metalsmith-metadata-files.png)](https://david-dm.org/kalamuna/metalsmith-metadata-files)

[Metalsmith](http://metalsmith.io) plugin to inject file metadata from matching `.json` files.

## Installation

    npm install --save metalsmith-metadata-files

### CLI

If you are using the command-line version of Metalsmith, you can install via npm, and then add the `metalsmith-metadata-files` key to your `metalsmith.json` file:

```json
{
  "plugins": {
    "metalsmith-metadata-files": {
      "pattern": "**.json"
    }
  }
}
```

### JavaScript

If you are using the JS Api for Metalsmith, then you can require the module and add it to your `.use()` directives:

```js
var metadataFiles = require('metalsmith-metadata-files');

metalsmith.use(metadataFiles({
  'pattern': '**.json'
}));
```

## Convention

Create `.json` files along-side your content. The data from these files will be injected into the metadata into the matching file.

### Example

The following example uses [Twig](https://github.com/twigjs/twig.js) through [Metalsmith JSTransformer](https://github.com/robloach/metalsmith-jstransformer):

    npm install metalsmith-jstransformer jstransformer-twig --save

#### `src/example.twig`

```
<div class="hello">Hello, {{name}}!</div>
```

#### `src/example.json`

```
{
  "name": "World"
}
```

#### Result

``` html
<div class="hello">Hello, World!</div>
```

## Configuration

### `.pattern`

The pattern used to find the JSON files. Defaults to `*.json`.

### `.patternOptions`

The [minimatch options](https://github.com/isaacs/minimatch#options) that are used when matching against the JSON Pattern. Defaults to `{ matchBase: true }`.

## License

MIT
