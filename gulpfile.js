import { src, dest, series, parallel, watch } from 'gulp';
import htmlMin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import svgSprite from "gulp-svg-sprite"
import cheerio from 'gulp-cheerio';

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

// Конфигурация для SVG-спрайта
const config = {
    mode: {
        stack: {
            sprite: "../sprite.svg"
        }
    }
};

// Задача для создания SVG-спрайтов и удаления fill и stroke
export const svgSprites = () => {
    return src("src/img/svg/**/*.svg")
        .pipe(
            cheerio({
                run: ($) => {
                    $('[fill]').removeAttr('fill');
                    $('[stroke]').removeAttr('stroke');
                },
                parserOptions: { xmlMode: true }
            })
        )
        .pipe(svgSprite(config))
        .pipe(dest("dist/images/svg"));
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
    return src("src/fonts/**/*", {encoding: false})
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
    watch('src/img/*', images);
    watch('src/fonts/**/*', fonts);
    watch("src/img/svg/**/*.svg", svgSprites)

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
    parallel(htmlBuild, stylesBuild, images, fonts, svgSprites)
);

// Dev задачи
export const dev = series(
    clean,
    parallel(htmlDev, stylesDev, images, fonts, svgSprites),
    watchFiles
);

export default dev;
