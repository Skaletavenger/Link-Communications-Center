"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GlobeHero(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const scrollY = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene and camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.set(0, 0, 4)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2))
    renderer.setSize(500, 500)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.width = '500px'
    renderer.domElement.style.height = '500px'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    // Group
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const RADIUS = 1.8

    // Globe geometry (mesh will be created inside texture loader callback)
    const globeGeometry = new THREE.SphereGeometry(RADIUS, 64, 64)
    let globeMesh: THREE.Mesh | null = null

    // Load earth texture and create globe inside callback
    const textureLoader = new THREE.TextureLoader()
    const earthTextureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
    textureLoader.load(earthTextureUrl, (texture) => {
      texture.encoding = THREE.sRGBEncoding
      const mat = new THREE.MeshPhongMaterial({ map: texture, shininess: 60, specular: new THREE.Color('#1a6cf6') })
      globeMesh = new THREE.Mesh(globeGeometry, mat)
      globeGroup.add(globeMesh)
    })

    // Atmosphere (radius 1.95) - fresnel rim glow
    const atmosphereGeo = new THREE.SphereGeometry(1.95, 64, 64)
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        viewDirection: { value: new THREE.Vector3(0, 0, 1) },
        glowColor: { value: new THREE.Color('#1a6cf6') },
      },
      vertexShader: `
        uniform vec3 viewDirection;
        varying float fresnel;
        void main(){
          vec3 worldNormal = normalize(normalMatrix * normal);
          vec3 viewDir = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          fresnel = pow(1.0 - max(dot(worldNormal, viewDir), 0.0), 3.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float fresnel;
        void main(){
          float alpha = fresnel * 0.9;
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
    globeGroup.add(atmosphereMesh)

    // Stars (3000) in radius 90 - use circular canvas texture
    const starCount = 3000
    const starsGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const r = 90 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r
      starPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r
      starPositions[i * 3 + 2] = Math.cos(phi) * r
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))

    const starCanvas = document.createElement('canvas')
    starCanvas.width = 16
    starCanvas.height = 16
    const starCtx = starCanvas.getContext('2d')!
    starCtx.beginPath()
    starCtx.arc(8, 8, 6, 0, Math.PI * 2)
    starCtx.fillStyle = 'white'
    starCtx.fill()
    const starTexture = new THREE.CanvasTexture(starCanvas)

    const starsMat = new THREE.PointsMaterial({ map: starTexture, size: 0.08, sizeAttenuation: true, color: 0xffffff, transparent: true, opacity: 0.8 })
    const stars = new THREE.Points(starsGeo, starsMat)
    scene.add(stars)

    // Wireframe grid at radius 1.81
    const gridGeo = new THREE.SphereGeometry(1.81, 64, 64)
    const wireGeo = new THREE.WireframeGeometry(gridGeo)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0a3a8a, transparent: true, opacity: 0.25 })
    const wireframe = new THREE.LineSegments(wireGeo, wireMat)
    globeGroup.add(wireframe)

    // Lat/Lon to Vector3
    function latLngToVector(lat: number, lng: number, radius: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)
      return new THREE.Vector3(x, y, z)
    }

    // Cities
    type City = { id: string; lat: number; lng: number; color: string; size: number }
    const cities: City[] = [
      { id: 'kampala', lat: 0.3476, lng: 32.5825, color: '#1a6cf6', size: 0.045 },
      { id: 'nairobi', lat: -1.2921, lng: 36.8219, color: '#00d4ff', size: 0.025 },
      { id: 'london', lat: 51.5074, lng: -0.1278, color: '#00d4ff', size: 0.025 },
      { id: 'dubai', lat: 25.2048, lng: 55.2708, color: '#00d4ff', size: 0.025 },
      { id: 'joburg', lat: -26.2041, lng: 28.0473, color: '#00d4ff', size: 0.025 },
      { id: 'cairo', lat: 30.0444, lng: 31.2357, color: '#00d4ff', size: 0.025 },
    ]

    const nodeRadius = 1.82
    const cityGroup = new THREE.Group()
    globeGroup.add(cityGroup)

    // Create nodes and Kampala rings
    const kampalaPos = latLngToVector(cities[0].lat, cities[0].lng, nodeRadius)
    const ringMaterials: THREE.MeshBasicMaterial[] = []
    for (const c of cities) {
      const pos = latLngToVector(c.lat, c.lng, nodeRadius)
      const geom = new THREE.SphereGeometry(c.size, 12, 12)
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.color) })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.copy(pos)
      cityGroup.add(mesh)

      if (c.id === 'kampala') {
        for (let i = 0; i < 2; i++) {
          const ringGeo = new THREE.RingGeometry(c.size * 1.5, c.size * 3.5, 64)
          const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#1a6cf6'), transparent: true, opacity: 0.8, side: THREE.DoubleSide })
          ringMaterials.push(ringMat)
          const ringMesh = new THREE.Mesh(ringGeo, ringMat)
          ringMesh.position.copy(pos)
          ringMesh.lookAt(camera.position)
          cityGroup.add(ringMesh)
        }
      }
    }

    // Arcs and moving dots
    const arcDots: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = []
    const offsets = [0, 0.2, 0.4, 0.6, 0.8]
    let offIdx = 0
    for (const c of cities) {
      if (c.id === 'kampala') continue
      const dest = latLngToVector(c.lat, c.lng, nodeRadius)
      const mid = new THREE.Vector3().addVectors(kampalaPos, dest).multiplyScalar(0.5)
      const control = mid.clone().normalize().multiplyScalar(1.8)
      const curve = new THREE.QuadraticBezierCurve3(kampalaPos.clone(), control, dest.clone())

      // 100 points along curve
      const points = curve.getPoints(100)
      const positions = new Float32Array(points.length * 3)
      for (let i = 0; i < points.length; i++) {
        positions[i * 3 + 0] = points[i].x
        positions[i * 3 + 1] = points[i].y
        positions[i * 3 + 2] = points[i].z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 })
      const line = new THREE.Line(geo, mat)
      globeGroup.add(line)

      const dotGeo = new THREE.SphereGeometry(0.018, 8, 8)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const dotMesh = new THREE.Mesh(dotGeo, dotMat)
      globeGroup.add(dotMesh)
      const offset = offsets[offIdx % offsets.length]
      arcDots.push({ mesh: dotMesh, curve, offset })
      offIdx++
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0x4488ff, 1.2)
    dir.position.set(5, 3, 5)
    scene.add(dir)
    const point = new THREE.PointLight(0x1a6cf6, 0.8)
    point.position.set(-5, 2, -3)
    scene.add(point)

    // Interaction state
    let mouseX = 0
    let mouseY = 0

    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      mouseX = THREE.MathUtils.clamp(x, -1, 1)
      mouseY = THREE.MathUtils.clamp(y, -1, 1)
    }
    window.addEventListener('pointermove', onPointerMove)

    // Animation
    const clock = new THREE.Clock()

    function animate() {
      const t = clock.getElapsedTime()

      // Auto rotate
      if (globeMesh) globeMesh.rotation.y += 0.0008

      // Mouse lerp to target rotations
      const targetRotationX = mouseY * 0.3
      const targetRotationY = mouseX * 0.3
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.06
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.06

      // Scroll influence
      globeGroup.rotation.y += scrollY.current * 0.0005

      // Update atmosphere viewDirection
      atmosphereMat.uniforms.viewDirection.value.copy(camera.position)

      // Animate Kampala rings
      let ringI = 0
      for (const child of cityGroup.children) {
        if (child.type === 'Mesh' && (child.geometry as THREE.RingGeometry).type === 'RingGeometry') {
          const ring = child as THREE.Mesh
          const scale = 1 + ((t * 0.5 + ringI * 0.3) % 1) * 2
          ring.scale.setScalar(scale)
          const mat = ring.material as THREE.MeshBasicMaterial
          mat.opacity = Math.max(0, 0.8 * (1 - ((t * 0.5 + ringI * 0.3) % 1)))
          ringI++
        }
      }

      // Animate arc dots
      for (const ad of arcDots) {
        const speed = 1 / 3
        const phase = (t * speed + ad.offset) % 1
        const p = ad.curve.getPoint(phase)
        ad.mesh.position.copy(p)
      }

      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    // Attach scroll handler after animation starts
    const handleScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)

    // Resize handler
    function onResize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(500, 500)
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', onResize)
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          const geo = (obj as THREE.Mesh).geometry as THREE.BufferGeometry
          geo.dispose()
        }
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
      // @ts-ignore
      if (renderer.getContext) renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        right: '-50px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '500px',
        height: '500px',
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  )
}
