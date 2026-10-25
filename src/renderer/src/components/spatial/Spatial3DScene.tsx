import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Spatial3DSceneProps = {
  className?: string
  intensity?: 'subtle' | 'normal' | 'vibrant'
  interactive?: boolean
  showCore?: boolean
  particleCount?: number
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function Spatial3DScene({
  className = '',
  intensity = 'normal',
  interactive = true,
  showCore = true,
  particleCount = 280
}: Spatial3DSceneProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setHasWebGL(false)
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    let animationFrameId: number | null = null
    let isDisposed = false

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.z = 18

    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)
    } catch {
      setHasWebGL(false)
      return
    }

    // Colors depending on intensity
    const cyanColor = new THREE.Color(intensity === 'vibrant' ? 0x00f0ff : 0x38bdf8)
    const purpleColor = new THREE.Color(intensity === 'vibrant' ? 0xbf5af2 : 0xa855f7)
    const magentaColor = new THREE.Color(intensity === 'vibrant' ? 0xff007f : 0xf43f5e)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1128, 1.8)
    scene.add(ambientLight)

    const cyanLight = new THREE.PointLight(cyanColor.getHex(), 2.2, 50)
    cyanLight.position.set(-12, 10, 8)
    scene.add(cyanLight)

    const purpleLight = new THREE.PointLight(purpleColor.getHex(), 2.5, 50)
    purpleLight.position.set(12, -8, 8)
    scene.add(purpleLight)

    const magentaLight = new THREE.PointLight(magentaColor.getHex(), 1.5, 40)
    magentaLight.position.set(0, 12, -5)
    scene.add(magentaLight)

    // Spatial Group for rotation and parallax
    const spatialGroup = new THREE.Group()
    scene.add(spatialGroup)

    // 1. Particle Constellation
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = 6 + Math.random() * 22
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Gradient between cyan, purple, and magenta
      const mixRatio = Math.random()
      const color =
        mixRatio < 0.45 ? cyanColor : mixRatio < 0.85 ? purpleColor : magentaColor

      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      scales[i] = Math.random() * 2.5 + 0.8
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: intensity === 'subtle' ? 0.45 : 0.75,
      blending: THREE.AdditiveBlending
    })

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    spatialGroup.add(particleSystem)

    // 2. Holographic Gyroscope Rings & Core (if showCore)
    const coreGroup = new THREE.Group()
    if (showCore) {
      // Outer Ring
      const ring1Geo = new THREE.TorusGeometry(4.8, 0.035, 16, 100)
      const ring1Mat = new THREE.MeshBasicMaterial({
        color: cyanColor,
        transparent: true,
        opacity: 0.55,
        wireframe: true
      })
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
      coreGroup.add(ring1)

      // Middle Ring
      const ring2Geo = new THREE.TorusGeometry(3.6, 0.03, 16, 100)
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: purpleColor,
        transparent: true,
        opacity: 0.6,
        wireframe: true
      })
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
      ring2.rotation.x = Math.PI / 3
      coreGroup.add(ring2)

      // Inner Ring
      const ring3Geo = new THREE.TorusGeometry(2.5, 0.025, 16, 80)
      const ring3Mat = new THREE.MeshBasicMaterial({
        color: magentaColor,
        transparent: true,
        opacity: 0.65,
        wireframe: true
      })
      const ring3 = new THREE.Mesh(ring3Geo, ring3Mat)
      ring3.rotation.y = Math.PI / 4
      coreGroup.add(ring3)

      // Central Polyhedral Cyber Crystal
      const crystalGeo = new THREE.IcosahedronGeometry(1.4, 0)
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x050a1e,
        emissive: purpleColor,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.85,
        wireframe: true
      })
      const crystal = new THREE.Mesh(crystalGeo, crystalMat)
      coreGroup.add(crystal)

      // Floating Satellite Nodes
      for (let j = 0; j < 5; j++) {
        const satGeo = new THREE.OctahedronGeometry(0.24, 0)
        const satMat = new THREE.MeshBasicMaterial({
          color: j % 2 === 0 ? cyanColor : magentaColor,
          wireframe: true
        })
        const sat = new THREE.Mesh(satGeo, satMat)
        const angle = (j / 5) * Math.PI * 2
        sat.position.set(Math.cos(angle) * 3.8, Math.sin(angle) * 3.8, (j % 2 - 0.5) * 1.5)
        coreGroup.add(sat)
      }

      spatialGroup.add(coreGroup)
    }

    // Parallax tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
    const handleMouseMove = (e: MouseEvent): void => {
      if (!interactive) {
        return
      }
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Resize handling
    const handleResize = (): void => {
      if (!container || !renderer) {
        return
      }
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Visibility handling (pause when tab hidden)
    let isPaused = false
    const handleVisibilityChange = (): void => {
      isPaused = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Animation Loop
    const clock = new THREE.Clock()

    const animate = (): void => {
      if (isDisposed) {
        return
      }
      animationFrameId = requestAnimationFrame(animate)

      if (isPaused) {
        return
      }

      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Parallax effect on spatial group
      spatialGroup.rotation.y = elapsedTime * 0.05 + mouse.x * 0.25
      spatialGroup.rotation.x = Math.sin(elapsedTime * 0.03) * 0.15 + mouse.y * 0.2

      // Rotate core elements if present
      if (showCore && coreGroup.children.length >= 4) {
        coreGroup.children[0].rotation.z = elapsedTime * 0.2
        coreGroup.children[0].rotation.x = Math.sin(elapsedTime * 0.15) * 0.3
        coreGroup.children[1].rotation.x = -elapsedTime * 0.25
        coreGroup.children[1].rotation.y = elapsedTime * 0.18
        coreGroup.children[2].rotation.y = elapsedTime * 0.3
        coreGroup.children[3].rotation.x = elapsedTime * 0.4
        coreGroup.children[3].rotation.y = elapsedTime * 0.35
      }

      // Gentle floating oscillation
      spatialGroup.position.y = Math.sin(elapsedTime * 0.4) * 0.35

      if (renderer) {
        renderer.render(scene, camera)
      }
    }

    animate()

    // Cleanup
    return () => {
      isDisposed = true
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Dispose Three.js objects
      particleGeometry.dispose()
      particleMaterial.dispose()
      if (showCore) {
        coreGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose()
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose())
            } else {
              obj.material?.dispose()
            }
          }
        })
      }

      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    }
  }, [intensity, interactive, showCore, particleCount])

  if (!hasWebGL) {
    // CSS-based Cyber Nebula Fallback (uses semantic theme tokens)
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ai-action-accent/20 blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-radial-[ellipse_80%_80%_at_50%_-20%] from-primary/10 to-transparent" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  )
}

export default Spatial3DScene
