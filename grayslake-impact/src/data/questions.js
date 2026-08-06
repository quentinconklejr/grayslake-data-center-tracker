export const questions = [
  {
    id: 'water-usage',
    plain: "The campus is expected to use less than 50,000 gallons a day once fully built. The Village calls that 4.0% more than it currently supplies, and the regional water agency puts the same volume at 0.25% of its system. Cooling is closed-loop, so water circulates rather than being consumed. The one large draw is a one-time flush of about 3.2 million gallons per 200 MW building, staged over several days. What is not settled is how much water the electricity generation behind the campus consumes, which happens at the power plant rather than here.",
    question: 'How much water will the campus use, and from where?',
    category: 'water',
    stated: [
      {
        text: 'Mayor Elizabeth Davies said Grayslake residents will not see any impacts regarding water or power from the development: "These data centers will make no difference to us than if they were anywhere in the five-state region."',
        sourceKey: 'govtech2025',
      },
      {
        text: 'The Village FAQ states the campus will use "primarily air cooling technology with minimal water usage," unlike earlier data center designs that relied on heavy water use. CLCJAWA describes it as a closed-loop system in which heated water is cooled with air and recycled rather than consumed, and T5 CEO Pete Marin described air-cooled chillers that do not need refilling once charged.',
        sourceKeys: ['villagefaq_archived', 'clcjawa2026', 'govtech2025'],
      },
      {
        text: 'Two sources put campus water use at no more than 50,000 gallons per day, but scale it against different denominators. The Village FAQ calls this "just 4.0% additional water use over what the Village supplies each day." CLCJAWA, the wholesale agency serving Grayslake and 13 other members, puts the same volume at about 0.25% of its system-wide daily flow, within its existing IDNR Lake Michigan allocation. Both can be accurate: one compares against Grayslake\'s supply, the other against a 100-square-mile regional system.',
        sourceKeys: ['villagefaq_archived', 'clcjawa2026'],
      },
      {
        text: 'CLCJAWA estimates the initial flush and fill for one 200 MW building at 3.2 million gallons, roughly 15% of the agency\'s daily demand if drawn at once, but planned and staged over several days.',
        sourceKey: 'clcjawa2026',
      },
    ],
    disputed: [
      {
        text: 'The Alliance for the Great Lakes has noted that air-cooling configurations shift water demand upstream to power plants rather than eliminating it. Grid-level thermal generation still consumes significant water per megawatt-hour of output. This applies to the confirmed air-cooled design.',
        sourceKey: 'alliancegreatlakes',
      },
      {
        text: 'The Citizens Utility Board projected that the Meta data center in DeKalb would contribute to a local water deficit by 2030 under current draw rates. The DeKalb/Meta campus is the closest Illinois precedent at this scale.',
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
    plain: "Illinois puts very large electricity users in a separate rate class, so the demand from this campus does not directly land on residential bills, and T5 says supply agreements are already in place with ComEd. T5 also funds its own substation and grid connection; the Village says it pays nothing toward that. The open question is indirect: regional capacity prices are set by total demand across the whole grid, and no public study has established how much data center growth is moving them.",
    question: "Will this raise residents' electric bills?",
    category: 'energy',
    stated: [
      {
        text: 'The Village FAQ states T5 will pay for all electricity used on the campus "as per State of Illinois electric rate standards and as provided for in electric supply agreements that are already in place between T5 and ComEd," that Illinois places large users in a separate rate class so their demand does not directly affect residential rates, and that the developer funds the supply infrastructure including its own substation with the Village paying nothing. Mayor Davies separately said residents will not see power impacts, and Dan Diorio of the Data Center Coalition said the industry is "fully committed to paying their full cost of service."',
        sourceKeys: ['villagefaq_archived', 'govtech2025'],
      },
    ],
    disputed: [],
    unknown: [
      {
        text: "No verified study has established what share of the regional data center load growth, if any, is driving higher PJM capacity auction prices in the ComEd zone. No project-specific figure is public.",
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
    plain: "Three acreage numbers circulate and they mean different things. T5 owns 287.8 acres today. The Village approved development on up to 472. T5 says it controls more than 490, which can include land it has not bought yet. The approvals cap building at 10.1 million square feet across what the Village calls \u201cseveral individual buildings\u201d without naming a number; reporting puts it at 18, and the T5 chief executive has said up to 20.",
    question: 'How big will it actually get?',
    category: 'scale',
    stated: [
      {
        text: 'The Village FAQ states the approved campus "covers up to 472 acres and can include no more than 10,100,000 square feet of data center space in several individual buildings" and gives no building count. Daily Herald reporting puts the count at 18. CLCJAWA records 470 acres, up to 10 million square feet, in fewer than 20 buildings.',
        sourceKeys: ['villagefaq_archived', 'dailyherald2026', 'clcjawa2026'],
      },
      {
        text: '18 buildings were approved per Daily Herald and Government Technology reporting. Developer CEO Pete Marin cited up to 20 buildings as an upper estimate. Leasable IT capacity is 1,200 MW at full buildout.',
        sourceKey: 'govtech2025',
      },
    ],
    disputed: [],
    unknown: [
      {
        text: 'T5 CEO Pete Marin stated 1.55 GW of capacity secured from ComEd, of which 1.2 GW is leasable IT capacity, plus a ComEd-built substation. CLCJAWA separately records 1.6 GW available to Phase I. What governs the ceiling on total campus draw, and how phasing maps to it, has not been publicly explained.',
        sourceKeys: ['govtech2025', 'clcjawa2026'],
      },
      {
        text: 'Final building count, phasing schedule beyond Phase 1, and whether the option parcel will be exercised are not determined.',
        sourceKey: null,
      },
    ],
  },

  {
    id: 'tax-revenue',
    plain: "Nobody has published a number for what Grayslake specifically will receive. Officials have cited figures ranging from about $300 million over decades to over $1 billion over 20 years, neither independently verified. Eight taxing districts cover the campus and four of them are not Grayslake districts, so part of the tax base goes to Round Lake, Fremont and Mundelein. The actual amount depends on a Lake County Assessor valuation that has not happened yet.",
    question: 'How much will the village and schools actually receive?',
    category: 'tax',
    stated: [
      {
        text: 'Mayor Davies described the fee split as approximately 50% to major infrastructure, 25% to special community projects, and 25% to resident cost-control measures. These figures were characterized as ballpark estimates and the final allocation was still under negotiation at the time of the Government Technology article.',
        sourceKey: 'govtech2025',
      },
      {
        text: 'The Mayor of Grayslake has publicly cited approximately $300 million in property tax revenue over the coming decades, across all taxing districts.',
        sourceKey: 'chitrib_june2026',
      },
      {
        text: 'The Deputy Village Manager has publicly cited over $1 billion across all taxing districts over 20 years.',
        sourceKey: 'chronicle2026',
      },
    ],
    disputed: [
      {
        text: 'Neither official projection has been independently verified. The only comparable publicly documented Illinois data is the DeKalb/Meta precedent, from a different county with different levy rates. Capitol News Illinois reported School District 428 received approximately 60.9% of Meta\'s property taxes across three DeKalb County properties (multi-year data). The 2025 tax bill for one Meta facility was $31.1M. These figures come from different datasets and cannot be combined into a single per-district ratio. Neither is directly applicable without a Lake County Assessor valuation of the T5 campus.',
        sourceKey: 'capitolnews2026',
      },
    ],
    unknown: [
      {
        text: 'The Village FAQ states that "the approved development agreements do not provide for any financial incentives." The Village\'s live copy is no longer reachable; this is quoted from the archived July 24, 2026 snapshot. The Lake County Assessor has not yet publicly valued the campus.',
        sourceKey: 'villagefaq_archived',
      },
      {
        text: 'Whether T5 secured Illinois Data Center Investment Tax Exemption status before the suspension of new applications (effective July 1, 2026, per the Governor\'s June 5, 2026 directive) is not publicly confirmed. No stated duration for the suspension appears on the DCEO page.',
        sourceKey: 'dceo2026',
      },
    ],
  },

  {
    id: 'approval-process',
    plain: "The Village approved the project over roughly eight months between September 2024 and May 2025, after public hearings and board meetings, and says T5 received every land-use and zoning approval required. Residents challenging it argue the hearings were inadequate, that objectors could not meaningfully cross-examine, and that the Village commissioned no independent studies. That dispute is headed for court; no complaint had been filed as of the most recent reporting.",
    question: 'Was the approval process adequate?',
    category: 'process',
    stated: [
      {
        text: 'The Mayor of Grayslake has stated that T5 received all required land-use and zoning approvals.',
        sourceKey: 'dailyherald2026',
      },
      {
        text: 'The Village FAQ, updated June 5, 2026, stated the Village can no longer respond to further questions about the project due to pending litigation: "Unfortunately, due to notice of impending litigation, and upon advice of counsel, the village cannot at this time offer further responses to questions regarding the approved data center development." The FAQ document itself became unreachable by August 5, 2026.',
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

  {
    id: 'jobs',
    question: 'How many jobs will it actually create?',
    category: 'jobs',
    plain: "Three numbers have been given. Mayor Davies cited 1,500 permanent jobs in October 2025. The T5 chief executive cited \u201cover 1,600\u201d in July 2026. The Village FAQ reaches 1,680, but gets there by assuming 50 jobs for every 300,000 square feet and that the full 10 million square feet actually gets built, and it cautions the estimate may change. Construction work is counted separately and described only as \u201chundreds\u201d of trade jobs.",
    stated: [
      {
        text: 'Mayor Elizabeth Davies cited 1,500 permanent positions at full buildout, plus hundreds of construction and trade jobs during development.',
        sourceKey: 'govtech2025',
      },
      {
        text: 'T5 CEO Pete Marin stated the development produces "over 1,600 jobs".',
        sourceKey: 'dailyherald_jul2026',
      },
      {
        text: 'The Village FAQ estimates "50 permanent jobs are created for every 300,000 sq ft. or 1,680 permanent jobs" if all 10 million sq ft is built, hedges that estimates "may change" as operations and technologies do, and excludes site development and construction jobs from the figure.',
        sourceKey: 'villagefaq_archived',
      },
    ],
    disputed: [],
    unknown: [
      {
        text: 'No breakdown by role, wage level, or how many positions would be filled locally has been published. No construction headcount has been given beyond "hundreds".',
        sourceKey: null,
      },
    ],
  },
]
