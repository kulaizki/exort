import type { FunctionDeclaration } from '@google/genai';

export const coachTools: FunctionDeclaration[] = [
  {
    name: 'get_performance_summary',
    description:
      'Get aggregate performance statistics: average accuracy, blunder/mistake/inaccuracy counts, result distribution, stats by time control and color, and top openings. Call this when the user asks about their overall performance or wants a general overview.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        timeControl: {
          type: 'string',
          description:
            'Filter by time control (e.g. "bullet", "blitz", "rapid", "classical"). Omit for all.'
        },
        days: {
          type: 'number',
          description: 'Number of days to look back. Defaults to 30.'
        }
      }
    }
  },
  {
    name: 'get_recent_games',
    description:
      'Get a list of recent games with summary metrics (result, accuracy, blunders, opening, opponent, rating). Call this when the user asks to see their recent games or game history.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of games to return. Max 20, default 10.'
        },
        timeControl: {
          type: 'string',
          description: 'Filter by time control.'
        },
        result: {
          type: 'string',
          description: 'Filter by result: "win", "loss", "draw".'
        }
      }
    }
  },
  {
    name: 'get_game_analysis',
    description:
      'Get full analysis for a specific game: metrics plus key moves only (blunders, mistakes, inaccuracies, brilliancies). Call this when the user asks to analyze a specific game or wants details about critical moments.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description:
            'The game ID to analyze. If not provided, uses the game linked to the current coaching session.'
        }
      }
    }
  },
  {
    name: 'get_opening_stats',
    description:
      'Get opening statistics: win rate, draw rate, loss rate, and average accuracy per opening. Call this when the user asks about their openings, what openings to play, or opening performance.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        color: {
          type: 'string',
          description: 'Filter by color: "white" or "black".'
        },
        limit: {
          type: 'number',
          description: 'Number of openings to return. Max 10, default 10.'
        }
      }
    }
  },
  {
    name: 'get_weakness_report',
    description:
      'Identify weaknesses: worst games by blunder count, average errors by game phase (opening/middlegame/endgame), and worst openings by accuracy. Call this when the user asks what to improve, their weaknesses, or areas needing work.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look back. Defaults to 30.'
        }
      }
    }
  },
  {
    name: 'get_rating_history',
    description:
      'Get rating progression over time with accuracy and result per game. Call this when the user asks about their rating trend, progress, or Elo history.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        timeControl: {
          type: 'string',
          description: 'Filter by time control.'
        },
        limit: {
          type: 'number',
          description: 'Number of games to include. Default 20, max 50.'
        }
      }
    }
  }
];
