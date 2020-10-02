# Metalsmith Metadata Files [![npm version](https://badge.fury.io/js/metalsmith-metadata-files.svg)](https://badge.fury.io/js/metalsmith-metadata-files)

[![Build Status](https://travis-ci.org/kalamuna/metalsmith-metadata-files.svg?branch=master)](https://travis-ci.org/kalamuna/metalsmith-metadata-files)
[![Greenkeeper badge](https://badges.greenkeeper.io/kalamuna/metalsmith-metadata-files.svg)](https://greenkeeper.io/)
[![Dependency Status](https://david-dm.org/kalamuna/metalsmith-metadata-files.png)](https://david-dm.org/kalamuna/metalsmith-metadata-files)

[Metalsmith](http://metalsmith.io) plugin to inject file metadata from matching `.json` or `.yaml` files.

## Installation

    npm install --save metalsmith-metadata-files

### CLI

If you are using the command-line version of Metalsmith, you can install via npm, and then add the `metalsmith-metadata-files` key to your `metalsmith.json` file:

```json
{
  "plugins": {
    "metalsmith-metadata-files": {
      "pattern": "{**.json,**.yaml}"
    }
  }
}
```

### JavaScript

If you are using the JS Api for Metalsmith, then you can require the module and add it to your `.use()` directives:

```js
var metadataFiles = require('metalsmith-metadata-files');

metalsmith.use(metadataFiles({
  'pattern': '{**.json,**.yaml}'
}));
```

## Convention

Create `.json` or `.yaml` files along-side your content. The data from these files will be injected into the metadata into the matching file.

### Example

The following example uses [Twig](https://github.com/twigjs/twig.js) through [Metalsmith JSTransformer](https://github.com/robloach/metalsmith-jstransformer):

    npm install metalsmith-jstransformer jstransformer-twig --save

#### `src/example.twig`

```
<div class="{{class}}">Hello, {{name}}!</div>
```

#### `src/example.json`

```
{
  "name": "World",
  "metadata-files": [
    "moreoptions.json"
  ]
}
```

### `moreoptions.json`

```
{
  "class": "hello"
}
```

#### Result

``` html
<div class="hello">Hello, World!</div>
```

### Options

#### `metadata-files`

An array depicting additional metadata files that are inheritted into the parent file's metadata. Can be added to the file's YAML front-matter, or inside the .json files themselves.

#### `metadata-files://`

String values that begin with `metadata-files://` will inject the file into the metadata itself.

##### Options
```
{
  "person": "metadata-files://component/charlie.json"
}
```
##### charlie.json
```
{
  "name": "Charlie"
}
```
##### Result
```
{
  "person": {
    "name": "Charlie"
  }
}
```

## Configuration

### `.pattern`

The pattern used to find the JSON files. Defaults to `{*.json|*.yaml}`.

### `.patternOptions`

The [minimatch options](https://github.com/isaacs/minimatch#options) that are used when matching against the JSON Pattern. Defaults to `{ matchBase: true }`.

### `.inheritFilePrefix`

The prefix that is expected when searching for inheritted files. Defaults to `metadata-files://`.

## License

MIT
