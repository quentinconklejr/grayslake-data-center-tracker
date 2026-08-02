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
        sourceKey: 'dceo2026',
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
        text: 'Developer disclosures describe up to 20 buildings and 1,200 MW of leasable IT capacity at full buildout.',
        sourceKey: 'govtech2025',
      },
    ],
    disputed: [
      {
        text: "The opposition's attorney and some developer marketing materials separately cited 1.55 GW of total ComEd capacity requested — if realized, that would exceed the 1.2 GW leasable figure the Village FAQ states.",
        sourceKey: 'dailyherald2026',
      },
    ],
    unknown: [
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
        text: 'Village officials project "tens of millions of dollars in developer fees" if the campus is fully built out — allocated 50% to major infrastructure, 25% to special community projects, and 25% to resident cost-control measures.',
        sourceKey: 'villageoffaq',
      },
    ],
    disputed: [
      {
        text: 'No independent, Grayslake-specific property tax revenue projection has been released by the Village, T5, or Lake County. The only comparable public data is the DeKalb/Meta precedent — a different county with different levy rates — where 60.9% of a $31.1M annual tax bill went to School District 428. That figure is not transferable without a Lake County assessor valuation.',
        sourceKey: 'capitolnews2026',
      },
    ],
    unknown: [
      {
        text: 'The Lake County Assessor has not yet publicly valued the T5 campus. Any tax abatement or TIF agreements that would reduce the taxable assessed value have not been disclosed.',
        sourceKey: null,
      },
      {
        text: 'Whether T5 secured Illinois Data Center Investment Tax Exemption status before the two-year suspension of new applications (effective July 1, 2026, per the Governor\'s June 5, 2026 directive) is not publicly confirmed.',
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
        text: 'The Mayor of Grayslake has stated that T5 received all required land-use and zoning approvals and that environmental reviews were conducted in accordance with Village procedures.',
        sourceKey: 'dailyherald2026',
      },
    ],
    disputed: [
      {
        text: "The opposition lawsuit argues that public hearings were inadequate: that residents had no meaningful opportunity for cross-examination of expert witnesses, that the Village commissioned no independent third-party environmental, water, or traffic studies before approval, and that the process did not comply with applicable procedural requirements.",
        sourceKey: 'dailyherald2026',
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
