import Scene from '@/components/Scene'
import ConversationLog from '@/components/ConversationLog'

export default function Home() {
  return (
    <main className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Trading Dashboard 3D</h1>
      {/* AgentStatus component could be placed here if exists */}
      <ConversationLog />
      <Scene />
    </main>
  );
}
