import { useState, useRef, useEffect } from 'react'

export type Option = {
  value: string | number
  label: string
}

export default function MultiSelect({ options, value = [], onChange, placeholder = "Chọn..." }: { 
  options: Option[], 
  value: (string | number)[], 
  onChange: (val: (string | number)[]) => void,
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedOptions = options.filter(o => value.includes(o.value))
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))

  const handleToggle = (val: string | number) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div className="multi-select" ref={ref} style={{ position: 'relative' }}>
      <div 
        className="form-control dis-flex align-items-center flex-wrap" 
        style={{ minHeight: 38, height: 'auto', padding: '4px 8px', gap: 4, cursor: 'text' }}
        onClick={() => setOpen(true)}
      >
        {selectedOptions.length === 0 && !q && (
          <div style={{ color: '#94a3b8', padding: '4px' }}>{placeholder}</div>
        )}
        
        {selectedOptions.map(o => (
          <div key={o.value} className="badge bg-light text-dark dis-flex align-items-center gap-4" style={{ padding: '2px 8px' }}>
            {o.label}
            <i className="ti ti-x cursor-pointer" onClick={(e) => { e.stopPropagation(); handleToggle(o.value) }} style={{ fontSize: 11 }} />
          </div>
        ))}
        
        <input 
          type="text" 
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 60, padding: 4 }}
        />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, 
          marginTop: 4, backgroundColor: '#fff', border: '1px solid #e2e8f0', 
          borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50,
          maxHeight: 250, overflow: 'auto'
        }}>
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', color: '#64748b', fontSize: 13, textAlign: 'center' }}>Không tìm thấy</div>
          ) : (
            filteredOptions.map(o => (
              <div 
                key={o.value}
                style={{ 
                  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  backgroundColor: value.includes(o.value) ? '#f1f5f9' : 'transparent'
                }}
                className="hover-bg"
                onClick={() => { handleToggle(o.value); setQ(''); }}
              >
                <div style={{ 
                  width: 16, height: 16, border: '1px solid #cbd5e1', borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: value.includes(o.value) ? '#1c9cf0' : '#fff',
                  borderColor: value.includes(o.value) ? '#1c9cf0' : '#cbd5e1'
                }}>
                  {value.includes(o.value) && <i className="ti ti-check" style={{ color: '#fff', fontSize: 10 }} />}
                </div>
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
