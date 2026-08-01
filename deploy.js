import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('Łączenie z serwerem FTP...');
    await client.access({
      host: 'serwer2665582.hosting-home.pl',
      user: '41958036_passmanagermain1@xcom.com.pl',
      password: 'SAIs6lEo',
      port: 21,
      secure: false
    });

    console.log('Połączono! Przechodzenie do katalogu /andrzej...');
    await client.ensureDir('/andrzej');
    await client.clearWorkingDir();

    console.log('Przesyłanie plików z dist/...');
    await client.uploadFromDir(path.join(__dirname, 'dist'));

    console.log('SUKCES! Wdrożenie zakończone pomyślnie.');
  } catch (err) {
    console.error('Błąd podczas wdrożenia FTP:', err);
  } finally {
    client.close();
  }
}

deploy();
