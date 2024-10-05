import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(5, "Messsage must be atleast 5 characters").max(500, "Messsage must be at most 500 characters"),
});
