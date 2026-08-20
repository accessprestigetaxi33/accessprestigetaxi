import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  telephone: z.string().trim().max(30).optional().nullable(),
  depart: z.string().trim().min(2).max(180),
  arrivee: z.string().trim().min(2).max(180),
  date_souhaitee: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  heure_souhaitee: z.string().trim().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  aller_retour: z.boolean().default(false),
  passagers: z.number().int().min(1).max(8).default(1),
  bagages: z.number().int().min(0).max(20).default(0),
  vehicule: z.string().trim().max(80).optional().nullable(),
  prestation: z.string().trim().max(80).optional().nullable(),
  transport_sanitaire: z.boolean().default(false),
  fauteuil_roulant: z.boolean().default(false),
  transport_groupe: z.boolean().default(false),
  sieges_enfant: z.boolean().default(false),
  distance_km: z.number().min(0).max(5000).optional().nullable(),
  prix_estime: z.number().min(0).max(50000).optional().nullable(),
  precisions: z.string().trim().max(1500).optional().nullable(),
  langue: z.enum(["fr", "en"]).default("fr"),
});

const statusSchema = z.object({
  reference: z.string().trim().min(4).max(20),
  email: z.string().trim().email().max(255),
});

export const submitDevis = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const { creerDevis } = await import("@/lib/devis.server");
    return creerDevis(data);
  });

export const getDevisStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }) => {
    const { lireDevis } = await import("@/lib/devis.server");
    const devis = await lireDevis(data.reference, data.email);
    return { devis };
  });
