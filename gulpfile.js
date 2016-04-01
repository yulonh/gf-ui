'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprite = require('css-sprite-mobile').stream;
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var replace = require('gulp-replace');
var ftp = require('vinyl-ftp');
var md5 = require("gulp-gf-md5");
var zip = require('gulp-zip');
var babel = require("gulp-babel");

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('styles', ['injector:css:preprocessor'], function () {
    return gulp.src(['sass/gfui.scss'])
        .pipe(sourcemaps.init())
        .pipe($.sass({style: 'compressed'}))
        //.pipe(sourcemaps.write('.',{includeContent:false, sourceRoot:'/app'}))
        .pipe(sourcemaps.write())
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        // https://github.com/ai/browserslist#queries
        .pipe($.autoprefixer({browsers: ['Android >= 2.1', 'iOS > 5']}))
        .pipe(gulp.dest('dist'));
});

//主要是gfui.scss里面能够自动导入scss文件
gulp.task('injector:css:preprocessor', function () {
    return gulp.src('sass/gfui.scss')
        .pipe($.inject(gulp.src([
            //'src/components/reset.scss',
            '!sass/base/*.scss',
            'sass/util/**/*.scss',
            'sass/component/*.scss',
            'sass/**/*.scss',
            '!demo/**/*.scss',
            '!sass/gfui.scss',
        ], {read: false}), {
            transform: function (filePath) {
                filePath = filePath.replace('sass/', '');
                //filePath = filePath.replace('src/components/', '../components/');
                return '@import \'' + filePath + '\';';
            },
            starttag: '// injector',
            endtag: '// endinjector',
            addRootSlash: false
        }))
        .pipe(gulp.dest('sass/'));
});

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
    return gulp.src('src/assets/sprites/*.png')
        .pipe(sprite({
            name: 'sprite',
            style: 'sprite.scss',
            retina: true,
            margin: 2,
            orientation: 'binary-tree',
            // prefix: 'icon', 默认是icon
            cssPath: '../assets/images/',
            processor: 'scss'
        }))
        .pipe(gulpif('*.png', gulp.dest('src/assets/images/'), gulp.dest('src/components/')))
});

//图片md5和压缩
gulp.task('images', function () {

    var imgSrc = ['src/assets/**/*.{png,jpg}', '!src/assets/backup/*.{png,jpg}', '!src/assets/sprites/*.{png,jpg}'],
        quoteSrc = ['dist/styles/*.css', 'dist/scripts/*.js'],
        imgDst = 'dist/assets';

    return gulp.src(imgSrc)
        //.pipe($.imagemin({
        //    optimizationLevel: 3,
        //    progressive: true,
        //    interlaced: true
        //}))
        .pipe(md5(8, quoteSrc))
        .pipe(gulp.dest(imgDst));

});

gulp.task('fonts', function () {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('misc', function () {
    return gulp.src('src/**/*.ico')
        .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function (done) {
    $.del(['dist/'], done);
});


gulp.task('build1', ['styles']);

gulp.task('build', function () {
    runSequence('clean', 'build1');
});
