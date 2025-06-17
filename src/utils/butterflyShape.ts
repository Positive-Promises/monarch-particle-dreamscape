
import * as THREE from 'three';

// Generate butterfly shape coordinates
export const butterflyShape: THREE.Vector3[] = [];

const generateButterflyShape = () => {
  const points: THREE.Vector3[] = [];
  
  // Butterfly body (15% of particles - about 225 particles)
  for (let i = 0; i < 225; i++) {
    const t = (i / 225) * 2 - 1; // -1 to 1
    const x = 0;
    const y = t * 2.5; // Length of body
    const z = Math.sin(t * Math.PI) * 0.1; // Slight curve
    points.push(new THREE.Vector3(x, y, z));
  }
  
  // Left wing (42.5% of particles - about 638 particles)
  for (let i = 0; i < 638; i++) {
    const u = Math.random();
    const v = Math.random();
    
    // Upper wing
    if (v > 0.5) {
      const t = u * Math.PI;
      const r = 2 + Math.sin(t * 2) * 0.5;
      const x = -r * Math.sin(t);
      const y = r * Math.cos(t) * 0.8 + 0.5;
      const z = Math.random() * 0.1 - 0.05;
      
      points.push(new THREE.Vector3(x, y, z));
    } else {
      // Lower wing
      const t = u * Math.PI * 0.7;
      const r = 1.2 + Math.sin(t * 3) * 0.3;
      const x = -r * Math.sin(t);
      const y = -r * Math.cos(t) * 0.6 - 0.3;
      const z = Math.random() * 0.1 - 0.05;
      
      points.push(new THREE.Vector3(x, y, z));
    }
  }
  
  // Right wing (42.5% of particles - about 637 particles)
  for (let i = 0; i < 637; i++) {
    const u = Math.random();
    const v = Math.random();
    
    // Upper wing
    if (v > 0.5) {
      const t = u * Math.PI;
      const r = 2 + Math.sin(t * 2) * 0.5;
      const x = r * Math.sin(t);
      const y = r * Math.cos(t) * 0.8 + 0.5;
      const z = Math.random() * 0.1 - 0.05;
      
      points.push(new THREE.Vector3(x, y, z));
    } else {
      // Lower wing
      const t = u * Math.PI * 0.7;
      const r = 1.2 + Math.sin(t * 3) * 0.3;
      const x = r * Math.sin(t);
      const y = -r * Math.cos(t) * 0.6 - 0.3;
      const z = Math.random() * 0.1 - 0.05;
      
      points.push(new THREE.Vector3(x, y, z));
    }
  }
  
  // Add polka dots pattern (black spots on wings)
  const dotPositions = [
    // Left wing dots
    new THREE.Vector3(-1.5, 1.2, 0.02),
    new THREE.Vector3(-0.8, 0.8, 0.02),
    new THREE.Vector3(-1.2, 0.4, 0.02),
    new THREE.Vector3(-0.6, -0.2, 0.02),
    new THREE.Vector3(-0.9, -0.8, 0.02),
    
    // Right wing dots
    new THREE.Vector3(1.5, 1.2, 0.02),
    new THREE.Vector3(0.8, 0.8, 0.02),
    new THREE.Vector3(1.2, 0.4, 0.02),
    new THREE.Vector3(0.6, -0.2, 0.02),
    new THREE.Vector3(0.9, -0.8, 0.02),
  ];
  
  // Add small clusters around each dot position
  dotPositions.forEach(dotPos => {
    for (let i = 0; i < 8; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.05
      );
      if (points.length < 1500) {
        points.push(dotPos.clone().add(offset));
      }
    }
  });
  
  return points;
};

// Generate the butterfly shape
butterflyShape.push(...generateButterflyShape());

export default butterflyShape;
