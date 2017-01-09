var assertDir = require('assert-dir-equal')
var Metalsmith = require('metalsmith')
var testit = require('testit')
var rmdir = require('rimraf')

/**
 * Define a test case.
 *
 * @param name - The folder name for the test fixtures.
 * @param plugins - An associative array of plugin key name, and options for it.
 */
function test(name, plugins) {
  testit(name, function (done) {
    // Ensure we load the Metalsmith JSTransformer Layouts plugin.
    plugins = plugins || {}
    if (!plugins['..']) {
      plugins['..'] = {}
    }
    if (!plugins['metalsmith-jstransformer']) {
      plugins['metalsmith-jstransformer'] = {}
    }

    // Construct Metalsmith with a clean build directory.
    var testPath = 'test/fixtures/' + name
    rmdir.sync(testPath + '/build')

    // Boot up Metalsmith and load the plugins.
    var metalsmith = new Metalsmith(testPath)
    Object.keys(plugins).forEach(function (pluginName) {
      metalsmith.use(require(pluginName)(plugins[pluginName])) // eslint-disable-line import/no-dynamic-require
    })

    // Build with Metalsmith.
    metalsmith.build(function (err) {
      if (err) {
        return done(err)
      }
      assertDir(testPath + '/build', testPath + '/expected')
      done()
    })
  })
}

testit('metalsmith-jstransformer', function () {
  test('basic')
  test('inherited')
})
