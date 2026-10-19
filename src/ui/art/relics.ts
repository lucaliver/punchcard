import { sprite } from './riso';

/**
 * Stationery sprites on the same 200×200 grid as the creatures, keyed by relic id. Small cute things, most with a face;
 * the renderer turns them into riso pixels like any creature (see riso.ts).
 */
export const OUT = 'stroke="#120e18" stroke-width="3" stroke-linejoin="round"';
export const INK = '#1b1830';
export const PAPER = '#f6f0e4';

/** Two dot eyes with a glint, pink cheeks and a small smile, centred on (cx, cy). */
export const face = (cx: number, cy: number, gap = 20, r = 5.5): string =>
  `<circle cx="${cx - gap}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx + gap}" cy="${cy}" r="${r}" fill="${INK}"/>` +
  `<circle cx="${cx - gap - r * 0.3}" cy="${cy - r * 0.35}" r="${r * 0.35}" fill="#fff"/><circle cx="${cx + gap - r * 0.3}" cy="${cy - r * 0.35}" r="${r * 0.35}" fill="#fff"/>` +
  `<ellipse cx="${cx - gap - 8}" cy="${cy + 9}" rx="7" ry="4.5" fill="#ff3d9a" opacity=".55"/><ellipse cx="${cx + gap + 8}" cy="${cy + 9}" rx="7" ry="4.5" fill="#ff3d9a" opacity=".55"/>` +
  `<path d="M${cx - 6} ${cy + 8}q6 7 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const star = (cx: number, cy: number, big: number, small: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 ? small : big;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');

const stressBall = `
<path d="M100 32c42 0 72 30 72 68s-30 72-72 72-72-34-72-72 30-68 72-68z" fill="#ffd900" ${OUT}/>
<path d="M50 70c-6 18-6 36 2 54M150 70c6 18 6 36-2 54" stroke="#e89400" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M62 56c8-12 20-18 34-20" stroke="#fff2a0" stroke-width="9" fill="none" stroke-linecap="round"/>
${face(100, 100)}`;

const thermos = `
<path d="M72 26h56a6 6 0 0 1 6 6v26H66V32a6 6 0 0 1 6-6z" fill="#ff3d9a" ${OUT}/>
<path d="M60 60h80v106c0 8-6 14-14 14H74c-8 0-14-6-14-14z" fill="#1c5fd0" ${OUT}/>
<path d="M60 72h80M60 164h80" stroke="${PAPER}" stroke-width="7"/>
<path d="M68 88v68" stroke="#6a98ea" stroke-width="6" stroke-linecap="round"/>
<rect x="76" y="88" width="56" height="56" rx="6" fill="${PAPER}" ${OUT}/>
${face(104, 112, 14, 5)}`;

const ergoChair = `
<path d="M64 28h72c10 0 16 8 14 18l-6 52H56l-6-52c-2-10 4-18 14-18z" fill="#ffd900" ${OUT}/>
<path d="M66 40h8" stroke="#fff2a0" stroke-width="7" stroke-linecap="round"/>
<path d="M30 104c0-8 6-12 14-12h112c8 0 14 4 14 12v14c0 6-4 10-10 10H40c-6 0-10-4-10-10z" fill="#ff3d9a" ${OUT}/>
<rect x="92" y="128" width="16" height="30" fill="#3a3450" ${OUT}/>
<path d="M100 156L36 176M100 156l64 20" stroke="#120e18" stroke-width="14" stroke-linecap="round"/><path d="M100 156L36 176M100 156l64 20" stroke="#3a3450" stroke-width="8" stroke-linecap="round"/>
<circle cx="34" cy="182" r="9" fill="${PAPER}" ${OUT}/><circle cx="166" cy="182" r="9" fill="${PAPER}" ${OUT}/><circle cx="100" cy="184" r="9" fill="${PAPER}" ${OUT}/>
${face(100, 64, 18, 5)}`;

const coffeeMug = `
<path d="M62 20c-8 8 8 14 0 24M92 16c-8 8 8 14 0 28" stroke="#9ab8f0" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M136 86h12c18 0 24 12 24 26s-6 26-24 26h-12" stroke="#120e18" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M136 86h12c18 0 24 12 24 26s-6 26-24 26h-12" stroke="${PAPER}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 64h104v86c0 16-12 28-28 28H64c-16 0-28-12-28-28z" fill="${PAPER}" ${OUT}/>
<ellipse cx="88" cy="64" rx="52" ry="12" fill="#6a3a1a" ${OUT}/>
<path d="M37 140h102" stroke="#ff3d9a" stroke-width="9"/>
${face(88, 106, 22, 6)}`;

const wallClock = `
<circle cx="100" cy="100" r="76" fill="#1c5fd0" ${OUT}/>
<circle cx="100" cy="100" r="62" fill="${PAPER}" ${OUT}/>
<path d="M100 44v10M100 146v10M44 100h10M146 100h10" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<path d="M100 100L80 74" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M100 100l26-28" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<circle cx="100" cy="100" r="7" fill="#ff3d9a" ${OUT}/>
${face(100, 124, 20, 5)}`;

const unionArmband = `
<path d="M48 36c34 12 70 12 104 0l10 126c-38 14-84 14-124 0z" fill="#ff3d9a" ${OUT}/>
<path d="M54 52c32 10 60 10 92 0M56 148c34 10 54 10 88 0" stroke="${PAPER}" stroke-width="3" stroke-dasharray="7 6" fill="none"/>
<circle cx="100" cy="100" r="44" fill="${PAPER}" ${OUT}/>
<polygon points="${star(100, 101, 38, 17)}" fill="${INK}" ${OUT}/>
<circle cx="91" cy="102" r="3.5" fill="${PAPER}"/><circle cx="109" cy="102" r="3.5" fill="${PAPER}"/>
<path d="M95 110q5 5 10 0" stroke="${PAPER}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

