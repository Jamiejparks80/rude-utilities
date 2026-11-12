import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://testapi.theenergyshop.co.uk/api/v1";

export type LiveTariff = {
  tariffId: number;
  supplierName: string;
  tariffName: string;
  annualCost: number;
  billGas: number | null;
  billElec: number | null;
  monthly: number;
  tariffType: string;
  contractLength: number;
  exitFee: number | null;
  bullets: string[];
  fuel: string;
  position: number;
};

type Addr = {
  line1: string;
  line2: string;
  line3: string;
  town: string;
  county: string;
  bldNumber: string;
  bldName: string;
  subBld: string;
  throughfare: string;
  addressAsLongString: string;
  mpanNumber: string;
  regionId: number;
  regionName: string;
  postcode: string;
};

type Supplier = { id: number; defaultTariff?: { tariffId: number; tariffName: string } } | null;

function apiHeaders() {
  const key = process.env["ENERGY_SHOP_API_KEY"];
  if (!key) throw new Error("ENERGY_SHOP_API_KEY missing");
  return { Authorization: key, "Content-Type": "application/json" };
}

function estimateUsage(bedrooms: string, occupants: string) {
  const b = Math.min(4, parseInt(bedrooms) || 2);
  const o = Math.min(4, parseInt(occupants) || 2);
  const size = (b + o) / 2;
  return { elec: Math.round(1800 + size * 450), gas: Math.round(7000 + size * 2500) };
}

async function resolveMeter(postcode: string, address: string) {
  const headers = apiHeaders();
  const pc = encodeURIComponent(postcode.trim().toUpperCase());
  const res = await fetch(`${BASE}/addresses/mpan?postcode=${pc}`, { headers });
  const addrs = (res.ok ? await res.json() : []) as Addr[];
  if (!addrs.length) return null;
  const want = address.toUpperCase();
  const match =
    addrs.find(
      (a) =>
        a.bldNumber &&
        new RegExp(`\\b${a.bldNumber}\\b`).test(want) &&
        (!a.subBld || want.includes(a.subBld)),
    ) ??
    addrs.find((a) => a.bldName && want.includes(a.bldName)) ??
    addrs[0]!;

  let mprn: string | null = null;
  let gasSupplier: Supplier = null;
  let elecSupplier: Supplier = null;
  try {
    const q = new URLSearchParams({
      mpan: match.mpanNumber,
      postcode: match.postcode,
      regionId: String(match.regionId),
      houseNo: match.bldNumber ?? "",
      houseName: match.bldName ?? "",
    });
    const m = await fetch(`${BASE}/addresses/combined-meter-check?${q}`, { headers });
    if (m.ok) {
      const j = (await m.json()) as { mprn?: string; currentGasSupplier?: Supplier; currentElecSupplier?: Supplier };
      mprn = j.mprn || null;
      gasSupplier = j.currentGasSupplier ?? null;
      elecSupplier = j.currentElecSupplier ?? null;
    }
  } catch {
    // electricity only then
  }
  return { address: match, mprn, gasSupplier, elecSupplier, dual: Boolean(mprn && gasSupplier) };
}

const quoteInput = z.object({
  postcode: z.string().min(3).max(10),
  address: z.string().max(300),
  bedrooms: z.string().max(5),
  occupants: z.string().max(5),
});

export const getEnergyQuote = createServerFn({ method: "POST" })
  .inputValidator((d) => quoteInput.parse(d))
  .handler(async ({ data }): Promise<{ tariffs: LiveTariff[]; error: string | null }> => {
    try {
      const meter = await resolveMeter(data.postcode, data.address);
      if (!meter) return { tariffs: [], error: "We couldn't find that postcode. Check it, genius." };
      const usage = estimateUsage(data.bedrooms, data.occupants);
      const res = await fetch(`${BASE}/quote`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          serviceTypeToCompare: meter.dual ? "D" : "E",
          paymentMethod: "MDD",
          mpan: meter.address.mpanNumber,
          mprn: meter.dual ? meter.mprn : null,
          elecUsage: usage.elec,
          gasUsage: meter.dual ? usage.gas : null,
          saleableTariffsOnly: true,
        }),
      });
      if (!res.ok) {
        console.error("Energy Shop quote failed", res.status, await res.text());
        return { tariffs: [], error: "The energy people aren't answering. Try again in a bit." };
      }
      type Raw = {
        annualCost?: unknown; billGas?: unknown; billElec?: unknown; tariffSummary?: unknown;
        exitPenaltyAmount?: unknown; tariffId?: unknown; supplierName?: unknown; tariffName?: unknown;
        tariffType?: unknown; contractLength?: unknown;
      };
      const raw = (await res.json()) as Raw[];
      const tariffs = raw
        .filter((t) => typeof t.annualCost === "number")
        .sort((a, b) => (a.annualCost as number) - (b.annualCost as number))
        .slice(0, 6)
        .map((t, i) => {
          const bullets = [...String(t.tariffSummary ?? "").matchAll(/<li>(.*?)<\/li>/gi)]
            .map((m) => (m[1] ?? "").replace(/<[^>]+>/g, "").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ").trim())
            .filter(Boolean)
            .slice(0, 3);
          const annual = t.annualCost as number;
          return {
            tariffId: Number(t.tariffId),
            supplierName: String(t.supplierName),
            tariffName: String(t.tariffName),
            annualCost: annual,
            billGas: typeof t.billGas === "number" ? t.billGas : null,
            billElec: typeof t.billElec === "number" ? t.billElec : null,
            monthly: annual / 12,
            tariffType: String(t.tariffType ?? ""),
            contractLength: Number(t.contractLength ?? -1),
            exitFee: typeof t.exitPenaltyAmount === "number" ? t.exitPenaltyAmount / 100 : null,
            bullets,
            fuel: meter.dual ? "Dual Fuel" : "Electricity only",
            position: i + 1,
          };
        });
      return { tariffs, error: tariffs.length ? null : "No deals found for that address. Typical." };
    } catch (e) {
      console.error("Energy Shop error", e);
      return { tariffs: [], error: "The energy people aren't answering. Try again in a bit." };
    }
  });

