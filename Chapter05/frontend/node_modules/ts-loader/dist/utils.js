"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var chalk_1 = require("chalk");
var constants = require("./constants");
function registerWebpackErrors(existingErrors, errorsToPush) {
    Array.prototype.splice.apply(existingErrors, [0, 0].concat(errorsToPush));
}
exports.registerWebpackErrors = registerWebpackErrors;
function hasOwnProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}
exports.hasOwnProperty = hasOwnProperty;
/**
 * Take TypeScript errors, parse them and format to webpack errors
 * Optionally adds a file name
 */
function formatErrors(diagnostics, loaderOptions, compiler, merge) {
    return diagnostics
        ? diagnostics
            .filter(function (diagnostic) { return loaderOptions.ignoreDiagnostics.indexOf(diagnostic.code) === -1; })
            .map(function (diagnostic) {
            var errorCategory = compiler.DiagnosticCategory[diagnostic.category].toLowerCase();
            var errorCategoryAndCode = errorCategory + ' TS' + diagnostic.code + ': ';
            var messageText = errorCategoryAndCode + compiler.flattenDiagnosticMessageText(diagnostic.messageText, constants.EOL);
            var error;
            if (diagnostic.file !== undefined) {
                var lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                var errorMessage = "" + chalk_1.white('(') + chalk_1.cyan((lineChar.line + 1).toString()) + "," + chalk_1.cyan((lineChar.character + 1).toString()) + "): " + chalk_1.red(messageText);
                if (loaderOptions.visualStudioErrorFormat) {
                    errorMessage = chalk_1.red(path.normalize(diagnostic.file.fileName)) + errorMessage;
                }
                error = makeError({
                    message: errorMessage,
                    rawMessage: messageText,
                    location: { line: lineChar.line + 1, character: lineChar.character + 1 }
                });
            }
            else {
                error = makeError({ rawMessage: messageText });
            }
            return Object.assign(error, merge);
        })
        : [];
}
exports.formatErrors = formatErrors;
function readFile(fileName) {
    fileName = path.normalize(fileName);
    try {
        return fs.readFileSync(fileName, 'utf8');
    }
    catch (e) {
        return undefined;
    }
}
exports.readFile = readFile;
function makeError(_a) {
    var rawMessage = _a.rawMessage, message = _a.message, location = _a.location, file = _a.file;
    var error = {
        rawMessage: rawMessage,
        message: message || "" + chalk_1.red(rawMessage),
        loaderSource: 'ts-loader'
    };
    return Object.assign(error, { location: location, file: file });
}
exports.makeError = makeError;
function appendSuffixIfMatch(patterns, path, suffix) {
    if (patterns.length > 0) {
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var regexp = patterns_1[_i];
            if (path.match(regexp)) {
                return path + suffix;
            }
        }
    }
    return path;
}
exports.appendSuffixIfMatch = appendSuffixIfMatch;
function appendSuffixesIfMatch(suffixDict, path) {
    for (var suffix in suffixDict) {
        path = appendSuffixIfMatch(suffixDict[suffix], path, suffix);
    }
    return path;
}
exports.appendSuffixesIfMatch = appendSuffixesIfMatch;
/**
 * Recursively collect all possible dependants of passed file
 */
function collectAllDependants(reverseDependencyGraph, fileName, collected) {
    if (collected === void 0) { collected = {}; }
    var result = {};
    result[fileName] = true;
    collected[fileName] = true;
    var dependants = reverseDependencyGraph[fileName];
    if (dependants !== undefined) {
        Object.keys(dependants).forEach(function (dependantFileName) {
            if (!collected[dependantFileName]) {
                collectAllDependants(reverseDependencyGraph, dependantFileName, collected)
                    .forEach(function (fName) { return result[fName] = true; });
            }
        });
    }
    return Object.keys(result);
}
exports.collectAllDependants = collectAllDependants;
/**
 * Recursively collect all possible dependencies of passed file
 */
function collectAllDependencies(dependencyGraph, filePath, collected) {
    if (collected === void 0) { collected = {}; }
    var result = {};
    result[filePath] = true;
    collected[filePath] = true;
    var directDependencies = dependencyGraph[filePath];
    if (directDependencies !== undefined) {
        directDependencies.forEach(function (dependencyModule) {
            if (!collected[dependencyModule.originalFileName]) {
                collectAllDependencies(dependencyGraph, dependencyModule.resolvedFileName, collected)
                    .forEach(function (filePath) { return result[filePath] = true; });
            }
        });
    }
    return Object.keys(result);
}
exports.collectAllDependencies = collectAllDependencies;
function arrify(val) {
    if (val === null || val === undefined) {
        return [];
    }
    return Array.isArray(val) ? val : [val];
}
exports.arrify = arrify;
;