const inboxZero = `
<g transform="rotate(-9 74 90)"><rect x="40" y="26" width="76" height="92" fill="${PAPER}" ${OUT}/><path d="M50 44h56M50 58h56M50 72h40" stroke="#1c5fd0" stroke-width="5"/></g>
<g transform="rotate(7 130 90)"><rect x="92" y="34" width="72" height="88" fill="${PAPER}" ${OUT}/><path d="M102 52h52M102 66h52" stroke="#1c5fd0" stroke-width="5"/><rect x="118" y="82" width="34" height="30" fill="#ff3d9a" ${OUT}/></g>
<path d="M44 108h112l26 28H18z" fill="#e89400" ${OUT}/>
<path d="M18 134h164v38c0 6-4 10-10 10H28c-6 0-10-4-10-10z" fill="#ffd900" ${OUT}/>
<path d="M30 140h140" stroke="#fff2a0" stroke-width="5" stroke-linecap="round"/>
${face(100, 158, 26, 5.5)}`;

const heavyStapler = `
<path d="M16 148h168v26c0 4-3 6-6 6H22c-3 0-6-2-6-6z" fill="#1c5fd0" ${OUT}/>
<path d="M30 140h44l-3 8H33z" fill="#c8d0e0" ${OUT}/><path d="M30 158h120" stroke="#6a98ea" stroke-width="6" stroke-linecap="round"/>
<g transform="rotate(-9 172 128)">
<path d="M14 100c0-18 18-32 44-32h116c8 0 14 6 14 14v50c0 6-4 10-10 10H24c-6 0-10-4-10-10z" fill="#ff3d9a" ${OUT}/>
<path d="M50 80h100" stroke="#ff9ac8" stroke-width="7" stroke-linecap="round"/>
<path d="M14 118h50l6 10H14z" fill="#3a3450" ${OUT}/>
<circle cx="172" cy="104" r="8" fill="#ffd900" ${OUT}/>
${face(98, 100, 22, 6)}</g>`;

const spareBadge = `
<path d="M56 0h24l26 60H84z" fill="#ffd900" ${OUT}/><path d="M144 0h-24l-26 60h22z" fill="#ffd900" ${OUT}/>
<rect x="90" y="52" width="20" height="18" rx="2" fill="#3a3450" ${OUT}/>
<rect x="46" y="64" width="108" height="128" rx="12" fill="${PAPER}" ${OUT}/>
<rect x="84" y="74" width="32" height="7" rx="3.5" fill="${INK}"/>
<rect x="50" y="90" width="100" height="18" fill="#1c5fd0"/>
<rect x="66" y="116" width="68" height="46" fill="#ffd900" ${OUT}/>
${face(100, 134, 14, 4)}
<path d="M64 174h72M72 184h56" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;

const emergencyExit = `
<rect x="46" y="0" width="9" height="46" fill="#3a3450" ${OUT}/><rect x="145" y="0" width="9" height="46" fill="#3a3450" ${OUT}/>
<rect x="18" y="40" width="164" height="100" rx="8" fill="#2e8a4a" ${OUT}/>
<rect x="27" y="49" width="146" height="82" rx="4" fill="none" stroke="${PAPER}" stroke-width="3"/>
<path d="M38 90h32V76l24 20-24 20v-14H38z" fill="${PAPER}" ${OUT}/>
<rect x="108" y="58" width="52" height="66" fill="${PAPER}" ${OUT}/>
<circle cx="140" cy="76" r="7" fill="#2e8a4a"/>
<path d="M138 84l-6 16M132 100l-9 12M132 100l12 6 3 10M138 88l-14-3M138 88l12 8" stroke="#2e8a4a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="M30 140h140v14H30z" fill="#3a3450" ${OUT}/>`;

const cargoPants = `
<path d="M50 16h100l20 166h-52l-18-82-18 82H30z" fill="#7c8a2e" ${OUT}/>
<path d="M50 16h100v22H50z" fill="#5e6a22" ${OUT}/>
<path d="M62 12v30M138 12v30" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M100 38v50" stroke="#3e4818" stroke-width="4"/><circle cx="100" cy="30" r="6" fill="#ffd900" ${OUT}/>
<path d="M38 96h46v52H38z" fill="#6a7626" ${OUT}/><path d="M38 96h46v16H38z" fill="#5e6a22" ${OUT}/><circle cx="61" cy="112" r="4.5" fill="#ffd900" ${OUT}/>
<path d="M116 96h46v52h-46z" fill="#6a7626" ${OUT}/><path d="M116 96h46v16h-46z" fill="#5e6a22" ${OUT}/><circle cx="139" cy="112" r="4.5" fill="#ffd900" ${OUT}/>
<path d="M44 168h34M122 168h34" stroke="#ff3d9a" stroke-width="5" stroke-linecap="round"/>`;

const paperClip = `
<path d="M128 150V62c0-22-12-34-32-34S64 40 64 62v84c0 14 10 24 24 24s24-10 24-24V76c0-8-6-14-12-14s-12 6-12 14v62" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M128 150V62c0-22-12-34-32-34S64 40 64 62v84c0 14 10 24 24 24s24-10 24-24V76c0-8-6-14-12-14s-12 6-12 14v62" fill="none" stroke="#9aa3b5" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M72 60c2-12 10-20 22-22" stroke="#e8ecf4" stroke-width="5" fill="none" stroke-linecap="round"/>`;

