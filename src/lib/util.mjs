// Small helpers shared by the page and diagram generators. No dependencies.

const TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

/** Escape text for use in HTML/SVG element content and double-quoted attributes. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Derive Thai date strings from an ISO date (YYYY-MM-DD).
 * Buddhist era = CE + 543. Parsed as UTC so the local timezone can't shift the day.
 */
export function thaiDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) throw new Error(`date must be YYYY-MM-DD, got: ${iso}`);
  const [, y, mo, d] = m.map(Number);
  const at = new Date(Date.UTC(y, mo - 1, d));
  if (at.getUTCMonth() !== mo - 1) throw new Error(`not a real date: ${iso}`);
  const be = y + 543;
  return {
    iso,
    short: `${d} ${TH_MONTH_ABBR[mo - 1]} ${be}`,
    long: `${TH_DAY[at.getUTCDay()]}ที่ ${d} ${TH_MONTH[mo - 1]} ${be}`,
    weekday: TH_DAY[at.getUTCDay()],
    sortKey: at.getTime(),
  };
}

/** Replace {{token}} against a flat lookup. Unknown tokens throw rather than render literally. */
export function fill(text, vars) {
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`unknown placeholder {{${key}}}`);
    return vars[key];
  });
}

/** `fill` + `esc`, the combination every template string needs. */
export function t(text, vars) {
  return esc(fill(text, vars));
}

/** Inline code spans (`like this`) into <code> tags. Escapes everything else. */
export function inlineCode(text, vars) {
  return esc(fill(text, vars)).replace(/`([^`]+)`/g, '<code>$1</code>');
}
