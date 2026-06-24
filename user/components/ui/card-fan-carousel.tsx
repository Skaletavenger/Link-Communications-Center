'use client'

type Card = {
  imgUrl: string
  alt: string
}

type SocialCardsProps = {
  cards: Card[]
}

export default function SocialCards({ cards }: SocialCardsProps) {
  return (
    <div className="relative w-full h-[360px] flex items-center justify-center">
      {cards.map((card, index) => {
        const offset = (index - (cards.length - 1) / 2) * 16
        const scale = 1 - Math.abs(index - (cards.length - 1) / 2) * 0.04
        const zIndex = 100 - Math.abs(index - (cards.length - 1) / 2)

        return (
          <div
            key={card.imgUrl + index}
            className="absolute top-0 left-1/2 w-[220px] h-[320px] rounded-3xl overflow-hidden border transition-transform duration-300"
            style={{
              transform: `translate(calc(-50% + ${offset}px), ${Math.abs(offset) * 0.16}rem) scale(${scale})`,
              zIndex,
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <img src={card.imgUrl} alt={card.alt} className="w-full h-full object-cover" />
          </div>
        )
      })}
    </div>
  )
}