const stickyNotes = `
<path d="M42 40h118v132H42z" fill="#e0a800" ${OUT} transform="rotate(6 100 106)"/>
<path d="M36 34h118v132H36z" fill="#ffe45a" ${OUT} transform="rotate(-5 100 100)"/>
<path d="M30 30h124v132H30z" fill="#ffd900" ${OUT}/>
<path d="M30 30h124v20H30z" fill="#fff2a0" ${OUT}/>
<path d="M30 148c40 10 84 10 124-4v18H30z" fill="#e0a800"/>
<path d="M46 126h86M46 138h56" stroke="#1c5fd0" stroke-width="4" stroke-linecap="round"/>
${face(92, 88)}`;

const rubberDuck = `
<path d="M30 126c0-26 22-40 52-40 10 0 20 2 28 6 12 6 22 6 40 12-4 30-26 48-62 48-34 0-58-8-58-26z" fill="#ffd900" ${OUT}/>
<circle cx="124" cy="68" r="38" fill="#ffd900" ${OUT}/>
<path d="M156 62h28c6 0 8 6 4 10l-14 12h-18z" fill="#ff8a00" ${OUT}/>
<path d="M60 128c10 14 40 18 52 4-12-2-26-4-52-4z" fill="#e0a800" ${OUT}/>
<circle cx="136" cy="56" r="6" fill="${INK}"/><circle cx="134" cy="54" r="2" fill="#fff"/>
<ellipse cx="146" cy="76" rx="8" ry="5" fill="#ff3d9a" opacity=".55"/>
<path d="M98 42c8-8 20-12 32-10" stroke="#fff2a0" stroke-width="8" fill="none" stroke-linecap="round"/>`;

const paperShredder = `
<rect x="28" y="52" width="144" height="60" rx="8" fill="#3a3450" ${OUT}/>
<rect x="44" y="66" width="112" height="9" rx="3" fill="#120e18"/>
<path d="M70 66l4-34h38l-4 34z" fill="${PAPER}" ${OUT}/><path d="M80 44h22M80 54h26" stroke="#1c5fd0" stroke-width="3"/>
<path d="M40 112h120l-10 70H50z" fill="#1c5fd0" ${OUT}/>
<path d="M60 112v36M76 112v44M92 112v32M108 112v42M124 112v34M140 112v40" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>
${face(100, 92, 24, 5)}`;

const quillPen = `
<path d="M150 14c-34 6-70 34-92 84l22 22c28-18 56-52 70-106z" fill="#ff3d9a" ${OUT}/>
<path d="M150 14c-8 36-24 66-44 90" stroke="#ffd0e6" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M62 96l-10 22 28 2z" fill="${INK}"/>
<path d="M58 98C50 120 40 140 34 156" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M62 150h92c8 0 12 6 12 12v10c0 8-6 12-14 12H64c-8 0-14-4-14-12v-10c0-6 4-12 12-12z" fill="#1c5fd0" ${OUT}/>
<path d="M72 150h72v-12H72z" fill="${INK}" ${OUT}/>
<path d="M50 168h116" stroke="#6a98ea" stroke-width="5" stroke-linecap="round" opacity=".7"/>
${face(108, 168, 18, 5)}`;

const deskPlant = `
<path d="M100 120C96 90 70 70 40 76c0 28 26 46 60 44z" fill="#2e8a4a" ${OUT}/>
<path d="M100 120c4-40 30-70 66-68-2 40-30 70-66 68z" fill="#3cb05c" ${OUT}/>
<path d="M100 120c-2-30 4-58 22-80-24 6-34 44-22 80z" fill="#2e8a4a" ${OUT}/>
<path d="M54 84c14 6 28 18 38 32M146 62c-12 14-30 34-42 54" stroke="#9be0a8" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M58 118h84l-10 62H68z" fill="#1c5fd0" ${OUT}/>
<path d="M52 112h96v14H52z" fill="#6a98ea" ${OUT}/>
${face(100, 150, 20, 5)}`;

const highlighter = `
<g transform="rotate(-38 100 100)">
<rect x="70" y="20" width="60" height="30" rx="6" fill="#120e18"/>
<path d="M64 46h72v102H64z" fill="#ffd900" ${OUT}/>
<path d="M64 148h72l-14 28H78z" fill="#fff2a0" ${OUT}/>
<path d="M92 176h16v14H92z" fill="#e0a800" ${OUT}/>
<path d="M76 56v82" stroke="#fff2a0" stroke-width="6" stroke-linecap="round"/>
${face(100, 94, 14, 4.5)}
</g>
<path d="M26 184c30-8 60-8 90 0" stroke="#ffd900" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>`;

const holePunch = `
<path d="M26 138h148v32c0 8-6 14-14 14H40c-8 0-14-6-14-14z" fill="#3a3450" ${OUT}/>
<path d="M36 70c0-14 12-22 28-22h72c20 0 32 14 32 34v56H36z" fill="#d6283a" ${OUT}/>
<path d="M44 62c4-6 10-8 20-8h60" stroke="#ff8a9a" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M120 52l36-26 12 14-34 28z" fill="#9aa3b5" ${OUT}/>
<circle cx="52" cy="176" r="7" fill="${PAPER}" ${OUT}/><circle cx="76" cy="180" r="7" fill="${PAPER}" ${OUT}/>
${face(100, 108, 22, 5.5)}`;

