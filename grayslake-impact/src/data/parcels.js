// Single Source of Truth for Lake County GIS Parcel Data
// Retrieved from Lake County GIS Tax Parcel Layer (Verified Aug 5, 2026)

export const PARCELS_DATA = [
  { pin: '1010200018', acres: 49.21, salePrice: '$29,356,282', date: 'May 2024' },
  { pin: '1011100009', acres: 48.39, salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1003400037', acres: 43.81, salePrice: '—',           date: '—' },
  { pin: '1011200017', acres: 33.05, salePrice: '$3,250,000',  date: 'May 2025' },
  { pin: '1003400036', acres: 20.19, salePrice: '—',           date: '—' },
  { pin: '1010200014', acres: 20.18, salePrice: '$29,356,282', date: 'May 2024' },
  { pin: '1011100007', acres: 16.35, salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1002300010', acres: 10.37, salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1002300019', acres: 8.42,  salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1011100005', acres: 5.82,  salePrice: '$17,000,000', date: 'Jan 2025' },
  { pin: '1011101001', acres: 1.04,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101028', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101029', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101030', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101031', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101032', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101033', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101046', acres: 0.72,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101017', acres: 0.71,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101018', acres: 0.71,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101019', acres: 0.71,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101020', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101021', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101022', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101023', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101024', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101025', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101016', acres: 0.71,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101026', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101027', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101034', acres: 0.71,  salePrice: '$7,769,362',  date: 'Apr 2025' },
  { pin: '1011101003', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101004', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101005', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101006', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101007', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101008', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101009', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101010', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101011', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101012', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101013', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin: '1011101014', acres: 0.70,  salePrice: '$5,592,606',  date: 'Apr 2025' },
  { pin:Here is the single source of truth helper that fixes the parcel table properties across all pages automatically.

### The Fix: Create `src/data/parcels.js`

Create `src/data/parcels.js` to normalize all property names (`salePrice`, `date`, `acres`, `pin`) directly from your `parcels.geojson` file, regardless of whether the property name in the source file is `Recorded sale`, `PRICE`, `Date`, or `salePrice`:

```javascript
import parcelsGeoJSON from './parcels.geojson'

export const PARCELS_DATA = (parcelsGeoJSON?.features || []).map(f => {
  const props = f.properties || {}
  return {
    pin: props.pin || props.PIN || '—',
    acres: props.acres || props.ACRES || '—',
    salePrice: props.salePrice || props['Recorded sale'] || props.PRICE || '—',
    date: props.date || props.Date || props.DATE || '—',
  }
})
