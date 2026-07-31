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
        text: "T5's specific cooling approach — air-cooled, water-cooled, or hybrid — has not been publicly disclosed in any Grayslake filing.",
        sourceKey: 'villageoffaq',
      },
    ],
    disputed: [
      {
        text: 'The Alliance for the Great Lakes has noted that air-cooling configurations shift water demand upstream to power plants rather than eliminating it — grid-level thermal generation still consumes significant water per megawatt-hour of output.',
        sourceKey: 'alliancegreatlakes',
      },
      {
        text: 'The Citizens Utility Board projected that the Meta data center in DeKalb would contribute to a local water deficit by 2030 under current draw rates — the closest Illinois precedent for this scale of data center water demand.',
        sourceKey: 'cub2026',
      },
      {
        text: 'The Chicago Tribune (July 2, 2026) reported an extrapolated figure of approximately 19.2 million gallons total water use for the full 1.2 GW buildout. This is a journalist-derived calculation — not an official T5 disclosure, not a figure from any regulatory filing, and not independently confirmed by T5 or the Village.',
        sourceKey: 'chitrib2026',
      },
    ],
    unknown: [
      {
        text: "T5 has not publicly disclosed its specific cooling method, water source (municipal or well), or daily water volume for the Grayslake campus in any regulatory filing. An extrapolated estimate has appeared in press reporting (see Disputed above); no official water usage figure has been submitted to IEPA or other regulatory bodies.",
        sourceKey: null,
      },
      {
        text: 'No utility agreement, water allocation study, or IEPA permit covering campus water draw has been made public.',
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
    disputed: [
      {
        text: 'ComEd residential bills rose approximately 12% in June 2026. The Citizens Utility Board links up to ~25% of that increase to data-center-driven PJM capacity price increases — a regional wholesale electricity market effect. PJM capacity prices are set by the aggregate demand of all load in the grid region, not by direct billing line items, so the tariff wall does not insulate residents from capacity auction outcomes.',
        sourceKey: 'cub2026',
      },
    ],
    unknown: [
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
        text: 'Village zoning documentation from 2024 references approximately 225 acres for the approved campus area near the Peterson Road and Route 83 intersection.',
        sourceKey: 'villageoffaq',
      },
      {
        text: 'Developer disclosures describe up to 20 buildings and 1,200 MW of leasable IT capacity at full buildout, with a separate ~45-acre option parcel adjacent to the primary site.',
        sourceKey: 'govtech2025',
      },
    ],
    disputed: [
      {
        text: "Developer marketing materials and the opposition's attorney both cite 10.1 million square feet of total buildable area and 1.55 GW of total ComEd capacity requested — metrics that, if realized, would make T5 @ Chicago IV among the largest single data center campuses in the United States.",
        sourceKey: 'dailyherald2026',
      },
    ],
    unknown: [
      {
        text: 'Final building count, phasing schedule beyond Phase 1, and whether the ~45-acre option parcel adjacent to the primary site will be exercised are not determined.',
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
