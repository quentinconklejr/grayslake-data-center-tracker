export const questions = [
  {
    id: 'water-usage',
    question: 'How much water will the campus use, and from where?',
    category: 'water',
    stated: [
      {
        text: 'The Village FAQ states that residents will not see a water impact from the T5 campus.',
        sourceKey: 'villageoffaq',
      },
      {
        text: 'The Village FAQ identifies the cooling approach as primarily air-cooled.',
        sourceKey: 'villageoffaq',
      },
      {
        text: 'The Village FAQ states the campus will use no more than 50,000 gallons of water per day at full buildout.',
        sourceKey: 'villageoffaq',
      },
      {
        text: 'Hoodline reported a one-time commissioning flush of approximately 3.2 million gallons.',
        sourceKey: 'hoodline2026',
      },
    ],
    disputed: [
      {
        text: 'The Alliance for the Great Lakes has noted that air-cooling configurations shift water demand upstream to power plants rather than eliminating it — grid-level thermal generation still consumes significant water per megawatt-hour of output. This applies to the confirmed air-cooled design.',
        sourceKey: 'alliancegreatlakes',
      },
      {
        text: 'The Citizens Utility Board projected that the Meta data center in DeKalb would contribute to a local water deficit by 2030 under current draw rates — the closest Illinois precedent for this scale of data center water demand.',
        sourceKey: 'cub2026',
      },
    ],
    unknown: [
      {
        text: 'Water source (municipal supply or on-site well) has not been publicly confirmed in any regulatory filing.',
        sourceKey: null,
      },
      {
        text: 'No IEPA permit or water allocation study covering campus water draw has been made public.',
        sourceKey: null,
      },
    ],
  },

  {
    id: 'energy-rates',
    question: "Will this raise residents' electric bills?",
    category: 'energy',
    stated: [
      {
        text: 'Illinois utility regulation maintains a separate rate class for large industrial users including data centers. The ICC approved a ComEd tariff structure that requires data centers to bear their own transmission and distribution upgrade costs, containing those costs within the business rate class.',
        sourceKey: 'villageoffaq',
      },
    ],
    disputed: [],
    unknown: [
      {
        text: "Whether the regional surge in data center load is contributing to higher PJM capacity auction clearing prices — and by how much — is not yet established by any verified, publicly available study specific to this project or to Illinois. No confirmed figure is available.",
        sourceKey: null,
      },
      {
        text: "T5's PJM interconnection queue position, any power purchase agreement (PPA), and whether its specific load will affect future PJM capacity auction clearing prices are not yet publicly filed.",
        sourceKey: null,
      },
    ],
  },

  {
    id: 'campus-scale',
    question: 'How big will it actually get?',
    category: 'scale',
    stated: [
      {
        text: 'The Village of Grayslake FAQ records the campus site as 472 acres and 10,100,000 sq ft of total buildable area at full buildout.',
        sourceKey: 'villageoffaq',
      },
      {
        text: '18 buildings were approved per Daily Herald and Government Technology reporting. Developer CEO Pete Marin cited up to 20 buildings as an upper estimate. Leasable IT capacity is 1,200 MW at full buildout.',
        sourceKey: 'govtech2025',
      },
    ],
    disputed: [],
    unknown: [
      {
        text: 'T5 CEO Pete Marin stated a total ComEd capacity request of 1.55 GW. The Village FAQ records only leasable IT capacity at 1.2 GW — no gigawatt ceiling appears in Village documents. The gap between those two figures has not been publicly explained, and no official ceiling has been published.',
        sourceKey: 'govtech2025',
      },
      {
        text: 'Final building count, phasing schedule beyond Phase 1, and whether the option parcel will be exercised are not determined.',
        sourceKey: null,
      },
    ],
  },

  {
    id: 'tax-revenue',
    question: 'How much will the village and schools actually receive?',
    category: 'tax',
    stated: [
      {
        text: 'Mayor Davies described the fee split as approximately 50% to major infrastructure, 25% to special community projects, and 25% to resident cost-control measures. These figures were characterized as ballpark estimates and the final allocation was still under negotiation at the time of the Government Technology article.',
        sourceKey: 'govtech2025',
      },
      {
        text: 'The Mayor of Grayslake has publicly cited approximately $300 million in property tax revenue over the coming decades, across all taxing districts. This is an official projection — not an independently verified figure or a confirmed outcome.',
        sourceKey: 'chitrib_june2026',
      },
      {
        text: 'The Deputy Village Manager has publicly cited over $1 billion across all taxing districts over 20 years. This is an official projection — not an independently verified figure or a confirmed outcome.',
        sourceKey: 'chronicle2026',
      },
    ],
    disputed: [
      {
        text: 'Neither official projection has been independently verified. The only comparable publicly documented Illinois data is the DeKalb/Meta precedent — a different county with different levy rates. Capitol News Illinois reported School District 428 received approximately 60.9% of Meta\'s property taxes across three DeKalb County properties (multi-year data). The 2025 tax bill for one Meta facility was $31.1M. These figures come from different datasets and cannot be combined into a single per-district ratio. Neither is directly applicable without a Lake County Assessor valuation of the T5 campus.',
        sourceKey: 'capitolnews2026',
      },
    ],
    unknown: [
      {
        text: 'The Village FAQ states that the development agreements provide no financial incentives to T5. The Lake County Assessor has not yet publicly valued the campus.',
        sourceKey: 'villageoffaq',
      },
      {
        text: 'Whether T5 secured Illinois Data Center Investment Tax Exemption status before the suspension of new applications (effective July 1, 2026, per the Governor\'s June 5, 2026 directive) is not publicly confirmed. No stated duration for the suspension appears on the DCEO page.',
        sourceKey: 'dceo2026',
      },
    ],
  },

  {
    id: 'approval-process',
    question: 'Was the approval process adequate?',
    category: 'process',
    stated: [
      {
        text: 'The Mayor of Grayslake has stated that T5 received all required land-use and zoning approvals.',
        sourceKey: 'dailyherald2026',
      },
    ],
    disputed: [
      {
        text: "The opposition lawsuit argues that public hearings were inadequate: that residents had no meaningful opportunity for cross-examination of expert witnesses, that the Village commissioned no independent third-party environmental or water studies before approval, and that the process did not comply with applicable procedural requirements.",
        sourceKey: 'dailyherald2026',
      },
      {
        text: "T5's application to fill approximately 15.75 acres of wetlands raises a separate federal adequacy question: a September 2025 Stormwater Management Commission letter reportedly indicates some of those wetlands may fall under US Army Corps of Engineers jurisdiction, which would require a federal Section 404 permit not obtained through the village approval process. Avon Township's board adopted a resolution calling for greater transparency and community engagement regarding the development.",
        sourceKey: 'chitrib_june2026',
      },
    ],
    unknown: [
      {
        text: 'The outcome of the pending Lake County Circuit Court litigation challenging the approval is not yet determined.',
        sourceKey: null,
      },
    ],
  },
]
