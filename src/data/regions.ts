// Approximate grocery price multipliers vs. the US average, by state.
// Rough figures drawn from cost-of-living grocery indices. The app treats them
// only as a starting point until you enter real prices from your own stores.
export const STATE_PRICE_INDEX: Record<string, { name: string; index: number }> = {
  AL: { name: 'Alabama', index: 0.95 }, AK: { name: 'Alaska', index: 1.35 },
  AZ: { name: 'Arizona', index: 1.0 }, AR: { name: 'Arkansas', index: 0.93 },
  CA: { name: 'California', index: 1.15 }, CO: { name: 'Colorado', index: 1.03 },
  CT: { name: 'Connecticut', index: 1.07 }, DE: { name: 'Delaware', index: 1.01 },
  DC: { name: 'District of Columbia', index: 1.12 }, FL: { name: 'Florida', index: 1.02 },
  GA: { name: 'Georgia', index: 0.97 }, HI: { name: 'Hawaii', index: 1.55 },
  ID: { name: 'Idaho', index: 0.98 }, IL: { name: 'Illinois', index: 1.01 },
  IN: { name: 'Indiana', index: 0.95 }, IA: { name: 'Iowa', index: 0.95 },
  KS: { name: 'Kansas', index: 0.95 }, KY: { name: 'Kentucky', index: 0.95 },
  LA: { name: 'Louisiana', index: 0.97 }, ME: { name: 'Maine', index: 1.04 },
  MD: { name: 'Maryland', index: 1.05 }, MA: { name: 'Massachusetts', index: 1.1 },
  MI: { name: 'Michigan', index: 0.97 }, MN: { name: 'Minnesota', index: 1.0 },
  MS: { name: 'Mississippi', index: 0.93 }, MO: { name: 'Missouri', index: 0.95 },
  MT: { name: 'Montana', index: 1.0 }, NE: { name: 'Nebraska', index: 0.96 },
  NV: { name: 'Nevada', index: 1.04 }, NH: { name: 'New Hampshire', index: 1.03 },
  NJ: { name: 'New Jersey', index: 1.06 }, NM: { name: 'New Mexico', index: 0.98 },
  NY: { name: 'New York', index: 1.1 }, NC: { name: 'North Carolina', index: 0.97 },
  ND: { name: 'North Dakota', index: 0.98 }, OH: { name: 'Ohio', index: 0.96 },
  OK: { name: 'Oklahoma', index: 0.94 }, OR: { name: 'Oregon', index: 1.06 },
  PA: { name: 'Pennsylvania', index: 0.99 }, RI: { name: 'Rhode Island', index: 1.05 },
  SC: { name: 'South Carolina', index: 0.97 }, SD: { name: 'South Dakota', index: 0.97 },
  TN: { name: 'Tennessee', index: 0.95 }, TX: { name: 'Texas', index: 0.95 },
  UT: { name: 'Utah', index: 0.99 }, VT: { name: 'Vermont', index: 1.06 },
  VA: { name: 'Virginia', index: 1.0 }, WA: { name: 'Washington', index: 1.1 },
  WV: { name: 'West Virginia', index: 0.97 }, WI: { name: 'Wisconsin', index: 0.97 },
  WY: { name: 'Wyoming', index: 0.99 },
}

export function priceIndex(state: string): number {
  return STATE_PRICE_INDEX[state]?.index ?? 1
}
