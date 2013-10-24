// Mostly ported from PhantomCSS
// For a better implementation, use that:
// https://github.com/Huddle/PhantomCSS
//
// Reworked here to work with any Selenium-powered browser

var fs = require('fs');
var _tolerance = 64;
var _root = '.';
var _count = 0;
var webdriver;
var exitStatus;
var platform = require('os').platform();
var _processRoot = process.cwd();
var gm = require("gm");
var _failOnFirstMismatch = true;

exports.screenshot = screenshot;
exports.compare = compare;
exports.init = init;

function init(options) {
    webdriver = options.webdriver || {};
    _root = options.screenshotRoot || _root;
    _processRoot = options.processRoot || _processRoot;
    _fileNameGetter = _fileNameGetter;

    if (options.fileNameGetter) {
        _fileNameGetter = options.fileNameGetter.apply(this, [platform, webdriver, fs]);
    }

    _failOnFirstMismatch = typeof options.failOnFirstMismatch !== "undefined" ?
                               options.failOnFirstMismatch :
                               _failOnFirstMismatch;
}

function _fileNameGetter(_root, selector) {
    // Possibly use selector here for filename
    selector = selector.replace(/[\#\.\s:>]/g,'');

    var name = _root + "/" + platform + "_" + webdriver.desiredCapabilities.browserName + '_' + selector + '_' + _count++;

    if (fs.existsSync(name + '.png')) {
        return name + '.diff.png';
    } else {
        return name + '.png';
    }
}

// If we're grabbing the whole page, just use webdriver default
function screenshot(selector, callback) {
    var filename = _fileNameGetter(_root, selector);
    if(typeof selector === "function") {
        // No selector passed, capture the whole page
        // selector is actually the callback
        return webdriver.saveScreenshot(filename, selector);
    }

    // Need to do some extra work
    captureSelector(filename, selector, callback);
}

function captureSelector(filename, selector, callback) {
    //console.log('captureSelector', filename, selector);
    // First, grab the whole page
    webdriver.screenshot(function(err, result) {
        if(err) {
            return callback("Error capturing screenshot: " + err.orgStatusMessage, result);
        }

        // Second, find out where the element is
        webdriver.getLocation(selector, function(err, where) {
            if(err) {
                return callback("Error getting location for selector: \"" + selector + "\" : " + err.orgStatusMessage, result);
            }
            // Third, find out how big the element is
            webdriver.getSize(selector, function(err, size) {
                if(err) {
                    return callback("Error getting size for selector: \"" + selector + "\" : " + err.orgStatusMessage, result);
                }

                // Fourth, save the fullsize image
                var buffer = new Buffer(result.value, 'base64'),
                    tempFile = _root + '/tmp/'+process.pid+'.png';

                fs.writeFile(tempFile, buffer, 'base64', function(err) {

                    if(err) {
                        return callback("Error saving screenshot to temp file: " + tempFile, tempFile);
                    }

                  
                    //console.log('cropping: ', tempFile, size.width, size.height, where.x, where.y);
                    // Fifth, crop the image to the object's bounds and save it.
                    gm(tempFile)
                        .crop(size.width, size.height, where.x, where.y)
                        .write(filename, function(err) {
                            if (!err) {
                                callback(null, {status: /\.diff\./.test(filename)?'success':'firstrun', value: filename});
                            }
                            else
                            {
                                callback(new Error("Error cropping image via gm: " + err));
                            }
                        });
                });
            });
        });
    });
}

// Create two image objects using the reference file and 
// current test render then use imagediff to compare them
function compare(filename, callback) {
    var baseFile = filename.replace('.diff', '');

    if (!fs.existsSync(baseFile)) {
        return callback(new Error(baseFile + " does not exist"));
    }
    else if (!fs.existsSync(filename)) {
        return callback(new Error(filename + " does not exist"));
    }
    else {

        //console.log( 'compare',filename,baseFile );
        var tolerance = 0.0;  // this means exactly equal
        gm.compare(filename, baseFile, tolerance, function (err, isEqual, equality, raw) {
            if (err) {
                // how to handle a true error here?
                console.log('error comparing images', err);
                throw err;
            }
            //console.log('The images are equal: %s', isEqual);
            //console.log('Actual equality: %d', equality)
            //console.log('Raw output was: %j', raw);
            if (isEqual) {
                callback();
            } else { 

				 // now, output the visually difference image using gm's somewhat-awkward API
                var visDiffFile = filename.replace(".diff",".visdiff");

                gm.compare( filename, baseFile, { file: visDiffFile }, function(err, isEqual, equality, raw) {

                    if (err) {
                        callback.fail("Error creating visual diff file: " + err);
                    }
				
                    //console.log("Images don't match. Created visdiff file.", errorFile);
                    if (_failOnFirstMismatch) {
                		callback.fail(new Error("Images don't match: " +  visDiffFile));
            		} 
					else {
                		console.log("\tWARN: Images don't match: " +  visDiffFile + "\n");
                		callback();
                    }
                });
            }
        });
    }
}

module.exports = exports;
