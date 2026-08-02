export const projections = {
  project: {
    name: "T5 @ Chicago IV",
    developer: "T5 Data Centers",
    location: "Grayslake, IL (Peterson Road & Route 83)",
    totalAcres: 472,
    totalSqFt: 10_100_000,
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
    permanent: 1500,
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
    districtName: "School District 428",
    outcome: "Funded construction of Mitchell Elementary, opened 2025",
    totalPropertyTaxBilled2025: 31.1, // millions
  },
  stateIncentiveContext: {
    program: "Illinois Data Center Investment Tax Exemption",
    minInvestmentRequired: 250, // million, over 60 months
    constructionWageTaxCredit: 20, // percent, for underserved areas
    statusChange: "Two-year suspension of new data center tax incentive applications, effective July 1, 2026 (Governor's directive, June 5, 2026)",
  },
  residentialRateImpact: {
    directImpact: "tariff-walled",
    tariffNote: "Illinois ICC-approved ComEd tariff requires data centers to fund their own transmission and distribution upgrade costs within the large industrial rate class.",
    capacityNote: "CUB links data-center-driven PJM capacity price increases to broader regional rate increases — a wholesale market effect not contained by the distribution tariff wall.",
  },
};
