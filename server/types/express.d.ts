declare global {
  namespace Express {
    interface Request {
      user_id?: string | null;
    }
  }
}

export {};
