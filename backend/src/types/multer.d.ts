declare namespace Express {
  export interface Request {
    file?: {
      filename: string;
      mimetype: string;
      size: number;
      path: string;
    };
  }
}

