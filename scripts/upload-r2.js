const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = '47c58a4368ac9bec90cf19153d73b5e7';
const ACCESS_KEY_ID = 'e661354e8bd31dc9950cfbb668394632';
const SECRET_ACCESS_KEY = 'ef8babd514c8a7fd627343a9103526ed6b67d40ea049e214248dc562fd392e3f';
const BUCKET_NAME = 'pl-catalogo';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const rootDir = process.cwd();

async function runUpload() {
  console.log('🚀 Iniciando escaneamento e upload automatizado para o Cloudflare R2...');
  console.log(`📦 Bucket de destino: ${BUCKET_NAME}`);

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const productDirs = entries.filter(d =>
    d.isDirectory() &&
    !d.name.startsWith('.') &&
    d.name !== 'node_modules' &&
    d.name !== 'public' &&
    d.name !== 'scripts'
  );

  const fileTasks = [];

  productDirs.forEach(dir => {
    const folderName = dir.name;
    const folderPath = path.join(rootDir, folderName);
    try {
      const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));
      files.forEach(filename => {
        const filePath = path.join(folderPath, filename);
        // Encode dir and filename for S3 Key matching URI scheme
        const encodedDir = folderName.split('/').map(encodeURIComponent).join('/');
        const encodedFile = encodeURIComponent(filename);
        const r2Key = `${encodedDir}/${encodedFile}`;
        fileTasks.push({ filePath, r2Key, folderName, filename });
      });
    } catch (e) {}
  });

  const totalFiles = fileTasks.length;
  console.log(`📸 Encontradas ${totalFiles.toLocaleString('pt-BR')} imagens em ${productDirs.length.toLocaleString('pt-BR')} produtos.`);
  console.log('⚡ Iniciando upload em lote de alta velocidade...\n');

  let completed = 0;
  let skipped = 0;
  let errors = 0;
  const CONCURRENCY = 25; // 25 uploads simultaneos

  async function processTask(task) {
    const ext = path.extname(task.filename).toLowerCase();
    const contentType = mimeTypes[ext] || 'image/jpeg';

    try {
      // Direct PutObject Command with high performance caching headers
      const fileStream = fs.createReadStream(task.filePath);
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: task.r2Key,
        Body: fileStream,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable'
      });

      await s3Client.send(command);
      completed++;
    } catch (err) {
      errors++;
      console.error(`❌ Erro no upload (${task.r2Key}):`, err.message);
    }

    const currentTotal = completed + skipped + errors;
    if (currentTotal % 100 === 0 || currentTotal === totalFiles) {
      const pct = ((currentTotal / totalFiles) * 100).toFixed(1);
      console.log(`[${currentTotal.toLocaleString('pt-BR')}/${totalFiles.toLocaleString('pt-BR')}] ${pct}% concluido | Sucesso: ${completed.toLocaleString('pt-BR')} | Erros: ${errors}`);
    }
  }

  // High-performance worker pool
  const activePromises = new Set();
  for (const task of fileTasks) {
    const p = processTask(task).then(() => activePromises.delete(p));
    activePromises.add(p);
    if (activePromises.size >= CONCURRENCY) {
      await Promise.race(activePromises);
    }
  }
  await Promise.all(activePromises);

  console.log('\n🎉 UPLOAD PARA O CLOUDFLARE R2 CONCLUÍDO COM SUCESSO!');
  console.log(`✅ ${completed.toLocaleString('pt-BR')} imagens enviadas para o R2.`);
  console.log(`🌐 As imagens estarao disponiveis em: https://pub-6d2973b55c1d47578ed242aa628fd9af.r2.dev/\n`);
}

runUpload().catch(err => {
  console.error('💥 Erro fatal no script de upload R2:', err);
});
