// server/routes/presign.js
const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuid } = require('uuid');

const REGION = 'us-east-1';                   // your AWS region
const BUCKET = 'pairpad-recordings';          // your bucket name

const s3 = new S3Client({ region: REGION });

router.get('/', async (req, res) => {
  try {
    const fileKey = `recordings/${uuid()}.webm`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: 'video/webm',
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

    res.json({ url, key: fileKey });
  } catch (err) {
    console.error('[presign] Error:', err);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

module.exports = router;
