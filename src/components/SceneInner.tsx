'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function BalanceCube({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
  })
  const color = pnl >= 0 ? '#10b981' : '#ef4444'
  return (
    <mesh ref={meshRef} position={isMobile ? [0, 0, 0] : [2, 0, 0]} scale={isMobile ? 0.5 : 0.8}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}

function PnLParticles({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const count = isMobile ? 30 : 80
  const meshRef = useRef<THREE.Points>(null)
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * (isMobile ? 5 : 12)
      pos[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 5 : 12)
      pos[i * 3 + 2] = (Math.random() - 0.5) * (isMobile ? 5 : 12)
      col[i * 3] = pnl >= 0 ? 0.06 : 0.94
      col[i * 3 + 1] = pnl >= 0 ? 0.73 : 0.27
      col[i * 3 + 2] = pnl >= 0 ? 0.51 : 0.27
    }
    return [pos, col]
  }, [pnl, count, isMobile])
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])
  useFrame(() => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3 + 1] += pnl >= 0 ? 0.015 : -0.015
        const limit = isMobile ? 2.5 : 6
        if (pos[i3 + 1] > limit) pos[i3 + 1] = -limit
        if (pos[i3 + 1] < -limit) pos[i3 + 1] = limit
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial size={isMobile ? 0.1 : 0.06} vertexColors />
    </points>
  )
}

function TradingGlobe({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08
  })
  return (
    <mesh ref={meshRef} position={isMobile ? [0, -1.2, 0] : [-1.5, 0, 0]} scale={isMobile ? 0.4 : 0.7}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} wireframe />
    </mesh>
  )
}

function AdaptiveCamera({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree()
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0, isMobile ? 8 : 6)
      camera.fov = isMobile ? 80 : 65
      camera.updateProjectionMatrix()
    }
  }, [isMobile, camera])
  return null
}

export default function SceneInner() {
  const isMobile = useIsMobile()
  const balance = 4992.76
  const pnl = 0.65
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0" style={{width:"100%",height:"100%"}}>
        <Canvas>
          <AdaptiveCamera isMobile={isMobile} />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <Stars radius={100} depth={50} count={isMobile ? 600 : 2000} factor={4} saturation={0} fade speed={1} />
          <TradingGlobe isMobile={isMobile} />
          <BalanceCube pnl={pnl} isMobile={isMobile} />
          <PnLParticles pnl={pnl} isMobile={isMobile} />
          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>
      
      <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
        <div className="pointer-events-auto p-3 bg-gradient-to-b from-black/95 to-black/50">
          <h1 className="text-white font-bold text-lg">Trading 3D</h1>
          <p className="text-gray-400 text-xs">BTC/USDT • Testnet</p>
        </div>
        
        <div className={`pointer-events-auto ${isMobile ? 'mt-2 px-2' : 'absolute top-14 left-3'}`}>
          <div className={`flex ${isMobile ? 'flex-row gap-1 justify-start' : 'flex-col gap-2'}`}>
            <div className="bg-gray-900/95 border border-gray-700 rounded px-2 py-1.5">
              <div className="text-gray-400 text-[9px] uppercase">Balance</div>
              <div className="text-white font-bold text-xs">${balance.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900/95 border border-gray-700 rounded px-2 py-1.5">
              <div className="text-gray-400 text-[9px] uppercase">PnL</div>
              <div className="text-green-400 font-bold text-xs">+${pnl}</div>
            </div>
            <div className="bg-gray-900/95 border border-gray-700 rounded px-2 py-1.5">
              <div className="text-gray-400 text-[9px] uppercase">Pos</div>
              <div className="text-green-400 font-bold text-xs">LONG</div>
            </div>
          </div>
        </div>
        
        <div className="pointer-events-auto mt-auto p-2 bg-gradient-to-t from-black/95 to-transparent flex justify-between items-center text-[10px]">
          <span className="text-gray-400">{isMobile ? '👆 Arrastra' : '🖱️ Arrastra • Scroll'}</span>
          {isMobile && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px]">Móvil</span>}
        </div>
      </div>
    </div>
  )
}
