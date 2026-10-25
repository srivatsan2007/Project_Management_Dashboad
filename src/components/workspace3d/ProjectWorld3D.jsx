import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const STATUS_BAY_CONFIG = {
  'To Do': { x: 5, z: -8, color: '#4A5542', label: 'To Do Depot' },
  'In Progress': { x: 13, z: -8, color: '#C8DEA0', label: 'In Progress Depot' },
  'Testing': { x: 5, z: 8, color: '#E5A448', label: 'Testing Depot' },
  'Completed': { x: 13, z: 8, color: '#6BA84F', label: 'Completed Deliverables' },
};

const PRIORITY_COLORS = {
  Urgent: 0xf07b7b,
  High: 0xe5a448,
  Medium: 0x72a5f5,
  Low: 0x7ab95f,
};

export default function ProjectWorld3D({
  projects = [],
  tasks = [],
  milestones = [],
  getProjectProgress = () => 0,
  selectedEntity = null,
  onSelectEntity = () => {},
  autoRotate = false,
  cameraView = 'iso', // 'iso' | 'top' | 'reset'
}) {
  const mountRef = useRef(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = useState(true);

  // References for render loop & raycasting
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const interactiveObjectsRef = useRef([]);
  const targetCameraPosRef = useRef(new THREE.Vector3(28, 24, 28));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioningCameraRef = useRef(false);

  // Check WebGL availability
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !hasWebGL) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x192017); // Deep Olive backdrop
    scene.fog = new THREE.FogExp2(0x192017, 0.015);

    // 2. Camera (Isometric Perspective)
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.5, 500);
    camera.position.set(28, 24, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 8;
    controls.maxDistance = 65;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera going under platform
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xf2f4eb, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf3f5e9, 1.4);
    dirLight.position.set(24, 38, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const accentPointLight = new THREE.PointLight(0xc8dea0, 1.8, 45);
    accentPointLight.position.set(-6, 8, -6);
    scene.add(accentPointLight);

    const depotFillLight = new THREE.PointLight(0x849b54, 1.2, 40);
    depotFillLight.position.set(10, 6, 0);
    scene.add(depotFillLight);

    // 6. Base Central Workspace Island
    const baseGeo = new THREE.BoxGeometry(40, 1.4, 38);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e261b,
      roughness: 0.7,
      metalness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.7;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Top Border Bevel
    const borderGeo = new THREE.BoxGeometry(40.4, 0.15, 38.4);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x606b3d,
      roughness: 0.3,
      metalness: 0.5,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = 0.05;
    scene.add(borderMesh);

    // Grid Floor Overlay
    const grid = new THREE.GridHelper(38, 38, 0x606b3d, 0x273422);
    grid.position.y = 0.08;
    scene.add(grid);

    // 7. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let hitObj = intersects[0].object;
        while (hitObj && !hitObj.userData?.entityType && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj?.userData?.entityType) {
          container.style.cursor = 'pointer';
          setHoveredEntity(hitObj.userData);
          setTooltipPos({ x: e.clientX, y: e.clientY });
          return;
        }
      }

      container.style.cursor = 'default';
      setHoveredEntity(null);
    };

    const handlePointerDown = (e) => {
      // Raycast click
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let hitObj = intersects[0].object;
        while (hitObj && !hitObj.userData?.entityType && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj?.userData?.entityType) {
          onSelectEntity({
            type: hitObj.userData.entityType,
            id: hitObj.userData.id,
            data: hitObj.userData.data,
            position: hitObj.userData.worldPos,
          });

          // Focus camera towards clicked object
          const pos = hitObj.userData.worldPos;
          if (pos) {
            targetLookAtRef.current.set(pos.x, pos.y, pos.z);
            targetCameraPosRef.current.set(pos.x + 12, pos.y + 10, pos.z + 12);
            isTransitioningCameraRef.current = true;
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('pointerdown', handlePointerDown);

    // 8. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera lerp transition towards target
      if (isTransitioningCameraRef.current) {
        camera.position.lerp(targetCameraPosRef.current, 0.08);
        controls.target.lerp(targetLookAtRef.current, 0.08);

        if (
          camera.position.distanceTo(targetCameraPosRef.current) < 0.2 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.2
        ) {
          isTransitioningCameraRef.current = false;
        }
      }

      // Auto-rotation when toggled
      if (autoRotate && !isTransitioningCameraRef.current) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
      } else {
        controls.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, [hasWebGL, autoRotate, onSelectEntity]);

  // Synchronize 3D World Objects with Real Data
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing dynamic objects group
    const existingGroup = scene.getObjectByName('dynamic-workspace-world');
    if (existingGroup) {
      scene.remove(existingGroup);
    }

    const worldGroup = new THREE.Group();
    worldGroup.name = 'dynamic-workspace-world';
    interactiveObjectsRef.current = [];

    // ==============================================================
    // A. TASK DEPOTS (4 Status Bays on the Right Side of Island)
    // ==============================================================
    Object.entries(STATUS_BAY_CONFIG).forEach(([statusKey, cfg]) => {
      const bayGroup = new THREE.Group();
      bayGroup.position.set(cfg.x, 0.1, cfg.z);

      // Bay Foundation Slab
      const slabGeo = new THREE.BoxGeometry(6.6, 0.22, 11);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x222a1f,
        roughness: 0.6,
        metalness: 0.3,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = true;
      bayGroup.add(slab);

      // Bay Neon Border
      const neonGeo = new THREE.BoxGeometry(6.8, 0.08, 11.2);
      const neonMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        emissive: new THREE.Color(cfg.color),
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.y = 0.12;
      bayGroup.add(neon);

      // Status Stencil Pillar on Bay Corner
      const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x606b3d, metalness: 0.8 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(-3.0, 0.9, -5.2);
      bayGroup.add(post);

      const beaconGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        emissive: new THREE.Color(cfg.color),
        emissiveIntensity: 0.8,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(-3.0, 1.9, -5.2);
      bayGroup.add(beacon);

      worldGroup.add(bayGroup);
    });

    // ==============================================================
    // B. REAL TASKS -> 3D CARGO CRATES IN CORRESPONDING DEPOTS
    // ==============================================================
    const tasksByStatus = {
      'To Do': [],
      'In Progress': [],
      'Testing': [],
      'Completed': [],
    };

    tasks.forEach((t) => {
      const st = tasksByStatus[t.status] ? t.status : 'To Do';
      tasksByStatus[st].push(t);
    });

    Object.entries(tasksByStatus).forEach(([statusKey, taskList]) => {
      const cfg = STATUS_BAY_CONFIG[statusKey];
      if (!cfg) return;

      taskList.forEach((task, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const crateX = cfg.x + (col - 0.5) * 2.5;
        const crateZ = cfg.z - 3.8 + row * 2.2;
        const crateY = 0.65;

        const isSelected = selectedEntity?.type === 'task' && selectedEntity.id === task.id;

        const crateGroup = new THREE.Group();
        crateGroup.position.set(crateX, crateY, crateZ);

        // Crate Main Body
        const crateGeo = new THREE.BoxGeometry(1.9, 0.9, 1.7);
        const crateMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xc8dea0 : 0x2d3829,
          roughness: 0.35,
          metalness: 0.6,
        });
        const crateMesh = new THREE.Mesh(crateGeo, crateMat);
        crateMesh.castShadow = true;
        crateMesh.receiveShadow = true;
        crateGroup.add(crateMesh);

        // Priority Color Accent Band
        const priorityColor = PRIORITY_COLORS[task.priority] || 0x72a5f5;
        const bandGeo = new THREE.BoxGeometry(2.0, 0.18, 1.8);
        const bandMat = new THREE.MeshStandardMaterial({
          color: priorityColor,
          emissive: isSelected ? 0xc8dea0 : priorityColor,
          emissiveIntensity: isSelected ? 0.7 : 0.35,
        });
        const bandMesh = new THREE.Mesh(bandGeo, bandMat);
        bandMesh.position.y = 0.15;
        crateGroup.add(bandMesh);

        // Top Status Pip
        const pipGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
        const pipMat = new THREE.MeshStandardMaterial({
          color: priorityColor,
          emissive: priorityColor,
          emissiveIntensity: 0.9,
        });
        const pip = new THREE.Mesh(pipGeo, pipMat);
        pip.position.y = 0.48;
        crateGroup.add(pip);

        // Metadata for Raycasting
        crateGroup.userData = {
          entityType: 'task',
          id: task.id,
          data: task,
          worldPos: new THREE.Vector3(crateX, crateY, crateZ),
        };

        worldGroup.add(crateGroup);
        interactiveObjectsRef.current.push(crateGroup);
      });
    });

    // ==============================================================
    // C. REAL PROJECTS -> 3D PROJECT ZONES / DOCKS
    // ==============================================================
    projects.forEach((proj, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const projX = -13 + col * 6.5;
      const projZ = -10 + row * 7.5;
      const projY = 0.1;

      const progress = getProjectProgress(proj.id);
      const isSelected = selectedEntity?.type === 'project' && selectedEntity.id === proj.id;

      const projGroup = new THREE.Group();
      projGroup.position.set(projX, projY, projZ);

      // Project Base Pedestal
      const dockGeo = new THREE.CylinderGeometry(2.7, 2.9, 0.35, 32);
      const dockColor = proj.color ? new THREE.Color(proj.color) : new THREE.Color(0x606b3d);
      const dockMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xc8dea0 : dockColor,
        roughness: 0.3,
        metalness: 0.5,
      });
      const dockMesh = new THREE.Mesh(dockGeo, dockMat);
      dockMesh.receiveShadow = true;
      projGroup.add(dockMesh);

      // Project Outer Ring Halo
      const ringGeo = new THREE.TorusGeometry(3.1, 0.08, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xc8dea0 : 0x849b54,
        emissive: isSelected ? 0xc8dea0 : 0x606b3d,
        emissiveIntensity: isSelected ? 0.8 : 0.25,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.2;
      projGroup.add(ringMesh);

      // Central Dynamic Progress Pillar (Height scales with % completion)
      const pillarH = Math.max(0.4, (progress / 100) * 3.4);
      const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, pillarH, 24);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: progress >= 100 ? 0x6ba84f : 0xc8dea0,
        emissive: progress >= 100 ? 0x6ba84f : 0x606b3d,
        emissiveIntensity: 0.35,
        roughness: 0.25,
        metalness: 0.6,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 0.18 + pillarH / 2;
      pillar.castShadow = true;
      projGroup.add(pillar);

      // Crown Holographic Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xc8dea0,
        emissive: 0xc8dea0,
        emissiveIntensity: 0.7,
        roughness: 0.1,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.18 + pillarH + 0.5;
      projGroup.add(crystal);

      // Metadata for Raycasting
      projGroup.userData = {
        entityType: 'project',
        id: proj.id,
        data: proj,
        progress,
        worldPos: new THREE.Vector3(projX, projY + pillarH / 2, projZ),
      };

      worldGroup.add(projGroup);
      interactiveObjectsRef.current.push(projGroup);
    });

    // ==============================================================
    // D. REAL MILESTONES -> 3D WAYPOINT OBELISKS ALONG PATHWAY
    // ==============================================================
    milestones.forEach((m, idx) => {
      // Position along front perimeter pathway
      const msX = -12 + (idx * 5.5);
      const msZ = 14;
      const msY = 0.1;

      const isDone = m.status === 'Completed';
      const isSelected = selectedEntity?.type === 'milestone' && selectedEntity.id === m.id;

      const msGroup = new THREE.Group();
      msGroup.position.set(msX, msY, msZ);

      // Milestone Stepping Pedestal
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.25, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isDone ? 0x6ba84f : 0x364132,
        roughness: 0.5,
        metalness: 0.4,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.receiveShadow = true;
      msGroup.add(baseMesh);

      // Obelisk Crystal
      const crystalGeo = new THREE.ConeGeometry(0.5, 1.8, 6);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: isDone ? 0xc8dea0 : 0xe5a448,
        emissive: isDone ? 0xc8dea0 : 0xe5a448,
        emissiveIntensity: isSelected ? 0.9 : 0.45,
        roughness: 0.2,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 1.05;
      crystal.castShadow = true;
      msGroup.add(crystal);

      // Metadata for Raycasting
      msGroup.userData = {
        entityType: 'milestone',
        id: m.id,
        data: m,
        worldPos: new THREE.Vector3(msX, msY + 1.0, msZ),
      };

      worldGroup.add(msGroup);
      interactiveObjectsRef.current.push(msGroup);
    });

    // ==============================================================
    // E. CONNECTING CONDUIT LINES (Link tasks to their parent projects)
    // ==============================================================
    tasks.forEach((t) => {
      if (!t.project_id) return;
      const projectIdx = projects.findIndex((p) => p.id === t.project_id);
      if (projectIdx === -1) return;

      const pCol = projectIdx % 2;
      const pRow = Math.floor(projectIdx / 2);
      const pX = -13 + pCol * 6.5;
      const pZ = -10 + pRow * 7.5;

      const cfg = STATUS_BAY_CONFIG[t.status] || STATUS_BAY_CONFIG['To Do'];
      const taskIdx = tasks.filter((ot) => ot.status === t.status).findIndex((ot) => ot.id === t.id);
      const tCol = taskIdx % 2;
      const tRow = Math.floor(taskIdx / 2);
      const tX = cfg.x + (tCol - 0.5) * 2.5;
      const tZ = cfg.z - 3.8 + tRow * 2.2;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(pX, 0.4, pZ),
        new THREE.Vector3((pX + tX) / 2, 2.4, (pZ + tZ) / 2),
        new THREE.Vector3(tX, 0.4, tZ)
      );

      const points = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x849b54,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      worldGroup.add(line);
    });

    // ==============================================================
    // F. EMPTY STATE BEACON (Shown if user has 0 projects)
    // ==============================================================
    if (projects.length === 0) {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(0, 0.2, 0);

      const beaconRingGeo = new THREE.TorusGeometry(3.5, 0.12, 16, 64);
      const beaconRingMat = new THREE.MeshStandardMaterial({
        color: 0xc8dea0,
        emissive: 0xc8dea0,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconGroup.add(beaconRing);

      const corePoly = new THREE.IcosahedronGeometry(1.2, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x606b3d,
        emissive: 0x606b3d,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.6,
      });
      const coreMesh = new THREE.Mesh(corePoly, coreMat);
      coreMesh.position.y = 1.8;
      beaconGroup.add(coreMesh);

      worldGroup.add(beaconGroup);
    }

    scene.add(worldGroup);
  }, [projects, tasks, milestones, getProjectProgress, selectedEntity]);

  // Handle Camera View Presets
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (cameraView === 'top') {
      targetCameraPosRef.current.set(0, 42, 0.1);
      targetLookAtRef.current.set(0, 0, 0);
      isTransitioningCameraRef.current = true;
    } else if (cameraView === 'iso' || cameraView === 'reset') {
      targetCameraPosRef.current.set(28, 24, 28);
      targetLookAtRef.current.set(0, 0, 0);
      isTransitioningCameraRef.current = true;
    }
  }, [cameraView]);

  if (!hasWebGL) {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--card-radius)',
          border: '1px solid var(--border-card)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: '8px' }}>WebGL is not supported</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Your browser or hardware graphics acceleration is disabled. Please enable WebGL or hardware acceleration to experience the interactive 3D Project Workspace.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating 3D Hover Tooltip */}
      {hoveredEntity && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x + 14}px`,
            top: `${tooltipPos.y + 14}px`,
            zIndex: 9999,
            pointerEvents: 'none',
            background: 'rgba(34, 41, 31, 0.95)',
            border: '1px solid var(--color-pistachio-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(6px)',
            maxWidth: '260px',
            fontSize: '0.8rem',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-pistachio-accent)',
                letterSpacing: '0.06em',
              }}
            >
              {hoveredEntity.entityType}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(200, 222, 160, 0.15)',
                color: 'var(--text-primary)',
              }}
            >
              {hoveredEntity.data?.status || 'Active'}
            </span>
          </div>

          <div style={{ fontWeight: 700, color: '#F2F4EB', marginBottom: '2px', wordBreak: 'break-word' }}>
            {hoveredEntity.data?.name || hoveredEntity.data?.title}
          </div>

          {hoveredEntity.entityType === 'project' && (
            <div style={{ color: 'var(--color-pistachio-accent)', fontSize: '0.725rem' }}>
              Progress: {hoveredEntity.progress}%
            </div>
          )}

          {hoveredEntity.entityType === 'task' && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
              Priority: {hoveredEntity.data?.priority || 'Medium'} • {hoveredEntity.data?.due_date || 'No due date'}
            </div>
          )}

          {hoveredEntity.entityType === 'milestone' && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
              Due: {hoveredEntity.data?.due_date}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