const rubberStamp = `
<rect x="78" y="14" width="44" height="40" rx="10" fill="#a8683a" ${OUT}/>
<path d="M90 22c4-4 10-6 18-4" stroke="#d8a070" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M88 54h24v36H88z" fill="#8a5028" ${OUT}/>
<path d="M44 90h112c10 0 14 6 14 14v22H30v-22c0-8 4-14 14-14z" fill="#3a3450" ${OUT}/>
<path d="M30 126h140v22H30z" fill="#d6283a" ${OUT}/>
<path d="M30 152h140v8H30z" fill="${INK}"/>
${face(100, 108, 22, 5)}
<path d="M40 186h120" stroke="#d6283a" stroke-width="8" stroke-linecap="round" stroke-dasharray="22 8"/>`;

const nameTag = `
<g transform="rotate(-6 100 100)">
<rect x="26" y="34" width="148" height="132" rx="10" fill="${PAPER}" ${OUT}/>
<path d="M26 44c0-6 4-10 10-10h128c6 0 10 4 10 10v38H26z" fill="#d6283a" ${OUT}/>
<path d="M52 56h96M72 70h56" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>
<path d="M44 128h112" stroke="#1c5fd0" stroke-width="6" stroke-linecap="round"/>
${face(100, 108, 24, 5)}
<circle cx="100" cy="148" r="5" fill="none"/>
</g>`;

const fireDrillBell = `
<path d="M100 28c-36 0-52 28-52 62v32l-16 26h136l-16-26V90c0-34-16-62-52-62z" fill="#d6283a" ${OUT}/>
<path d="M66 70c6-18 18-28 34-30" stroke="#ff8a9a" stroke-width="8" fill="none" stroke-linecap="round"/>
<rect x="88" y="10" width="24" height="22" rx="5" fill="#3a3450" ${OUT}/>
<circle cx="100" cy="168" r="14" fill="#ffd900" ${OUT}/>
<path d="M26 60c-8 14-8 28 0 42M174 60c8 14 8 28 0 42" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
${face(100, 100, 22, 5.5)}`;

const outOfOffice = `
<path d="M34 8h132v184H34z" fill="#ff3d9a" ${OUT}/>
<circle cx="100" cy="40" r="20" fill="#f6f0e4" ${OUT}/>
<path d="M34 8h132v18H34z" fill="#c42a78" ${OUT}/>
<rect x="52" y="76" width="96" height="76" rx="6" fill="${PAPER}" ${OUT}/>
<path d="M66 176h68" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>
<path d="M70 100h60M70 112h42" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
${face(100, 134, 18, 4.5)}`;

const rolodex = `
<path d="M24 150h152l8 30H16z" fill="#3a3450" ${OUT}/>
<path d="M34 150c-4-52 24-96 66-96s70 44 66 96z" fill="#1c5fd0" ${OUT}/>
<path d="M54 140c-2-34 14-60 46-60s48 26 46 60z" fill="#ffd900" ${OUT}/>
<path d="M62 100l-4-12M80 88l-2-14M100 84V70M120 88l2-14M138 100l4-12" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M44 128c-2-24 4-40 14-52" stroke="#6a98ea" stroke-width="7" fill="none" stroke-linecap="round"/>
<rect x="68" y="102" width="64" height="48" rx="5" fill="${PAPER}" ${OUT}/>
<path d="M76 142h48" stroke="#ff3d9a" stroke-width="5" stroke-linecap="round"/>
${face(100, 122, 14, 4.5)}
<circle cx="100" cy="40" r="12" fill="#ff3d9a" ${OUT}/><path d="M96 36h8" stroke="#ffd0e6" stroke-width="4" stroke-linecap="round"/>`;

const correctionFluid = `
<path d="M92 16h16v36H92z" fill="#3a3450" ${OUT}/>
<path d="M98 4h4v14h-4z" fill="${INK}" ${OUT}/>
<path d="M62 52h76c8 0 14 6 14 14v102c0 8-6 14-14 14H62c-8 0-14-6-14-14V66c0-8 6-14 14-14z" fill="${PAPER}" ${OUT}/>
<path d="M48 84h104v52H48z" fill="#ff3d9a" ${OUT}/>
<path d="M60 64c0-6 4-8 10-8" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M126 150c4 8 4 12 0 16" stroke="#9aa3b5" stroke-width="5" fill="none" stroke-linecap="round"/>
${face(100, 110, 20, 5)}`;

const wellnessVoucher = `
<path d="M26 40h148c8 0 12 4 12 12v22a14 14 0 0 0 0 28v22c0 8-4 12-12 12H26c-8 0-12-4-12-12v-22a14 14 0 0 0 0-28V52c0-8 4-12 12-12z" fill="#7fd6a8" ${OUT}/>
<path d="M136 46v108" stroke="${INK}" stroke-width="4" stroke-dasharray="7 7"/>
<path d="M30 56h92" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
<path d="M150 82c0-10 18-10 18 0 0 8-9 12-9 20 0-8-9-12-9-20z" fill="#ff3d9a" ${OUT} transform="translate(-1 6)"/>
${face(76, 98, 18, 5)}
<path d="M44 140h66" stroke="${PAPER}" stroke-width="6" stroke-linecap="round"/>`;

const cheatSheet = `
<path d="M40 22h92l32 32v126H40z" fill="#fff59a" ${OUT}/>
<path d="M132 22v32h32" fill="#e8d86a" ${OUT}/>
<path d="M58 62h60M58 78h72M58 94h46" stroke="#b9a64a" stroke-width="5" stroke-linecap="round"/>
<path d="M58 150h84M58 166h54" stroke="#b9a64a" stroke-width="5" stroke-linecap="round"/>
<path d="M54 40l8-10 8 10" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${face(100, 126, 22, 5.5)}`;

