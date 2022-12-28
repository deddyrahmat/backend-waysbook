const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');

const app = express();

// akun cloduinary use akun gmail me
cloudinary.config({
  cloud_name: "diiiza92o",
  api_key: "123925992438822",
  api_secret: "jDOv3ka4hUv_K9cBcpYGeFn8mtQ",
});



exports.uploadFile = (imageFile, bookAttachment) => {
    
    // filter berdasarkan parameter yang dikirim dari routes sebagai middleware
    // filter untuk memnentukan image atau pdf
    const fileFilter = function (req, file, cb) {
        console.log('file.fieldname', file.fieldname)
        if (file.fieldname ===  imageFile) {
            if (!file.originalname.match(/\.(jpg|JPG|png|PNG|jpeg|JPEG)$/)) {
                req.fileValidationError = {
                message: "Only image files are allowed!"
                }
                return cb(new Error("Only image are allowed!"), false)
            }            
        }

        if (file.fieldname ===  bookAttachment) {
            if (!file.originalname.match(/\.(pdf|PDF)$/)) {
                req.fileValidationError = {
                message: "Only PDF files are allowed!"
                }
                return cb(new Error("Only PDF are allowed!"), false)
            }            
        }
        

        cb(null, true)
    }

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            // console.log("file dari cloudinary storage", file);
            // cek file apa yang diupload user
            if (file.fieldname === "bookAttachment") {
                // simpan file hasil upload ke folder waysbooks dari clodynary
                // karna file yang diupload berbentuk pdf maka tambahkan param dengan type raw
                // dan hanya mengizikan jenis file type pdf dan saat diupload beri ext .pdf
                return {
                    folder: 'waysbooks',
                    allowedFormats: "pdf",
                    format: "pdf"
                };                
            }else if (file.fieldname === "thumbnail" || file.fieldname === "attachment" || file.fieldname === "evidence" || file.fieldname === "avatar"){
                // simpan file hasil upload ke folder waysbooks dari clodynary
                // dan hanya mengizikan jenis file type image dan sisanya otomatis di create cloudinary
                return {
                    folder: 'waysbooks',
                    allowedFormats: ["jpg", "jpeg", "png"],
                };
            }
        }
    });   

    const maxSize = 5 * 1000 * 1000; //Maximum file size 5 MB

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
            },
        }).fields([
            {
            name: imageFile,
            maxCount: 1,
            },
            {
            name: bookAttachment,//dari parameter khusus type file pdf
            maxCount: 1, //maksimal file yang di upload
            }
        ])

    //middleware handler
    return (req, res, next) => {
        upload(req, res, function (err) {
        //munculkan error jika validasi gagal
        if (req.fileValidationError)
            return res.status(400).json({
                status : 0,
                message : req.fileValidationError
            })

        //munculkan error jika file tidak disediakan
        if (!req.files && !err)
            return res.status(400).json({
                status : 0,
                message: "Please select image to upload",
            })

        //munculkan error jika melebihi max size
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                status : 0,
                message: "Max file sized 5 MB",
            })
            }
            return res.status(400).json({
                status : 0,
                message : err
            })
        }
        //jika oke dan aman lanjut ke controller
        //akses nnti pake req.files
        return next();
        })
    }

}