const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
const outputPath = path.join(__dirname, 'src/environments/environment.ts');

const env = dotenv.parse(fs.readFileSync(envPath));

const envObj = {
  production: false,
  backendUrl: env.BACKEND_URL
};

const tsContent = `export const environment = ${JSON.stringify(envObj, null, 2)};\n`;

fs.writeFileSync(outputPath, tsContent);
console.log('environment.ts generado correctamente');