const statuette = `
<path d="M34 164h132l8 20H26z" fill="#6c6880" ${OUT}/>
<path d="M44 140h112v26H44z" fill="#8a8798" ${OUT}/>
<path d="M62 142c-8-34-6-64 10-82 8-10 48-10 56 0 16 18 18 48 10 82z" fill="#a9a6b8" ${OUT}/>
<path d="M76 70c6-8 14-12 24-12" stroke="#d8d5e2" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M118 52l-8 20 12 10-8 22" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M60 112l-18 14M140 112l18 14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
${face(100, 100, 18, 5)}`;

const lanyard = `
<path d="M34 0h28l50 106-26 8z" fill="#ff3d9a" ${OUT}/>
<path d="M166 0h-28L88 106l26 8z" fill="#ff3d9a" ${OUT}/>
<rect x="80" y="100" width="40" height="20" rx="4" fill="#c9c4d6" ${OUT}/>
<rect x="58" y="118" width="84" height="68" rx="8" fill="${PAPER}" ${OUT}/>
<rect x="86" y="124" width="28" height="7" rx="3" fill="${INK}"/>
<rect x="58" y="168" width="84" height="18" fill="#1c5fd0" ${OUT}/>
${face(100, 150, 15, 4.5)}`;

const companyCard = `
<g transform="rotate(-8 100 100)">
<rect x="14" y="44" width="172" height="112" rx="14" fill="#2e8a4a" ${OUT}/>
<rect x="14" y="62" width="172" height="20" fill="${INK}"/>
<rect x="30" y="96" width="34" height="26" rx="4" fill="#ffd900" ${OUT}/><path d="M30 109h34M47 96v26" stroke="#e0a800" stroke-width="3"/>
<path d="M30 140h30M70 140h30M110 140h30" stroke="${PAPER}" stroke-width="6" stroke-linecap="round"/>
<circle cx="154" cy="140" r="8" fill="#ffd900" ${OUT}/>
${face(130, 106, 14, 4.5)}
</g>`;

const flexitime = `
<circle cx="44" cy="44" r="20" fill="#e89400" ${OUT}/><circle cx="156" cy="44" r="20" fill="#e89400" ${OUT}/>
<path d="M100 20v14" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
<path d="M62 168l-12 16M138 168l12 16" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<circle cx="100" cy="108" r="68" fill="#ff3d9a" ${OUT}/>
<circle cx="100" cy="108" r="54" fill="${PAPER}" ${OUT}/>
<path d="M100 62v8M100 146v8M54 108h8M138 108h8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M100 104V80" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M100 104l22 12" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M60 70c6-8 14-14 24-16" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
${face(100, 134, 18, 4.5)}`;

const justInTime = `
<path d="M6 108h24M0 130h30M8 152h22" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M40 82l18-36h84l18 36z" fill="#c68a4e" ${OUT}/>
<path d="M40 82h120v90H40z" fill="#e0a868" ${OUT}/>
<path d="M40 100h120v14H40z" fill="#ff3d9a" ${OUT}/>
<path d="M54 92h22" stroke="#fff2d0" stroke-width="5" stroke-linecap="round"/>
<circle cx="158" cy="62" r="26" fill="${PAPER}" ${OUT}/>
<path d="M158 62V46M158 62l11 7" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<circle cx="158" cy="62" r="3.5" fill="#ff3d9a"/>
${face(98, 142, 22, 5.5)}`;

const stockOptions = `
<path d="M22 34h156v116H22z" fill="${PAPER}" ${OUT}/>
<path d="M32 44h136v96H32z" fill="none" stroke="#2e8a4a" stroke-width="3"/>
<path d="M44 124l30-24 22 14 40-46" stroke="#2e8a4a" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M130 60h26v26z" fill="#2e8a4a" ${OUT}/>
${face(78, 70, 14, 4)}
<path d="M142 150l-8 30 18-9 18 9-8-30" fill="#ff3d9a" ${OUT}/>
<circle cx="152" cy="142" r="20" fill="#ffd900" ${OUT}/>
<polygon points="${star(152, 142, 13, 6)}" fill="${INK}"/>`;

const safetyNet = `
<g transform="rotate(14 100 34)"><rect x="82" y="8" width="36" height="48" rx="4" fill="${PAPER}" ${OUT}/><path d="M89 22h22M89 32h22M89 42h14" stroke="#1c5fd0" stroke-width="4" stroke-linecap="round"/></g>
<path d="M44 150l-14 32M156 150l14 32" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
<path d="M44 150l-14 32M156 150l14 32" stroke="#3a3450" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="100" cy="116" rx="82" ry="52" fill="#e9e4d6" ${OUT}/>
<path d="M18 116h164M100 64v104M34 86c40 22 92 22 132 0M34 146c40-22 92-22 132 0" stroke="#9aa3b5" stroke-width="3" fill="none"/>
<ellipse cx="100" cy="116" rx="82" ry="52" fill="none" stroke="#ff3d9a" stroke-width="10"/>
<ellipse cx="100" cy="116" rx="82" ry="52" fill="none" stroke="${INK}" stroke-width="3"/>
<path d="M52 92c10-8 22-12 36-14" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
${face(100, 118, 22, 5.5)}`;

const lockerKey = `
<path d="M62 92c0 10 4 16 10 18" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M84 82L170 168M140 138l18-16M156 154l18-16" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
<path d="M84 82L170 168M140 138l18-16M156 154l18-16" stroke="#ffd900" stroke-width="16" stroke-linecap="round"/>
<circle cx="64" cy="62" r="34" fill="#ffd900" ${OUT}/><circle cx="64" cy="62" r="13" fill="#120e18"/>
<path d="M42 42c6-8 14-12 24-13" stroke="#fff2a0" stroke-width="7" fill="none" stroke-linecap="round"/>
<rect x="18" y="108" width="84" height="66" rx="8" fill="${PAPER}" ${OUT}/>
<path d="M18 116a8 8 0 0 1 8-8h68a8 8 0 0 1 8 8v12H18z" fill="#1c5fd0" ${OUT}/>
<circle cx="60" cy="118" r="4" fill="${PAPER}"/>
${face(60, 150, 17, 4.5)}`;

