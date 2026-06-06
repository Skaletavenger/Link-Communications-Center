import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './GlobeHero.module.css';

type City = {
  name: string;
  lat: number;
  lon: number;
  isHub?: boolean;
};

type PulsingMesh = THREE.Mesh & { userData: { pulse?: number } };

const cities: City[] = [
  { name: 'Kampala', lat: 0.3476, lon: 32.5825, isHub: true },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
];

const GlobeHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight('#1a6cf6', 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight('#1a6cf6', 1.2, 12);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 1;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: '#050d1a',
      emissive: '#050d1a',
      roughness: 0.5,
      metalness: 0.2,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    const gridMaterial = new THREE.MeshBasicMaterial({
      color: '#0a2a6e',
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const gridMesh = new THREE.Mesh(new THREE.SphereGeometry(globeRadius + 0.001, 64, 64), gridMaterial);
    globeGroup.add(gridMesh);

    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.08, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: '#1a6cf6',
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    const nodeGroup = new THREE.Group();
    globeGroup.add(nodeGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clock = new THREE.Clock();

    const cityMeshes: THREE.Mesh[] = [];
    const cityLookups: { mesh: THREE.Mesh; city: City }[] = [];

    const toVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    };

    const hubCity = cities.find((city) => city.isHub) ?? cities[0];
    const hubPosition = toVector3(hubCity.lat, hubCity.lon, globeRadius);

    cities.forEach((city) => {
      const position = toVector3(city.lat, city.lon, globeRadius);
      const dotRadius = city.isHub ? 0.045 : 0.02;
      const dotMaterial = new THREE.MeshStandardMaterial({
        color: '#00d4ff',
        emissive: '#00d4ff',
        roughness: 0.4,
        metalness: 0.8,
        transparent: true,
        opacity: 1,
      });
      const cityDot = new THREE.Mesh(new THREE.SphereGeometry(dotRadius, 16, 16), dotMaterial);
      cityDot.position.copy(position);
      nodeGroup.add(cityDot);
      cityMeshes.push(cityDot);
      cityLookups.push({ mesh: cityDot, city });

      if (city.isHub) {
        const ringGeometry = new THREE.RingGeometry(dotRadius * 1.5, dotRadius * 2.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: '#00d4ff',
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial) as PulsingMesh;
        ring.position.copy(position);
        const normal = position.clone().normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        ring.quaternion.copy(quaternion);
        ring.rotateX(Math.PI / 2);
        ring.userData.pulse = 0;
        nodeGroup.add(ring);
      }
    });

    const arcData: {
      curve: THREE.QuadraticBezierCurve3;
      tracer: THREE.Mesh;
      speed: number;
    }[] = [];

    const arcMaterial = new THREE.LineBasicMaterial({
      color: '#00d4ff',
      transparent: true,
      opacity: 0.35,
    });

    cities.filter((city) => !city.isHub).forEach((targetCity) => {
      const targetPosition = toVector3(targetCity.lat, targetCity.lon, globeRadius);
      const midPoint = hubPosition.clone().add(targetPosition).multiplyScalar(0.5);
      const control = midPoint.clone().normalize().multiplyScalar(1.25).add(midPoint.clone().multiplyScalar(0.4));
      const curve = new THREE.QuadraticBezierCurve3(hubPosition.clone(), control, targetPosition.clone());
      const points = curve.getPoints(80);
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      globeGroup.add(arcLine);

      const tracer = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 10, 10),
        new THREE.MeshStandardMaterial({
          color: '#1a6cf6',
          emissive: '#1a6cf6',
          roughness: 0.3,
          metalness: 0.6,
          transparent: true,
          opacity: 0.9,
        }),
      );
      globeGroup.add(tracer);
      arcData.push({ curve, tracer, speed: 0.18 + Math.random() * 0.08 });
    });

    const resizeScene = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let targetScale = 1;
    let currentScale = 1;
    let scrollTarget = 0;
    let scrollCurrent = 0;
    let totalTime = 0;
    let frameId = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = x * 0.15;
      targetRotX = y * 0.08;
      mouse.x = x;
      mouse.y = y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cityMeshes, false);
      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;
        const found = cityLookups.find((item) => item.mesh === object);
        if (found) {
          const projected = found.mesh.position.clone().project(camera);
          const xPos = (projected.x * 0.5 + 0.5) * container.clientWidth;
          const yPos = (-projected.y * 0.5 + 0.5) * container.clientHeight;
          setHoverInfo({ name: found.city.name, x: xPos, y: yPos });
          return;
        }
      }
      setHoverInfo(null);
    };

    const onScroll = () => {
      const scrollRatio = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);
      scrollTarget = scrollRatio;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', resizeScene);

    resizeScene();

    const animate = () => {
      const delta = clock.getDelta();
      totalTime += delta;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.06;
      targetScale = 1 - scrollCurrent * 0.08;
      currentScale += (targetScale - currentScale) * 0.06;

      globeGroup.rotation.x = currentRotX;
      globeGroup.rotation.y += 0.002;
      globeGroup.rotation.y += currentRotY * 0.05;
      globeGroup.scale.set(currentScale, currentScale, currentScale);

      nodeGroup.children.forEach((child: THREE.Object3D) => {
        const ring = child as PulsingMesh;
        if (ring.userData.pulse !== undefined) {
          ring.userData.pulse += delta * 2;
          const scale = 1 + Math.sin(ring.userData.pulse) * 0.18;
          ring.scale.set(scale, scale, scale);
          const material = ring.material as THREE.Material & { opacity?: number };
          if (material.opacity !== undefined) {
            material.opacity = 0.35 + Math.sin(ring.userData.pulse) * 0.08;
          }
        }
      });

      arcData.forEach((data) => {
        const t = (totalTime * data.speed) % 1;
        const point = data.curve.getPoint(t);
        data.tracer.position.copy(point);
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resizeScene);
      cancelAnimationFrame(frameId);
      globeGroup.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material: THREE.Material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {hoverInfo && (
        <div
          className={styles.label}
          style={{
            '--hover-x': `${hoverInfo.x}px`,
            '--hover-y': `${hoverInfo.y}px`,
          } as React.CSSProperties}
        >
          {hoverInfo.name}
        </div>
      )}
    </div>
  );
};

export default GlobeHero;
