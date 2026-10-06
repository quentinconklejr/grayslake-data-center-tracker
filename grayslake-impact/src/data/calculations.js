/**
 * Figures the site calculates itself, with the parcel inputs for each.
 *
 * An entry that gives a calculated figure says so ("calculated from county
 * parcel records"). The guard (pipeline/lib/calculated.mjs) lets such a figure
 * pass only if every input below matches the county record and recomputing
 * from the inputs gives exactly the figure printed. Inputs come from the
 * county parcel snapshot committed at src/data/parcels.geojson (Lake County
 * GIS, Tax Parcel Information layer 12).
 *
 * ops: sum_acres (sum of the inputs' acres, rounded half up to `decimals`,
 * or given to two decimals as the county records them),
 * sum_recordings (sum of sale amounts, each distinct date and amount counted
 * once), count (number of inputs), outline_area (area of the inputs' county
 * parcel boundaries, dissolved, in acres).
 */
export const calculations = [
  {
    "entry": {
      "date": "2024-05-02",
      "title": "Land acquisition begins"
    },
    "label": "calculated from county parcel records",
    "source": "lakecountygis",
    "values": [
      {
        "value": "69.9",
        "what": "Acres in the three parcels sold on May 2, 2024",
        "op": "sum_acres",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          }
        ]
      },
      {
        "value": "89.4",
        "what": "Acres in the five parcels sold in January 2025",
        "op": "sum_acres",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          }
        ]
      },
      {
        "value": "62,968,250",
        "what": "Recorded consideration: each distinct sale (date and amount) counted once",
        "op": "sum_recordings",
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "55",
        "what": "Parcels with a recorded sale",
        "op": "count",
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "57",
        "what": "Parcels in T5 ownership",
        "op": "count",
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1003400036",
            "acres": 20.19,
            "saleAmount": null,
            "saleDate": null
          },
          {
            "pin": "1003400037",
            "acres": 43.81,
            "saleAmount": null,
            "saleDate": null
          },
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "223.8",
        "what": "Acres in the parcels with a recorded sale",
        "op": "sum_acres",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "287.8",
        "what": "Acres in all parcels in T5 ownership",
        "op": "sum_acres",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1002300010",
            "acres": 10.37,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1002300019",
            "acres": 8.42,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1003400036",
            "acres": 20.19,
            "saleAmount": null,
            "saleDate": null
          },
          {
            "pin": "1003400037",
            "acres": 43.81,
            "saleAmount": null,
            "saleDate": null
          },
          {
            "pin": "1010200014",
            "acres": 20.18,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010200018",
            "acres": 49.21,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1010201002",
            "acres": 0.54,
            "saleAmount": 29356282,
            "saleDate": "2024-05-02"
          },
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "64.0",
        "what": "Acres in the two parcels with no recorded sale",
        "op": "sum_acres",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1003400036",
            "acres": 20.19,
            "saleAmount": null,
            "saleDate": null
          },
          {
            "pin": "1003400037",
            "acres": 43.81,
            "saleAmount": null,
            "saleDate": null
          }
        ]
      },
      {
        "value": "134.9",
        "what": "Area of the largest contiguous block, calculated from the merged county parcel boundaries of these parcels (as scripts/fetch-parcels.js computes it).",
        "op": "outline_area",
        "decimals": 1,
        "inputs": [
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "50",
        "what": "Parcels in the largest contiguous block",
        "op": "count",
        "inputs": [
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      },
      {
        "value": "135.10",
        "what": "Sum of the county’s own acreage figures for the parcels in the largest contiguous block",
        "op": "sum_acres",
        "decimals": 2,
        "inputs": [
          {
            "pin": "1011100005",
            "acres": 5.82,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100007",
            "acres": 16.35,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011100009",
            "acres": 48.39,
            "saleAmount": 17000000,
            "saleDate": "2025-01-17"
          },
          {
            "pin": "1011101001",
            "acres": 1.04,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101002",
            "acres": 0.69,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101003",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101004",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101005",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101006",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101007",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101008",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101009",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101010",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101011",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101012",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101013",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101014",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101015",
            "acres": 0.7,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101016",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101017",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101018",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101019",
            "acres": 0.71,
            "saleAmount": 5592606,
            "saleDate": "2025-04-28"
          },
          {
            "pin": "1011101020",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101021",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101022",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101023",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101024",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101025",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101026",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101027",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101028",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101029",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101030",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101031",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101032",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101033",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101034",
            "acres": 0.71,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101035",
            "acres": 0.7,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101036",
            "acres": 0.67,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101037",
            "acres": 0.64,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101038",
            "acres": 0.61,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101039",
            "acres": 0.58,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101040",
            "acres": 0.56,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101041",
            "acres": 0.54,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101042",
            "acres": 0.53,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101043",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101044",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101045",
            "acres": 0.52,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011101046",
            "acres": 0.72,
            "saleAmount": 7769362,
            "saleDate": "2025-04-25"
          },
          {
            "pin": "1011200017",
            "acres": 33.05,
            "saleAmount": 3250000,
            "saleDate": "2025-05-06"
          }
        ]
      }
    ]
  }
]