const bulletproofCardigan = `
<path d="M64 30L100 46 136 30l50 28-12 96-34 8-4-48v88H64v-88l-4 48-34-8L14 58z" fill="#ffd900" ${OUT}/>
<path d="M74 34l26 52 26-52-26 12z" fill="${PAPER}" ${OUT}/>
<path d="M100 86v94" stroke="#e89400" stroke-width="4"/>
<circle cx="100" cy="152" r="6" fill="#ff3d9a" ${OUT}/><circle cx="100" cy="172" r="6" fill="#ff3d9a" ${OUT}/>
<ellipse cx="34" cy="116" rx="11" ry="15" fill="#1c5fd0" ${OUT}/><ellipse cx="166" cy="116" rx="11" ry="15" fill="#1c5fd0" ${OUT}/>
<path d="M62 70c4-8 10-14 18-16" stroke="#fff2a0" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="132" cy="150" r="7" fill="#9aa3b5" ${OUT}/><path d="M129 147l6 6M135 147l-6 6" stroke="${INK}" stroke-width="2.5"/>
${face(100, 120, 22, 5)}`;

const revengeSpreadsheet = `
<rect x="22" y="28" width="156" height="148" rx="6" fill="${PAPER}" ${OUT}/>
<path d="M22 34a6 6 0 0 1 6-6h144a6 6 0 0 1 6 6v32H22z" fill="#ffd900" ${OUT}/>
<path d="M22 100h156M22 134h156M74 66v110M126 66v110" stroke="#9ab8f0" stroke-width="3"/>
<rect x="76" y="102" width="48" height="30" fill="#ff3d9a"/><rect x="128" y="136" width="48" height="38" fill="#ff3d9a"/><rect x="24" y="68" width="48" height="30" fill="#ff3d9a"/>
<path d="M72 40l16 7M128 40l-16 7" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
${face(100, 52, 20, 4.5)}`;

const assortedBiscuitTin = `
<circle cx="64" cy="28" r="17" fill="#d9a066" ${OUT}/><circle cx="58" cy="24" r="3" fill="#5a3418"/><circle cx="70" cy="32" r="3" fill="#5a3418"/>
<rect x="92" y="10" width="34" height="30" rx="5" fill="#e8b878" ${OUT}/><circle cx="104" cy="22" r="3" fill="#5a3418"/><circle cx="116" cy="30" r="3" fill="#5a3418"/>
<circle cx="146" cy="30" r="15" fill="#c68a4e" ${OUT}/><circle cx="141" cy="27" r="3" fill="#5a3418"/><circle cx="151" cy="34" r="3" fill="#5a3418"/>
<path d="M26 74c0-14 22-24 74-24s74 10 74 24v10H26z" fill="#ff3d9a" ${OUT}/>
<path d="M30 84h140l-8 90c0 8-6 12-14 12H52c-8 0-14-4-14-12z" fill="#1c5fd0" ${OUT}/>
<path d="M36 128h128" stroke="${PAPER}" stroke-width="5" stroke-dasharray="9 7"/>
<path d="M44 66c14-6 30-9 46-9" stroke="#ff9ac8" stroke-width="6" fill="none" stroke-linecap="round"/>
${face(100, 154, 26, 6)}`;

const goldWatch = `
<circle cx="100" cy="22" r="15" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="100" cy="22" r="15" fill="none" stroke="#e89400" stroke-width="5"/>
<rect x="86" y="36" width="28" height="20" rx="3" fill="#e89400" ${OUT}/>
<circle cx="100" cy="122" r="70" fill="#ffd900" ${OUT}/>
<circle cx="100" cy="122" r="55" fill="${PAPER}" ${OUT}/>
<path d="M100 76v9M100 159v9M54 122h9M137 122h9" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M100 120V92" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M100 120l21 11" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<circle cx="100" cy="120" r="5" fill="#ff3d9a" ${OUT}/>
<path d="M48 84c6-14 18-24 34-28" stroke="#fff2a0" stroke-width="8" fill="none" stroke-linecap="round"/>
${face(100, 146, 18, 4.5)}`;

const floorPlan = `
<rect x="26" y="26" width="148" height="26" rx="13" fill="#e8e0cc" ${OUT}/>
<path d="M36 48h128v112H36z" fill="#1c5fd0" ${OUT}/>
<path d="M48 62h36v28H48zM84 62h40v14H84zM124 62h28v28h-28zM84 76h40v14H84z" stroke="${PAPER}" stroke-width="4" fill="none"/>
<path d="M62 90v6M104 76v-4" stroke="#1c5fd0" stroke-width="5"/>
<rect x="48" y="106" width="104" height="44" rx="4" fill="${PAPER}" ${OUT}/>
<rect x="26" y="150" width="148" height="26" rx="13" fill="#e8e0cc" ${OUT}/>
<path d="M60 160h8M132 160h8" stroke="#b9b09a" stroke-width="3" stroke-linecap="round"/>
${face(100, 128, 22, 5)}`;

