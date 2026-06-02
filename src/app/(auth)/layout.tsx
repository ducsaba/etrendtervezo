export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white text-2xl font-bold mb-4 shadow-lg">
            É
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ÉtrendTervező</h1>
          <p className="text-slate-500 text-sm mt-1">Személyre szabott AI étkezési asszisztens</p>
        </div>
        {children}
      </div>
    </div>
  )
}
