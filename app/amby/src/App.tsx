import React, { useState } from 'react'
import QuestCard from './components/QuestCard'
import WalletConnect from './components/WalletConnect'

export default function App(){
  const [connected, setConnected] = useState(false)

  return (
    <div className="min-h-screen">
      <QuestCard connected={connected} onConnect={setConnected} />
    </div>
  )
}
