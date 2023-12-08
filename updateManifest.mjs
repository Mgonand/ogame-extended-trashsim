import { readFileSync, writeFileSync } from 'fs';

(() => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
  manifest.version = process.env.RELEASE_VERSION;
  writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
})();
