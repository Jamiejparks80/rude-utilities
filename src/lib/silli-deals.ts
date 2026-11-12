export type EnergyPlan = {
  id: string;
  name: string;
  supplier: string;
  fuel: string;
  blurb: string;
  bullets: string[];
  monthly: number;
  annual: number;
  badge: string | null;
};

export const energyPlans: EnergyPlan[] = [
  {
    id: "1 Year Fixed - Aurora Energy",
    name: "1 Year Fixed",
    supplier: "Aurora Energy",
    fuel: "Dual Fuel",
    blurb: "Lock your rates for a year and stop worrying about price rises.",
    bullets: ["Fixed energy prices", "Paperless billing", "£100.00 early exit fee (total)"],
    monthly: 166,
    annual: 1994.92,
    badge: "OUR LEAST HATED",
  },
  {
    id: "2 Year Fixed - Aurora Energy",
    name: "2 Year Fixed",
    supplier: "Aurora Energy",
    fuel: "Dual Fuel",
    blurb: "Fix your prices across two whole winters. Cosy.",
    bullets: ["Fixed for 24 months", "Smart meter included", "£150.00 early exit fee (total)"],
    monthly: 174,
    annual: 2088.4,
    badge: null,
  },
  {
    id: "Simply Variable - Northwind",
    name: "Simply Variable",
    supplier: "Northwind Power",
    fuel: "Dual Fuel",
    blurb: "No exit fees, wander off whenever you fancy.",
    bullets: ["No exit fees", "100% renewable electricity", "Leave any time"],
    monthly: 159,
    annual: 1912.0,
    badge: "FLEXI",
  },
];

export type BroadbandDeal = {
  id: string;
  provider: string;
  name: string;
  silliSays: string;
  speed: string;
  contract: string;
  bullets: string[];
  monthly: number;
  setup: string;
  badge: string | null;
  colour: string;
};

export const broadbandDeals: BroadbandDeal[] = [
  {
    id: "Virgin Media - Gig1 Fibre",
    provider: "Virgin Media",
    name: "Gig1 Fibre Broadband",
    silliSays: "Ludicrously fast. Your downloads finish before you've let go of the mouse.",
    speed: "1,130 Mbps average",
    contract: "18 month contract",
    bullets: ["Gigabit download speeds", "WiFi guarantee in every room", "No landline needed"],
    monthly: 46.99,
    setup: "£35.00 set-up",
    badge: "OUR LEAST HATED",
    colour: "#E4002B",
  },
  {
    id: "Sky - Full Fibre 150 + Sky TV",
    provider: "Sky",
    name: "Full Fibre 150 + Sky TV",
    silliSays: "Telly and internet in one lump. Perfect for sofa-shaped evenings.",
    speed: "150 Mbps average",
    contract: "24 month contract",
    bullets: ["Sky TV with 100+ channels", "Netflix included", "Sky Stream puck sent to you"],
    monthly: 43.0,
    setup: "Free set-up",
    badge: "BEST FOR TELLY",
    colour: "#0072C9",
  },
  {
    id: "BT - Full Fibre 500 + Digital Voice",
    provider: "BT",
    name: "Full Fibre 500 + Digital Voice",
    silliSays: "Sturdy, sensible, and it comes with an actual phone line. Very grown up.",
    speed: "500 Mbps average",
    contract: "24 month contract",
    bullets: ["Digital Voice home phone", "Complete WiFi promise", "Unlimited downloads"],
    monthly: 39.99,
    setup: "Free set-up",
    badge: null,
    colour: "#5514B4",
  },
  {
    id: "Vodafone - Full Fibre 100 Essentials",
    provider: "Vodafone",
    name: "Full Fibre 100 Essentials",
    silliSays: "Cheap as chips and no faff. Ideal if you mostly scroll and stream.",
    speed: "100 Mbps average",
    contract: "24 month contract",
    bullets: ["Price promise, no mid-contract rises", "Super WiFi router", "Unlimited data"],
    monthly: 24.0,
    setup: "Free set-up",
    badge: "CHEAPEST",
    colour: "#E60000",
  },
];
