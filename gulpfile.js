//----------------------------------------------------------------------
//  モード
//----------------------------------------------------------------------
"use strict";

//----------------------------------------------------------------------
//  モジュール読み込み
//----------------------------------------------------------------------
const gulp = require("gulp"); // gulpのインポート
const concat = require("gulp-concat"); // gulp-concatのインポート
// const watch = require("gulp-watch");
const { src, dest, watch, series, parallel } = require("gulp");

const plumber = require("gulp-plumber"),
	notify = require("gulp-notify"),
	sassGlob = require("gulp-sass-glob-use-forward"),
	sass = require("gulp-sass")(require("sass")),
	path = require("path"),
	autoprefixer = require("gulp-autoprefixer"),
	// cached = require("gulp-cached"),
	browserSync = require("browser-sync");

//パスの管理
const paths = {
	rootDir: "./",
	srcDir: { html: "./*.html", css: "./src/sass/**/*.scss", js: "./src/js/*.js" },
};

//----------------------------------------------------------------------
//  関数定義
//----------------------------------------------------------------------

//sassのコンパイル
//No.1 400ms以上かかるが原因が分からない。No.2を書き換えた。
const css = () => {
	return (
		src("./src/sass/**/*.scss", { sourcemaps: true })
			.pipe(
				plumber({
					errorHandler: notify.onError("Error: <%= error.message %>"),
				})
			) // watch中にエラーが発生してもwatchが止まらないようにする
			.pipe(sassGlob()) // glob機能を使って@useや@forwardを省略する
			// .pipe(cached("scss"))//変更されたものだけ?
			.pipe(
				sass({
					outputStyle: "expanded", //一般的なcssの構造で出力(種類あり)最後は圧縮設定にする
					// minifier: true //minファイルを作成するかどうかだが、outputStyleのcompressedでも良い気がする
				})
			) // sassのコンパイルをする
			.pipe(autoprefixer()) // ベンダープレフィックスを自動付与する
			.pipe(dest("./src/css", { sourcemaps: paths.rootDir }))
	);
};

// No.2平均して25ms程度
// 以下の時はnpx gulp compile　で実行
// function css(done) {
// 	src("./src/sass/**/*.scss", { sourcemaps: true })
// 		// .pipe(plumber()) // watch中にエラーが発生してもwatchが止まらないようにする
// 		.pipe(sassGlob()) // glob機能を使って@useや@forwardを省略する
// 		// .pipe(cached("scss"))
// 		.pipe(
// 			sass({
// 				outputStyle: "expanded", //一般的なcssの構造で出力(種類あり)最後は圧縮設定にする
// 				// minifier: true //minファイルを作成するかどうか
// 			})
// 		) // sassのコンパイルをする
// 		.pipe(autoprefixer()) // ベンダープレフィックスを自動付与する
// 		.pipe(dest("./src/css", { sourcemaps: paths.rootDir }));

// 	done();
// }

//jsのコンパイル
const compile = () => {
	return src("src/js/*.js") // 結合するjs
		.pipe(concat("abc.js")) // 結合後のファイル名
		.pipe(gulp.dest("src/js")); // 結合後のファイルが出力される場所
};

//ブラウザシンクで同期する仮想サーバーの立ち上げ？
const server = () => {
	browserSync.init({
		server: {
			baseDir: paths.rootDir, //htmlのある箇所を示すディレクトリ？
		},
		notify: true,
	});
};

//ブラウザシンク（リロードで全体リロード）
const reload = (done) => {
	browserSync.reload();
	done();
};

//watch機能
const watchFile = () => {
	watch(paths.srcDir.html, series(reload));
	watch(paths.srcDir.css, series(css, reload));
	watch(paths.srcDir.js, series(compile, reload));
};

//----------------------------------------------------------------------
//  タスク定義
//----------------------------------------------------------------------

exports.css = css;

exports.compile = compile;

exports.taskrunner = parallel(css, watchFile, server);

/************************************************************************/
/*  END OF FILE                                                         */
/************************************************************************/
