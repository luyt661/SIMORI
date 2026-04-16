const prettify = (key) => key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const toList = (globResult) => Object.entries(globResult).map(([path, url]) => {
  const filename = path.split('/').pop();
  const key = filename?.replace(/\.(glb|gltf)$/i, '') || filename;
  return { key, name: prettify(key), url };
});

export const modelGroups = {
  settings: toList(import.meta.glob('/src/assets/models/settings/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' })),
  bands: toList(import.meta.glob('/src/assets/models/bands/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' })),
  gems: toList(import.meta.glob('/src/assets/models/gems/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' })),
  materials: toList(import.meta.glob('/src/assets/models/materials/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' })),
  presets: toList(import.meta.glob('/src/assets/models/presets/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' })),
};

export const hasModels = Object.values(modelGroups).some((list) => list.length > 0);
