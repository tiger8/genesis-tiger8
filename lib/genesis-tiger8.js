/**
 * Compiler hooks for Genesis
 * @module genesis-tiger8
 * @license MIT
 */

var path = require('path');
var wrench = require('wrench');
var _ = require('lodash');
var config = {};
var uniqueViews = [];
var fs = require('fs-extended');
require('sugar');


/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
var preLoad = function (alloyConfig, alloyLogger, config) {
    
};

/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
var preCompile = function (alloyConfig, alloyLogger, config) {
    
    findCustomViews(alloyConfig, alloyLogger, config);
}

/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
var postCompile = function (alloyConfig, alloyLogger, config) {
    
    //  deleteFoldersThatShouldNotExist(alloyConfig, alloyLogger, config);
    processCustomViews(alloyConfig, alloyLogger, config);
    copyBaseController(alloyConfig, alloyLogger, config);

}


/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function copyBaseController(alloyConfig, alloyLogger, config) {
    //Alloy BUSTED.  Don't use this: alloyConfig.platform
    var platform = alloyConfig.alloyConfig.platform === 'ios' ? 'iphone' : alloyConfig.alloyConfig.platform;
    fs.copyFileSync(path.join(__dirname, 'BaseController.js'), path.join(alloyConfig.dir.resources, platform, 'alloy', 'controllers', 'BaseController.js'));
}
/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function replaceBaseController(alloyConfig, alloyLogger, config) {
    
    var replace = require('replace');
    
    replace(
        {
            regex: "alloy/controllers/BaseController",
            replacement: "alloy/controllers/t8/BaseController",
            paths: [alloyConfig.dir.resources],
            recursive: true,
            silent: false
        });
}
/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function findCustomViews(alloyConfig, alloyLogger, config) {
    
    alloyLogger.trace('********************* STARTING findCustomViews ***************************');
    
    var customViews = [];
    var srcDir = alloyConfig.dir.lib;
    var files = wrench.readdirSyncRecursive(srcDir);
    files.forEach(function (file) {
        var fullpath = path.join(srcDir, file);
        
        if (fs.statSync(fullpath).isFile()) {
            config.customFolders.forEach(function (viewFolderName) {
                //var newViewFolderName = viewFolderName.slice(1);
                var newViewFolderName = viewFolderName.replace(/[_]+(\S+)/gi, '$1');
                //var regex1 = new RegExp(viewFolderName + '[\\\\/](\\b(controllers|views|models|styles)\\b)+([\\\\/]+)([^\\\\/]+)$', 'gi');
                //var regex1 = new RegExp(viewFolderName + '[\\\\/]((?:\\b(?:controllers|views|models|styles)\\b)(?:[\\\\/](?:[^\\\\/])+)+[\\\\/])([\\S]+)$', 'gi');
                var regex1 = new RegExp(viewFolderName + '[\\\\/]((\\S+?)(?:[\\\\/](?:[^\\\\/])+)*[\\\\/])([\\S]+)$', 'gi');
                //var regex2 = new RegExp('^.+?' + viewFolderName + '[\\\\/](\\b(assets)\\b){1}(.+?)$', 'gi');
                //alloyLogger.trace('file: ' + file);
                
                //alloyLogger.error('fullpath = ' + fullpath);
                alloyLogger.error('file = ' + file);
                //alloyLogger.error('alloyConfig.dir = ' + JSON.stringify(alloyConfig.dir));
                
                var m = regex1.exec(file);
                if (m !== null) {
                    var targetBaseFolder = alloyConfig.dir['home'];
                    var folderName = m[2];
                    var targetFolder = m[1];
                    if (_.includes(['controllers', 'views', 'styles'], folderName)) {
                        var viewName = path.basename(file, path.extname(file));
                        customViews.push(viewName);
                        targetBaseFolder = alloyConfig.dir[folderName];
                    } else if (_.includes(['assets', 'config', 'models', 'themes', 'vendor', 'widgets', 'lib'], folderName)) {
                        targetBaseFolder = alloyConfig.dir[folderName];
                    } else {
                        targetBaseFolder = alloyConfig.dir['lib'];
                    }
                    
                    
                    var fileName = path.basename(file);
                    var destPath = path.join(targetBaseFolder, targetFolder, newViewFolderName, fileName);
                    
                    //alloyLogger.error('folderName = ' + folderName);
                    //alloyLogger.error('newViewFolderName = ' + newViewFolderName);
                    //alloyLogger.error('fileName = ' + fileName);
                    //alloyLogger.error('targetBaseFolder = ' + targetBaseFolder);
                    //alloyLogger.error('targetFolder = ' + targetFolder);
                    //alloyLogger.error('destPath = ' + destPath);
                    
                    //var x = crash.now();
                    
                    var fileContents = fs.readFileSync(fullpath);
                    fs.createFileSync(destPath, fileContents);

                }
                
                
                
                
                
                //if (regex1.test(file)) {
                    
                //    //var folderName = path.basename(path.dirname(file));
                    
                    
                //    alloyLogger.error('folderName = ' + folderName);
                //    alloyLogger.error('newViewFolderName = ' + newViewFolderName);
                //    alloyLogger.error('fileName = ' + fileName);
                //    alloyLogger.error('alloyConfig.dir[folderName]= ' + alloyConfig.dir[folderName]);
                    
                //    var destPath = path.join(alloyConfig.dir[folderName], newViewFolderName, fileName);
                //    fs.createFileSync(destPath, fileContents);
                //    //alloyLogger.trace('copied file to: ' + destPath);
                //}
                //else if (regex2.test(file)) {

                //    //TODO:  Fix copying of assets to folder

                //    //var fileContents = fs.readFileSync(fullpath);
                //    //var matches = regex2.exec( fullpath );
                //	//alloyLogger.error( 'matches=' + matches );
                //    ////var replace = '$3';
                //    ////var destFile = file.replace( regex2, replace );
                //    ////alloyLogger.error( 'destFile=' + destFile );
                //	//var destPath = path.join(alloyConfig.dir[matches[2]],newViewFolderName, matches[3]);
                //    //fs.createFileSync(destPath, fileContents);
                //    //alloyLogger.warn('copied file to: ' + destPath);
                //}
            });
        }
    });
    
    uniqueViews = _.uniq(customViews);
    alloyLogger.debug('uniqueViews: ' + uniqueViews);
    deleteCustomViewFolders(alloyConfig, alloyLogger, config);
    
    alloyLogger.trace('********************* FINISHED findCustomViews ***************************');


}

