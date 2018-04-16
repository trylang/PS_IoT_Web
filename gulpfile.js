var gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin');
    htmlmin = require('gulp-htmlmin');
    less = require('gulp-less');
    del = require('del');
    plumber = require('gulp-plumber');
    ngAnnotate = require('gulp-ng-annotate');
    replace = require('gulp-replace');
    rename = require('gulp-rename');
var config = {
  exclude: ['!bower_components/**','!node_modules/**','!release/**', '!gulpfile.js'],
  outDir: 'release',
  devDir: 'css',
  configDir: ['**/fonts/**','**/localdb/**','**/ckplayer/**'],
  libDir: ['**/bower_components/**']
}
gulp.task('clean', function() {
  return del(config.outDir);
});

gulp.task('less-public', function() {
  return gulp.src(['./less/**/AdminLTE.less','./less/**/skins/*.less','./less/**/dashboard.less','./less/**/displayMain.less'].concat(config.exclude))
    .pipe(plumber())
    .pipe(less()) //执行less编译
    .pipe(gulp.dest(config.devDir))
});
gulp.task('less-private', function() {
  return gulp.src(['./app-*/**/*.less'].concat(config.exclude))
    .pipe(plumber())
    .pipe(less()) //执行less编译
    .pipe(rename(function (path) {
       path.dirname = path.dirname.replace('/less', '/css') 
     }))
    .pipe(gulp.dest('./'))
});
gulp.task('minify-css',['less-public','less-private'], function() {
  return gulp.src(['**/*.css'].concat(config.exclude))
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.outDir));
});
gulp.task('compress', function() {
  return gulp.src(['**/*.js'].concat(config.exclude))
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest(config.outDir));
});

gulp.task('images', function() {
  return gulp.src(['**/*.jpg','**/*.png','**/*.gif','**/*.svg','**/*.mp3'].concat(config.exclude))
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(config.outDir))
});

gulp.task('copyhtml', function() {
  return gulp.src(['**/*.html'].concat(config.exclude))
    .pipe(plumber())
    .pipe(gulp.dest(config.outDir))
});
gulp.task('copyconfigs', function() {
  return gulp.src(config.configDir.concat(config.exclude))
    .pipe(plumber())
    .pipe(gulp.dest(config.outDir))
});
gulp.task('copylibs', function() {
  return gulp.src(config.libDir)
    .pipe(plumber())
    .pipe(gulp.dest(config.outDir))
});
gulp.task('copyjs', function() {
  return gulp.src(['**/*.js'].concat(config.exclude))
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(gulp.dest(config.outDir));
});
gulp.task('release-version',['compress'], function() {
  return gulp.src([config.outDir+'/**/js/main.js'])
    .pipe(plumber())
    .pipe(replace('==version==', (new Date()).getTime()))
    .pipe(gulp.dest(config.outDir));
});
gulp.task('daily-version',['copyjs'], function() {
  return gulp.src([config.outDir+'/**/js/main.js'])
    .pipe(plumber())
    .pipe(replace('==version==', (new Date()).getTime()))
    .pipe(gulp.dest(config.outDir));
});
gulp.task('daily', ['clean'], function() {
  gulp.start('daily-version','minify-css', 'images', 'copyhtml', 'copyconfigs', 'copylibs');
});

gulp.task('release', ['clean'], function() {
  gulp.start('release-version','minify-css', 'images', 'copyhtml', 'copyconfigs', 'copylibs');
});