'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GlobeHero() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.background = 'transparent'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.z = 3.5

    const group = new THREE.Group()
    scene.add(group)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x4488ff, 1.2)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x1a6cf6, 0.8)
    pointLight.position.set(-5, 2, -3)
    scene.add(pointLight)

    const starCount = 2500
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i += 1) {
      const distance = 100 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * distance
      starPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * distance
      starPositions[i * 3 + 2] = Math.cos(phi) * distance
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))

    const starCanvas = document.createElement('canvas')
    starCanvas.width = 16
    starCanvas.height = 16
    const starContext = starCanvas.getContext('2d')
    if (starContext) {
      starContext.clearRect(0, 0, 16, 16)
      starContext.beginPath()
      starContext.arc(8, 8, 6, 0, Math.PI * 2)
      starContext.fillStyle = 'white'
      starContext.fill()
    }
    const starTexture = new THREE.CanvasTexture(starCanvas)
    starTexture.minFilter = THREE.LinearFilter
    starTexture.magFilter = THREE.LinearFilter

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.5,
      map: starTexture,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const globeRadius = 1.8
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64)
    const textureLoader = new THREE.TextureLoader()
    const globeMaterial = new THREE.MeshPhongMaterial({
      shininess: 60,
      specular: new THREE.Color('#1a6cf6'),
    })
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial)
    group.add(globeMesh)

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        texture.encoding = THREE.sRGBEncoding
        globeMaterial.map = texture
        globeMaterial.needsUpdate = true
      },
      undefined,
      () => {
        globeMaterial.map = null
        globeMaterial.color = new THREE.Color('#1a3a6b')
        globeMaterial.needsUpdate = true
      }
    )

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.96, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1)), 2.0);
            gl_FragColor = vec4(0.12, 0.44, 0.98, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
      })
    )
    group.add(atmosphere)

    group.add(
      new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(1.81, 36, 36)),
        new THREE.LineBasicMaterial({ color: 0x0a3a8a, transparent: true, opacity: 0.18 })
      )
    )

    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      )
    }

    const uganda = latLngToVector3(0.3476, 32.5825, globeRadius)

    const cities = [
      { lat: -1.2921, lng: 36.8219 },
      { lat: 51.5074, lng: -0.1278 },
      { lat: 25.2048, lng: 55.2708 },
      { lat: -26.2041, lng: 28.0473 },
      { lat: 30.0444, lng: 31.2357 },
    ]

    const arcDots: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = []

    const hubNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x1a6cf6 })
    )
    hubNode.position.copy(uganda)
    group.add(hubNode)

    for (let i = 0; i < cities.length; i += 1) {
      const city = cities[i]
      const cityPosition = latLngToVector3(city.lat, city.lng, globeRadius)

      const cityDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff })
      )
      cityDot.position.copy(cityPosition)
      group.add(cityDot)

      const midPoint = uganda.clone().add(cityPosition).multiplyScalar(0.5).normalize().multiplyScalar(globeRadius * 1.55)
      const curve = new THREE.QuadraticBezierCurve3(uganda.clone(), midPoint, cityPosition.clone())
      const points = curve.getPoints(80)
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const arcLine = new THREE.Line(
        arcGeometry,
        new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.45 })
      )
      group.add(arcLine)

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
      group.add(dot)
      arcDots.push({ mesh: dot, curve, offset: i * 0.18 })
    }

    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    const scroll = { y: 0 }

    const onMouseMove = (event: MouseEvent) => {
      const bounds = container.getBoundingClientRect()
      mouse.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      mouse.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    }

    const onScroll = () => {
      scroll.y = window.scrollY
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll', onScroll)

    const clock = new THREE.Clock()
    let frameId: number

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      target.x += (mouse.y * 0.3 - target.x) * 0.05
      target.y += (mouse.x * 0.3 - target.y) * 0.05
      group.rotation.x = target.x
      group.rotation.y += 0.0008
      group.rotation.y += target.y * 0.01
      group.rotation.y += scroll.y * 0.00005

      arcDots.forEach(({ mesh, curve, offset }) => {
        mesh.position.copy(curve.getPoint(((t * 0.3 + offset) % 1)))
      })

      renderer.render(scene, camera)
    }

    const resizeRenderer = () => {
      if (!mountRef.current) return
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    resizeRenderer()

    const resizeObserver = new ResizeObserver(resizeRenderer)
    resizeObserver.observe(container)
    window.addEventListener('resize', resizeRenderer)

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resizeRenderer)
      resizeObserver.disconnect()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
