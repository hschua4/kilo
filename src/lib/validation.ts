import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const entryCreateSchema = z.object({
  weight: z.coerce.number().positive().max(1000),
  entryDate: dateString,
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const entryUpdateSchema = z
  .object({
    weight: z.coerce.number().positive().max(1000).optional(),
    entryDate: dateString.optional(),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export const goalSchema = z.object({
  startWeight: z.coerce.number().positive().max(1000),
  targetWeight: z.coerce.number().positive().max(1000),
  weeklyTargetRate: z.coerce.number().positive().max(5),
});

export type EntryCreateInput = z.infer<typeof entryCreateSchema>;
export type GoalInputSchema = z.infer<typeof goalSchema>;
