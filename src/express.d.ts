import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
       
      };
      admin:{
        _id:string
      }
    }
  }
}