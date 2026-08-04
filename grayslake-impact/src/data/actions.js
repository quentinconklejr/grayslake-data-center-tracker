// Sourced strictly from sources.js and timeline.js — nothing invented.
// sourceIds must reference keys in sources.js.
export const actions = [
  {
    id: "grayslake-application-2024",
    date: "2024-09-23",
    jurisdiction: "Village of Grayslake",
    actionType: "Application Filed",
    description:
      "T5 files for village approvals. The formal approval process begins September 23, 2024, per the Village FAQ.",
    outcome: "Application accepted; review process initiated.",
    sourceIds: ["hoodline2026", "villageoffaq"],
    status: "complete",
    lastVerified: "June 5, 2026",
  },
  {
    id: "grayslake-approval-2025",
    date: "2025-05-06",
    jurisdiction: "Village of Grayslake",
    actionType: "Land-Use Approval",
    description:
      "Village approval process concludes after a period spanning September 23, 2024 through May 6, 2025. Officials cited up to 1,500 permanent jobs and major tax revenue at public meetings during this period.",
    outcome: "Approved.",
    sourceIds: ["villageoffaq", "govtech2025"],
    status: "complete",
    lastVerified: "June 5, 2026",
  },
  {
    id: "grayslake-faq-litigation-2026",
    date: "2026-06-05",
    jurisdiction: "Village of Grayslake",
    actionType: "Official Statement",
    description:
      "Village FAQ updated as of June 5, 2026. The revised document states the Village can no longer respond to further questions about the project due to pending litigation.",
    outcome: "Village entered litigation posture; no further Q&A responses.",
    sourceIds: ["villageoffaq"],
    status: "complete",
    lastVerified: "June 5, 2026",
  },
  {
    id: "lakecounty-legal-challenge-2026",
    date: "2026-06",
    jurisdiction: "Lake County Board",
    actionType: "Legal Challenge",
    description:
      "A Lake County coalition retains counsel to challenge village approvals as invalid. No filing date was confirmed at the time of the Daily Herald report.",
    outcome: "Counsel retained; challenge pending as of June 8, 2026.",
    sourceIds: ["dailyherald2026"],
    status: "pending",
    lastVerified: "June 8, 2026",
  },
  {
    id: "lakecounty-smc-review-2026",
    date: "2026-06-05",
    jurisdiction: "Lake County SMC",
    actionType: "Permit Review",
    description:
      "As of the June 5, 2026 Chicago Tribune report, Lake County's Stormwater Management Commission had not yet received a stormwater application from T5 and did not expect one for approximately one month.",
    outcome: "No application received as of June 5, 2026.",
    sourceIds: ["chitrib_june2026"],
    status: "pending",
    lastVerified: "June 5, 2026",
  },
  {
    id: "usace-wetlands-permit-2026",
    date: "2026-06-05",
    jurisdiction: "US Army Corps of Engineers",
    actionType: "Permit Application",
    description:
      "T5 applied for a Section 404 permit to fill approximately 15.75 acres of wetlands on the site. A September 2025 Stormwater Management Commission letter reportedly indicates some of those wetlands may fall under US Army Corps jurisdiction.",
    outcome: "Application filed; no decision as of June 5, 2026.",
    sourceIds: ["chitrib_june2026"],
    status: "pending",
    lastVerified: "June 5, 2026",
  },
  {
    id: "avon-township-resolution-2026",
    date: "2026-06",
    jurisdiction: "Avon Township",
    actionType: "Resolution",
    description:
      "Avon Township's elected board adopts a resolution calling for greater transparency and community engagement regarding the T5 development. Avon Township is a township government, not a municipality.",
    outcome: "Resolution adopted.",
    sourceIds: ["chronicle2026"],
    status: "complete",
    lastVerified: "June 26, 2026",
  },
  {
    id: "lakecounty-civil-intent-2026",
    date: "2026-06-26",
    jurisdiction: "Lake County Board",
    actionType: "Legal Challenge",
    description:
      "Opposition coalition signals intent to pursue civil litigation against the project. No filings had been made as of the Chronicle Media report.",
    outcome: "Intent stated; no filings confirmed as of June 26, 2026.",
    sourceIds: ["chronicle2026"],
    status: "pending",
    lastVerified: "June 26, 2026",
  },
  {
    id: "illinois-dceo-incentive-suspension-2026",
    date: "2026-06-05",
    jurisdiction: "State of Illinois",
    actionType: "Policy Change",
    description:
      "Governor directs DCEO to stop processing new data center tax incentive applications, effective July 1, 2026. No stated duration for the suspension appears on the DCEO page.",
    outcome: "New applications suspended effective July 1, 2026.",
    sourceIds: ["dceo2026"],
    status: "complete",
    lastVerified: "June 5, 2026",
  },
]
