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
    <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'relative', overflow: 'hidden' }}>
      {/* Canvas 3D - con pointer-events para no bloquear UI */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas style={{ pointerEvents: 'auto' }}>
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
      
      {/* UI Overlay - zIndex alto y pointer-events */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 10, 
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '12px 16px', 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>Trading Dashboard 3D</h1>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>BTC/USDT • Testnet</p>
        </div>
        
        {/* Métricas - Lado izquierdo */}
        <div style={{ 
          position: 'absolute', 
          top: '70px', 
          left: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          pointerEvents: 'auto'
        }}>
          <div style={{ 
            background: 'rgba(17,24,39,0.9)', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #374151',
            minWidth: '120px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>Balance</div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>${balance.toLocaleString()}</div>
          </div>
          <div style={{ 
            background: 'rgba(17,24,39,0.9)', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #374151',
            minWidth: '120px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>PnL Hoy</div>
            <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>+{pnl} USDT</div>
          </div>
        </div>
        
        {/* Posición - Lado derecho */}
        <div style={{ 
          position: 'absolute', 
          top: '70px', 
          right: '12px',
          pointerEvents: 'auto'
        }}>
          <div style={{ 
            background: 'rgba(17,24,39,0.9)', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #374151',
            textAlign: 'right',
            minWidth: '100px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>Posición</div>
            <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '14px' }}>LONG</div>
            <div style={{ color: 'white', fontSize: '12px' }}>0.002 BTC</div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '12px 16px', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{ color: '#9ca3af', fontSize: '11px' }}>
            {isMobile ? '👆 Toca y arrastra' : '🖱️ Arrastra para rotar'}
          </div>
          {isMobile && (
            <span style={{ background: '#2563eb', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
              Móvil
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