/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function deleteFoldersThatShouldNotExist(alloyConfig, alloyLogger, config) {
    var deletePaths = [];
    
    //Alloy BUSTED.  Don't use this: alloyConfig.platform
    var platform = alloyConfig.platform === 'ios' ? 'iphone' : alloyConfig.platform;
    var resourceFolder = path.join(config.dir.resources, platform);
    
    wrench.readdirSyncRecursive(resourceFolder).forEach(function (folderPath) {
        
        var fullPath = path.join(resourceFolder, folderPath);
        if (fs.statSync(fullPath).isDirectory()) {
            var folderBasename = path.basename(fullPath);
            
            if (_.contains(config.ignoreDirs, folderBasename)) {
                deletePaths.push(fullPath);
            }
        }
    });
    
    alloyLogger.debug("deletePaths: " + deletePaths);
    
    _.forEach(deletePaths, function (targetPath) {
        fs.deleteDirSync(targetPath);
    });

}

/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function deleteCustomViewFolders(alloyConfig, alloyLogger, config) {
    var deletePaths = [];
    
    //Alloy BUSTED.  Don't use this: alloyConfig.platform
    var platform = alloyConfig.alloyConfig.platform === 'ios' ? 'iphone' : alloyConfig.alloyConfig.platform;
    var resourceFolder = path.join(alloyConfig.dir.resources, platform);
    
    wrench.readdirSyncRecursive(resourceFolder).forEach(function (folderPath) {
        
        var fullPath = path.join(resourceFolder, folderPath);
        if (fs.statSync(fullPath).isDirectory()) {
            var folderBasename = path.basename(fullPath);
            
            if (_.contains(config.customFolders, folderBasename)) {
                deletePaths.push(fullPath);
            }
        }
    });
    
    alloyLogger.debug("deletePaths: " + deletePaths);
    
    _.forEach(deletePaths, function (targetPath) {
        fs.deleteDirSync(targetPath);
    });

}

