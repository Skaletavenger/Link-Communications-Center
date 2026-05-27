'use client'

export default function BrandLogo() {
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 rounded-xl flex items-center justify-center w-10 h-10 bg-[#1574B5]">
          <svg viewBox="0 0 44 44" fill="none" width="30" height="30">
            <line x1="10" y1="8" x2="18" y2="19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="17" y1="8" x2="25" y2="19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M6 30 Q22 20 38 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M12 36 Q22 29 32 36" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="41" r="2.8" fill="white" />
          </svg>
        </div>
        <span
          className="font-black uppercase text-white"
          style={{ fontSize: '28px', lineHeight: '1', letterSpacing: '0.05em' }}
        >
          LINK
        </span>
      </div>
      <span
        className="font-bold uppercase text-white/70"
        style={{ fontSize: '7.5px', marginTop: '1px', paddingLeft: '2px', letterSpacing: '0.2em' }}
      >
        COMMUNICATIONS CENTER
      </span>
    </div>
  )
}

