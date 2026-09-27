export const projections = {
  project: {
    name: "T5 @ Chicago IV",
    developer: "T5 Data Centers",
    location: "Grayslake, IL (Peterson Road & Route 83)",
    // Primary records lead. These three are what the five signed ordinances
    // state; the Village FAQ's rounder numbers and CLCJAWA's follow, kept
    // beside them so a page can attribute both without retyping either.
    //
    //   acres     135 + 90 + 31.5 + 33 + 184, one figure per ordinance
    //             (packet pp. 2, 60, 142, 169, 195)
    //   sq ft     2,570,000 + 2,120,000 + 1,060,000 + 4,410,000, the four
    //             caps in force (packet pp. 12, 178, 150, 196). Ordinance
    //             2025-0-06 replaced the Phase 2 cap of 1,590,000 with the
    //             combined 2,120,000, so the earlier figure is not added.
    //   buildings a count of labels on the master plan sheet (packet p. 242).
    //             No ordinance sets a building count, and the agreements let
    //             the number change within the floor area cap (packet p. 12).
    totalAcres: 473.5,
    totalSqFt: 10_160_000,
    maxSqFt: "10,160,000",
    masterPlanBuildings: 18,
    maxBuildings: 20,

    // Other published figures for the same things, each attributed wherever
    // it is shown. Neither is a correction of the other.
    faqAcres: 472,
    faqMaxSqFt: "10,100,000",
    clcjawaAcres: 470,
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
  },
  fees: {
    totalDescription: "tens of millions of dollars if fully built out",
    allocation: [
      { category: "Resident cost-control measures", percent: 25 },
      { category: "Special community projects", percent: 25 },
      { category: "Major infrastructure projects", percent: 50 },
    ],
  },
  // Listed verbatim in the Village FAQ under "What taxing districts are the
  // approved data center campus buildings in?". Worth surfacing because four of
  // the eight sit outside Grayslake: the campus straddles district lines, so
  // some of the tax base it creates accrues to Round Lake, Fremont and
  // Mundelein districts rather than to Grayslake ones.
  taxingDistricts: [
    { name: "Village of Grayslake", grayslake: true },
    { name: "Grayslake Community High School District 127", grayslake: true, school: true },
    { name: "Grayslake Fire Protection District", grayslake: true },
    { name: "Grayslake Park District", grayslake: true },
    { name: "Round Lake Area Park District", grayslake: false },
    { name: "Fremont Elementary School District 79", grayslake: false, school: true },
    { name: "Mundelein High School District 120", grayslake: false, school: true },
    { name: "Fremont Library District", grayslake: false },
  ],
  taxingDistrictsNote:
    "The FAQ notes that Illinois taxing district boundaries often do not match village boundaries and that villages have no say in setting them. It states that any property tax revenue received represents resources to each district \u201cnot coming from homeowners,\u201d and that each independent district determines the actual impact for its own taxpayers. No per-district projection has been published. District names are reproduced as the FAQ spells them.",

  schoolFundingComparable: {
    source: "Meta data center, DeKalb, IL",
    percentToSchoolDistrict: 60.9,
    percentNote: "School District 428's share of Meta's property taxes across three DeKalb County properties (multi-year, 2021–2024 data per Capitol News Illinois)",
    districtName: "School District 428",
    outcome: "Funded construction of Mitchell Elementary, opened 2025",
    totalPropertyTaxBilled2025: 31.1, // millions — one facility, 2025 tax year
    taxNote: "2025 tax bill for one Meta facility, from a separate dataset than the 60.9% figure",
  },
  stateIncentiveContext: {
    program: "Illinois Data Center Investment Tax Exemption",
    minInvestmentRequired: 250, // million, over 60 months
    constructionWageTaxCredit: 20, // percent, for underserved areas
    statusChange: "Suspension of new data center tax incentive applications, effective July 1, 2026 (Governor's directive, June 5, 2026). No stated duration appears on the DCEO page",
  },
  // Two published buildout horizons, from two outlets three days apart in
  // October 2025. Do NOT collapse these into a range: they are different kinds
  // of claim. "As early as 2029" is a floor. "Seven to 10 years" is a central
  // expectation. A range spanning them would imply a single estimate nobody
  // actually made. The Village FAQ is silent on timing entirely, so any
  // attribution of a buildout date to the Village is unsupported.
  buildoutHorizon: {
    claims: [
      {
        key: "earliest",
        value: "2029",
        framing: "Earliest possible",
        quote: "full build-out could come as early as 2029",
        attribution: "Chicago Tribune, via Government Technology, Oct. 14, 2025",
        sourceKey: "govtech2025",
      },
      {
        key: "expected",
        value: "2032 \u2013 2035",
        framing: "Expected",
        quote: "full build out is expected over the next seven to 10 years",
        attribution: "Daily Herald, Oct. 11, 2025",
        sourceKey: "dailyherald_oct2025",
      },
    ],
    note:
      "Two outlets published different buildout horizons within three days of each other in October 2025, and they are not the same kind of statement. The Tribune reported a best case; the Daily Herald reported an expectation roughly three to six years later. Both were reported while the project was described as demand-driven, with the number of buildings tailored to customer needs. The Village FAQ gives no buildout date at all.",
    firstPower: [
      { value: "Q4 2027", attribution: "Data Center Dynamics", sourceKey: "dcd2026" },
      { value: "June 2027", attribution: "Daily Herald, Oct. 2025", sourceKey: "dailyherald_oct2025" },
    ],
  },

  // Three acreage figures circulate and they measure different things. Keeping
  // them apart matters: conflating ownership with approval is what the old map
  // did. Ordered smallest to largest.
  acreageFigures: [
    {
      key: "owned",
      value: "287.8 acres",
      metric: "Recorded in T5 ownership",
      definition:
        "Land whose deed is in a T5 entity's name, across 57 parcels in four non-contiguous groups.",
      attribution: "Lake County GIS tax parcel layer, retrieved Aug. 5, 2026",
      sourceKey: "lakecountygis",
    },
    {
      key: "approved",
      value: "about 473.5 acres",
      metric: "Approved across five ordinances",
      definition:
        "The sum of the acreage each of the five approval ordinances states: 135 + 90 + 31.5 + 33 + 184. The same ordinances cap building at 10,160,000 sq ft in total. The Village FAQ gives the figures as up to 472 acres and 10,100,000 sq ft; CLCJAWA records 470 acres.",
      attribution: "Village of Grayslake Ordinances 2024-0-37, 2024-0-38, 2025-0-05, 2025-0-06 and 2025-0-21",
      sourceKey: "t5RecordsPacket2026",
    },
    {
      key: "controlled",
      value: "more than 490 acres",
      metric: "Controlled developable land",
      definition:
        "Land T5 says it controls on either side of Peterson Road, which exceeds what it owns and is not the same as what is approved. Control can include options and contracts that are not recorded transfers.",
      attribution:
        "David Horowitz, T5 senior vice president and head of leasing, to the Daily Herald (Oct. 2025)",
      sourceKey: "dailyherald_oct2025",
    },
  ],
  acreageNote:
    "Ownership, approval and control are three different things. T5 holds title to 287.8 acres today; the five approval ordinances cover about 473.5 acres between them; T5 states it controls more than 490. None of these is a correction of the others.",

  // Three published capacity figures. They measure DIFFERENT things and are not
  // in conflict with one another. Each is attributed to whoever stated it.
  capacityFigures: [
    {
      key: "it",
      value: "1,200 MW",
      metric: "Leasable IT capacity",
      definition:
        "The computing load T5 markets the campus as able to support at full buildout.",
      // Marin gave 1.2 GW in both: "up to 1.2GW of IT capacity" (DCD) and
      // 1.2 GW of the 1.55 GW "will be leasable power" (Government Technology).
      attribution: "Pete Marin, T5 CEO, via Data Center Dynamics (Feb. 2025) and Government Technology (Oct. 2025)",
      sourceKey: "dcdGW2026",
      alsoSourceKey: "govtech2025",
    },
    {
      key: "secured",
      value: "1,600 MW",
      metric: "Secured utility power",
      // The source says "1.6GW of secured utility power" and nothing about
      // why it exceeds IT capacity. An earlier definition added "to allow for
      // redundancy and phasing", which no source states; removed.
      definition:
        "Utility power T5 describes as secured for the campus. Data Center Dynamics reports it as a 1.6 GW ComEd onsite substation.",
      attribution: "Pete Marin, T5 CEO, via Data Center Dynamics (Feb. 2025)",
      sourceKey: "dcdGW2026",
    },
    {
      key: "comed",
      value: "1.55 GW",
      metric: "Power secured from ComEd",
      // Marin: "developers have secured 1.55 gigawatts of power from ComEd".
      // Substation wording belongs to the 1.6 GW figure (DCD), not this one.
      definition:
        "Power secured from ComEd for the campus, of which 1.2 GW is leasable.",
      attribution:
        "Pete Marin, T5 CEO, to the Chicago Tribune (Oct. 2025). The same figure was later cited by Chloe Russell, counsel to the coalition challenging the approvals, in the Daily Herald (June 2026).",
      sourceKey: "govtech2025",
      alsoSourceKey: "dailyherald2026",
    },
  ],
  // Only what the sources say. Earlier wording called these "different
  // measurements, not competing estimates" and ComEd capacity "necessarily
  // larger"; no source says either.
  capacityNote:
    "T5 CEO Pete Marin gave 1.6 GW of secured utility power and up to 1.2 GW of IT capacity in February 2025, and 1.55 GW secured from ComEd, 1.2 GW of it leasable, in October 2025. CLCJAWA's executive director told an ICC session in January 2026 that Phase I has 1.6 GW available. The difference between 1.6 GW and 1.55 GW has not been explained publicly.",

  residentialRateImpact: {
    directImpact: "tariff-walled",
    tariffNote: "Illinois ICC-approved ComEd tariff requires data centers to fund their own transmission and distribution upgrade costs within the large industrial rate class.",
    capacityNote: "Whether data center load growth is driving higher PJM capacity auction prices in the ComEd zone is not yet established by any verified public study. No confirmed figure is available.",
  },
};
