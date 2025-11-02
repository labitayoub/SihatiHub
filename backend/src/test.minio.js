// src/minioExample.js
import client, { ensureBucket } from '../utils/minioClient.js';

async function run() {
  try {
    const created = await ensureBucket('my-bucket');
    console.log(created ? 'Bucket créé' : 'Bucket déjà existant');

    // putObject with Buffer
    client.putObject('my-bucket', 'hello.txt', Buffer.from('Bonjour MinIO'), (err, etag) => {
      if (err) return console.error('putObject error:', err);
      console.log('Objet uploadé, etag:', etag);
    });
  } catch (err) {
    console.error('Erreur MinIO:', err);
  }
}

run();