'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

interface F1TunnelDriveConfig {
  speed: number
  carBob: number
  fogDensity: number
}

const defaultConfig: F1TunnelDriveConfig = {
  speed: 0.15,
  carBob: 0.3,
  fogDensity: 0.035,
}

export function F1TunnelDrive({
  config: uc,
  className,
}: {
  config?: Partial<F1TunnelDriveConfig>
  className?: string
}) {
  const mount = useRef<HTMLDivElement>(null)
  const cfg = { ...defaultConfig, ...uc }

  useEffect(() => {
    const el = mount.current
    if (!el) return

    const w = el.clientWidth
    const h = el.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 12, 30)

    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 50)
    camera.position.set(0, 1.0, 2.5)
    camera.lookAt(0, 0.4, -1)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    el.appendChild(renderer.domElement)

    const loader = new THREE.TextureLoader()
    const tunnelTex = loader.load('/images/f1cartunnel.jpg')
    tunnelTex.wrapS = THREE.RepeatWrapping
    tunnelTex.wrapT = THREE.RepeatWrapping
    tunnelTex.repeat.set(1, 1)
    tunnelTex.colorSpace = THREE.SRGBColorSpace

    const tunnelGeo = new THREE.CylinderGeometry(3.8, 3.8, 24, 48, 1, true)
    const tunnelMat = new THREE.MeshBasicMaterial({
      map: tunnelTex,
      side: THREE.BackSide,
    })
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat)
    tunnel.rotation.x = Math.PI / 2
    tunnel.position.z = -10
    scene.add(tunnel)

    const groundGeo = new THREE.PlaneGeometry(8, 24)
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -3.7
    ground.position.z = -10
    scene.add(ground)

    const trackMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide })
    const track = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 24), trackMat)
    track.rotation.x = -Math.PI / 2
    track.position.y = -3.68
    track.position.z = -10
    scene.add(track)

    const centerLineMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide })
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.3), centerLineMat)
      m.rotation.x = -Math.PI / 2
      m.position.set(0, -3.67, -i * 0.5 - 1)
      scene.add(m)
    }

    function buildF1Car(): THREE.Group {
      const group = new THREE.Group()
      const S = 1.8

      const redMat = new THREE.MeshBasicMaterial({ color: 0xcc0000 })
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x222222 })
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xff2200 })

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6 * S, 0.15 * S, 0.35 * S), redMat)
      body.position.set(0, 0.12 * S, 0)
      group.add(body)

      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12 * S, 0.25 * S, 6), redMat)
      nose.rotation.x = Math.PI / 2
      nose.position.set(0, 0.10 * S, -0.3 * S)
      group.add(nose)

      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.25 * S, 0.15 * S, 0.12 * S), redMat)
      cockpit.position.set(0, 0.24 * S, 0.03 * S)
      group.add(cockpit)

      const cockpitDark = new THREE.Mesh(new THREE.BoxGeometry(0.2 * S, 0.05 * S, 0.08 * S), darkMat)
      cockpitDark.position.set(0, 0.30 * S, 0.03 * S)
      group.add(cockpitDark)

      const rearWingBase = new THREE.Mesh(new THREE.BoxGeometry(0.5 * S, 0.02 * S, 0.15 * S), redMat)
      rearWingBase.position.set(0, 0.22 * S, 0.22 * S)
      group.add(rearWingBase)

      const rearWingUp = new THREE.Mesh(new THREE.BoxGeometry(0.5 * S, 0.15 * S, 0.02 * S), redMat)
      rearWingUp.position.set(0, 0.32 * S, 0.22 * S)
      group.add(rearWingUp)

      const endplate1 = new THREE.Mesh(new THREE.BoxGeometry(0.02 * S, 0.15 * S, 0.08 * S), redMat)
      endplate1.position.set(-0.26 * S, 0.26 * S, 0.24 * S)
      group.add(endplate1)

      const endplate2 = new THREE.Mesh(new THREE.BoxGeometry(0.02 * S, 0.15 * S, 0.08 * S), redMat)
      endplate2.position.set(0.26 * S, 0.26 * S, 0.24 * S)
      group.add(endplate2)

      const halo1 = new THREE.Mesh(new THREE.BoxGeometry(0.35 * S, 0.02 * S, 0.02 * S), darkMat)
      halo1.position.set(0, 0.28 * S, -0.04 * S)
      group.add(halo1)

      const halo2 = new THREE.Mesh(new THREE.BoxGeometry(0.02 * S, 0.08 * S, 0.02 * S), darkMat)
      halo2.position.set(0.17 * S, 0.24 * S, -0.04 * S)
      group.add(halo2)

      const halo3 = new THREE.Mesh(new THREE.BoxGeometry(0.02 * S, 0.08 * S, 0.02 * S), darkMat)
      halo3.position.set(-0.17 * S, 0.24 * S, -0.04 * S)
      group.add(halo3)

      const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
      const wheelPositions = [
        [-0.30 * S, 0.06 * S, -0.18 * S],
        [0.30 * S, 0.06 * S, -0.18 * S],
        [-0.30 * S, 0.06 * S, 0.20 * S],
        [0.30 * S, 0.06 * S, 0.20 * S],
      ]
      wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.10 * S, 0.10 * S, 0.05 * S, 12), wheelMat)
        wheel.rotation.z = Math.PI / 2
        wheel.position.set(x, y, z)
        group.add(wheel)
      })

      const brakeDiskMat = new THREE.MeshBasicMaterial({ color: 0xff4400 })
      wheelPositions.forEach(([x, y, z]) => {
        const disk = new THREE.Mesh(new THREE.CircleGeometry(0.04 * S, 8), brakeDiskMat)
        disk.rotation.y = Math.PI / 2
        disk.position.set(x > 0 ? x - 0.03 * S : x + 0.03 * S, y, z)
        group.add(disk)
      })

      const exGlow1 = new THREE.Mesh(new THREE.CircleGeometry(0.02 * S, 6), glowMat)
      exGlow1.position.set(0, 0.04 * S, 0.24 * S)
      group.add(exGlow1)

      return group
    }

    const f1 = buildF1Car()
    f1.position.set(0, 0, -1.2)
    scene.add(f1)

    const particles: { mesh: THREE.Mesh; vx: number; vz: number }[] = []
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.6,
    })
    for (let i = 0; i < 60; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.06), particleMat)
      p.rotation.x = -Math.PI / 2
      p.position.set(
        (Math.random() - 0.5) * 5,
        -3.6 + Math.random() * 0.4,
        Math.random() * 8 - 10,
      )
      scene.add(p)
      particles.push({ mesh: p, vx: 0, vz: 0.1 + Math.random() * 0.15 })
    }

    let texOffset = 0

    function animate() {
      texOffset += cfg.speed * 0.012
      if (texOffset > 1) texOffset -= 1
      tunnelMat.map!.offset.y = texOffset

      const bob = Math.sin(Date.now() * 0.003) * 0.04
      const sway = Math.sin(Date.now() * 0.002) * 0.06
      const roll = Math.sin(Date.now() * 0.0025) * 0.02
      f1.position.y = bob
      f1.position.x = sway
      f1.rotation.z = roll

      particles.forEach(p => {
        p.mesh.position.z += p.vz * cfg.speed * 0.5
        if (p.mesh.position.z > 2) {
          p.mesh.position.z = -10
          p.mesh.position.x = (Math.random() - 0.5) * 5
          p.vz = 0.1 + Math.random() * 0.15
        }
      })

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    function resize() {
      if (!mount.current) return
      const w2 = mount.current.clientWidth
      const h2 = mount.current.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    }
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      renderer.dispose()
      if (renderer.domElement.parentElement === el) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [cfg.speed, cfg.carBob])

  return (
    <div
      ref={mount}
      aria-hidden="true"
      className={cn('w-full h-full', className)}
    />
  )
}
