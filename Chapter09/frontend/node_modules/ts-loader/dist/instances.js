"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var chalk_1 = require("chalk");
var after_compile_1 = require("./after-compile");
var config_1 = require("./config");
var compilerSetup_1 = require("./compilerSetup");
var utils_1 = require("./utils");
var logger = require("./logger");
var servicesHost_1 = require("./servicesHost");
var watch_run_1 = require("./watch-run");
var instances = {};
/**
 * The loader is executed once for each file seen by webpack. However, we need to keep
 * a persistent instance of TypeScript that contains all of the files in the program
 * along with definition files and options. This function either creates an instance
 * or returns the existing one. Multiple instances are possible by using the
 * `instance` property.
 */
function getTypeScriptInstance(loaderOptions, loader) {
    if (utils_1.hasOwnProperty(instances, loaderOptions.instance)) {
        return { instance: instances[loaderOptions.instance] };
    }
    var log = logger.makeLogger(loaderOptions);
    var compiler = compilerSetup_1.getCompiler(loaderOptions, log);
    if (loaderOptions.configFileName) {
        log.logWarning(chalk_1.yellow('Usage of ts-loader option `configFileName` is deprecated. Use `configFile` instead.'));
    }
    if (compiler.errorMessage !== undefined) {
        return { error: utils_1.makeError({ rawMessage: compiler.errorMessage }) };
    }
    return successfulTypeScriptInstance(loaderOptions, loader, log, compiler.compiler, compiler.compilerCompatible, compiler.compilerDetailsLogMessage);
}
exports.getTypeScriptInstance = getTypeScriptInstance;
function successfulTypeScriptInstance(loaderOptions, loader, log, compiler, compilerCompatible, compilerDetailsLogMessage) {
    var configFileAndPath = config_1.getConfigFile(compiler, loader, loaderOptions, compilerCompatible, log, compilerDetailsLogMessage);
    if (configFileAndPath.configFileError !== undefined) {
        return { error: configFileAndPath.configFileError };
    }
    var configFilePath = configFileAndPath.configFilePath;
    var configParseResult = config_1.getConfigParseResult(compiler, configFileAndPath.configFile, configFileAndPath.configFilePath);
    if (configParseResult.errors.length > 0 && !loaderOptions.happyPackMode) {
        utils_1.registerWebpackErrors(loader._module.errors, utils_1.formatErrors(configParseResult.errors, loaderOptions, compiler, { file: configFilePath }));
        return { error: utils_1.makeError({ rawMessage: 'error while parsing tsconfig.json', file: configFilePath }) };
    }
    var compilerOptions = compilerSetup_1.getCompilerOptions(compilerCompatible, compiler, configParseResult);
    var files = {};
    var getCustomTransformers = loaderOptions.getCustomTransformers || Function.prototype;
    if (loaderOptions.transpileOnly) {
        // quick return for transpiling
        // we do need to check for any issues with TS options though
        var program = compiler.createProgram([], compilerOptions);
        var diagnostics = program.getOptionsDiagnostics();
        // happypack does not have _module.errors - see https://github.com/TypeStrong/ts-loader/issues/336
        if (!loaderOptions.happyPackMode) {
            utils_1.registerWebpackErrors(loader._module.errors, utils_1.formatErrors(diagnostics, loaderOptions, compiler, { file: configFilePath || 'tsconfig.json' }));
        }
        var instance_1 = { compiler: compiler, compilerOptions: compilerOptions, loaderOptions: loaderOptions, files: files, dependencyGraph: {}, reverseDependencyGraph: {}, transformers: getCustomTransformers() };
        instances[loaderOptions.instance] = instance_1;
        return { instance: instance_1 };
    }
    // Load initial files (core lib files, any files specified in tsconfig.json)
    var normalizedFilePath;
    try {
        var filesToLoad = configParseResult.fileNames;
        filesToLoad.forEach(function (filePath) {
            normalizedFilePath = path.normalize(filePath);
            files[normalizedFilePath] = {
                text: fs.readFileSync(normalizedFilePath, 'utf-8'),
                version: 0
            };
        });
    }
    catch (exc) {
        return { error: utils_1.makeError({
                rawMessage: "A file specified in tsconfig.json could not be found: " + normalizedFilePath
            }) };
    }
    // if allowJs is set then we should accept js(x) files
    var scriptRegex = configParseResult.options.allowJs && loaderOptions.entryFileIsJs
        ? /\.tsx?$|\.jsx?$/i
        : /\.tsx?$/i;
    var instance = instances[loaderOptions.instance] = {
        compiler: compiler,
        compilerOptions: compilerOptions,
        loaderOptions: loaderOptions,
        files: files,
        languageService: null,
        version: 0,
        transformers: getCustomTransformers(),
        dependencyGraph: {},
        reverseDependencyGraph: {},
        modifiedFiles: null,
    };
    var servicesHost = servicesHost_1.makeServicesHost(scriptRegex, log, loader, instance, loaderOptions.appendTsSuffixTo, loaderOptions.appendTsxSuffixTo);
    instance.languageService = compiler.createLanguageService(servicesHost, compiler.createDocumentRegistry());
    loader._compiler.plugin("after-compile", after_compile_1.makeAfterCompile(instance, configFilePath));
    loader._compiler.plugin("watch-run", watch_run_1.makeWatchRun(instance));
    return { instance: instance };
}
