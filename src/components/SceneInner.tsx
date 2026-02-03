'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Hook para detectar móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

// Cubo de Balance 3D
function BalanceCube({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  const color = pnl >= 0 ? '#10b981' : '#ef4444'
  const position = isMobile ? [0, 0.5, 0] : [1.5, 0.5, 0]
  const scale = isMobile ? 0.4 : 0.6
  
  return (
    <mesh ref={meshRef} position={position as [number, number, number]} scale={scale}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.8} 
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// Partículas de PnL
function PnLParticles({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const count = isMobile ? 50 : 80
  const meshRef = useRef<THREE.Points>(null)
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const isPositive = pnl >= 0
    const range = isMobile ? 8 : 12
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range
      pos[i * 3 + 1] = (Math.random() - 0.5) * range
      pos[i * 3 + 2] = (Math.random() - 0.5) * range - 2
      
      if (isPositive) {
        col[i * 3] = 0.06
        col[i * 3 + 1] = 0.73
        col[i * 3 + 2] = 0.51
      } else {
        col[i * 3] = 0.94
        col[i * 3 + 1] = 0.27
        col[i * 3 + 2] = 0.27
      }
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
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3 + 1] += pnl >= 0 ? 0.02 : -0.02
        const limit = isMobile ? 4 : 6
        if (positions[i3 + 1] > limit) positions[i3 + 1] = -limit
        if (positions[i3 + 1] < -limit) positions[i3 + 1] = limit
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial size={isMobile ? 0.15 : 0.1} vertexColors />
    </points>
  )
}

// Globo de Trading
function TradingGlobe({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  const position = isMobile ? [0, -0.5, 0] : [-1.5, 0, 0]
  const scale = isMobile ? 0.5 : 0.8
  
  return (
    <mesh ref={meshRef} position={position as [number, number, number]} scale={scale}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#1a1a2e" 
        metalness={0.9} 
        roughness={0.1}
        wireframe
      />
    </mesh>
  )
}

// Cámara adaptativa
function AdaptiveCamera({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree()
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (isMobile) {
        camera.position.set(0, 0, 8)
        camera.fov = 80
      } else {
        camera.position.set(0, 0, 6)
        camera.fov = 65
      }
      camera.updateProjectionMatrix()
    }
  }, [isMobile, camera])
  
  return null
}

// Escena Principal
export default function SceneInner() {
  const isMobile = useIsMobile()
  const balance = 4992.76
  const pnl = 0.65
  
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* CANVAS 3D - z-index bajo */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <AdaptiveCamera isMobile={isMobile} />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
          
          <Stars 
            radius={100} 
            depth={50} 
            count={isMobile ? 1000 : 2000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />
          
          <TradingGlobe isMobile={isMobile} />
          <BalanceCube pnl={pnl} isMobile={isMobile} />
          <PnLParticles pnl={pnl} isMobile={isMobile} />
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            enableRotate={true}
            rotateSpeed={isMobile ? 0.5 : 1}
            zoomSpeed={isMobile ? 0.5 : 1}
            autoRotate={true}
            autoRotateSpeed={0.3}
          />
        </Canvas>
      </div>
      
      {/* UI OVERLAY - z-index alto */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
        
        {/* HEADER */}
        <div className="pointer-events-auto p-3 bg-gradient-to-b from-black/95 to-transparent">
          <h1 className="text-white font-bold text-xl">Trading Dashboard 3D</h1>
          <p className="text-gray-400 text-sm">BTC/USDT • Testnet</p>
        </div>
        
        {/* MÉTRICAS IZQUIERDA */}
        <div className="pointer-events-auto absolute top-16 left-3 flex flex-col gap-2">
          <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 min-w-[140px]">
            <div className="text-gray-400 text-xs uppercase tracking-wider">Balance</div>
            <div className="text-white font-bold text-xl">${balance.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 min-w-[140px]">
            <div className="text-gray-400 text-xs uppercase tracking-wider">PnL Hoy</div>
            <div className="text-green-400 font-bold text-xl">+${pnl}</div>
          </div>
        </div>
        
        {/* POSICIÓN DERECHA */}
        <div className="pointer-events-auto absolute top-16 right-3">
          <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 text-right min-w-[120px]">
            <div className="text-gray-400 text-xs uppercase tracking-wider">Posición</div>
            <div className="text-green-400 font-bold text-lg">LONG</div>
            <div className="text-white text-sm">0.002 BTC</div>
          </div>
        </div>
        
        {/* FOOTER */}
        <div className="pointer-events-auto mt-auto p-3 bg-gradient-to-t from-black/95 to-transparent flex justify-between items-center">
          <span className="text-gray-400 text-xs">
            {isMobile ? '👆 Toca y arrastra para rotar' : '🖱️ Arrastra para rotar • Scroll para zoom'}
          </span>
          {isMobile && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Modo Móvil
            </span>
          )}
        </div>
        
      </div>
    </div>
  )
}