const switchInput = quoteInput.extend({
  tariffId: z.number().int(),
  annualCost: z.number(),
  billGas: z.number().nullable(),
  billElec: z.number().nullable(),
  position: z.number().int(),
  title: z.string().min(1).max(10),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().min(10).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startDate: z.string().max(10).optional(),
  accountName: z.string().trim().min(2).max(80),
  sortCode: z.string().regex(/^\d{2}-?\d{2}-?\d{2}$/),
  accountNumber: z.string().regex(/^\d{8}$/),
  ddAuthorisation: z.literal(true),
});

export const submitSwitch = createServerFn({ method: "POST" })
  .inputValidator((d) => switchInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; reference: string | null; error: string | null }> => {
    const agentId = process.env["ENERGY_SHOP_AGENT_ID"];
    if (!agentId) {
      return { ok: false, reference: null, error: "Switching isn't switched on yet. Ironic, we know. Try again soon." };
    }
    try {
      const meter = await resolveMeter(data.postcode, data.address);
      if (!meter) return { ok: false, reference: null, error: "We couldn't find your address. Check the postcode." };
      const usage = estimateUsage(data.bedrooms, data.occupants);
      const a = meter.address;
      const body = {
        user: {
          tariffId: data.tariffId,
          agentId,
          serviceTypeToCompare: meter.dual ? "D" : "E",
          homeMover: true,
          E7: false,
          gasSupplier: meter.dual ? meter.gasSupplier?.id : null,
          gasTariffId: meter.dual ? meter.gasSupplier?.defaultTariff?.tariffId : null,
          gasTariffName: meter.dual ? meter.gasSupplier?.defaultTariff?.tariffName : null,
          gasPayment: meter.dual ? "MDD" : null,
          elecSupplier: meter.elecSupplier?.id ?? null,
          elecTariffId: meter.elecSupplier?.defaultTariff?.tariffId ?? null,
          elecTariffName: meter.elecSupplier?.defaultTariff?.tariffName ?? null,
          elecPayment: "MDD",
          bill: data.annualCost,
          billGas: data.billGas,
          billElec: data.billElec,
          saving: 0,
          savingPercentage: 0,
          tariffPosition: data.position,
          currentTariffGasConsumption: meter.dual ? usage.gas : null,
          currentTariffElecConsumption: usage.elec,
          showOnlyApplyTariff: true,
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNo: data.mobile,
          email: data.email,
          dob: data.dob,
          smartMeter: "DK",
          sameCurrentAddress: true,
          currentAddress: {
            line1: a.line1, line2: a.line2, line3: a.line3, town: a.town, county: a.county,
            postcode: a.postcode, bldNumber: a.bldNumber, bldName: a.bldName, subBld: a.subBld,
            throughfare: a.throughfare, addressAsLongString: a.addressAsLongString,
            mpanNumber: a.mpanNumber, mprn: meter.dual ? meter.mprn : null,
            regionId: a.regionId, regionName: a.regionName,
          },
        },
        payment: {
          accountName: data.accountName,
          sortCode: data.sortCode.replace(/-/g, ""),
          accountNumber: data.accountNumber,
          preferredDay: 1,
          ddAuthorisation: true,
          receiveBills: "Email",
          preferredSupplyStartDate: data.startDate || null,
          supplierOptIn: false,
          supplierLetterOptIn: false,
          supplierPhoneOptIn: false,
          supplierTextOptIn: false,
          specialNeeds: false,
          tesOptIn: false,
          debtAssignmentProtocol: false,
        },
      };
      const res = await fetch(`${BASE}/applications/processapplication`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(body),
      });
      const text = (await res.text()).trim();
      if (!res.ok) {
        console.error("Energy Shop application failed", res.status, text);
        const generic = /error occurred|try again later/i.test(text);
        const msg = generic
          ? "The energy company said no to this one. Not our fault. Check your bank details or pick another deal."
          : text.length < 160 && !text.startsWith("{") ? text : "Something in there didn't add up.";
        return { ok: false, reference: null, error: msg };
      }
      let reference = text;
      try {
        reference = String(JSON.parse(text));
      } catch {
        // plain text reference
      }
      return { ok: true, reference, error: null };
    } catch (e) {
      console.error("Energy Shop switch error", e);
      return { ok: false, reference: null, error: "The energy people aren't answering. Try again in a bit." };
    }
  });
