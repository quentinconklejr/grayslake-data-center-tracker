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
    costLow: 8.5, // billions
    costHigh: 18, // billions
    firstBuildingOnline: "Q4 2027",
    fullBuildOut: "2029",
  },
  jobs: {
    permanent: 1680,
    permanentEarlier: 1500,
    constructionPhase: "hundreds of construction and trade jobs during buildout",
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
  residentialRateImpact: {
    directImpact: "tariff-walled",
    tariffNote: "Illinois ICC-approved ComEd tariff requires data centers to fund their own transmission and distribution upgrade costs within the large industrial rate class.",
    capacityNote: "Whether data center load growth is driving higher PJM capacity auction prices in the ComEd zone is not yet established by any verified public study. No confirmed figure is available.",
  },
};
