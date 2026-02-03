'use client'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./SceneInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center text-white">
      <p>Cargando escena 3D...</p>
    </div>
  )
})

export default function SceneWrapper() {
  return <Scene />
}
