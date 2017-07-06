// 引入 gulp
import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import minifycss from 'gulp-minify-css';
import cssnano from 'gulp-cssnano';
import autoprefixer from 'gulp-autoprefixer';
import rollup from 'gulp-rollup';
import del from 'del';

let paths = {
  script: ['static/js/*.js'],
  entry: 'src/index.js'
};

const WARNING_MESSAGE_REGEXP = /The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten/;
const WARNING_CODE_REGEXP = /THIS_IS_UNDEFINED/;
const DEPENDENCY_WARNING_MESSAGE_REGEXP =  /external dependency/;

// 清除dist
gulp.task('clean', function() {
  return del(['dist/**/*']);
});

// 合并，压缩js文件
let cache = null;
let caches = {};
gulp.task('script', () => {
  return gulp.src(paths.script)
      .pipe(sourcemaps.init())
        .pipe(rollup({
          format: 'iife',
          sourceMap: false,
          plugins: [
            require('rollup-plugin-babel')({
              babelrc: false,
              runtimeHelpers: true,
              externalHelpers: false
            })
          ],
          onwarn(warning, next) {
              if (WARNING_CODE_REGEXP.test(warning.code || '')
                  || DEPENDENCY_WARNING_MESSAGE_REGEXP.test(warning)
                  || WARNING_MESSAGE_REGEXP.test(warning)
              ) { return; }
              next(warning);
          },
          rollup: require('rollup'),
          entry: [paths.entry],
          cache: cache,
          separateCaches: caches,
          generateUnifiedCache: true,
          allowRealFiles: false
        }))
        .on('bundle', function(bundle, name) {
          caches[name] = bundle;
        })
        .on('unifiedcache', function(unifiedCache) {
          cache = unifiedCache;
        })
        .pipe(uglify())
        .pipe(rename(function (path) {
          path.basename += ".min";
        }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/js'));
});

// 监听文件变化
gulp.task('watch', () => {
  gulp.watch(paths.script, ['script']);
});

// 默认任务
gulp.task('default', ['clean','watch', 'script']);
