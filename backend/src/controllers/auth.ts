import { Request, Response } from "express";

export const loginHandler = (req: Request, res: Response) => {
  console.log(req.body);

  res.status(200).json({
    message: "login was successful",
  });
};
