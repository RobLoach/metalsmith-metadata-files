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

            // Indicate that the metadata file was used. Mark it for deletion.
            files[jsonFile]['metadata-files-used'] = true
          }
        }
        files[jsonFile].metadata = contents
      }
    }

    // Inheritable metadata files.
    for (var m in filesKeys) {
      if (filesKeys[m]) {
        var filename = filesKeys[m]
        var file = files[filename]
        // See if there are metadata-files to import.
        for (var z in file['metadata-files'] || []) {
          if (file['metadata-files'][z]) {
            // Find the metadata file.
            var metadataFileName = file['metadata-files'][z]
            if (files[metadataFileName] && files[metadataFileName].metadata) {
              // Merge the JSON content into the destination.
              extend(files[filename], files[metadataFileName].metadata)

              // Indicate that the metadata file was used. Mark it for deletion.
              files[metadataFileName]['metadata-files-used'] = true
            }
          }
        }
      }
    }

    // Delete all used metadata JSON files.
    for (var n in jsonFiles) {
      if (jsonFiles[n] && files[jsonFiles[n]]['metadata-files-used']) {
        delete files[jsonFiles[n]]
      }
    }

    return done()
  }
}
