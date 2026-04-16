# 3D Model Drop Zone

Place production assets here. Suggested layout:
- settings/: prong.glb, bezel.glb, halo.glb, tension.glb, channel.glb
- bands/: plain.glb, pave.glb, eternity.glb, twisted.glb, milgrain.glb, split-shank.glb
- gems/: diamond.glb, sapphire.glb, ruby.glb, emerald.glb, amethyst.glb, topaz.glb (or shared mesh + material variants)
- materials/: PBR maps (albedo/metallic/roughness/normal) or baked variants
- presets/: full-ring presets if needed

Use URLs in code like: /models/settings/prong.glb
If using Draco/meshopt, put decoders in /public/decoders/ and set loader paths accordingly.
