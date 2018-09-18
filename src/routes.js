// Loading dependencies.
var express = require('express');
var app = express();
var router = express.Router();

var request = require("request");
require('dotenv').config()
var fs = require('fs');
var glob = require('glob');
var moment = require('moment');

var exec = require('child_process').exec;
var rmdir = require('rmdir');
// var path = '/path/to/the/dir';

//Required local file Dependencies
var s3Handlers = require('./handlers/s3');
var rekognitionHandlers = require('./handlers/rekognition.js');

//===========================================================

router.get('/getImages', function(req, resp) {
    var folderPath = req.query.video.split('.')[0];
    obj = [];
    var count = 1;
    var dirList = getDirectories('clustered_images/' + folderPath);
    dirList.forEach((element) => {
        getFiles(`clustered_images/${folderPath}/` + element, (err, res) => {
            // console.log(res);
            if (res.length == 0) {
                rmdir('clustered_images/video1/' + element, function (err, dirs, files) {
                    console.log(dirs);
                    console.log(files);
                    console.log('all files are removed');
                });
                // fs.unlinkSync('clustered_images/video1/' + element);
            } else {
                obj.push({
                    'name': element,
                    'images': res
                })
            }
            if (count == dirList.length) {
                resp.status(200).json({
                    "results": obj
                })
            } else {
                count++;
            }
        })
    })
})

// router.post('/tagData', function(req, res) {
//     console.log(req.body.data);
//     res.send("successful");
// });

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}

function getFiles (src, callback) {
    glob(src + '/**/*', callback);
};

//===========================================================

router.post('/tagData', (req, res) => {
    var options = {
        method: 'POST',
        url: process.env.REKOG_API + '/' + process.env.API_VERSION + '/autotrain',
        headers: {
            'Content-Type': 'application/json'
        },
        body: req.body,
        json: true
    };

    request(options, function (error, response, body) {
        if (error){
            res.send(error)
        }
        res.send(body);
    });
})

router.post('/deleteObjects', (req, res) => {
    if (typeof req.body.images !== 'undefined' && req.body.images.length > 0) {
        console.log(req.body);

        req.body.images.forEach((element, i) => {
            var splitedPath = element.Key.split('/');
            var imageFolderPath = splitedPath[0] + "/" + splitedPath[1] + "/" + splitedPath[2];

            getFiles(imageFolderPath, (err, res) => {
                res.forEach((image) => {
                    if (image == element.Key) {
                        fs.unlinkSync(element.Key);
                    }
                })
            })
            if (req.body.images.length == i + 1) {
                res.status(200).json({
                    "status": 200,
                    "message": "deleted successfully"
                })
            } 
        })
    } else {
        res.status(200).json({
            "status": 415,
            "message": "There are no images in the bin to delete"
        })
    }
})

// router.post('/getPlaceholder', (req, res) => {
//     // console.log(req.body.clusterImageArray);
//     rekognitionHandlers.getIdentity(req.body.clusterImageArray, (err, result) => {
//         console.log(result);
//         res.status(200).json(result);
//     })
// })

router.get('/getAllClusterVideos', (req, res) => {
    var dataArray = [];
    getFiles('videos', (err, result) => {
        result.forEach((element, i) => {
            // console.log(fs.statSync(element));
            var date = new Date(fs.statSync(element).mtime);
            var dt = moment(date).format('lll');
            var videoName = element.split('/')[element.split('/').length -1];   
            var videoURL = element;

            dataArray.push({
                videoURL: videoURL,
                videoName: videoName,
                dateModified: dt
            })
            if (result.length == i + 1) {
                dataArray.sort(function(a, b) {
                    // console.log(b);
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(b.dateModified) - new Date(a.dateModified);
                });
                res.status(200).json({
                    "status": 200,
                    "message": "success",
                    "result": dataArray
                });
            }
        })
    })
    // s3Handlers.listVideoObjects((err, result) => {
        
    //     if (err) {
    //         res.status(200).json({
    //             "status": 400,
    //             "message": "Error Occurred"
    //         });
    //     } else {
    //         res.status(200).json({
    //             "status": 200,
    //             "message": "success",
    //             "result": result
    //         });
    //     }
    // })
})

router.get('/getCluster', (req, res) => {
    s3Handlers.listVideoObjects((err, result) => {
        if (err) {
            res.status(200).json({
                "status": 400,
                "message": "Error Occurred"
            });
        } else {
            res.status(200).json({
                "status": 200,
                "message": "success",
                "result": result
            });
        }
    })
})

router.get('/deleteAll', (req, res) => {
    var dataArray = [];
    var deleteImagesArray = [];
    var dataToDelete = JSON.parse(req.query.clustersToDelete);
    var videoToDelete = JSON.parse(req.query.videoToDelete);

    dataArray.push({
        Key: videoToDelete[0].Key
    });
    
    // console.log(dataArray);
    s3Handlers.DeleteMultipleObject(dataArray, (err, result) => {
        if (err) {
            res.status(200).json({
                "status": 400,
                "message": "Error Occurred"
            })
        } else {
            s3Handlers.listImageObjects(dataToDelete[0].Key, (err, result) => {
                result.forEach((element, i) => {
                    deleteImagesArray.push({
                        'Key': element
                    })

                    if (result.length == i + 1) {
                        s3Handlers.DeleteMultipleObject(deleteImagesArray, (err, result) => {
                            if (err) {
                                res.status(200).json({
                                    "status": 400,
                                    "message": "Error Occurred"
                                })
                            } else {
                                dataArray = [];
                                dataArray.push({
                                    Key: dataToDelete[0].Key
                                });
                                s3Handlers.DeleteMultipleObject(dataArray, (err, result) => {
                                    if (err) {
                                        res.status(200).json({
                                            "status": 400,
                                            "message": "Error Occurred"
                                        })
                                    } else {
                                        res.status(200).json({
                                            "status": 200,
                                            "message": "deleted successfully"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    })
})

router.post('/deleteZone', (req, res) => {
    console.log(req.body);
    req.body.images.forEach((element, i) => {
        fs.unlinkSync(element.Key);

        if (req.body.images.length == i + 1) {
            res.status(200).json({
                "status": 200,
                "message": "deleted successfully"
            })
        }
    })
})

module.exports = router;