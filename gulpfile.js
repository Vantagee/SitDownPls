import { src, dest, series, parallel, watch } from 'gulp';
import htmlMin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import image from 'gulp-image';
import sourcemaps from 'gulp-sourcemaps';
import del from 'del';
import browserSync from 'browser-sync';

// Очистка папки dist
const clean = () => {
    return del(['dist']);
};

// Обработка изображений
const images = () => {
    return src([
        'src/img/**/*.jpg',
        'src/img/**/*.png',
        'src/img/*.svg',
        'src/img/**/*.jpeg',
    ],{ encoding: false })
        .pipe(image())
        .pipe(dest('dist/images'));
};

// таски для dev
const stylesDev = () => {
    return src('src/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

// Задача для оптимизации шрифтов
const fonts = () => {
    return src("src/fonts/**/*")
        .pipe(dest("dist/fonts"));
};

const htmlDev = () => {
    return src('src/**/*.html')
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });

    watch('src/css/**/*.css', stylesDev);
    watch('src/**/*.html', htmlDev);
    watch('src/img/**/*', images);
    watch('src/fonts/**/*', fonts);

};

// Стили для build
const stylesBuild = () => {
    return src('src/css/*.css')
        .pipe(cleanCSS({ level: 2 }))
        .pipe(dest('dist'));
};

const htmlBuild = () => {
    return src('src/**/*.html')
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(dest('dist'));
};

export const cleanTask = clean;

// Build задачи
export const build = series(
    clean,
    parallel(htmlBuild, stylesBuild, images, fonts)
);

// Dev задачи
export const dev = series(
    clean,
    parallel(htmlDev, stylesDev, images, fonts),
    watchFiles
);

export default dev;
