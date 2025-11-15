type Props = { selectedOutcome?: string | null }

export default function OutcomeList({ selectedOutcome }: Props){
  return (
    <div className="space-y-3">
      <div className={`${selectedOutcome==='Yes' ? 'bg-white text-black' : 'text-gray-400'} p-4 rounded relative`}>
        1. Yes
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded">48.26% (343,638)</div>
      </div>

      <div className={`${selectedOutcome==='No' ? 'bg-white text-black' : 'text-gray-400'} p-4 rounded relative`}>
        2. No
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded">51.74% (368,354)</div>
      </div>
    </div>
  )
}
