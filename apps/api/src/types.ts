declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        name: string;
        email: string;
        image: string | null;
      };
    }
  }
}

export {};
