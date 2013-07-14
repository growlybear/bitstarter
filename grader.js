#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

'use strict';

var fs = require('fs'),
    rest = require('restler'),
    program = require('commander'),
    cheerio = require('cheerio');

var DEFAULTS = {
        html  : 'index.html',
        checks: 'checks.json'
    };

var assertFileExists = function (file) {
    file = file.toString();
    if (!fs.existsSync(file)) {
        console.log('%s does not exist. Exiting.', file);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return file;
};

var cheerioHtmlFile = function (html) {
    return cheerio.load(fs.readFileSync(html));
};

var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (htmlfile, checksfile) {
    var $ = cheerioHtmlFile(htmlfile),
        checks = loadChecks(checksfile).sort(),
        out = {},
        key, present;

    for (key in checks) {
        present = $(checks[key]).length > 0;
        out[checks[key]] = present;
    }

    return out;
};

var clone = function (fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// TODO still sort of yuck
if (require.main === module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), DEFAULTS.checks)
        .option('-f, --file <html_file>',    'Path to index.html',  clone(assertFileExists), DEFAULTS.html)
        .option('-u, --url <html_file>',     'Url path')
        .parse(process.argv);

    if (program.url) {
        rest.get(program.url).on('complete', function (result) {
            fs.writeFileSync(DEFAULTS.html, result);
            console.log(checkHtmlFile(DEFAULTS.html, program.checks));
        });
    }
    else {
        console.log(checkHtmlFile(program.file, program.checks));
    }
}
else {
    exports.checkHtmlFile = checkHtmlFile;
}
