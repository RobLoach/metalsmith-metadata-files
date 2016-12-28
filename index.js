var path = require('path')
var extend = require('extend-shallow')
var multimatch = require('multimatch')

module.exports = function (opts) {
  // Prepare the options.
  opts = opts || {}
  opts.pattern = opts.pattern || '*.json'
  opts.patternOptions = opts.patternOptions || {matchBase: true}

  // Execute the plugin.
  return function (files, metalsmith, done) {
    // Find every JSON file.
    var filesKeys = Object.keys(files)
    var jsonFiles = multimatch(filesKeys, opts.pattern, opts.patternOptions)
    for (var i in jsonFiles) {
      if (jsonFiles[i]) {
        // Retrieve information about the JSON file.
        var jsonFile = jsonFiles[i]
        var pathDetails = path.parse(jsonFile)

        // Retrieve the JSON contents.
        var contents = null
        try {
          contents = JSON.parse(files[jsonFile].contents)
        } catch (err) {
          return done(err + ' ' + jsonFile)
        }

        // Find what files the contents of the JSON file should go.
        var destFilename = path.join(pathDetails.root, pathDetails.dir, pathDetails.name)
        var destFiles = multimatch(filesKeys, destFilename + '.*')

        // Loop through each of the destination files.
        for (var x in destFiles) {
          // Don't merge the JSON file into itself.
          if (destFiles[x] && destFiles[x] !== jsonFile) {
            // Merge the JSON contents into the destination file.
            extend(files[destFiles[x]], contents)
          }
        }

        // Now that we are done with the JSON file, delete it.
        delete files[jsonFile]
      }
    }
    return done()
  }
}
