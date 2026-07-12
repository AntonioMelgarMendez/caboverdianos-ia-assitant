const { Document, NodeIO } = require('@gltf-transform/core');
const { KHRONOS_EXTENSIONS } = require('@gltf-transform/extensions');
const fs = require('fs');

async function fixGltf() {
  console.log('Loading GLB...');
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const doc = await io.read('src/assets/Cipitio.glb');
  
  const root = doc.getRoot();
  const scenes = root.listScenes();
  const defaultScene = scenes[0];
  const rootNodes = defaultScene.listChildren();
  
  console.log('Root nodes in scene:', rootNodes.map(n => n.getName()));
  
  // The first node will be our base model. We will retarget all animations to its bones.
  const baseNode = rootNodes[0];
  const otherNodes = rootNodes.slice(1);
  
  // Build a map of bone name -> base model bone node
  const baseBones = new Map();
  baseNode.traverse(node => {
    baseBones.set(node.getName(), node);
  });
  
  console.log(`Found ${baseBones.size} bones/nodes in base model.`);
  
  // Retarget animations
  const animations = root.listAnimations();
  console.log(`Retargeting ${animations.length} animations...`);
  
  for (const anim of animations) {
    const channels = anim.listChannels();
    for (const channel of channels) {
      const targetNode = channel.getTargetNode();
      if (targetNode) {
        const name = targetNode.getName();
        const newTarget = baseBones.get(name);
        if (newTarget) {
          channel.setTargetNode(newTarget);
        } else {
          // If it targets a root node itself (e.g. 'Sitting'), retarget to 'Dancing' (baseNode)
          if (rootNodes.includes(targetNode)) {
            channel.setTargetNode(baseNode);
          }
        }
      }
    }
  }
  
  // Remove the other 5 models
  console.log('Removing duplicate models...');
  for (const node of otherNodes) {
    node.dispose();
  }
  
  // The base node name doesn't matter much, let's just name it 'Cipitio'
  baseNode.setName('Cipitio');
  
  console.log('Saving Cipitio_fixed.glb...');
  await io.write('src/assets/Cipitio_fixed.glb', doc);
  console.log('Done!');
}

fixGltf().catch(console.error);
