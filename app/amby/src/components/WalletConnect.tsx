import { useEffect, useState } from 'react'
import { getBalance } from '../utils/getBalance'

type Props = {
  connected: boolean
  onConnect: (c: boolean) => void
  onBalanceUpdate?: (balance: string) => void
  onLoadingChange?: (loading: boolean) => void
}

// Declare global window type for NeoLine
declare global {
  interface Window {
    NEOLineN3?: any
  }
}

export default function WalletConnect({ connected, onConnect, onBalanceUpdate, onLoadingChange }: Props){
  const [address, setAddress] = useState<string | null>(null)
  const [neolineN3, setNeolineN3] = useState<any>(null)
  const [gasBalance, setGasBalance] = useState<string>('0')
  const [isConnecting, setIsConnecting] = useState<boolean>(false)

  useEffect(() => {
    // Listen for NeoLine N3 ready event
    const handleReady = () => {
      try {
        const neolineInstance = new (window as any).NEOLineN3.Init()
        setNeolineN3(neolineInstance)
      } catch (error) {
        console.error('Failed to initialize NeoLine N3:', error)
      }
    }

    // Check if already loaded
    if (window.NEOLineN3) {
      handleReady()
    } else {
      // Listen for the ready event
      window.addEventListener('NEOLine.N3.EVENT.READY', handleReady)
      return () => {
        window.removeEventListener('NEOLine.N3.EVENT.READY', handleReady)
      }
    }
  }, [])

  async function handleConnect(){
    setIsConnecting(true)
    if (onLoadingChange) onLoadingChange(true)
    
    try {
      if (!neolineN3) {
        alert('Please install NeoLine wallet extension: https://neoline.io/')
        setIsConnecting(false)
        if (onLoadingChange) onLoadingChange(false)
        return
      }

      // Use getAccount to connect and get user's account
      const account = await neolineN3.getAccount()
      
      setAddress(account.address)
      onConnect(true)

      // Fetch balance after connecting
      try {
        const balances = await getBalance(neolineN3)
        
        // Find GAS balance from the results
        Object.keys(balances).forEach(addr => {
          const addressBalances = balances[addr]
          const gasToken = addressBalances.find((b: any) => b.symbol === 'GAS')
          if (gasToken) {
            setGasBalance(gasToken.amount)
            if (onBalanceUpdate) {
              onBalanceUpdate(gasToken.amount)
            }
          }
        })
      } catch (balanceError) {
        console.error('Failed to fetch balance:', balanceError)
      }
    } catch (error: any) {
      console.error('Connection error:', error)
      const { type, description } = error
      
      switch(type) {
        case 'NO_PROVIDER':
          alert('Please install NeoLine wallet extension')
          break
        case 'CONNECTION_DENIED':
          alert('Connection denied by user')
          break
        case 'CHAIN_NOT_MATCH':
          alert('Please switch to N3 network in NeoLine')
          break
        default:
          alert('Failed to connect wallet: ' + (description || 'Unknown error'))
      }
    } finally {
      setIsConnecting(false)
      if (onLoadingChange) onLoadingChange(false)
    }
  }

  return (
    <div>
      {connected ? (
        <div className="px-4 py-2 bg-gray-800 text-green-500 rounded-lg text-sm">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'unknown'}
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            'Connect Neo Wallet'
          )}
        </button>
      )}
    </div>
  )
}
