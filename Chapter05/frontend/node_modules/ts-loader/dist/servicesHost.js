"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var constants = require("./constants");
var resolver_1 = require("./resolver");
var utils_1 = require("./utils");
/**
 * Create the TypeScript language service
 */
function makeServicesHost(scriptRegex, log, loader, instance, appendTsSuffixTo, appendTsxSuffixTo) {
    var compiler = instance.compiler, compilerOptions = instance.compilerOptions, files = instance.files;
    var newLine = compilerOptions.newLine === constants.CarriageReturnLineFeedCode ? constants.CarriageReturnLineFeed :
        compilerOptions.newLine === constants.LineFeedCode ? constants.LineFeed :
            constants.EOL;
    // make a (sync) resolver that follows webpack's rules
    var resolveSync = resolver_1.makeResolver(loader.options);
    var moduleResolutionHost = {
        fileExists: function (fileName) { return utils_1.readFile(fileName) !== undefined; },
        readFile: function (fileName) { return utils_1.readFile(fileName) || ''; },
    };
    return {
        getProjectVersion: function () { return "" + instance.version; },
        getScriptFileNames: function () { return Object.keys(files).filter(function (filePath) { return filePath.match(scriptRegex); }); },
        getScriptVersion: function (fileName) {
            fileName = path.normalize(fileName);
            var file = files[fileName];
            return file === undefined ? '' : file.version.toString();
        },
        getScriptSnapshot: function (fileName) {
            // This is called any time TypeScript needs a file's text
            // We either load from memory or from disk
            fileName = path.normalize(fileName);
            var file = files[fileName];
            if (file === undefined) {
                var text = utils_1.readFile(fileName);
                if (text === undefined) {
                    return undefined;
                }
                file = files[fileName] = { version: 0, text: text };
            }
            return compiler.ScriptSnapshot.fromString(file.text);
        },
        /**
         * getDirectories is also required for full import and type reference completions.
         * Without it defined, certain completions will not be provided
         */
        getDirectories: compiler.sys ? compiler.sys.getDirectories : undefined,
        /**
         * For @types expansion, these two functions are needed.
         */
        directoryExists: compiler.sys ? compiler.sys.directoryExists : undefined,
        // The following three methods are necessary for @types resolution from TS 2.4.1 onwards see: https://github.com/Microsoft/TypeScript/issues/16772
        fileExists: compiler.sys ? compiler.sys.fileExists : undefined,
        readFile: compiler.sys ? compiler.sys.readFile : undefined,
        readDirectory: compiler.sys ? compiler.sys.readDirectory : undefined,
        getCurrentDirectory: function () { return process.cwd(); },
        getCompilationSettings: function () { return compilerOptions; },
        getDefaultLibFileName: function (options) { return compiler.getDefaultLibFilePath(options); },
        getNewLine: function () { return newLine; },
        log: log.log,
        resolveModuleNames: function (moduleNames, containingFile) {
            return resolveModuleNames(resolveSync, moduleResolutionHost, appendTsSuffixTo, appendTsxSuffixTo, scriptRegex, instance, moduleNames, containingFile);
        },
        getCustomTransformers: function () { return instance.transformers; }
    };
}
exports.makeServicesHost = makeServicesHost;
function resolveModuleNames(resolveSync, moduleResolutionHost, appendTsSuffixTo, appendTsxSuffixTo, scriptRegex, instance, moduleNames, containingFile) {
    var resolvedModules = moduleNames.map(function (moduleName) {
        return resolveModuleName(resolveSync, moduleResolutionHost, appendTsSuffixTo, appendTsxSuffixTo, scriptRegex, instance, moduleName, containingFile);
    });
    populateDependencyGraphs(resolvedModules, instance, containingFile);
    return resolvedModules;
}
function isJsImplementationOfTypings(resolvedModule, tsResolution) {
    return resolvedModule.resolvedFileName.endsWith('js') &&
        /node_modules(\\|\/).*\.d\.ts$/.test(tsResolution.resolvedFileName);
}
function resolveModuleName(resolveSync, moduleResolutionHost, appendTsSuffixTo, appendTsxSuffixTo, scriptRegex, instance, moduleName, containingFile) {
    var compiler = instance.compiler, compilerOptions = instance.compilerOptions;
    var resolutionResult;
    try {
        var originalFileName = resolveSync(undefined, path.normalize(path.dirname(containingFile)), moduleName);
        var resolvedFileName = appendTsSuffixTo.length > 0 || appendTsxSuffixTo.length > 0
            ? utils_1.appendSuffixesIfMatch({
                '.ts': appendTsSuffixTo,
                '.tsx': appendTsxSuffixTo,
            }, originalFileName)
            : originalFileName;
        if (resolvedFileName.match(scriptRegex)) {
            resolutionResult = { resolvedFileName: resolvedFileName, originalFileName: originalFileName };
        }
    }
    catch (e) { }
    var tsResolution = compiler.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
    if (tsResolution.resolvedModule !== undefined) {
        var resolvedFileName = path.normalize(tsResolution.resolvedModule.resolvedFileName);
        var tsResolutionResult = {
            originalFileName: resolvedFileName,
            resolvedFileName: resolvedFileName,
            isExternalLibraryImport: tsResolution.resolvedModule.isExternalLibraryImport
        };
        if (resolutionResult) {
            if (resolutionResult.resolvedFileName === tsResolutionResult.resolvedFileName ||
                isJsImplementationOfTypings(resolutionResult, tsResolutionResult)) {
                resolutionResult.isExternalLibraryImport = tsResolutionResult.isExternalLibraryImport;
            }
        }
        else {
            resolutionResult = tsResolutionResult;
        }
    }
    return resolutionResult;
}
function populateDependencyGraphs(resolvedModules, instance, containingFile) {
    resolvedModules = resolvedModules
        .filter(function (m) { return m !== null && m !== undefined; });
    instance.dependencyGraph[path.normalize(containingFile)] = resolvedModules;
    resolvedModules.forEach(function (resolvedModule) {
        if (instance.reverseDependencyGraph[resolvedModule.resolvedFileName] === undefined) {
            instance.reverseDependencyGraph[resolvedModule.resolvedFileName] = {};
        }
        instance.reverseDependencyGraph[resolvedModule.resolvedFileName][path.normalize(containingFile)] = true;
    });
}
