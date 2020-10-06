import gulp from 'gulp'
import path from 'path'
import git from 'gulp-git'
import bump from 'gulp-bump'

import gutil from 'gulp-util'
import jshint from 'gulp-jshint'
import connect from 'gulp-connect'
import es from 'event-stream'
import source from 'vinyl-source-stream'
import watchify from 'watchify'
import browserify from 'browserify'
import babelify from 'babelify'
import { readFileSync } from 'fs'

var index = './lib/index.js'
var outdir = './build'
var exampledir = './examples'
var bundle = 'Phakr'
var outfile = 'phakr.js'
var ver = {
        major: 1,
        minor: 0,
        patch: 0
    }
var pkg = JSON.parse(readFileSync('./package.json'))
var version = pkg.version.split('.')

function rebundle(file) {
    if (file) {
        gutil.log('Rebundling,', path.basename(file[0]), 'has changes.');
    }

    return this
        .transform(babelify.configure(
            {
                presets: ["@babel/preset-env"],
                plugins: ["@babel/plugin-proposal-class-properties"]
            }
        ))
        .bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(outfile))
        .pipe(gulp.dest(outdir))
        .pipe(gulp.dest(exampledir));
}

function createBundler(args) {
    args = args || {};
    args.standalone = bundle;

    return browserify(index, args);
}

/*****
 * Dev task, incrementally rebuilds the output bundle as the the sources change
 *****/
gulp.task('dev', function() {
    watchify.args.standalone = bundle;
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', rebundle);

    return rebundle.call(bundler);
});

/*****
 * Build task, builds the output bundle
 *****/
gulp.task('build', function () {
    return rebundle.call(createBundler());
});

/*****
 * JSHint task, lints the lib and test *.js files.
 *****/
gulp.task('jshint', function () {
    return gulp.src([
            './lib/**/*.js',
            'gulpfile.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-summary'));
});

/*****
 * Base task
 *****/
gulp.task('default', gulp.series(['jshint', 'build'], function(){}));


/*****
 * Release task
 *****/
gulp.task('release', gulp.series(['jshint', 'build'], function (cb) {
    var up = process.argv[3] || 'patch';

    up = up.replace('--', '');

    if (Object.keys(ver).indexOf(up) === -1) {
        return cb(new Error('Please specify major, minor, or patch release.'));
    }

    version[ver[up]]++;
    for (var i = 0; i < 3; ++i) {
        if (i > ver[up]) {
            version[i] = 0;
        }
    }

    version = 'v' + version.join('.');

    return es.merge(
            gulp.src('./package.json')
                .pipe(bump({ type: up }))
                .pipe(gulp.dest('./')),
            gulp.src(outdir + '/' + outfile)
                .pipe(gulp.dest('./dist'))
        )
        .pipe(git.commit('release ' + version))
        .pipe(git.tag(version, version, function () {}));
}));

gulp.task('examples', function () {
    connect.server({
        root: ['./examples'],
        port: 9000
    });
});
