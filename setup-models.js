const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsToDownload = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const modelsDir = path.join(__dirname, 'assets', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function downloadModels() {
    for (const model of modelsToDownload) {
        const modelUrl = baseUrl + model;
        const modelPath = path.join(modelsDir, model);
        console.log(`Downloading ${model}...`);
        await downloadFile(modelUrl, modelPath);
        console.log(`Downloaded ${model}`);
    }
}

downloadModels().then(() => {
    console.log('All models downloaded successfully!');
}).catch(console.error);