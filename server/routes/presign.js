// server/routes/presign.js
const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuid } = require('uuid');

const REGION = 'us-east-1';
const BUCKET = 'pairpad-recordings';

const s3 = new S3Client({ region: REGION });

// POST /api/presign → for uploading
router.get('/', async (req, res) => {
  try {
    const fileKey = `recordings/${uuid()}.webm`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: 'video/webm',
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins

    res.json({ url, key: fileKey });
  } catch (err) {
    console.error('[presign] Error generating presigned URL', err);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

// GET /api/presign/list → for listing uploaded files
router.get('/list', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'recordings/',
    });

    const { Contents } = await s3.send(command);

    const files = await Promise.all(
      (Contents || []).map(async (obj) => {
        const getCmd = new GetObjectCommand({
          Bucket: BUCKET,
          Key: obj.Key,
        });

        const url = await getSignedUrl(s3, getCmd, { expiresIn: 300 });

        return {
          key: obj.Key,
          url,
          size: `${(obj.Size / 1024).toFixed(1)} KB`,
          date: obj.LastModified,
        };
      })
    );

    res.json(files);
  } catch (err) {
    console.error('[presign/list] Error listing recordings', err);
    res.status(500).json({ error: 'Failed to list recordings' });
  }
});

module.exports = router;
