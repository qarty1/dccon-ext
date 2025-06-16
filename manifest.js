const { copyFileSync } = require('fs');
const browser = process.env.BROWSER;

if(!browser) {
    browser = 'chrome';
}
try {
    copyFileSync(`manifest/manifest-${browser}.json`, 'public/manifest.json');
} catch (e) {
    console.log(e);
}