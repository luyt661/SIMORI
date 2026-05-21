import fs from 'fs';

const fileBuffer = fs.readFileSync('src/assets/models/gems/diamond.glb');
const chunk0Length = fileBuffer.readUInt32LE(12);
const jsonString = fileBuffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonString);

console.log('GLTF Materials:');
console.log(JSON.stringify(gltf.materials, null, 2));
