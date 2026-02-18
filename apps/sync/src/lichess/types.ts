export interface LichessPlayer {
  user?: { name: string; id: string };
  rating?: number;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: LichessPlayer;
    black: LichessPlayer;
  };
  winner?: 'white' | 'black';
  opening?: { eco: string; name: string };
  moves?: string;
  pgn?: string;
  clock?: { initial: number; increment: number; totalTime: number };
}
