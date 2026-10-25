import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export default function GeometricSculpture({ height = 200, width = '100%', interactive = true }) {
  const containerRef = useRef(null);
  const { animationEnabled, accentColor } = useTheme();
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / (container.clientHeight || height),
      0.1,
      1000
    );
    camera.position.z = 6;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(container.clientWidth, container.clientHeight || height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    // Geometry 1: Core Polyhedron (Olive Green with metallic sheen)
    const icosahedronGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const icosahedronMat = new THREE.MeshStandardMaterial({
      color: 0x606B3D,
      roughness: 0.25,
      metalness: 0.8,
      wireframe: false,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(icosahedronGeo, icosahedronMat);
    scene.add(coreMesh);

    // Geometry 2: Floating Translucent Outer Cage (Pistachio accent)
    const outerGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 50);
    const outerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor || '#C8DEA0'),
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(outerGeo, outerMat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(outerGeo, outerMat);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Inner orbiting sphere (Pistachio highlight)
    const sphereGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor || '#C8DEA0'),
      roughness: 0.1,
      emissive: new THREE.Color(accentColor || '#C8DEA0'),
      emissiveIntensity: 0.35,
    });
    const orbitSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(orbitSphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xC8DEA0, 2.2, 50);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x849B54, 1.5, 50);
    backLight.position.set(-4, -3, -3);
    scene.add(backLight);

    // Pointer Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (animationEnabled) {
        coreMesh.rotation.y += 0.35 * delta;
        coreMesh.rotation.x += 0.2 * delta;

        ring1.rotation.z += 0.25 * delta;
        ring2.rotation.x += 0.2 * delta;

        // Orbit calculation
        orbitSphere.position.x = Math.cos(elapsedTime * 0.8) * 2.4;
        orbitSphere.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
        orbitSphere.position.z = Math.sin(elapsedTime * 0.8) * 1.2;
      }

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 1.2;
      camera.position.y = targetY * 0.8;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [height, interactive, animationEnabled, accentColor]);

  if (!hasWebGL) {
    // Beautiful Accessible Fallback
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(96,107,61,0.2) 0%, rgba(200,222,160,0.1) 100%)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--accent-color)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>◈</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VeroPlan Visual Core</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        cursor: interactive ? 'grab' : 'default',
        overflow: 'hidden',
      }}
    />
  );
}
