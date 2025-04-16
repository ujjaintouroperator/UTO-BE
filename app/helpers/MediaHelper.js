
'use strict';

const path = require('path');
const ABSPATH = '' ; // path.dirname(process.mainModule.filename);
const gm = require('gm');
const fs = require('fs');

/**
 * Checks if a file exists at the given path.
 * @param {string} path - The path to the file.
 * @returns {boolean} - True if the file exists, false otherwise.
 */
const exists = (path) => {
    try {
        return fs.existsSync(path);
    } catch (e){
	    console.log('erorFile::',e)
        return false;
    }
};

/**
 * Retrieves the file extension from a filename.
 * @param {string} filename - The filename.
 * @returns {string} - The file extension.
 */
const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

class Media {
    constructor(path) {
        this.src = path;
    }

    /**
     * Validates if the media source is a JPEG or PNG image.
     * @param {string} src - The path to the media source.
     * @returns {boolean} - True if the media source is valid, false otherwise.
     */
    isValidMedia(src) {
        return /\.(jpe?g|png)$/.test(src);
    }

    /**
     * Validates if the base directory of the media source is valid.
     * @param {string} src - The path to the media source.
     * @returns {boolean} - True if the base directory is valid, false otherwise.
     */
    isValidBaseDir(src) {
        return /^\/public\/images/.test(src);
    }

    /**
     * Generates a thumbnail for the media source and sends it as a response.
     * @param {Request} request - The HTTP request object.
     * @param {Response} response - The HTTP response object.
     */
    thumb(request, response, imagePath) {
        return new Promise(resolve => {
            let image = this.src;


//            if (this.isValidBaseDir(this.src) && this.isValidMedia(this.src) && exists(image)) {
                let width = (request.query.w && /^\d+$/.test(request.query.w)) ? request.query.w : '150';
                let height = (request.query.h && /^\d+$/.test(request.query.h)) ? request.query.h : '150';
                let extension = getFileExtension(this.src);

                gm(image).resize(width, height).write(imagePath, (err) => {
                    if (err) {
                        return resolve(false)
                    }
                    return resolve(true)
                });
  //          } else {
    //            return resolve(false)
      //      }
        })

    }
}

module.exports.Media = Media;
module.exports.exists = exists;
module.exports.getFileExtension = getFileExtension;

