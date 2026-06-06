'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from './GlobeHero.module.css'

export default function GlobeHero(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const scrollY = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = 500
    const height = 500
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x4488ff, 1.2)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x1a6cf6, 0.8)
    pointLight.position.set(-5, 2, -3)
    scene.add(pointLight)

    const starCount = 3000
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i += 1) {
      const r = 90 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r
      starPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r
      starPositions[i * 3 + 2] = Math.cos(phi) * r
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))

    const starCanvas = document.createElement('canvas')
    starCanvas.width = 16
    starCanvas.height = 16
    const starContext = starCanvas.getContext('2d')
    if (starContext) {
      starContext.beginPath()
      starContext.arc(8, 8, 6, 0, Math.PI * 2)
      starContext.fillStyle = 'white'
      starContext.fill()
    }
    const starTexture = new THREE.CanvasTexture(starCanvas)

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      map: starTexture,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const globeRadius = 1.8
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64)
    let globeMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial> | null = null
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        texture.encoding = THREE.sRGBEncoding
        const globeMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          shininess: 60,
          specular: new THREE.Color('#1a6cf6'),
        })
        globeMesh = new THREE.Mesh(globeGeometry, globeMaterial)
        globeGroup.add(globeMesh)
      }
    )

    const atmosphereGeometry = new THREE.SphereGeometry(1.95, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying float vFresnel;
        void main() {
          vec3 worldNormal = normalize(normalMatrix * normal);
          vec3 viewDirection = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          vFresnel = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), 2.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vFresnel;
        void main() {
          gl_FragColor = vec4(vec3(0.102, 0.424, 0.902), vFresnel * 0.9);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    globeGroup.add(atmosphereMesh)

    const gridGeometry = new THREE.SphereGeometry(1.81, 64, 64)
    const wireGeometry = new THREE.WireframeGeometry(gridGeometry)
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x0a3a8a,
      opacity: 0.25,
      transparent: true,
    })
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial)
    globeGroup.add(wireframe)

    const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)
      return new THREE.Vector3(x, y, z)
    }

    type City = { lat: number; lng: number; color: number; size: number; isHub?: boolean }
    const cityRadius = 1.82
    const cities: City[] = [
      { lat: 0.3476, lng: 32.5825, color: 0x1a6cf6, size: 0.045, isHub: true },
      { lat: -1.2921, lng: 36.8219, color: 0x00d4ff, size: 0.025 },
      { lat: 51.5074, lng: -0.1278, color: 0x00d4ff, size: 0.025 },
      { lat: 25.2048, lng: 55.2708, color: 0x00d4ff, size: 0.025 },
      { lat: -26.2041, lng: 28.0473, color: 0x00d4ff, size: 0.025 },
      { lat: 30.0444, lng: 31.2357, color: 0x00d4ff, size: 0.025 },
    ]

    const ugandaPosition = latLngToVector3(0.3476, 32.5825, cityRadius)
    const arcDots: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = []

    for (let i = 0; i < cities.length; i += 1) {
      const city = cities[i]
      const position = latLngToVector3(city.lat, city.lng, cityRadius)
      const nodeGeometry = new THREE.SphereGeometry(city.size, 16, 16)
      const nodeMaterial = new THREE.MeshBasicMaterial({ color: city.color })
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
      nodeMesh.position.copy(position)
      globeGroup.add(nodeMesh)

      if (city.isHub) {
        for (let ringIndex = 0; ringIndex < 2; ringIndex += 1) {
          const ringGeometry = new THREE.RingGeometry(city.size * 1.5, city.size * 3.5, 64)
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a6cf6,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
          })
          const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
          ringMesh.position.copy(position)
          ringMesh.lookAt(camera.position)
          ringMesh.userData = { pulse: ringIndex * 0.8 }
          globeGroup.add(ringMesh)
        }
      }

      if (!city.isHub) {
        const controlPoint = new THREE.Vector3().addVectors(ugandaPosition, position).multiplyScalar(0.5).normalize().multiplyScalar(1.8)
        const curve = new THREE.QuadraticBezierCurve3(ugandaPosition.clone(), controlPoint, position.clone())
        const points = curve.getPoints(100)
        const curvePositions = new Float32Array(points.length * 3)
        for (let j = 0; j < points.length; j += 1) {
          curvePositions[j * 3 + 0] = points[j].x
          curvePositions[j * 3 + 1] = points[j].y
          curvePositions[j * 3 + 2] = points[j].z
        }
        const arcGeometry = new THREE.BufferGeometry()
        arcGeometry.setAttribute('position', new THREE.BufferAttribute(curvePositions, 3))
        const arcMaterial = new THREE.LineBasicMaterial({ color: 0x00d4ff, opacity: 0.5, transparent: true })
        const arcLine = new THREE.Line(arcGeometry, arcMaterial)
        globeGroup.add(arcLine)

        const dotGeometry = new THREE.SphereGeometry(0.018, 8, 8)
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial)
        globeGroup.add(dotMesh)
        arcDots.push({ mesh: dotMesh, curve, offset: i * 0.2 })
      }
    }

    let mouseX = 0
    let mouseY = 0
    const targetRotation = { x: 0, y: 0 }

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
      mouseX = THREE.MathUtils.clamp(x, -1, 1)
      mouseY = THREE.MathUtils.clamp(y, -1, 1)
    }

    const handleScroll = () => {
      scrollY.current = window.scrollY
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('scroll', handleScroll)

    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const delta = clock.getDelta()

      globeGroup.rotation.y += 0.0008
      targetRotation.x += (mouseY * 0.3 - targetRotation.x) * 0.05
      targetRotation.y += (mouseX * 0.3 - targetRotation.y) * 0.05
      globeGroup.rotation.x = targetRotation.x
      globeGroup.rotation.y += targetRotation.y * 0.01
      globeGroup.rotation.y += scrollY.current * 0.0005

      globeGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData && typeof child.userData.pulse === 'number') {
          child.userData.pulse += delta * 0.75
          const scale = 1 + Math.sin(child.userData.pulse) * 2
          child.scale.setScalar(scale)
          const material = child.material as THREE.MeshBasicMaterial
          material.opacity = Math.max(0, 0.8 - (Math.sin(child.userData.pulse) + 1) * 0.4)
        }
      })

      arcDots.forEach((arcDot) => {
        const progress = (elapsed * 0.33 + arcDot.offset) % 1
        const point = arcDot.curve.getPoint(progress)
        arcDot.mesh.position.copy(point)
      })

      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height)
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })

      starMaterial.dispose()
      starTexture.dispose()
      renderer.dispose()

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.container} aria-hidden />
  )
}
