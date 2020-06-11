

const gulp = require("gulp");
let texturePacker = require('gulp-free-tex-packer');

gulp.task('default', function() {
    gulp.src('../res_raw/**/**/*.png')
        .pipe(texturePacker({textureName: "atlas0_100"}))
        .pipe(gulp.dest('dest/'));
		
	gulp.src('../res_raw/**/**/*.png')
        .pipe(texturePacker({
			textureName: "atlas0_75",
			scale: 0.75,
			}))
        .pipe(gulp.dest('dest/'));
		
	gulp.src('../res_raw/**/**/*.png')
	.pipe(texturePacker({
		textureName: "atlas0_50",
		scale: 0.50,
		}))
	.pipe(gulp.dest('dest/'));
	
	gulp.src('../res_raw/**/**/*.png')
	.pipe(texturePacker({
		textureName: "atlas0_25",
		scale: 0.25,
		}))
	.pipe(gulp.dest('dest/'));
	
	gulp.src('../res_raw/**/**/*.png')
	.pipe(texturePacker({
		textureName: "atlas0_10",
		scale: 0.10,
		}))
	.pipe(gulp.dest('dest/'));
	
});