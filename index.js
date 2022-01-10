const express = require('express');
const multer = require('multer');
require('dotenv').config()

const AWS = require('aws-sdk');
const app = express();
const bodyParser = require('body-parser');
const upload = multer();
const s3 = new AWS.S3({
    endpoint: process.env.ENDPOINT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});

app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

app.post('/upload', upload.none(), (req, res) => {
    const buf = Buffer.from(
        req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
    );

    const params = {
        Bucket: 'your-bucket-name', // pass your bucket name
        Key: `${Math.floor(Date.now() / 1000)}.png`, //here is your file name
        Body: buf,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: 'image/png',
    };

    s3.upload(params, (s3Err, data) => {
        if (s3Err) {
            res.json({
                success: false,
                error: s3Err,
            });
        } else {
            res.json({
                success: true,
                data: data.Location,
            });
        }
    });
});

app.listen(3000);