/** The weekend's stationery. A garden gnome: a pointed red hat, a white beard down to his belt, a fishing rod he has never used. */
const gardenGnome = `
<path d="M100 14l-44 74h88z" fill="#ff3b3b" ${OUT}/><path d="M100 14l-14 26" stroke="#ff8a8a" stroke-width="6" stroke-linecap="round"/>
<circle cx="100" cy="16" r="9" fill="${PAPER}" ${OUT}/>
<rect x="50" y="82" width="100" height="14" rx="7" fill="#1c5fd0" ${OUT}/>
<circle cx="100" cy="112" r="34" fill="#ffc8a0" ${OUT}/>
<path d="M60 112c0 40 16 64 40 64s40-24 40-64c-14 14-26 18-40 18s-26-4-40-18z" fill="${PAPER}" ${OUT}/>
<path d="M76 70v-8M124 70v-8" stroke="${INK}" stroke-width="0"/>
<ellipse cx="100" cy="106" rx="9" ry="7" fill="#ff8a8a" ${OUT}/>
${face(100, 92, 18, 5)}
<path d="M52 168h96v16H52z" fill="#2a8a58" ${OUT}/><path d="M156 100v80" stroke="#8a5a2a" stroke-width="6" stroke-linecap="round"/>
<path d="M156 100c14 0 18 12 12 20" stroke="${INK}" stroke-width="2.5" fill="none"/>`;

/** The Reserved Sunbed: a towel laid over a lounger with a book on it, a sunhat, a pair of sunglasses, and a face on the towel that dares you. */
const reservedSunbed = `
<circle cx="150" cy="40" r="22" fill="#ffd900" ${OUT}/><path d="M150 4v10M150 76v10M114 40h10M176 40h10M124 14l7 7M170 60l7 7M176 14l-7 7M124 66l7-7" stroke="#ffd900" stroke-width="5" stroke-linecap="round"/>
<path d="M30 140l90-60 26 22-84 52z" fill="#8ad0f8" ${OUT}/>
<path d="M36 124l86-52 28 24-86 48z" fill="#ff3d9a" ${OUT}/>
<path d="M50 118l18-10M72 104l18-10M94 90l18-10M116 76l18-10" stroke="${PAPER}" stroke-width="6" stroke-linecap="round" opacity=".8"/>
<path d="M44 158l-12 22M120 130l16 50M92 152l-6 28" stroke="#120e18" stroke-width="8" stroke-linecap="round"/><path d="M44 158l-12 22M120 130l16 50M92 152l-6 28" stroke="#c8c0d8" stroke-width="4" stroke-linecap="round"/>
<rect x="70" y="86" width="26" height="18" rx="2" fill="${PAPER}" ${OUT}/><path d="M76 92h14M76 97h10" stroke="#1c5fd0" stroke-width="3"/>
<g ${OUT}><ellipse cx="124" cy="96" rx="14" ry="6" fill="#ffe08a"/><path d="M112 94c4-10 20-10 24 0z" fill="#ffe08a"/></g>
${face(94, 130, 14, 4)}`;

/** The Lottery Ticket: a scratch card with a clover under the silver, a coin to scratch it with and a very hopeful face. */
const lotteryTicket = `
<rect x="26" y="40" width="148" height="116" rx="8" fill="#ffd900" ${OUT} transform="rotate(-6 100 100)"/>
<g transform="rotate(-6 100 100)">
<rect x="38" y="50" width="124" height="22" rx="3" fill="#ff3d9a" ${OUT}/><path d="M48 61h60" stroke="${PAPER}" stroke-width="5" stroke-linecap="round"/>
<rect x="38" y="80" width="124" height="56" rx="4" fill="#c8c0d8" ${OUT}/>
<path d="M44 86l12 10M64 86l12 10M84 86l12 10M104 86l12 10M124 86l12 10M44 106l12 10M64 106l12 10M84 106l12 10M104 106l12 10M124 106l12 10" stroke="#9a94b8" stroke-width="3"/>
<path d="M78 128c-12 0-14-14-4-16 0-10 14-10 14 0 10 2 8 16-4 16 0 4-2 8-4 10 0-2-2-6-2-10z" fill="#2a8a58" ${OUT}/>
<circle cx="146" cy="116" r="12" fill="${PAPER}" ${OUT}/><path d="M142 116h8" stroke="${INK}" stroke-width="3"/>
</g>
${face(100, 150, 22, 5)}`;

/** The Doggy Bag: a paper takeaway bag, folded over at the top and stained, a bone sticking out of it and a dog's hopeful face drawn on in marker. */
const doggyBag = `
<path d="M58 66h84l12 108c1 6-3 10-9 10H55c-6 0-10-4-9-10z" fill="#d8a868" ${OUT}/>
<path d="M58 66l-4-18h92l-4 18" fill="#e8c488" ${OUT}/><path d="M54 48l-2-12h96l-2 12" fill="#e8c488" ${OUT}/>
<path d="M66 80l-8 96M134 80l8 96" stroke="#b8884a" stroke-width="4" opacity=".7"/>
<path d="M144 14c0-6 8-8 12-4 6-2 10 6 6 10 2 6-4 10-10 8-4 4-12 2-12-4z" fill="${PAPER}" ${OUT} transform="rotate(25 150 20)"/>
<path d="M148 24L120 52" stroke="${PAPER}" stroke-width="10" stroke-linecap="round"/><path d="M148 24L120 52" stroke="#120e18" stroke-width="14" stroke-linecap="round" opacity=".0"/>
<path d="M88 118l-6-20M112 118l6-20" stroke="${INK}" stroke-width="0"/>
<ellipse cx="82" cy="102" rx="10" ry="16" fill="#8a5a2a" ${OUT}/><ellipse cx="118" cy="102" rx="10" ry="16" fill="#8a5a2a" ${OUT}/>
<circle cx="100" cy="110" r="26" fill="#f6e0b8" ${OUT}/>
${face(100, 108, 12, 4)}
<ellipse cx="100" cy="122" rx="6" ry="4" fill="${INK}"/>
<path d="M60 160c20 10 60 10 80 0" stroke="#c85a1a" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="2 9"/>`;

