import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const predictionSchema = z.object({
  raceId: z.string(),
  predictedP1: z.string(),
  predictedP2: z.string(),
  predictedP3: z.string(),
  predictedPole: z.string(),
  unexpectedStatement: z.string().min(5).max(240),
}).refine((data) => new Set([data.predictedP1, data.predictedP2, data.predictedP3]).size === 3, {
  message: 'P1/P2/P3 must be unique drivers',
  path: ['predictedP1'],
});

export const resultsSchema = z.object({
  p1: z.string(),
  p2: z.string(),
  p3: z.string(),
  pole: z.string(),
}).refine((data) => new Set([data.p1, data.p2, data.p3]).size === 3, {
  message: 'Results podium must be unique',
  path: ['p1'],
});
