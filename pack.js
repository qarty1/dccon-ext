const { readFileSync, existsSync, mkdirSync } = require('fs');
const { parse, resolve } = require('path');
const AdmZip = require('adm-zip');
const extName = 'dccon-ext';
const browser = process.env.BROWSER;

try {
  const { base } = parse(__dirname);
  const { version_name, version } = JSON.parse(
    readFileSync(resolve(__dirname, 'build', 'manifest.json'), 'utf8')
  );

  const outdir = 'release';
  const v = version_name === undefined ? version : version_name;
  const filename = `${base}-${browser}-v${v}.zip`;
  const zip = new AdmZip();
  zip.addLocalFolder('build');
  if (!existsSync(outdir)) {
    mkdirSync(outdir);
  }
  zip.writeZip(`${outdir}/${filename}`);

  console.log(
    `Success! Created a ${filename} file under ${outdir} directory. You can upload this file to web store.`
  );
} catch (e) {
  console.error('Error! Failed to generate a zip file.');
}
