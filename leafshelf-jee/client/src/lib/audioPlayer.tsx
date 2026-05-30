import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Book } from './types';

interface AudioPlayerCtx {
  playerBook: Book | null;
  setPlayerBook: (b: Book | null) => void;
  isMini: boolean;
  setMini: (v: boolean) => void;
}

export const AudioPlayerContext = createContext<AudioPlayerCtx>({
  playerBook: null, setPlayerBook: () => {}, isMini: false, setMini: () => {},
});

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [playerBook, setPlayerBook] = useState<Book | null>(null);
  const [isMini, setMini] = useState(false);
  return (
    <AudioPlayerContext.Provider value={{ playerBook, setPlayerBook, isMini, setMini }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() { return useContext(AudioPlayerContext); }