/**
 *
 * @param {object} alloyConfig Alloy config
 * @param {object} alloyLogger Alloy logger
 * @param {object} config Genesis config
 */
function processCustomViews(alloyConfig, alloyLogger, config) {
    
    //Alloy BUSTED.  Don't use this: alloyConfig.alloyConfig.platform
    var platformDir = alloyConfig.alloyConfig.platform === 'ios' ? 'iphone' : alloyConfig.alloyConfig.platform;
    
    var controllerFolder = path.join(alloyConfig.dir.resources, platformDir, 'alloy', 'controllers');
    
    String.prototype.ucfirst = function () {
        return this[0].toUpperCase() + this.substr(1);
    };
    
    String.prototype.lcfirst = function () {
        return this[0].toLowerCase() + this.substr(1);
    };
    
    wrench.readdirSyncRecursive(controllerFolder).forEach(function (controller) {
        var controllerPath = path.join(controllerFolder, controller);
        
        if (fs.statSync(controllerPath).isFile()) {
            var contents = fs.readFileSync(controllerPath, 'utf8');
            var regex, replace;
            
            // Add parentController and rootController
            regex = /(id:[^"]*"([^"]*)")(?=[\s\S]+?(\$\.__views\.)([\S]+)\.add[(]\3\2)+/gi;
            replace = "$1,\n        parentController: $3$4,\n        rootController: $$\n";
            contents = contents.replace(regex, replace);
            
            uniqueViews.forEach(function (viewName) {
                
                regex = new RegExp('((\\$\\.[\\S]+?)[\\s]+?=[\\s]+?' + 'Ti\\.UI\\.create' + viewName.ucfirst() + '[(][\\s\\S]+?id:[^"]*"[^"]*"[^;]+;[\\s\\S]+?)((\\$\.[\\S]+)\.add\\(\\2\\);)', "gi");
                //alloyLogger.trace("regex1 = " + regex);
                replace = "$1$2.setParent($4);";
                contents = contents.replace(regex, replace);
                
                
                // Add support for custom tiger8 controllers, views, etc.
                regex = new RegExp('Ti\\.UI\\.create' + viewName.ucfirst() + '[(]([\\s\\S]+?id:[^"]*"([^"]*)"[^;]+)', "gi");
                if (_.contains(config.exclusiveViews, viewName)) {
                    var i = 0;
                    var m;
                    while ((m = regex.exec(contents)) !== null) {
                        i++;
                        if (m[2] !== viewName) {
                            if (i > 1) {
                                
                                var ex = "Found more than one exclusive view: " + viewName + " in file: " + controllerPath;
                                alloyLogger.error(ex);
								// throw new Error(ex);
                            }
                            //alloyLogger.warn("matched id = " + m[2]);
                            contents = contents.replace(new RegExp(m[2], "gi"), viewName);
                        }

                    }

                }
                
                replace = "Alloy.createController('t8/" + viewName + "', $1";
                contents = contents.replace(regex, replace);
            });
            
            // Update file with changes
            fs.writeFileSync(controllerPath, contents);
        }

    });

    module.exports = function () {

        preLoad = this.preLoad;
        preCompile = this.preCompile;
        postCompile = this.postCompile;

    };

}
