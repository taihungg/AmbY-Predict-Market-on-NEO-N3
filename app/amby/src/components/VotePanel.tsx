type Props = {
  selectedOutcome?: string | null
  onSelect?: (s: string) => void
}

export default function VotePanel({ selectedOutcome, onSelect }: Props){
  const yesSelected = selectedOutcome === 'Yes'

  return (
    <div className="bg-[color:var(--card)] p-4 rounded-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-gray-400">Selected outcome</div>
          <button onClick={() => onSelect?.('Yes')} className={`mt-2 h-10 w-full rounded-md flex items-center justify-center ${yesSelected ? 'bg-white text-black' : 'bg-gray-700 text-gray-200'}`}>Yes</button>
        </div>

        <div className="w-56">
          <div className="text-sm text-gray-400">Amount (GAS)</div>
          <div className="mt-2 bg-gray-800 rounded-md h-10 flex items-center px-3">1</div>
        </div>

        <div className="w-48 flex flex-col items-end justify-between">
          <div className="text-sm text-gray-400">Potential rewards</div>
          <button className="mt-2 bg-[#3be86f] text-black font-semibold px-6 py-2 rounded">Vote</button>
        </div>
      </div>
    </div>
  )
}
