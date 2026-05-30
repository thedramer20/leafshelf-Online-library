import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Book } from '../lib/types';

type Props = { book: Book; variant?: 'default' | 'compact' };

export default function BookCard({ book, variant = 'default' }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const compact = variant === 'compact';

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden shadow-[0_12px_32px_-16px_rgba(28,26,23,0.35),0_2px_6px_-2px_rgba(28,26,23,0.12)] transition-transform duration-200 group-hover:-translate-y-1 bg-gradient-to-br from-forest to-forest-dark">
        {book.cover_url && !imgFailed ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="p-4 h-full flex flex-col justify-between text-paper">
            <div>
              <div className="text-[0.6rem] tracking-widest opacity-60 uppercase">LeafShelf</div>
              <div className="font-serif text-sm mt-2 leading-tight">{book.title}</div>
            </div>
            <div className="text-[0.7rem] italic opacity-75">{book.author}</div>
          </div>
        )}

        <div
          className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-paper ${
            book.available ? 'bg-gold' : 'bg-rust'
          }`}
          title={book.available ? `${book.available_copies} available` : 'Checked out'}
        />
      </div>

      <div className={compact ? 'mt-2' : 'mt-3'}>
        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-forest-mid">
          {book.category}
        </div>
        <h3 className={`font-serif text-forest-dark leading-tight mt-1 ${compact ? 'text-sm' : 'text-base'}`}>
          {book.title}
        </h3>
        <div className="text-xs italic text-forest-mid">{book.author}</div>
        {!compact && (
          <div className="text-xs text-forest-mid mt-1">
            ★ {book.rating.toFixed(1)} ·{' '}
            {book.available ? `${book.available_copies} available` : 'Checked out'}
          </div>
        )}
      </div>
    </Link>
  );
}
