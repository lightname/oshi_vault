import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';

const CHECK = process.argv.includes('--check');
const ROOT = process.cwd();
const XLSX_PATH = path.join(ROOT, 'data/source/mega-ip-goods.xlsx');
const LOCK_PATH = path.join(ROOT, 'src/data/slug-lock.json');
const GEN_DIR = path.join(ROOT, 'src/data/generated');
const PUB_PATH = path.join(ROOT, 'public/data/catalog.json');

const MAP = {
  cat: { '게임': 'game', '애니': 'anime', '캐릭터': 'character', '영화': 'movie' },
  type: { '피규어': 'figure', '인형': 'plush', '뱃지·아크릴': 'badge', '카드': 'card', '쿠지': 'kuji', '의류·잡화': 'apparel', '기타': 'other' },
  limit: { '수량': 'quantity', '기간': 'period', '매장·이벤트': 'store', '지역': 'region', '추첨': 'lottery', '콜라보': 'collab', '일반': 'regular' },
  status: { '예약중': 'preorder', '판매중': 'onsale', '품절': 'soldout', '종료': 'ended' },
  seller: { '공식몰': 'official_online', '공식매장': 'official_store', '쇼핑몰': 'mall', '전문샵': 'specialty' },
  markets: new Set(['ebay', 'mercari', 'kream', 'other']),
  currencies: new Set(['JPY', 'KRW', 'USD']),
  fallbackSlugs: { '리락쿠마·스미코구라시': 'rilakkuma-sumikkogurashi' },
};

const errors = [];
const err = (s, r, c, m) => errors.push(`[data] ${s} ${r} ${c} ${m}`);

function cellVal(cell) {
  let v = cell?.value;
  if (v && typeof v === 'object' && 'result' in v) v = v.result;
  if (v && typeof v === 'object' && 'richText' in v) v = v.richText.map((r) => r.text).join('');
  if (v && typeof v === 'object' && 'hyperlink' in v) v = v.text ?? v.hyperlink;
  return v ?? null;
}

const asStr = (v) => (v === null || v === undefined ? null : String(v).trim() || null);

function asDate(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
  const s = String(v).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

function makeSlug(text) {
  if (!text) return '';
  let s = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 60) { const c = s.slice(0, 60); const i = c.lastIndexOf('-'); s = i > 0 ? c.slice(0, i) : c; }
  return s;
}

function deriveIpSlug(nameKo, original) {
  if (MAP.fallbackSlugs[nameKo]) return MAP.fallbackSlugs[nameKo];
  const latin = (original.match(/[A-Za-z0-9\u00C0-\u024F\s'×&.-]+/g) || []).map((x) => x.trim()).filter((x) => /[A-Za-z]/.test(x)).join(' ');
  return makeSlug(latin) || makeSlug(nameKo);
}

function mapHeaders(ws) {
  const exact = new Map(); const base = new Map();
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
    const raw = asStr(cellVal(cell)); if (!raw) return;
    exact.set(raw, col);
    const b = raw.replace(/\([^)]*\)$/, '').trim();
    if (!base.has(b)) base.set(b, col);
  });
  return (name) => exact.get(name) ?? base.get(name) ?? null;
}

const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v;
const toJson = (v) => `${JSON.stringify(sortKeys(v), null, 2)}\n`;

