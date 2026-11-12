import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type FoundAddress = { label: string; postcode: string };

export const lookupPostcode = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ postcode: z.string().trim().min(5).max(10) }).parse(d))
  .handler(async ({ data }): Promise<{ addresses: FoundAddress[]; error: string | null }> => {
    const key = process.env["IDEAL_POSTCODES_API_KEY"];
    if (!key) return { addresses: [], error: "Address lookup isn't set up yet. Type it in yourself." };
    try {
      const pc = encodeURIComponent(data.postcode.replace(/\s+/g, "").toUpperCase());
      const res = await fetch(`https://api.ideal-postcodes.co.uk/v1/postcodes/${pc}?api_key=${encodeURIComponent(key)}`);
      if (res.status === 404) return { addresses: [], error: "That postcode doesn't exist. Nice try." };
      if (!res.ok) {
        console.error("Ideal Postcodes failed", res.status, await res.text());
        return { addresses: [], error: "Address lookup is having a moment. Type it in yourself." };
      }
      const j = (await res.json()) as {
        result: Array<{ line_1: string; line_2: string; line_3: string; post_town: string; postcode: string }>;
      };
      const addresses = j.result.map((a) => ({
        label: [a.line_1, a.line_2, a.line_3, a.post_town].filter(Boolean).join(", "),
        postcode: a.postcode,
      }));
      return { addresses, error: addresses.length ? null : "No addresses found. Weird." };
    } catch (e) {
      console.error("Ideal Postcodes error", e);
      return { addresses: [], error: "Address lookup is having a moment. Type it in yourself." };
    }
  });
