'use strict'

const BOOTSTRAP = './node_modules/bootstrap-css-only',
      CSS = './client/css/**/*.css',
      DIST      = './public/dist'

let gulp       = require('gulp'),
    source     = require('vinyl-source-stream'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    sourcemaps = require('gulp-sourcemaps'),
    watchify   = require('watchify'),
    buffer     = require('vinyl-buffer'),
    gutil      = require('gulp-util'),

    gulpFilter = require('gulp-filter'),
    gulpConcat = require('gulp-concat')

function prepareBrowserify(watch) {
  let customOpts = {
    entries: ['./userscript/index.js'],
    debug: true
  }
  let opts = Object.assign({}, watchify.args, customOpts),
      b    = browserify(opts)

  if (watch) {
    b = watchify(b)
    b.on('update', function () {
      bundle(b)
    })
  }

  b.transform([babelify.configure({
    extensions: ['.js', '.jsx'],
    experimental: true,
    optional: ['runtime'],
  })])

  b.on('log', gutil.log)

  bundle(b)
}

function bundle(b) {
  return b.bundle()
    // log errors if they happen
    .on('error', function (err) {
      error.call(this, err)
    })
    .pipe(source('app.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'))
}

function error(err) {
  gutil.log(err)
  this.emit('end')
}

gulp.task('browserify', prepareBrowserify.bind(null, false))

gulp.task('watch', () => {
  prepareBrowserify(true)
  gulp.watch(CSS, ['clientCss'])
})

gulp.task('default', ['browserify'])

gulp.task('clientCss', () => {
  gulp.src(CSS)
  .pipe(gulpConcat('style.css'))
  .pipe(gulp.dest(`${DIST}/css`))
})

gulp.task('css', () =>
gulp.src(`${BOOTSTRAP}/css/*.min.css`)
.pipe(gulpConcat('vendor.css'))
  .pipe(gulp.dest(`${DIST}/css`))
)

gulp.task('fonts', () =>
gulp.src(`${BOOTSTRAP}/fonts/*`)
.pipe(gulp.dest(`${DIST}/fonts`))
)

gulp.task('build', ['css', 'clientCss', 'fonts'], prepareBrowserify.bind(null, false))