"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GlobeHero(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene + Camera + Renderer
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(600, 600)
    renderer.domElement.style.width = '600px'
    renderer.domElement.style.height = '600px'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.pointerEvents = 'none'
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.set(0, 0, 6)

    // Resize handling (keeps fixed 600x600 but handle DPR changes)
    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(600, 600)
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambient)
    const pointLight = new THREE.PointLight(0x1a6cf6, 2.5, 50)
    pointLight.position.set(4, 3, 6)
    scene.add(pointLight)

    // Globe parameters
    const RADIUS = 1.5

    // Load earth texture
    const loader = new THREE.TextureLoader()
    const earthTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
    const earthMat = new THREE.MeshPhongMaterial({ shininess: 80 })
    loader.load(earthTextureUrl, (tex) => {
      tex.encoding = THREE.sRGBEncoding
      earthMat.map = tex
      earthMat.needsUpdate = true
    })

    const globeGeo = new THREE.SphereGeometry(RADIUS, 64, 64)
    const globeMesh = new THREE.Mesh(globeGeo, earthMat)
    globeMesh.castShadow = false
    globeMesh.receiveShadow = false
    scene.add(globeMesh)

    // Wireframe grid (lat/long) on separate LineSegments at radius + 0.01
    const gridGeo = new THREE.EdgesGeometry(new THREE.SphereGeometry(RADIUS + 0.01, 64, 64))
    const gridMat = new THREE.LineBasicMaterial({ color: 0x0a2a6e, transparent: true, opacity: 0.4 })
    const gridLines = new THREE.LineSegments(gridGeo, gridMat)
    scene.add(gridLines)

    // Atmosphere: slightly larger sphere with ShaderMaterial glow
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS + 0.15, 64, 64)
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.8 },
        p: { value: 2.0 },
        glowColor: { value: new THREE.Color(0x1a6cf6) },
        viewVector: { value: new THREE.Vector3(0, 0, 1) },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormView = normalize(normalMatrix * viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
          intensity = pow(max(0.0, dot(vNormal, vNormView)), 1.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          float alpha = intensity * 0.6;
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
    atmosphereMesh.renderOrder = 1
    scene.add(atmosphereMesh)

    // Stars background
    const starCount = 2000
    const starsGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const r = 10 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r
      starPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r
      starPositions[i * 3 + 2] = Math.cos(phi) * r
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.9 })
    const stars = new THREE.Points(starsGeo, starsMat)
    scene.add(stars)

    // Helper: lat/lon to Vector3
    function latLonToVector3(lat: number, lon: number, radius: number) {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)
      return new THREE.Vector3(x, y, z)
    }

    // City list with lat/lon and sizes
    const cities = [
      { id: 'kampala', lat: 0.3476, lon: 32.5825, size: 12, color: 0x1a6cf6 },
      { id: 'nairobi', lat: -1.286389, lon: 36.817223, size: 7, color: 0x00d4ff },
      { id: 'london', lat: 51.5074, lon: -0.1278, size: 7, color: 0x00d4ff },
      { id: 'dubai', lat: 25.2048, lon: 55.2708, size: 7, color: 0x00d4ff },
      { id: 'joburg', lat: -26.2041, lon: 28.0473, size: 7, color: 0x00d4ff },
      { id: 'cairo', lat: 30.0444, lon: 31.2357, size: 7, color: 0x00d4ff },
    ]

    // Create sprite texture for city glow
    function createGlowTexture(color: string | number, size = 64) {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      grad.addColorStop(0, `#${(typeof color === 'number' ? color.toString(16) : color)}`)
      grad.addColorStop(0.3, 'rgba(255,255,255,0.9)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      const tex = new THREE.CanvasTexture(canvas)
      tex.needsUpdate = true
      return tex
    }

    // Add city sprites and pulsing rings
    const cityGroup = new THREE.Group()
    scene.add(cityGroup)

    const spriteTex = createGlowTexture(0x00d4ff, 128)

    const citySprites: { id: string; sprite: THREE.Sprite; pulseMeshes?: THREE.Mesh[] }[] = []

    for (const c of cities) {
      const pos = latLonToVector3(c.lat, c.lon, RADIUS + 0.01)
      const mat = new THREE.SpriteMaterial({ map: spriteTex, color: c.color, transparent: true, opacity: 1 })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set((c.size / 12) * 0.25, (c.size / 12) * 0.25, 1)
      sprite.position.copy(pos)
      cityGroup.add(sprite)

      let pulseMeshes: THREE.Mesh[] | undefined
      if (c.id === 'kampala') {
        pulseMeshes = []
        for (let i = 0; i < 2; i++) {
          const geom = new THREE.RingGeometry(0.02, 0.04, 32)
          const mat = new THREE.MeshBasicMaterial({ color: 0x1a6cf6, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
          const mesh = new THREE.Mesh(geom, mat)
          mesh.position.copy(pos.clone().multiplyScalar((RADIUS + 0.02) / RADIUS))
          mesh.lookAt(camera.position)
          cityGroup.add(mesh)
          pulseMeshes.push(mesh)
        }
      }

      citySprites.push({ id: c.id, sprite, pulseMeshes })
    }

    // Arcs and moving dots
    const arcsGroup = new THREE.Group()
    scene.add(arcsGroup)

    const arcMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 })

    const movingDots: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = []

    const kampala = cities.find((c) => c.id === 'kampala')!
    const kampPos = latLonToVector3(kampala.lat, kampala.lon, RADIUS + 0.01)

    let arcIndex = 0
    for (const c of cities) {
      if (c.id === 'kampala') continue
      const dest = latLonToVector3(c.lat, c.lon, RADIUS + 0.01)
      const mid = new THREE.Vector3().addVectors(kampPos, dest).multiplyScalar(0.5)
      const midDir = mid.clone().normalize().multiplyScalar(RADIUS + 0.8 + Math.random() * 0.6)
      const control = midDir

      const curve = new THREE.QuadraticBezierCurve3(kampPos.clone(), control, dest.clone())
      const tubeGeo = new THREE.TubeGeometry(curve as unknown as THREE.Curve<THREE.Vector3>, 64, 0.01, 8, false)
      const tube = new THREE.Mesh(tubeGeo, arcMaterial)
      arcsGroup.add(tube)

      // moving dot
      const dotGeo = new THREE.SphereGeometry(0.03, 8, 8)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      arcsGroup.add(dot)
      movingDots.push({ mesh: dot, curve, offset: (arcIndex / Math.max(1, cities.length - 1)) * 0.33 })
      arcIndex++
    }

    // Animation state
    let targetRotX = 0
    let targetRotY = 0
    let currentRotX = 0
    let currentRotY = 0
    let scrollRot = 0

    // Mouse parallax
    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      const max = 15 * (Math.PI / 180)
      targetRotY = x * max
      targetRotX = y * max * -1
    }
    window.addEventListener('pointermove', onPointerMove)

    // Scroll rotates globe
    function onScroll() {
      const s = window.scrollY || window.pageYOffset
      scrollRot = s * 0.0006
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Animation loop
    const clock = new THREE.Clock()

    function animate() {
      clock.getDelta()

      // Auto rotate
      globeMesh.rotation.y += 0.001

      // Lerp to target rotations (mouse parallax)
      currentRotX += (targetRotX - currentRotX) * 0.06
      currentRotY += (targetRotY - currentRotY) * 0.06
      globeMesh.rotation.x = currentRotX
      globeMesh.rotation.y += (currentRotY - globeMesh.rotation.y) * 0.06

      // Apply scroll rotation smoothly
      globeMesh.rotation.y += (scrollRot - globeMesh.rotation.y) * 0.02

      // Atmosphere view vector
      atmosphereMat.uniforms.viewVector.value.copy(camera.position)

      // Update pulses on Kampala
      const t = performance.now() * 0.001
      for (const cs of citySprites) {
        if (cs.id === 'kampala' && cs.pulseMeshes) {
          for (let i = 0; i < cs.pulseMeshes.length; i++) {
            const m = cs.pulseMeshes[i]
            const scale = 1 + ((t * 0.8 + i * 0.5) % 1) * 2.5
            m.scale.setScalar(scale)
            const mat = m.material as THREE.MeshBasicMaterial
            mat.opacity = 0.6 * (1 - ((t * 0.8 + i * 0.5) % 1))
          }
        }
      }

      // Move dots along arcs
      for (let i = 0; i < movingDots.length; i++) {
        const md = movingDots[i]
        const speed = 1 / 3 // loop every 3s
        const phase = ((t * speed) + md.offset) % 1
        const p = md.curve.getPoint(phase)
        md.mesh.position.copy(p)
      }

      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      renderer.dispose()
      scene.clear()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
    }
  }, [])

  // Container styling: right side, vertically centered, fixed size 600x600, floating
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        right: '6%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '600px',
        height: '600px',
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  )
}
