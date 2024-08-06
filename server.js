const { nanoid } = require('nanoid');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mime = require('mime-types'); // 用於獲取文件的 MIME 類型

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = nanoid(10);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext); 
        cb(null, `${baseName}${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

// 使用一個簡單的內存對象來保存短網址和文件名的映射
const urlMappings = {};

app.use(cors({
    // origin: 'http://localhost:3000'
}));

app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;

    // 查找短網址對應的文件名
    const filePath = urlMappings[shortUrl];

    if (!filePath) {
        res.status(404).send('圖片不存在');
        return;
    }

    // 獲取文件的 MIME 類型
    const contentType = mime.lookup(filePath);

    if (!contentType) {
        res.status(400).send('無法識別的文件類型');
        return;
    }

    // 設置 Content-Type 標頭
    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath, { root: __dirname }, (err) => {
        if (err) {
            res.status(err.status).end();
        }
    });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const shortUrl = nanoid(10);

    // 保存短網址和文件名的映射
    urlMappings[shortUrl] = path.join('uploads', file.filename);

    res.json({ shortUrl: `http://localhost:3001/${shortUrl}` });
});

app.listen(3001, () => {
    console.log('伺服器啟動在 http://localhost:3001');
});