async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ipSheet = wb.getWorksheet('메가IP');
  const goodsSheet = wb.getWorksheet('굿즈');
  const priceSheet = wb.getWorksheet('시세');
  if (!ipSheet) err('메가IP', 1, '-', '시트 없음');
  if (!goodsSheet) err('굿즈', 1, '-', '시트 없음');
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

  const nextLock = fs.existsSync(LOCK_PATH) ? { ...JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8')) } : {};
  const ipCol = mapHeaders(ipSheet);
  const rawIps = [];
  for (let r = 2; r <= ipSheet.rowCount; r++) {
    const row = ipSheet.getRow(r);
    const nameKo = asStr(cellVal(row.getCell(1)));
    if (!nameKo) continue;
    const get = (h) => { const c = ipCol(h); return c ? cellVal(row.getCell(c)) : null; };
    if (asStr(get('상태')) === '제외') continue;
    const original = asStr(get('원어명')); const owner = asStr(get('권리사'));
    const cat = MAP.cat[asStr(get('분류'))]; const priority = Number(get('우선순위'));
    const slug = ipCol('IP슬러그') !== null ? asStr(get('IP슬러그')) : deriveIpSlug(nameKo, original ?? '');
    if (!original) err('메가IP', r, '원어명', '필수 누락');
    if (!owner) err('메가IP', r, '권리사', '필수 누락');
    if (!cat) err('메가IP', r, '분류', '허용되지 않은 값');
    if (![1, 2, 3].includes(priority)) err('메가IP', r, '우선순위', '1~3 필요');
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) err('메가IP', r, 'IP슬러그', '형식 오류');
    rawIps.push({
      row: r, slug: slug ?? '',
      name: { ko: nameKo, en: asStr(get('IP명(EN)')) ?? original ?? nameKo, ja: asStr(get('IP명(JA)')) ?? original ?? nameKo },
      original: original ?? '', owner: owner ?? '', category: cat ?? 'other',
      priority, officialUrl: asStr(get('공식몰URL')), order: 0, goodsCount: 0,
    });
  }
  rawIps.sort((a, b) => a.priority - b.priority || a.row - b.row);
  const ips = rawIps.map((item, i) => { const ip = { ...item, order: i }; delete ip.row; return ip; });
  const ipByName = new Map(ips.map((ip) => [ip.name.ko, ip]));

  const gCol = mapHeaders(goodsSheet);
  const goods = []; const seenIds = new Set();
  for (let r = 2; r <= goodsSheet.rowCount; r++) {
    const row = goodsSheet.getRow(r);
    const id = asStr(cellVal(row.getCell(1)));
    if (!id) continue;
    const get = (h) => { const c = gCol(h); return c ? cellVal(row.getCell(c)) : null; };
    if (!/^[A-Z]{3}-\d{4}$/.test(id)) err('굿즈', r, '굿즈ID', '형식 오류');
    if (seenIds.has(id)) err('굿즈', r, '굿즈ID', '중복');
    seenIds.add(id);
    const ip = ipByName.get(asStr(get('IP명')));
    if (!ip) err('굿즈', r, 'IP명', '메가IP 시트에 없음');
    const original = asStr(get('상품명(원어)')); const nameKr = asStr(get('상품명(KR)'));
    const nameEn = asStr(get('상품명(EN)')) ?? ''; const nameJa = asStr(get('상품명(JA)')) ?? original ?? '';
    const type = MAP.type[asStr(get('품목유형'))]; const limit = MAP.limit[asStr(get('한정구분'))];
    const price = Number(get('정가')); const currency = asStr(get('통화'));
    const seller = asStr(get('판매처')); const sellerType = MAP.seller[asStr(get('판매처유형'))];
    const status = MAP.status[asStr(get('판매상태'))]; const officialUrl = asStr(get('상품URL'));
    const verifiedAt = asDate(get('검증일')); const firstCollectedAt = asDate(get('최초수집일'));
    if (!original) err('굿즈', r, '상품명(원어)', '필수 누락');
    if (!nameKr) err('굿즈', r, '상품명(KR)', '필수 누락');
    if (!type || !limit || !sellerType || !status) err('굿즈', r, 'enum', '허용되지 않은 값');
    if (!(price > 0) || !MAP.currencies.has(currency)) err('굿즈', r, '정가/통화', '값 오류');
    if (!seller || !officialUrl) err('굿즈', r, '판매처/URL', '필수 누락');
    if (!verifiedAt || !firstCollectedAt) err('굿즈', r, '날짜', '날짜 형식 오류');

    const rawCode = get('품번/JAN');
    const code = typeof rawCode === 'number' ? (console.warn('[data] numeric code', id), BigInt(Math.round(rawCode)).toString()) : asStr(rawCode);
    const codeType = code === null ? null : /^\d{13}$/.test(code) ? 'jan13' : /^\d{8}$/.test(code) ? 'jan8' : 'other';
    const slug = nextLock[id] ?? makeSlug(nameEn);
    if (slug && !(id in nextLock)) nextLock[id] = slug;
    if (ip) ip.goodsCount += 1;
    goods.push({
      id, ipSlug: ip?.slug ?? '', slug, name: { ko: nameKr ?? '', en: nameEn, ja: nameJa },
      original: original ?? '', code, codeType, maker: asStr(get('제조사')),
      type: type ?? 'other', limit: limit ?? 'regular', releaseDate: asDate(get('예약·발매일')),
      retail: { price, currency: currency ?? 'JPY' }, seller: seller ?? '',
      sellerType: sellerType ?? 'official_online', status: status ?? 'onsale',
      officialUrl: officialUrl ?? '', verifiedAt: verifiedAt ?? '', firstCollectedAt: firstCollectedAt ?? '',
      note: { ko: asStr(get('비고')), en: asStr(get('비고(EN)')), ja: asStr(get('비고(JA)')) },
      review: { en: asStr(get('EN검수')) === 'Y', ja: asStr(get('JA검수')) === 'Y' },
    });
  }
  goods.sort((a, b) => a.id.localeCompare(b.id));

  const prices = [];
  if (priceSheet) {
    const pCol = mapHeaders(priceSheet); const seenKeys = new Set();
    for (let r = 2; r <= priceSheet.rowCount; r++) {
      const row = priceSheet.getRow(r);
      const goodsId = asStr(cellVal(row.getCell(1)));
      if (!goodsId) continue;
      const get = (h) => { const c = pCol(h); return c ? cellVal(row.getCell(c)) : null; };
      const date = asDate(get('일자')); const market = asStr(get('마켓'))?.toLowerCase();
      const median = Number(get('중앙값')); const currency = asStr(get('통화')); const samples = Number(get('표본수'));
      if (!seenIds.has(goodsId)) err('시세', r, '굿즈ID', '굿즈 시트에 없음');
      if (!date || !MAP.markets.has(market) || !(median > 0) || !MAP.currencies.has(currency) || !Number.isInteger(samples) || samples < 1) {
        err('시세', r, '행', '필드 값 오류');
      }
      const key = `${goodsId}|${date}|${market}`;
      if (seenKeys.has(key)) err('시세', r, '굿즈ID', '중복 키');
      seenKeys.add(key);
      prices.push({ goodsId, date: date ?? '', market: market ?? 'other', median, currency: currency ?? 'JPY', samples, sourceUrl: asStr(get('확인URL')) });
    }
  }
  prices.sort((a, b) => a.goodsId.localeCompare(b.goodsId) || a.date.localeCompare(b.date) || a.market.localeCompare(b.market));
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

  const dates = [...goods.map((g) => g.verifiedAt), ...prices.map((p) => p.date)].filter(Boolean).sort();
  const meta = { generatedAt: dates.at(-1) ?? '2026-01-01', counts: { ips: ips.length, goods: goods.length, prices: prices.length } };
  const outputs = [
    [path.join(GEN_DIR, 'ips.json'), toJson(ips)],
    [path.join(GEN_DIR, 'goods.json'), toJson(goods)],
    [path.join(GEN_DIR, 'prices.json'), toJson(prices)],
    [path.join(GEN_DIR, 'meta.json'), toJson(meta)],
    [PUB_PATH, toJson({ meta, ips, goods, prices })],
    [LOCK_PATH, toJson(nextLock)],
  ];
  if (CHECK) {
    const stale = outputs.filter(([f, c]) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null) !== c);
    stale.forEach(([f]) => console.error(`[data:check] stale: ${path.relative(ROOT, f)}`));
    if (stale.length) process.exit(1);
    return;
  }
  outputs.forEach(([f, c]) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c, 'utf8'); });
}

run().catch((e) => { console.error(e); process.exit(1); });
