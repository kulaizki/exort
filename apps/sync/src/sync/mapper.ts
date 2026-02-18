import type { LichessGame } from '../lichess/types.js';
import type { Prisma } from '@exort/db';

export function mapLichessGame(lichessGame: LichessGame, userId: string, username: string): Prisma.GameCreateManyInput {
  const isWhite = lichessGame.players.white.user?.id?.toLowerCase() === username.toLowerCase() ||
    lichessGame.players.white.user?.name?.toLowerCase() === username.toLowerCase();

  const color = isWhite ? 'white' : 'black';

  let result: string;
  if (!lichessGame.winner) {
    result = 'draw';
  } else if (lichessGame.winner === color) {
    result = 'win';
  } else {
    result = 'loss';
  }

  const opponent = isWhite
    ? (lichessGame.players.black.user?.name ?? 'Anonymous')
    : (lichessGame.players.white.user?.name ?? 'Anonymous');

  const playerRating = isWhite
    ? lichessGame.players.white.rating
    : lichessGame.players.black.rating;

  const opponentRating = isWhite
    ? lichessGame.players.black.rating
    : lichessGame.players.white.rating;

  return {
    lichessGameId: lichessGame.id,
    userId,
    pgn: lichessGame.pgn ?? lichessGame.moves ?? '',
    timeControl: lichessGame.speed,
    result,
    playedAt: new Date(lichessGame.createdAt),
    opponent,
    color,
    rated: lichessGame.rated,
    variant: lichessGame.variant,
    clockInitial: lichessGame.clock?.initial ?? null,
    clockIncrement: lichessGame.clock?.increment ?? null,
    playerRating: playerRating ?? null,
    opponentRating: opponentRating ?? null,
    status: lichessGame.status
  };
}
