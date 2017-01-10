var path = require('path')
var extend = require('extend-shallow')
var multimatch = require('multimatch')
var traverse = require('traverse')

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
    var jsonFile = null
    var i = 0
    for (i in jsonFiles) {
      if (jsonFiles[i]) {
        // Retrieve information about the JSON file.
        jsonFile = jsonFiles[i]

        // Retrieve the JSON contents.
        var contents = null
        try {
          contents = JSON.parse(files[jsonFile].contents)
        } catch (err) {
          return done(err + ' ' + jsonFile)
        }
        files[jsonFile].metadata = contents
      }
    }

    // Merge in any metadata-files:// objects.
    for (i in jsonFiles) {
      if (jsonFiles[i]) {
        jsonFile = jsonFiles[i]
        // See if the JSON file has metadata.
        if (files[jsonFile].metadata) {
          // Traverse through all entries in the metadata.
          traverse(files[jsonFile].metadata).forEach(function (val) {
            // Check if the object is a string.
            if (typeof val === 'string' || val instanceof String) {
              // See if it starts with metadata-files://.
              if (val.substring(0, 17) === 'metadata-files://') {
                // Retrieve the metadata file that it is to retrieve.
                var objectFile = val.substring(17)
                // Find its own metadata.
                if (files[objectFile] && files[objectFile].metadata) {
                  // Update the object to be the injected metadata.
                  this.update(files[objectFile].metadata)
                  // State that the source file has been used (mark for deletion).
                  files[objectFile]['metadata-files-used'] = true
                }
              }
            }
          })
        }
      }
    }

    // Merge JSON metadata into the content files.
    for (i in jsonFiles) {
      if (jsonFiles[i]) {
        // Retrieve information about the JSON file.
        jsonFile = jsonFiles[i]
        var pathDetails = path.parse(jsonFile)
        // Find what files the contents of the JSON file should go.
        var destFilename = path.join(pathDetails.root, pathDetails.dir, pathDetails.name)
        var destFiles = multimatch(filesKeys, destFilename + '.*')

        // Loop through each of the destination files.
        for (var x in destFiles) {
          // Don't merge the JSON file into itself.
          if (destFiles[x] && destFiles[x] !== jsonFile) {
            // Merge the JSON contents into the destination file.
            extend(files[destFiles[x]], files[jsonFile].metadata)

            // Indicate that the metadata file was used. Mark it for deletion.
            files[jsonFile]['metadata-files-used'] = true
          }
        }
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
