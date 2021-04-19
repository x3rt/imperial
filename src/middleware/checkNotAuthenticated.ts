import { NextFunction, Request, Response } from "express";

// chekc for th

export const checkNotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) return res.redirect("/");

  next();
};
