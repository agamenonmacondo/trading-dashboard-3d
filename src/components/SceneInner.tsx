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
function BalanceCube({ balance, pnl, isMobile }: { balance: number; pnl: number; isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  const color = pnl >= 0 ? '#10b981' : '#ef4444'
  const position = isMobile ? [0, 1.5, 0] : [3, 2, 0]
  const scale = isMobile ? 0.8 : 1
  
  return (
    <group position={position as [number, number, number]} scale={scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

// Partículas de PnL
function PnLParticles({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const count = isMobile ? 100 : 200
  const meshRef = useRef<THREE.Points>(null)
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const isPositive = pnl >= 0
    const range = isMobile ? 15 : 20
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range
      pos[i * 3 + 1] = (Math.random() - 0.5) * range
      pos[i * 3 + 2] = (Math.random() - 0.5) * range
      
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
        const limit = isMobile ? 7.5 : 10
        if (positions[i3 + 1] > limit) positions[i3 + 1] = -limit
        if (positions[i3 + 1] < -limit) positions[i3 + 1] = limit
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial size={isMobile ? 0.08 : 0.05} vertexColors />
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
  
  const position = isMobile ? [0, -1.5, 0] : [-3, 0, 0]
  const scale = isMobile ? 0.8 : 1
  
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
    if (isMobile) {
      camera.position.set(0, 0, 12)
      camera.fov = 75
    } else {
      camera.position.set(0, 0, 8)
      camera.fov = 60
    }
    camera.updateProjectionMatrix()
  }, [isMobile, camera])
  
  return null
}

// Escena Principal
export default function SceneInner() {
  const isMobile = useIsMobile()
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Canvas>
        <AdaptiveCamera isMobile={isMobile} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={isMobile ? 3000 : 5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <TradingGlobe isMobile={isMobile} />
        <BalanceCube balance={4992.76} pnl={0.65} isMobile={isMobile} />
        <PnLParticles pnl={0.65} isMobile={isMobile} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          enableRotate={true}
          rotateSpeed={isMobile ? 0.5 : 1}
          zoomSpeed={isMobile ? 0.5 : 1}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
      
      {/* UI Overlay - Responsive */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 text-white z-10">
        <h1 className="text-lg sm:text-2xl font-bold">Trading Dashboard 3D</h1>
        <p className="text-xs sm:text-sm text-gray-400">BTC/USDT • Testnet</p>
        <p className="text-xs sm:text-sm text-gray-400">Balance: $4,992.76</p>
        <p className="text-xs sm:text-sm text-green-400">PnL: +$0.65</p>
      </div>
      
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-white text-right z-10">
        <p className="text-xs sm:text-sm text-gray-400">
          {isMobile ? 'Toca y arrastra para rotar' : 'Usa el mouse para rotar'}
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          {isMobile ? 'Pellizca para zoom' : 'Scroll para zoom'}
        </p>
      </div>
      
      {/* Indicador de móvil */}
      {isMobile && (
        <div className="absolute top-2 right-2 z-10">
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Móvil</span>
        </div>
      )}
    </div>
  )
}
