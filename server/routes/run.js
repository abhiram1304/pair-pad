// server/routes/run.js
/*────────────────────────────────────────────────────────────────
  POST /api/run
  Body: { code: "...", language: "javascript" | "python" | "cpp" }
  • Sends the code to Docker via STDIN
  • Inside the container, writes it to a temp file
  • Compiles/runs it
  • Streams stdout/stderr back over Socket.IO
────────────────────────────────────────────────────────────────*/

const router    = require('express').Router();
const { spawn } = require('child_process');
const { v4: uuid } = require('uuid');

const recipes = {
  javascript: {
    image: 'node:20-alpine',
    cmd:   ['sh', '-c', 'cat > code.js && node code.js'],
  },
  python: {
    image: 'python:3.11-alpine',
    cmd:   ['sh', '-c', 'cat > code.py && python code.py'],
  },
  cpp: {
    image: 'gcc:12.3.0-bullseye',
    cmd:   ['sh', '-c',
      // write C++ source, then compile & run
      'cat > code.cpp && ' +
      'g++ code.cpp -std=c++17 -O2 -pipe -o code.out && ' +
      './code.out'
    ],
  },
};

router.post('/', async (req, res) => {
  const { code = '', language = 'javascript' } = req.body || {};
  const recipe = recipes[language];
  if (!recipe)      return res.status(400).json({ error: 'unsupported language' });
  if (!code.trim()) return res.status(400).json({ error: 'empty code' });

  // 1) Immediate response with a unique jobId
  const jobId = uuid();
  res.status(202).json({ jobId });

  // 2) Spawn Docker container, reading code from STDIN
  const io = req.app.get('io');
  const proc = spawn('docker', [
    'run', '--rm',
    '--memory', '256m',
    '--cpus',   '0.5',
    '--network','none',
    '-i',                         // <-- keep STDIN open
    recipe.image,
    ...recipe.cmd
  ], { timeout: 5_000 });

  // 3) Pipe code into the container’s STDIN
  proc.stdin.write(code);
  proc.stdin.end();

  // 4) Stream stdout/stderr back to the client
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
