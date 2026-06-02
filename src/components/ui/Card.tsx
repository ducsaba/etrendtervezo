interface CardProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

export function Card({ children, className = '', gradient }: CardProps) {
  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border border-slate-100
      ${gradient ? 'bg-gradient-to-br from-white to-orange-50' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
