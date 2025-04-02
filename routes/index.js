const express = require('express');
const router = express.Router();
const uuid = require('uuid');
let upload = require('./upload');
const url = require('url');
let Image = require('../models/images');

router.get('/', async (req, res) => {
    try {
        const images = await Image.find({});  // ✅ Use async/await instead of callback
        res.render('index', { images: images, msg: req.query.msg });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/upload', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.redirect(`/?msg=${err}`);
        } else {
            console.log(req.file);
            
            if (!req.file) {
                res.redirect('/?msg=Error: No file selected!');
            } else {
                try {
                    // Create new image
                    let newImage = new Image({
                        name: req.file.filename,
                        size: req.file.size,
                        path: 'images/' + req.file.filename
                    });

                    // Save the uploaded image to the database
                    await newImage.save();  // ✅ Use `await` to properly handle the DB operation
                    
                    res.redirect('/?msg=File uploaded successfully');
                } catch (saveErr) {
                    console.error(saveErr);
                    res.redirect('/?msg=Error saving file to database');
                }
            }
        }
    });
});

module.exports = router;
