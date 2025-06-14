// server/routes/run.js
const router = require('express').Router();
const { exec } = require('child_process');
const { v4: uuid } = require('uuid');

router.post('/', async (req, res) => {
  const { code = '', language = 'javascript' } = req.body || {};
  if (!['javascript', 'python'].includes(language))
    return res.status(400).json({ error: 'Only JavaScript and Python are supported in demo' });
  if (!code.trim())
    return res.status(400).json({ error: 'Empty code' });

  // 1) Immediate response with a unique jobId
  const jobId = uuid();
  res.status(202).json({ jobId });

  // 2) Pick command
  let command;
  if (language === 'javascript') {
    command = `node -e "${code.replace(/"/g, '\\"')}"`;
  } else if (language === 'python') {
    command = `python3 -c "${code.replace(/"/g, '\\"')}"`;
  }

  // 3) Execute command directly on server (no Docker)
  const io = req.app.get('io');
  const proc = exec(command);

  proc.stdout.on('data', chunk =>
    io.to(jobId).emit('run-out', { type: 'stdout', data: chunk.toString() })
  );
  proc.stderr.on('data', chunk =>
    io.to(jobId).emit('run-out', { type: 'stderr', data: chunk.toString() })
  );
  proc.on('close', (exitCode) => {
    io.to(jobId).emit('run-done', { exitCode });
  });
});

module.exports = router;
