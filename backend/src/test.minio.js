import client, { ensureBucket } from '../utils/minioClient.js';

async function run() {
  try {
    const created = await ensureBucket('my-bucket');
    console.log(created ? 'Bucket créé' : 'Bucket déjà existant');

    // const filePath = './photo.png';
    // const fileBuffer = fs.readFileSync(filePath);

        // const objectName = 'images/photo.png';

    const etag = await client.putObject(
      'my-bucket',
      'hello.txt',
      // objectName,
      Buffer.from('Bonjour MinIO')
    );
    console.log('Objet uploadé, etag:', etag);
  } catch (err) {
    console.error('Erreur lors de l\'interaction avec MinIO:', err);
  }
}

run();
