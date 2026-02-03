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
        const limit = isMobile ? 7.5 : 10
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
        <BalanceCube pnl={pnl} isMobile={isMobile} />
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
      
      {/* UI HEADER */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '12px' : '16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              fontSize: isMobile ? '18px' : '24px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: 0 
            }}>
              Trading Dashboard 3D
            </h1>
            <p style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#9ca3af',
              margin: '4px 0 0 0'
            }}>
              BTC/USDT • Binance Testnet
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#9ca3af' }}>Estado</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                display: 'inline-block'
              }}></span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#4ade80' }}>Activo</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* UI METRICS - Left */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '70px' : '90px',
        left: isMobile ? '8px' : '16px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: isMobile ? '8px 12px' : '12px 16px',
          border: '1px solid #374151'
        }}>
          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#9ca3af' }}>Balance Total</div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '22px', 
            fontWeight: 'bold', 
            color: 'white' 
          }}>
            ${balance.toLocaleString()}
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: isMobile ? '8px 12px' : '12px 16px',
          border: '1px solid #374151'
        }}>
          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#9ca3af' }}>PnL Hoy</div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '22px', 
            fontWeight: 'bold', 
            color: pnl >= 0 ? '#4ade80' : '#f87171'
          }}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
          </div>
        </div>
      </div>
      
      {/* UI POSITION - Right */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '70px' : '90px',
        right: isMobile ? '8px' : '16px',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: isMobile ? '8px 12px' : '12px 16px',
          border: '1px solid #374151',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#9ca3af' }}>Posición Actual</div>
          <div style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: 'bold', 
            color: '#4ade80' 
          }}>
            LONG 0.002 BTC
          </div>
          <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#9ca3af', marginTop: '4px' }}>
            Entrada: $78,450
          </div>
        </div>
      </div>
      
      {/* UI FOOTER */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '12px' : '16px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '11px' : '13px' }}>
            <p style={{ margin: '0 0 2px 0' }}>{isMobile ? '👆 Toca y arrastra' : '🖱️ Arrastra para rotar'}</p>
            <p style={{ margin: 0 }}>{isMobile ? '👌 Pellizca para zoom' : '📜 Scroll para zoom'}</p>
          </div>
          {isMobile && (
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              backgroundColor: 'rgba(37, 99, 235, 0.8)',
              color: 'white',
              fontSize: '11px',
              borderRadius: '4px'
            }}>
              Modo Móvil
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
