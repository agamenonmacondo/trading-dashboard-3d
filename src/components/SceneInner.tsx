'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Billboard } from '@react-three/drei'
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

// Cubo de Balance 3D con etiqueta
function BalanceCube({ balance, pnl, isMobile }: { balance: number; pnl: number; isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  const color = pnl >= 0 ? '#10b981' : '#ef4444'
  const position = isMobile ? [0, 1.5, 0] : [2.5, 1.5, 0]
  const scale = isMobile ? 0.6 : 0.8
  
  return (
    <group position={position as [number, number, number]} scale={scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Etiqueta flotante */}
      <Billboard position={[0, 1.5, 0]}>
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          BALANCE
        </Text>
        <Text
          fontSize={0.3}
          color={pnl >= 0 ? '#10b981' : '#ef4444'}
          anchorX="center"
          anchorY="middle"
          position={[0, -0.5, 0]}
        >
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
        </Text>
      </Billboard>
    </group>
  )
}

// Partículas de PnL
function PnLParticles({ pnl, isMobile }: { pnl: number; isMobile: boolean }) {
  const count = isMobile ? 80 : 150
  const meshRef = useRef<THREE.Points>(null)
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const isPositive = pnl >= 0
    const range = isMobile ? 12 : 18
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range
      pos[i * 3 + 1] = (Math.random() - 0.5) * range
      pos[i * 3 + 2] = (Math.random() - 0.5) * range - 5
      
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
        positions[i3 + 1] += pnl >= 0 ? 0.03 : -0.03
        const limit = isMobile ? 6 : 9
        if (positions[i3 + 1] > limit) positions[i3 + 1] = -limit
        if (positions[i3 + 1] < -limit) positions[i3 + 1] = limit
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

// Globo de Trading
function TradingGlobe({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  const position = isMobile ? [0, -1.2, 0] : [-2.5, 0, 0]
  const scale = isMobile ? 0.7 : 1
  
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

// Anillo de datos
function DataRing({ isMobile }: { isMobile: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.05
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2
    }
  })
  
  return (
    <mesh ref={ringRef} position={[0, 0, -2]} scale={isMobile ? 0.8 : 1.2}>
      <torusGeometry args={[4, 0.02, 16, 100]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Cámara adaptativa
function AdaptiveCamera({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree()
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (isMobile) {
        camera.position.set(0, 0, 10)
        camera.fov = 70
      } else {
        camera.position.set(0, 0, 8)
        camera.fov = 60
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
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Canvas 3D */}
      <Canvas className="absolute inset-0">
        <AdaptiveCamera isMobile={isMobile} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[0, 5, 5]} intensity={0.5} color="#10b981" />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={isMobile ? 2000 : 4000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <DataRing isMobile={isMobile} />
        <TradingGlobe isMobile={isMobile} />
        <BalanceCube balance={balance} pnl={pnl} isMobile={isMobile} />
        <PnLParticles pnl={pnl} isMobile={isMobile} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          enableRotate={true}
          rotateSpeed={isMobile ? 0.5 : 1}
          zoomSpeed={isMobile ? 0.5 : 1}
          autoRotate={true}
          autoRotateSpeed={0.5}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
      
      {/* UI Overlay - Dashboard Header */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Trading Dashboard 3D</h1>
            <p className="text-xs sm:text-sm text-gray-400">BTC/USDT • Binance Testnet</p>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm text-gray-400">Estado</div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm text-green-400">Activo</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* UI Overlay - Métricas principales */}
      <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-10 space-y-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-gray-800">
          <div className="text-xs text-gray-400">Balance Total</div>
          <div className="text-lg sm:text-xl font-bold text-white">${balance.toLocaleString()}</div>
        </div>
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-gray-800">
          <div className="text-xs text-gray-400">PnL Hoy</div>
          <div className={`text-lg sm:text-xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
          </div>
        </div>
      </div>
      
      {/* UI Overlay - Posición actual */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-gray-800">
          <div className="text-xs text-gray-400">Posición Actual</div>
          <div className="text-sm sm:text-base font-bold text-green-400">LONG 0.002 BTC</div>
          <div className="text-xs text-gray-400 mt-1">Entrada: $78,450</div>
        </div>
      </div>
      
      {/* UI Overlay - Controles */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="flex justify-between items-end">
          <div className="text-white/60 text-xs sm:text-sm">
            <p>{isMobile ? '👆 Toca y arrastra para rotar' : '🖱️ Arrastra para rotar'}</p>
            <p>{isMobile ? '👌 Pellizca para zoom' : '📜 Scroll para zoom'}</p>
          </div>
          <div className="text-right">
            {isMobile && (
              <span className="inline-block px-2 py-1 bg-blue-600/80 text-white text-xs rounded">
                Modo Móvil
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
