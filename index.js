const path = require('path')
const extend = require('extend-shallow')
const multimatch = require('multimatch')
const traverse = require('traverse')
const yaml = require('yaml')

module.exports = function (options) {
  // Prepare the options.
  options = options || {}
  options.pattern = options.pattern || '{*.json,*.yaml}'
  options.patternOptions = options.patternOptions || {matchBase: true}
  options.inheritFilePrefix = options.inheritFilePrefix || 'metadata-files://'

  // Execute the plugin.
  return function (files, metalsmith, done) {
    // Find every JSON file.
    const filesKeys = Object.keys(files)
    const jsonFiles = multimatch(filesKeys, options.pattern, options.patternOptions)
    let jsonFile = null
    for (const i in jsonFiles) {
      if (jsonFiles[i]) {
        // Retrieve information about the JSON file.
        jsonFile = jsonFiles[i]
        let contents = {}

        // Determine whether to parse it with JSON or YAML.
        if (jsonFile.endsWith('.yaml') || jsonFile.endsWith('.yml')) {
          // Pass the contents through YAML.
          try {
            contents = yaml.parse(files[jsonFile].contents.toString())
          } catch (error) {
            return done(error + ' (' + jsonFile + ')')
          }
        } else {
          // Retrieve the JSON contents.
          try {
            contents = JSON.parse(files[jsonFile].contents)
          } catch (error) {
            return done(error + ' (' + jsonFile + ')')
          }
        }

        files[jsonFile].metadata = contents
      }
    }

    // Merge in any metadata-files:// objects.
    for (const i in jsonFiles) {
      if (jsonFiles[i]) {
        jsonFile = jsonFiles[i]
        // See if the JSON file has metadata.
        if (files[jsonFile].metadata) {
          // Traverse through all entries in the metadata.
          traverse(files[jsonFile].metadata).forEach(function (value) {
            // Check if the object is a string.
            if (typeof value === 'string' || value instanceof String) {
              // See if it starts with metadata-files://.
              const inheritFileLength = options.inheritFilePrefix.length
              if (value.slice(0, inheritFileLength) === options.inheritFilePrefix) {
                // Retrieve the metadata file that it is to retrieve.
                const objectFile = value.slice(inheritFileLength)
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
    for (const i in jsonFiles) {
      if (jsonFiles[i]) {
        // Retrieve information about the JSON file.
        jsonFile = jsonFiles[i]
        const pathDetails = path.parse(jsonFile)
        // Find what files the contents of the JSON file should go.
        const destFilename = path.join(pathDetails.root, pathDetails.dir, pathDetails.name)
        const destFiles = multimatch(filesKeys, destFilename + '.*')

        // Loop through each of the destination files.
        for (const x in destFiles) {
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
    for (const m in filesKeys) {
      if (filesKeys[m]) {
        const filename = filesKeys[m]
        const file = files[filename]
        // See if there are metadata-files to import.
        for (const z in file['metadata-files'] || []) {
          if (file['metadata-files'][z]) {
            // Find the metadata file.
            const metadataFileName = file['metadata-files'][z]
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
    for (const n in jsonFiles) {
      if (jsonFiles[n] && files[jsonFiles[n]]['metadata-files-used']) {
        delete files[jsonFiles[n]]
      }
    }

    return done()
  }
}
