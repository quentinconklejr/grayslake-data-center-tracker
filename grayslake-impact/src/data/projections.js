export const projections = {
  project: {
    name: "T5 @ Chicago IV",
    developer: "T5 Data Centers",
    location: "Grayslake, IL (Peterson Road & Route 83)",
    totalAcres: 472,
    totalSqFt: 10_100_000,
    approvedBuildings: 18,
    maxBuildings: 20,
    maxSqFt: "10,100,000",
    totalCapacityMW: 1200,
    securedPowerMW: 1600,
    comEdCapacityGW: 1.55,
    costLow: 8.5, // billions
    costHigh: 18, // billions
    firstBuildingOnline: "Q4 2027",
    fullBuildOut: "2029",
  },
  jobs: {
    // 1,680 is re-confirmed from the archived Village FAQ (Wayback snapshot
    // 2026-07-24, page 2). It is NOT a flat headcount estimate: the FAQ derives
    // it from a density ratio applied to the maximum approved footprint —
    // "50 permanent jobs are created for every 300,000 sq. ft. or 1,680
    // permanent jobs". It therefore only holds at the full 10.1M sq ft
    // build-out, which is a ceiling rather than a commitment. Always render it
    // with that condition attached.
    permanent: 1680,
    permanentBasis: "50 permanent jobs for every 300,000 sq. ft.",
    permanentCondition: "if all 10 million sq ft of approved space is built",
    permanentNote:
      "Village FAQ ratio figure. The FAQ frames it conditionally and hedges it: \u201cBecause operations and technologies will change over time, current estimations of job creation from the data center campus may change.\u201d It also excludes construction employment, which is counted separately.",
    permanentExcludesConstruction: true,
    // Attributable alternatives, each with a named speaker and a live source:
    permanentDavies: 1500,   // Mayor Elizabeth Davies, Chicago Tribune, Oct. 2025
    permanentMarin: 1600,    // Pete Marin, T5 CEO, "over 1,600", Daily Herald, Jul. 2026
    permanentEarlier: 1500,
    constructionPhase: "hundreds of construction and trade jobs during buildout",
    // Editorial midpoint for chart display only — not a cited figure.
    // The sourced description is "hundreds"; 400 is used as a visual estimate.
    constructionMidpoint: 400,
  },
  fees: {
    totalDescription: "tens of millions of dollars if fully built out",
    allocation: [
      { category: "Resident cost-control measures", percent: 25 },
      { category: "Special community projects", percent: 25 },
      { category: "Major infrastructure projects", percent: 50 },
    ],
  },
  schoolFundingComparable: {
    source: "Meta data center, DeKalb, IL",
    percentToSchoolDistrict: 60.9,
    percentNote: "School District 428's share of Meta's property taxes across three DeKalb County properties (multi-year, 2021–2024 data per Capitol News Illinois)",
    districtName: "School District 428",
    outcome: "Funded construction of Mitchell Elementary, opened 2025",
    totalPropertyTaxBilled2025: 31.1, // millions — one facility, 2025 tax year
    taxNote: "2025 tax bill for one Meta facility — from a separate dataset than the 60.9% figure",
  },
  stateIncentiveContext: {
    program: "Illinois Data Center Investment Tax Exemption",
    minInvestmentRequired: 250, // million, over 60 months
    constructionWageTaxCredit: 20, // percent, for underserved areas
    statusChange: "Suspension of new data center tax incentive applications, effective July 1, 2026 (Governor's directive, June 5, 2026). No stated duration appears on the DCEO page",
  },
  // Three published capacity figures. They measure DIFFERENT things and are not
  // in conflict with one another. Each is attributed to whoever stated it.
  capacityFigures: [
    {
      key: "it",
      value: "1,200 MW",
      metric: "Leasable IT capacity",
      definition:
        "The computing load T5 markets the campus as able to support at full buildout.",
      attribution: "T5 Data Centers (developer), via Data Center Dynamics",
      sourceKey: "dcdGW2026",
    },
    {
      key: "secured",
      value: "1,600 MW",
      metric: "Secured utility power",
      definition:
        "Utility capacity T5 states it has contracted, above leasable IT capacity to allow for redundancy and phasing.",
      attribution: "T5 Data Centers (developer), via Data Center Dynamics",
      sourceKey: "dcdGW2026",
    },
    {
      key: "comed",
      value: "1.55 GW",
      metric: "Total ComEd capacity secured",
      definition:
        "Total utility capacity secured from ComEd for the campus, of which 1.2 GW is leasable. The campus includes a ComEd-built substation.",
      attribution:
        "Pete Marin, T5 CEO, to the Chicago Tribune (Oct. 2025). The same figure was later cited by Chloe Russell, counsel to the coalition challenging the approvals, in the Daily Herald (June 2026).",
      sourceKey: "govtech2025",
      alsoSourceKey: "dailyherald2026",
    },
  ],
  capacityNote:
    "These are different measurements, not competing estimates of the same quantity. Leasable IT capacity is the computing load the campus can rent out; total ComEd capacity is the utility connection feeding it, which is necessarily larger. All three figures trace back to T5: CEO Pete Marin described 1.55 GW secured from ComEd with 1.2 GW of it leasable, and CLCJAWA's utility briefing independently records 1.6 GW available to Phase I.",

  residentialRateImpact: {
    directImpact: "tariff-walled",
    tariffNote: "Illinois ICC-approved ComEd tariff requires data centers to fund their own transmission and distribution upgrade costs within the large industrial rate class.",
    capacityNote: "Whether data center load growth is driving higher PJM capacity auction prices in the ComEd zone is not yet established by any verified public study. No confirmed figure is available.",
  },
};
