'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// Cubo de Balance 3D
function BalanceCube({ balance, pnl }: { balance: number; pnl: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  const color = pnl >= 0 ? '#10b981' : '#ef4444'
  
  return (
    <group position={[3, 2, 0]}>
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
      <mesh position={[0, 0, 1.05]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial color="#0f0f0f" />
      </mesh>
      <Center position={[0, 0.3, 1.06]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.15}
          height={0.02}
        >
          ${balance.toFixed(2)}
          <meshStandardMaterial color="white" />
        </Text3D>
      </Center>
      <Center position={[0, -0.3, 1.06]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.12}
          height={0.02}
        >
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
          <meshStandardMaterial color={pnl >= 0 ? '#10b981' : '#ef4444'} />
        </Text3D>
      </Center>
    </group>
  )
}

// Partículas de PnL
function PnLParticles({ pnl }: { pnl: number }) {
  const count = 200
  const meshRef = useRef<THREE.Points>(null)
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const isPositive = pnl >= 0
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      if (isPositive) {
        col[i * 3] = 0.06 // R
        col[i * 3 + 1] = 0.73 // G
        col[i * 3 + 2] = 0.51 // B
      } else {
        col[i * 3] = 0.94 // R
        col[i * 3 + 1] = 0.27 // G
        col[i * 3 + 2] = 0.27 // B
      }
    }
    
    return [pos, col]
  }, [pnl])
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3 + 1] += pnl >= 0 ? 0.02 : -0.02
        if (positions[i3 + 1] > 10) positions[i3 + 1] = -10
        if (positions[i3 + 1] < -10) positions[i3 + 1] = 10
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors />
    </points>
  )
}

// Globo de Trading
function TradingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} position={[-3, 0, 0]}>
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

// Escena Principal
export default function Scene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <TradingGlobe />
        <BalanceCube balance={4992.76} pnl={0.65} />
        <PnLParticles pnl={0.65} />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white">
        <h1 className="text-2xl font-bold">Trading Dashboard 3D</h1>
        <p className="text-sm text-gray-400">BTC/USDT • Testnet</p>
      </div>
      
      <div className="absolute bottom-4 right-4 text-white text-right">
        <p className="text-sm text-gray-400">Usa el mouse para rotar</p>
        <p className="text-sm text-gray-400">Scroll para zoom</p>
      </div>
    </div>
  )
}