/** The Remote Control: a long black remote with a big red pause button, a worn-out mute, and a face squashed in the middle. */
const remoteControl = `
<rect x="62" y="12" width="76" height="176" rx="22" fill="#3a3450" ${OUT}/>
<path d="M72 22c-4 8-4 40-2 60" stroke="#6a6488" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="100" cy="40" r="14" fill="#ff3b3b" ${OUT}/><path d="M94 33v14M106 33v14" stroke="${PAPER}" stroke-width="5" stroke-linecap="round"/>
<g fill="${PAPER}" ${OUT}><circle cx="80" cy="66" r="7"/><circle cx="100" cy="66" r="7"/><circle cx="120" cy="66" r="7"/></g>
<rect x="76" y="82" width="48" height="52" rx="8" fill="#ffd900" ${OUT}/>
${face(100, 106, 12, 4)}
<g fill="#6a98ea" ${OUT}><circle cx="82" cy="152" r="8"/><circle cx="118" cy="152" r="8"/></g><circle cx="100" cy="166" r="8" fill="#ff3d9a" ${OUT}/>`;

/** The Master Key Ring: a brass ring, the janitor's, with three keys that open what no floor plan shows, and a tag with a face. */
const masterKeys = `
<defs><linearGradient id="mk-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe45a"/><stop offset="1" stop-color="#c8881a"/></linearGradient></defs>
<circle cx="100" cy="50" r="34" fill="none" stroke="${INK}" stroke-width="16"/><circle cx="100" cy="50" r="34" fill="none" stroke="url(#mk-b)" stroke-width="9"/>
<g ${OUT}><path d="M58 76h22v82a11 11 0 0 1-22 0z" fill="url(#mk-b)"/><path d="M58 128h-10v-8h10zM58 144h-14v-8h14z" fill="#c8881a"/><circle cx="69" cy="164" r="4" fill="${INK}"/></g>
<g ${OUT}><path d="M120 76h22v62a11 11 0 0 1-22 0z" fill="#9ab8f0"/><path d="M142 110h12v8h-12zM142 126h8v8h-8z" fill="#5a7ac8"/><circle cx="131" cy="146" r="4" fill="${INK}"/></g>
<g ${OUT}><path d="M86 82h24v94a12 12 0 0 1-24 0z" fill="#ff7aba"/><path d="M110 118h12v8h-12zM110 138h16v8h-16z" fill="#c84a8a"/></g>
<rect x="84" y="94" width="30" height="26" rx="3" fill="${PAPER}" ${OUT}/>
${face(99, 108, 6, 2.4)}`;

/** The Intern Emeritus's Lanyard: a faded lilac strap, a clip, and a badge with a small gold star that someone has dusted. */
const emeritusLanyard = `
<defs><linearGradient id="el-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8b8ff"/><stop offset="1" stop-color="#8a78d8"/></linearGradient></defs>
<path d="M54 8l46 70 46-70" fill="none" stroke="${INK}" stroke-width="22" stroke-linejoin="round"/><path d="M54 8l46 70 46-70" fill="none" stroke="url(#el-b)" stroke-width="14" stroke-linejoin="round"/>
<path d="M62 18l38 56M138 18l-38 56" stroke="#e8e0ff" stroke-width="3" stroke-dasharray="2 7"/>
<rect x="88" y="72" width="24" height="16" rx="3" fill="#9aa3b5" ${OUT}/>
<rect x="52" y="86" width="96" height="100" rx="10" fill="${PAPER}" ${OUT}/>
<rect x="52" y="86" width="96" height="22" rx="10" fill="#8a78d8" ${OUT}/>
<path d="M100 152l-8 14 14-4 14 4-8-14 10-11-15 1-5-14-5 14-15-1z" fill="#ffd900" ${OUT} transform="translate(0 -22) scale(1)" opacity=".0"/>
<path d="M${star(100, 126, 17, 7)}" fill="none"/>
<polygon points="${star(100, 128, 18, 8)}" fill="#ffd900" ${OUT}/>
${face(100, 160, 14, 3.4)}`;

/** Sprite sources by relic id, as the renderer wants them (`relic.` keeps them apart from creature ids). */
export const RELIC_SPRITES: Record<string, string> = Object.fromEntries(
  Object.entries({
    stressBall,
    thermos,
    ergoChair,
    coffeeMug,
    wallClock,
    unionArmband,
    inboxZero,
    heavyStapler,
    spareBadge,
    emergencyExit,
    cargoPants,
    stickyNotes,
    rubberDuck,
    paperShredder,
    statuette,
    quillPen,
    lanyard,
    paperClip,
    companyCard,
    deskPlant,
    highlighter,
    holePunch,
    rubberStamp,
    nameTag,
    fireDrillBell,
    outOfOffice,
    rolodex,
    wellnessVoucher,
    correctionFluid,
    cheatSheet,
    flexitime,
    justInTime,
    stockOptions,
    safetyNet,
    lockerKey,
    bulletproofCardigan,
    revengeSpreadsheet,
    assortedBiscuitTin,
    goldWatch,
    floorPlan,
    gardenGnome,
    reservedSunbed,
    lotteryTicket,
    doggyBag,
    remoteControl,
    masterKeys,
    emeritusLanyard,
  }).map(([id, svg]) => [`relic.${id}`, svg]),
);

/** Riso-pixel sprite of a relic (see riso.ts). */
export const relicArt = (id: string, cls = ''): string => sprite(`relic.${id}`, cls);
