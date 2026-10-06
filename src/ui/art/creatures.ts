import { sprite } from './riso';

/**
 * Hand-built vector creatures on a 200×200 grid. Parts carry classes (`.eye`, `.limb`)
 * that CSS animates. Gradient ids are prefixed per creature to avoid collisions.
 */
export const OUT = 'stroke="#120e18" stroke-width="3" stroke-linejoin="round"';

export const lg = (id: string, a: string, b: string, x2 = 0, y2 = 1): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rg = (id: string, a: string, b: string): string =>
  `<radialGradient id="${id}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const glow = (id: string, color: string): string =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity=".9"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
const eyes = (x1: number, x2: number, y: number, r: number, color: string, id: string): string =>
  `<g class="eye"><circle cx="${x1}" cy="${y}" r="${r * 2.6}" fill="url(#${id})"/><circle cx="${x2}" cy="${y}" r="${r * 2.6}" fill="url(#${id})"/><circle cx="${x1}" cy="${y}" r="${r}" fill="${color}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${color}"/><circle cx="${x1 - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/><circle cx="${x2 - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/></g>`;
export const shadow = `<ellipse cx="100" cy="188" rx="62" ry="9" fill="#000" opacity=".35"/>`;

/** The Snitch: a round purple rat in a hi-vis vest, buck teeth, beady red eyes, a notepad of names in one paw and a pencil in the other, a sweat drop for his guilty conscience. */
const snitch = `
<defs>${rg('sn-b', '#c8a8f8', '#4a2a9a')}${rg('sn-e', '#ffb8dc', '#e0408a')}${glow('sn-g', '#ff3b3b')}</defs>
${shadow}
<path class="limb" d="M150 168c34 4 48-16 40-36-3-8-12-8-11 0 4 12-6 22-28 20" fill="none" stroke="#120e18" stroke-width="10" stroke-linecap="round"/><path class="limb" d="M150 168c34 4 48-16 40-36-3-8-12-8-11 0 4 12-6 22-28 20" fill="none" stroke="#ff8ac8" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="72" cy="182" rx="18" ry="8" fill="#ff8ac8" ${OUT}/><ellipse cx="128" cy="182" rx="18" ry="8" fill="#ff8ac8" ${OUT}/>
<ellipse cx="100" cy="136" rx="54" ry="48" fill="url(#sn-b)" ${OUT}/>
<path d="M62 112c10-8 20-10 30-8l4 70c-14 2-26 0-36-6-6-16-6-38 2-56zM138 112c-10-8-20-10-30-8l-4 70c14 2 26 0 36-6 6-16 6-38-2-56z" fill="#ffd900" ${OUT}/>
<path d="M58 140h38M104 140h38" stroke="#ff3d9a" stroke-width="8"/>
<g transform="rotate(-10 40 140)"><rect x="18" y="114" width="40" height="48" rx="3" fill="#f6f0e4" ${OUT}/><path d="M24 130h28M24 140h28M24 150h18" stroke="#1c5fd0" stroke-width="4"/><path d="M18 116h40" stroke="#120e18" stroke-width="6"/></g>
<circle cx="58" cy="148" r="9" fill="url(#sn-e)" ${OUT}/>
<g class="limb"><path d="M144 164l24-46 9 5-24 46z" fill="#ffd900" ${OUT}/><path d="M144 164l9 5-10 7z" fill="#120e18"/><path d="M168 118l9 5 3-6-8-5z" fill="#ff8ac8" ${OUT}/></g>
<circle cx="150" cy="156" r="9" fill="url(#sn-e)" ${OUT}/>
<circle cx="52" cy="48" r="26" fill="url(#sn-b)" ${OUT}/><circle cx="52" cy="48" r="15" fill="url(#sn-e)"/>
<circle cx="148" cy="48" r="26" fill="url(#sn-b)" ${OUT}/><circle cx="148" cy="48" r="15" fill="url(#sn-e)"/>
<circle cx="100" cy="76" r="42" fill="url(#sn-b)" ${OUT}/>
<ellipse cx="100" cy="98" rx="20" ry="15" fill="#e8d8ff" ${OUT}/>
<ellipse cx="100" cy="90" rx="9" ry="7" fill="#ff3d9a" ${OUT}/>
<path d="M92 104h7v10h-7zM101 104h7v10h-7z" fill="#f6f0e4" ${OUT}/>
<path d="M82 94l-28-6M82 100l-26 6M118 94l28-6M118 100l26 6" stroke="#f6f0e4" stroke-width="2.5" opacity=".8"/>
${eyes(84, 116, 68, 7, '#ff4a3a', 'sn-g')}
<path d="M66 54l26 10M134 54l-26 10" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
<path d="M142 40c4 6 5 10 0 12-5-2-4-6 0-12z" fill="#9ab8f0" ${OUT}/>`;

/** Senior Boomer: forty years on the line and still clocking in. A round skeleton with a comb-over, huge glasses, a walrus mustache, a mug and a box cutter, trousers up to the armpits. */
const seniorBoomer = `
<defs>${rg('bo-b', '#fbf6e6', '#c8bc96')}${rg('bo-s', '#b8d0f8', '#2a5ab8')}${rg('bo-t', '#c8946a', '#5a3a1a')}</defs>
${shadow}
<path d="M62 190l4-12h28l2 12zM106 190l2-12h28l4 12z" fill="#120e18" ${OUT}/>
<path d="M66 150h68l-2 32h-24l-8-12-8 12H68z" fill="url(#bo-t)" ${OUT}/>
<ellipse cx="100" cy="124" rx="56" ry="46" fill="url(#bo-s)" ${OUT}/>
<path d="M60 150c26 10 54 10 80 0v10c-26 10-54 10-80 0z" fill="url(#bo-t)" ${OUT}/><rect x="92" y="148" width="16" height="12" fill="#ffd900" ${OUT}/>
<path d="M82 90l18 14 18-14 6 10-24 12-24-12z" fill="#f6f0e4" ${OUT}/>
<path d="M95 104h10l5 10-6 44-4 6-4-6-6-44z" fill="#ff3d9a" ${OUT}/>
<rect x="116" y="118" width="22" height="18" fill="#9ab8f0" ${OUT}/><path d="M121 108v14M127 108v14M133 108v14" stroke="#ff3d9a" stroke-width="4"/>
<!-- bony arms: mug (left) and box cutter (right) -->
<path d="M52 108L38 136 54 148" stroke="#120e18" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 108L38 136 54 148" stroke="#f6f0e4" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g class="limb"><rect x="22" y="140" width="26" height="28" fill="#f6f0e4" ${OUT}/><path d="M48 146h8c6 0 6 14 0 14h-8" fill="none" stroke="#120e18" stroke-width="3"/><rect x="22" y="148" width="26" height="8" fill="#1c5fd0"/><path d="M30 134c-3-4 3-6 0-10M40 134c-3-4 3-6 0-10" stroke="#f6f0e4" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<path d="M148 108L166 132 156 150" stroke="#120e18" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M148 108L166 132 156 150" stroke="#f6f0e4" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g class="limb"><rect x="150" y="150" width="12" height="26" rx="3" fill="#ff9a1e" ${OUT}/><path d="M152 150l-2-20 12 6-2 14z" fill="#c8c0d8" ${OUT}/></g>
<!-- skull head -->
<ellipse cx="100" cy="58" rx="40" ry="42" fill="url(#bo-b)" ${OUT}/>
<path d="M76 90h48v10c0 6-6 10-12 10H88c-6 0-12-4-12-10z" fill="url(#bo-b)" ${OUT}/><path d="M86 96v12M94 96v13M106 96v13M114 96v12" stroke="#120e18" stroke-width="2"/>
<path d="M66 40c4-8 12-12 22-12M70 34c14-10 40-10 60 4M72 42c20-10 36-10 56 0" stroke="#120e18" stroke-width="3" fill="none" stroke-linecap="round" opacity=".0"/>
<path d="M62 36c8-14 22-18 38-18s30 6 38 20c-14-6-24-8-34-6-12 0-24 2-42 4z" fill="#d8d0c0" ${OUT}/><path d="M70 30c20-10 40-10 58 2M76 38c18-6 34-6 50 0" stroke="#120e18" stroke-width="2" fill="none"/>
<g ${OUT}><circle cx="84" cy="62" r="17" fill="#f6f0e4"/><circle cx="116" cy="62" r="17" fill="#f6f0e4"/></g><path d="M101 62h-2" stroke="#120e18" stroke-width="4"/>
<g class="eye" fill="#120e18"><circle cx="86" cy="64" r="5"/><circle cx="114" cy="64" r="5"/></g>
<path d="M68 46l16 4M132 46l-16 4" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<path d="M96 76l-4 8h16l-4-8z" fill="#120e18"/>
<path d="M70 92c8-8 20-8 30-2 10-6 22-6 30 2-6 8-20 8-30 2-10 6-24 6-30-2z" fill="#d8d0c0" ${OUT}/>`;

/** Toxic Coworker: a smug green toad on the phone, an iced coffee in the other hand, bubbles of gossip floating about and poison dripping from the smirk. */
const toxicCoworker = `
<defs>${rg('tc-b', '#8ad060', '#16402a')}${rg('tc-bl', '#fbf4c0', '#c8d880')}${rg('tc-w', '#ff9ad0', '#c02a80')}</defs>
${shadow}
<!-- gossip bubbles -->
<g class="limb"><ellipse cx="150" cy="30" rx="26" ry="16" fill="#f6f0e4" ${OUT}/><path d="M132 42l-6 12 16-8z" fill="#f6f0e4" ${OUT}/><circle cx="138" cy="30" r="4" fill="#120e18"/><circle cx="150" cy="30" r="4" fill="#120e18"/><circle cx="162" cy="30" r="4" fill="#120e18"/>
<ellipse cx="50" cy="26" rx="22" ry="14" fill="#ffd900" ${OUT}/><path d="M64 36l8 10-14-4z" fill="#ffd900" ${OUT}/><path d="M38 26h24M42 32h16" stroke="#120e18" stroke-width="3"/></g>
<!-- legs -->
<path d="M44 176c-8 4-8 12 2 14l20-2 2-12zM156 176c8 4 8 12-2 14l-20-2-2-12z" fill="url(#tc-b)" ${OUT}/>
<!-- fat body -->
<ellipse cx="100" cy="136" rx="70" ry="50" fill="url(#tc-b)" ${OUT}/>
<ellipse cx="100" cy="150" rx="42" ry="32" fill="url(#tc-bl)" ${OUT}/>
<g fill="url(#tc-w)" ${OUT}><circle cx="46" cy="118" r="5"/><circle cx="154" cy="112" r="6"/><circle cx="62" cy="104" r="4"/><circle cx="142" cy="98" r="4"/><circle cx="168" cy="136" r="4"/></g>
<!-- lanyard and badge -->
<path d="M82 100l18 30 18-30" stroke="#ff3d9a" stroke-width="4" fill="none"/><rect x="88" y="128" width="24" height="18" rx="2" fill="#f6f0e4" ${OUT}/><rect x="92" y="132" width="8" height="8" fill="#ff3d9a"/><path d="M103 133h6M103 139h6" stroke="#120e18" stroke-width="2"/>
<!-- left hand: iced coffee with a straw -->
<path d="M46 148c-6 6-6 14 0 18l12-6z" fill="url(#tc-b)" ${OUT}/>
<g class="limb"><path d="M18 120h26l-3 38H21z" fill="#f6f0e4" ${OUT}/><path d="M18 120h26l-1 8H19z" fill="#ff3d9a" ${OUT}/><path d="M32 120l4-20 8-2" stroke="#120e18" stroke-width="4" fill="none"/><path d="M24 138h14M24 146h14" stroke="#9a6a3a" stroke-width="4"/></g>
<circle cx="46" cy="150" r="8" fill="url(#tc-b)" ${OUT}/>
<!-- right hand: the phone -->
<g class="limb"><rect x="150" y="104" width="24" height="42" rx="4" fill="#120e18" ${OUT}/><rect x="154" y="110" width="16" height="28" fill="#1c5fd0"/><path d="M158 118h8M158 124h6" stroke="#f6f0e4" stroke-width="2.5"/></g>
<circle cx="156" cy="148" r="8" fill="url(#tc-b)" ${OUT}/>
<!-- head: bulging half-lidded eyes, a wide smirk, poison drip -->
<circle cx="64" cy="76" r="24" fill="url(#tc-b)" ${OUT}/><circle cx="136" cy="76" r="24" fill="url(#tc-b)" ${OUT}/>
<ellipse cx="100" cy="98" rx="62" ry="36" fill="url(#tc-b)" ${OUT}/>
<g ${OUT}><circle cx="64" cy="76" r="16" fill="#f6f0e4"/><circle cx="136" cy="76" r="16" fill="#f6f0e4"/></g>
<g class="eye"><rect x="62" y="68" width="5" height="16" rx="2" fill="#ff3d9a" ${OUT}/><rect x="133" y="68" width="5" height="16" rx="2" fill="#ff3d9a" ${OUT}/></g>
<path d="M46 76a18 18 0 0 1 36 0c-10-6-26-6-36 0zM118 76a18 18 0 0 1 36 0c-10-6-26-6-36 0z" fill="#2a6a2a" ${OUT}/>
<path d="M40 112c20 16 100 16 120 0-4 22-30 30-60 30s-56-8-60-30z" fill="#120e18" ${OUT}/>
<path d="M60 124c20 8 60 8 80 0" stroke="#f6f0e4" stroke-width="4" fill="none"/>
<path d="M150 118c4 8 6 14 3 18-4-2-6-8-3-18z" fill="url(#tc-w)" ${OUT}/><path d="M156 138c2 4 2 8 0 10-3-2-3-6 0-10z" fill="url(#tc-w)" ${OUT}/>
<circle cx="86" cy="104" r="3" fill="#120e18"/><circle cx="114" cy="104" r="3" fill="#120e18"/>`;

/** Team Leader: a team-building mascot in a stretched polo, headset on, megaphone in one hand and a giant foam thumbs-up in the other, grinning far too much. */
const teamLeader = `
<defs>${rg('sc-p', '#ffc860', '#c05a10')}${rg('sc-f', '#ffe0c8', '#d89068')}${rg('sc-h', '#ffec6a', '#e0a000')}</defs>
${shadow}
<!-- cheering sparkles -->
<g fill="#ffd900" ${OUT}><path d="M30 44l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M170 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>
<!-- stubby legs and sneakers -->
<path d="M72 168h20v14H72zM108 168h20v14h-20z" fill="#3a3450" ${OUT}/>
<path d="M62 180h34v10H62zM104 180h34v10h-34z" fill="#f6f0e4" ${OUT}/><path d="M62 186h34M104 186h34" stroke="#ff3d9a" stroke-width="3"/>
<!-- stretched polo -->
<ellipse cx="100" cy="136" rx="54" ry="46" fill="url(#sc-p)" ${OUT}/>
<path d="M60 128c28 6 52 6 80 0M58 146c28 6 56 6 84 0" stroke="#fff4d0" stroke-width="5" fill="none"/>
<path d="M82 98l18 16 18-16-6-6-12 10-12-10z" fill="#f6f0e4" ${OUT}/>
<!-- lanyard with whistle and badge -->
<path d="M84 104l16 34 16-34" stroke="#1c5fd0" stroke-width="4" fill="none"/><rect x="88" y="136" width="24" height="18" rx="2" fill="#f6f0e4" ${OUT}/><path d="M100 140l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#ff3d9a"/>
<!-- left arm: megaphone with sound waves -->
<path d="M56 124c-10 4-14 14-10 24l12-4c-2-6 0-10 6-12z" fill="url(#sc-p)" ${OUT}/>
<g class="limb"><path d="M22 118l-12-8v36l12-8z" fill="#f6f0e4" ${OUT}/><path d="M22 118l30 8v14l-30 6z" fill="#ff3d9a" ${OUT}/><rect x="50" y="126" width="12" height="14" fill="#120e18" ${OUT}/></g>
<circle cx="56" cy="148" r="9" fill="url(#sc-f)" ${OUT}/>
<!-- right arm: giant foam thumbs-up -->
<path d="M140 124c12-4 20-14 22-26l-12-2c-2 10-6 16-14 20z" fill="url(#sc-p)" ${OUT}/>
<g class="limb" transform="rotate(10 168 100)"><rect x="146" y="84" width="48" height="44" rx="14" fill="url(#sc-h)" ${OUT}/><path d="M150 68c0-10 18-10 18 0v20h-18z" fill="url(#sc-h)" ${OUT}/><path d="M176 92h14M176 102h14M176 112h14" stroke="#b07800" stroke-width="3" stroke-linecap="round"/><path d="M146 104c-8 0-10 12 0 14" fill="none" stroke="#120e18" stroke-width="3"/></g>
<!-- head: slicked hair, headset, manic eyes, a grin full of teeth -->
<circle cx="100" cy="70" r="40" fill="url(#sc-f)" ${OUT}/>
<path d="M62 62c0-24 16-38 38-38s38 14 38 38c-8-12-20-18-38-18s-30 6-38 18z" fill="#6a3a1a" ${OUT}/><path d="M80 34c8-4 16-4 24-2" stroke="#fff4a0" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M58 70c0-40 16-48 42-48s42 8 42 48" stroke="#120e18" stroke-width="5" fill="none"/>
<rect x="52" y="60" width="12" height="22" rx="4" fill="#1c5fd0" ${OUT}/><rect x="136" y="60" width="12" height="22" rx="4" fill="#1c5fd0" ${OUT}/>
<path d="M58 80c2 18 10 26 24 28" stroke="#120e18" stroke-width="3" fill="none"/><circle cx="84" cy="108" r="5" fill="#ff3d9a" ${OUT}/>
<g ${OUT}><circle cx="86" cy="66" r="11" fill="#f6f0e4"/><circle cx="114" cy="66" r="11" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="66" r="3"/><circle cx="114" cy="66" r="3"/></g>
<path d="M72 50l26 4M128 50l-26 4" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<path d="M72 80c10 24 46 24 56 0z" fill="#120e18" ${OUT}/><path d="M76 82h48v7H80zM82 90c8 6 28 6 36 0z" fill="#f6f0e4"/><path d="M88 82v7M96 82v8M104 82v8M112 82v7" stroke="#120e18" stroke-width="2"/>
<path d="M142 40c4 6 5 10 0 12-5-2-4-6 0-12z" fill="#9ab8f0" ${OUT}/>`;

/** Goblin Consultant: a round pale goblin with a mop of black curls, an enormous hooked nose and an evil grin, in a shiny teal suit and a dollar-green tie, a briefcase spilling invoices and a knife behind his back. */
const goblinConsultant = `
<defs>${rg('gc-b', '#4ac0b0', '#0e5a58')}${rg('gc-f', '#e8f4c0', '#9ab860')}${rg('gc-c', '#c8864a', '#6a3a1a')}${glow('gc-g', '#ffd900')}</defs>
${shadow}
<!-- the knife behind his back -->
<path d="M150 100l30-34 6 6-26 40z" fill="#c8c0d8" ${OUT}/><path d="M148 104l8 8-10 6z" fill="#6a3a1a" ${OUT}/>
<path d="M76 182l-6 8h24l-2-12zM108 178l-2 12h24l-6-8z" fill="#120e18" ${OUT}/>
<ellipse cx="100" cy="138" rx="50" ry="44" fill="url(#gc-b)" ${OUT}/>
<path d="M100 96v84" stroke="#120e18" stroke-width="3"/>
<path d="M84 96l16 22 16-22z" fill="#f6f0e4" ${OUT}/><path d="M96 108h8l5 36-9 6-9-6z" fill="#2ac84a" ${OUT}/><path d="M100 118v18M96 122h8M96 132h8" stroke="#0e5a30" stroke-width="2.5"/>
<path d="M64 120l16 4-4 18-14-6zM136 120l-16 4 4 18 14-6z" fill="#0e5a58"/>
<!-- left claw: briefcase of invoices -->
<g class="limb"><path d="M26 136l6-14 12 0 4 14z" fill="#f6f0e4" ${OUT}/><path d="M22 146l6-16 10 2-2 14zM34 146l4-14 12 2-2 12z" fill="#f6f0e4" ${OUT}/><rect x="14" y="140" width="46" height="34" rx="4" fill="url(#gc-c)" ${OUT}/><rect x="32" y="136" width="10" height="8" fill="none" stroke="#120e18" stroke-width="3"/><rect x="34" y="150" width="8" height="8" fill="#ffd900" ${OUT}/></g>
<path d="M62 118c-10 8-14 20-10 30l12-4c-2-8 0-14 6-18z" fill="url(#gc-b)" ${OUT}/><circle cx="52" cy="148" r="8" fill="url(#gc-f)" ${OUT}/>
<path d="M138 118c10 6 14 14 12 22l-10 0c0-6-2-10-8-14z" fill="url(#gc-b)" ${OUT}/><circle cx="148" cy="142" r="8" fill="url(#gc-f)" ${OUT}/>
<!-- head: big ears, curls, nose, grin -->
<path d="M62 66L28 52l22 24zM138 66l34-14-22 24z" fill="url(#gc-f)" ${OUT}/>
<circle cx="100" cy="68" r="38" fill="url(#gc-f)" ${OUT}/>
<g fill="#1b1830" ${OUT}><circle cx="68" cy="38" r="12"/><circle cx="86" cy="28" r="12"/><circle cx="106" cy="26" r="12"/><circle cx="126" cy="32" r="12"/><circle cx="136" cy="48" r="10"/><circle cx="62" cy="54" r="10"/></g>
<path d="M92 66c-4 12 2 26 14 26 6 0 10-4 8-8-6 2-10-2-8-8z" fill="#c8e080" ${OUT}/>
${eyes(84, 116, 62, 6, '#ffd900', 'gc-g')}<circle cx="85" cy="63" r="2.5" fill="#120e18"/><circle cx="117" cy="63" r="2.5" fill="#120e18"/>
<path d="M70 48l22 10M130 48l-22 10" stroke="#120e18" stroke-width="6" stroke-linecap="round"/>
<path d="M76 88c10 14 38 14 48 0z" fill="#120e18" ${OUT}/><path d="M82 90l4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8" stroke="#f6f0e4" stroke-width="2.5" fill="none"/>`;

/** Security Automaton: a round brass guard robot on piston legs, one red eye in a visor, a navy cap and a star badge, a riot shield in one fist and a baton in the other. */
const securityMonitor = `
<defs>${rg('sm-b', '#ffe8a0', '#8a5a10')}${rg('sm-s', '#c8d8f8', '#3a5aa0')}${rg('sm-c', '#5a70d8', '#141c60')}${glow('sm-g', '#ff3b3b')}</defs>
${shadow}
<path d="M70 150h20v24H70zM110 150h20v24h-20z" fill="#8a94a8" ${OUT}/><path d="M72 156h16M72 164h16M112 156h16M112 164h16" stroke="#120e18" stroke-width="2"/>
<path d="M58 190l4-16h32l4 16zM102 190l4-16h32l4 16z" fill="#3a3450" ${OUT}/>
<ellipse cx="100" cy="122" rx="54" ry="44" fill="url(#sm-b)" ${OUT}/>
<g fill="#8a5a10" ${OUT}><circle cx="62" cy="108" r="3"/><circle cx="138" cy="108" r="3"/><circle cx="62" cy="136" r="3"/><circle cx="138" cy="136" r="3"/></g>
<path d="M100 96l6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1z" fill="#ffd900" ${OUT}/>
<rect x="76" y="140" width="48" height="10" fill="#120e18"/><path d="M82 140v10M92 140v10M102 140v10M112 140v10" stroke="#f6f0e4" stroke-width="2"/>
<!-- riot shield (left) and baton (right) -->
<g class="limb"><path d="M10 96h40l-4 60-16 14-16-14z" fill="url(#sm-s)" ${OUT}/><path d="M16 110h28M16 124h28" stroke="#120e18" stroke-width="3"/><rect x="22" y="132" width="16" height="8" fill="#ffd900" ${OUT}/></g>
<path d="M50 110c-6 4-8 12-4 18l10-4z" fill="#c8c0d8" ${OUT}/>
<g class="limb"><rect x="158" y="82" width="12" height="62" rx="5" fill="#2a2640" ${OUT}/><path d="M158 96h12M158 130h12" stroke="#ff3d9a" stroke-width="5"/></g>
<path d="M148 106c10 4 14 12 14 22l-10 0c0-6-2-10-8-12z" fill="#c8c0d8" ${OUT}/><circle cx="162" cy="138" r="8" fill="#8a94a8" ${OUT}/>
<!-- head: visor with one red eye, cap -->
<rect x="64" y="38" width="72" height="62" rx="16" fill="url(#sm-b)" ${OUT}/>
<rect x="70" y="56" width="60" height="26" rx="8" fill="#120e18" ${OUT}/>
<g class="eye"><circle cx="100" cy="69" r="16" fill="url(#sm-g)"/><circle cx="100" cy="69" r="8" fill="#ff3b3b"/><circle cx="100" cy="69" r="3.5" fill="#120e18"/><circle cx="97" cy="66" r="2" fill="#fff"/></g>
<path d="M82 88h36M86 94h28" stroke="#8a5a10" stroke-width="3"/>
<path d="M60 44c0-18 16-30 40-30s40 12 40 30z" fill="url(#sm-c)" ${OUT}/><path d="M56 44h88c0 6-4 8-10 8H66c-6 0-10-2-10-8z" fill="#141c60" ${OUT}/>
<path d="M100 22l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffd900" ${OUT}/>
<path d="M100 14V4" stroke="#120e18" stroke-width="3"/><circle cx="100" cy="4" r="4" fill="#ff3b3b" ${OUT}/>`;

/** Slaves CEO: the boss. A huge skull on a riveted steel jaw, top hat, monocle and cigar, pinstripe suit, a gold chain and a giant stopwatch he is always checking. */
const slavesCeo = `
<defs>${rg('ce-s', '#fbf6e6', '#b8ac84')}${rg('ce-m', '#d8e0f0', '#4a5878')}${rg('ce-p', '#5a4aa0', '#14103a')}${rg('ce-g', '#fff08a', '#c88a00')}${glow('ce-e', '#ff3b3b')}</defs>
${shadow}
<path d="M70 190l-4-18h32l2 18zM104 190l2-18h32l-4 18z" fill="#120e18" ${OUT}/>
<path d="M72 150h22v24H72zM106 150h22v24h-22z" fill="#14103a" ${OUT}/>
<ellipse cx="100" cy="132" rx="62" ry="46" fill="url(#ce-p)" ${OUT}/>
<path d="M66 100v64M80 96v72M120 96v72M134 100v64" stroke="#8a7ae0" stroke-width="2" opacity=".6"/>
<path d="M82 100l18 28 18-28z" fill="#f6f0e4" ${OUT}/><path d="M96 114h8l4 40-8 8-8-8z" fill="#ff3d9a" ${OUT}/>
<path d="M60 112c6 30 24 44 40 44s34-14 40-44" fill="none" stroke="#120e18" stroke-width="10" stroke-linecap="round"/><path d="M60 112c6 30 24 44 40 44s34-14 40-44" fill="none" stroke="url(#ce-g)" stroke-width="5" stroke-dasharray="7 3" stroke-linecap="round"/>
<!-- giant stopwatch -->
<g class="limb"><circle cx="36" cy="140" r="26" fill="url(#ce-g)" ${OUT}/><circle cx="36" cy="140" r="19" fill="#f6f0e4" ${OUT}/><rect x="31" y="108" width="10" height="8" fill="#8a5a00" ${OUT}/><path d="M36 140V126M36 140l10 6" stroke="#120e18" stroke-width="3" stroke-linecap="round"/><path d="M36 124v-3M36 156v3M20 140h-3M52 140h3" stroke="#120e18" stroke-width="2"/></g>
<path d="M60 116c-10 6-14 16-12 26l12 0z" fill="url(#ce-p)" ${OUT}/><circle cx="58" cy="146" r="9" fill="url(#ce-s)" ${OUT}/>
<path d="M142 116c10 6 14 16 12 26l-12 0z" fill="url(#ce-p)" ${OUT}/><circle cx="148" cy="146" r="9" fill="url(#ce-s)" ${OUT}/>
<!-- skull, steel jaw, monocle, cigar, top hat -->
<ellipse cx="100" cy="64" rx="40" ry="38" fill="url(#ce-s)" ${OUT}/>
<path d="M72 88h56v12c0 8-6 14-14 14H86c-8 0-14-6-14-14z" fill="url(#ce-m)" ${OUT}/>
<path d="M82 96v14M92 96v16M108 96v16M118 96v14" stroke="#120e18" stroke-width="3"/><g fill="#8a94a8" ${OUT}><circle cx="76" cy="94" r="2.5"/><circle cx="124" cy="94" r="2.5"/></g>
<ellipse cx="84" cy="66" rx="12" ry="14" fill="#120e18" ${OUT}/><ellipse cx="116" cy="66" rx="12" ry="14" fill="#120e18" ${OUT}/>
<g class="eye"><circle cx="84" cy="68" r="9" fill="url(#ce-e)"/><circle cx="84" cy="68" r="3.5" fill="#ff3b3b"/><circle cx="116" cy="68" r="9" fill="url(#ce-e)"/><circle cx="116" cy="68" r="3.5" fill="#ff3b3b"/></g>
<circle cx="116" cy="68" r="18" fill="none" stroke="#ffd900" stroke-width="4"/><path d="M130 82c4 12 6 22 8 30" stroke="#ffd900" stroke-width="2" fill="none"/>
<path d="M96 76l4 8 4-8z" fill="#120e18"/>
<path d="M104 100l34 4" stroke="#120e18" stroke-width="9" stroke-linecap="round"/><path d="M104 100l34 4" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/><circle cx="142" cy="105" r="5" fill="#ff8a1e" ${OUT}/>
<path d="M64 38h72l-4-34H68z" fill="url(#ce-p)" ${OUT}/><rect x="66" y="22" width="68" height="10" fill="#ff3d9a"/>
<path d="M50 40h100c0 6-6 10-12 10H62c-6 0-12-4-12-10z" fill="url(#ce-p)" ${OUT}/>`;

/** HR Bitch: a round pink harpy in a blazer, pearls, a pencil-stuck bun and cat-eye glasses, a giant WRITE-UP rubber stamp in one talon and a stack of forms in the other wing. */
const hrBitch = `
<defs>${rg('hr-w', '#d8a0f0', '#4a2090')}${rg('hr-j', '#ffa8d4', '#a01a60')}${rg('hr-f', '#fbf4df', '#c8b090')}</defs>
${shadow}
<!-- big feathered wings -->
<path d="M62 120C38 96 14 100 6 120c8-2 12 0 14 4-8 2-12 8-12 16 8-4 14-4 18 0-4 4-4 10-2 16 8-6 18-8 26-6z" fill="url(#hr-w)" ${OUT}/>
<path d="M138 120c24-24 48-20 56 0-8-2-12 0-14 4 8 2 12 8 12 16-8-4-14-4-18 0 4 4 4 10 2 16-8-6-18-8-26-6z" fill="url(#hr-w)" ${OUT}/>
<!-- talons -->
<path d="M80 172l-10 16M80 172v16M80 172l10 16M120 172l-10 16M120 172v16M120 172l10 16" stroke="#120e18" stroke-width="8" stroke-linecap="round"/>
<path d="M80 172l-10 16M80 172v16M80 172l10 16M120 172l-10 16M120 172v16M120 172l10 16" stroke="#ffd900" stroke-width="4" stroke-linecap="round"/>
<!-- blazer body -->
<ellipse cx="100" cy="136" rx="52" ry="44" fill="url(#hr-j)" ${OUT}/>
<path d="M84 96l16 34 16-34-6-4-10 14-10-14z" fill="#f6f0e4" ${OUT}/><path d="M84 96l-12 28 22 8zM116 96l12 28-22 8z" fill="#c02a80" ${OUT}/>
<circle cx="100" cy="150" r="4" fill="#ffd900" ${OUT}/><circle cx="100" cy="166" r="4" fill="#ffd900" ${OUT}/>
<rect x="116" y="138" width="22" height="12" fill="#f6f0e4" ${OUT}/><path d="M120 144h14" stroke="#120e18" stroke-width="2.5"/>
<!-- forms in the left wing -->
<g transform="rotate(-10 34 140)"><rect x="12" y="118" width="40" height="48" fill="#f6f0e4" ${OUT}/><rect x="16" y="122" width="40" height="48" fill="#f6f0e4" ${OUT}/><path d="M22 134h28M22 142h28M22 150h18" stroke="#1c5fd0" stroke-width="3"/><path d="M42 154l10 10M52 154l-10 10" stroke="#ff3d9a" stroke-width="4"/></g>
<circle cx="52" cy="156" r="8" fill="url(#hr-w)" ${OUT}/>
<!-- stamp in the right talon -->
<g class="limb"><path d="M162 100h22v14h-22z" fill="#6a4a2a" ${OUT}/><path d="M168 114h10v16h-10z" fill="#6a4a2a" ${OUT}/><rect x="154" y="130" width="42" height="14" rx="2" fill="#ff3d9a" ${OUT}/><path d="M158 144h34v6h-34z" fill="#c02a80" ${OUT}/></g>
<path d="M136 128c14 0 22 6 24 14l-10 4c-2-6-6-8-12-8z" fill="url(#hr-w)" ${OUT}/><circle cx="162" cy="116" r="7" fill="url(#hr-w)" ${OUT}/>
<!-- head: pearls, bun with pencils, cat-eye glasses, a pursed beak -->
<path d="M72 94c8 10 48 10 56 0" stroke="#f6f0e4" stroke-width="6" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>
<circle cx="100" cy="68" r="36" fill="url(#hr-f)" ${OUT}/>
<circle cx="100" cy="22" r="17" fill="#4a2090" ${OUT}/><path d="M92 14l22-12M108 14L86 2" stroke="#120e18" stroke-width="7"/><path d="M92 14l22-12M108 14L86 2" stroke="#ffd900" stroke-width="3"/>
<path d="M64 62c-2-24 14-40 36-40s38 16 36 40c-8-14-20-22-36-22s-28 8-36 22z" fill="#4a2090" ${OUT}/>
<path d="M66 60l26 4v12L72 72zM134 60l-26 4v12l20-4z" fill="#f6f0e4" ${OUT}/><path d="M66 60l26 4M134 60l-26 4" stroke="#120e18" stroke-width="5"/>
<path d="M92 66h16" stroke="#120e18" stroke-width="4"/><path d="M62 56l-4-6M138 56l4-6" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<g class="eye" fill="#ff3d9a"><circle cx="82" cy="68" r="3.5"/><circle cx="118" cy="68" r="3.5"/></g>
<path d="M92 80l8 12 8-12z" fill="#ffd900" ${OUT}/><path d="M92 80h16" stroke="#120e18" stroke-width="2"/>`;

/** Guy Asleep: a huge green ogre in overalls asleep on his desk, pink nightcap on, snot bubble swelling, drooling on the keyboard, mug gone cold, Zs rising. */
const guyAsleep = `
<defs>${rg('gs-b', '#b8e070', '#3a7a28')}${lg('gs-d', '#c8864a', '#6a3a1a')}${rg('gs-o', '#6a9af8', '#1c4fb0')}</defs>
${shadow}
<g class="eye" fill="#f6f0e4" ${OUT}><path d="M128 40h16v5l-10 11h10v5h-16v-5l10-11h-10z"/><path d="M152 12h22v6l-14 15h14v6h-22v-6l14-15h-14z"/></g>
<!-- desk, keyboard, cold mug -->
<rect x="8" y="148" width="184" height="16" rx="3" fill="url(#gs-d)" ${OUT}/><rect x="16" y="164" width="14" height="24" fill="#6a3a1a" ${OUT}/><rect x="170" y="164" width="14" height="24" fill="#6a3a1a" ${OUT}/>
<rect x="30" y="138" width="52" height="12" rx="2" fill="#c8c0d8" ${OUT}/><path d="M36 144h40" stroke="#6d6680" stroke-width="3" stroke-dasharray="4 3"/>
<rect x="150" y="124" width="22" height="24" fill="#f6f0e4" ${OUT}/><path d="M172 130h6c4 0 4 10 0 10h-6" fill="none" stroke="#120e18" stroke-width="3"/>
<!-- overalls and arms folded as a pillow -->
<ellipse cx="100" cy="132" rx="64" ry="28" fill="url(#gs-o)" ${OUT}/>
<path d="M62 114l-6-18M138 114l6-18" stroke="#1c4fb0" stroke-width="10"/><circle cx="62" cy="126" r="5" fill="#ffd900" ${OUT}/><circle cx="138" cy="126" r="5" fill="#ffd900" ${OUT}/>
<ellipse cx="62" cy="134" rx="22" ry="12" fill="url(#gs-b)" ${OUT}/><ellipse cx="138" cy="134" rx="22" ry="12" fill="url(#gs-b)" ${OUT}/>
<!-- head, nightcap, snot bubble -->
<circle cx="100" cy="86" r="46" fill="url(#gs-b)" ${OUT}/>
<path d="M62 70c4-28 22-42 40-42 20 0 36 14 38 38l30 14-30 4c-14-12-50-12-78-14z" fill="#ff3d9a" ${OUT}/><circle cx="170" cy="86" r="10" fill="#f6f0e4" ${OUT}/>
<path d="M60 70c28-8 56-8 82 0v10c-26-6-54-6-82 0z" fill="#f6f0e4" ${OUT}/>
<path d="M72 92c6 6 14 6 20 0M108 92c6 6 14 6 20 0" stroke="#120e18" stroke-width="5" fill="none" stroke-linecap="round"/>
<ellipse cx="100" cy="106" rx="10" ry="7" fill="#7ab838" ${OUT}/><circle cx="96" cy="106" r="2" fill="#120e18"/><circle cx="104" cy="106" r="2" fill="#120e18"/>
<path d="M104 112l16 6" stroke="none"/><circle cx="124" cy="104" r="12" fill="#bfeaff" ${OUT}/><circle cx="120" cy="100" r="3" fill="#fff"/>
<path d="M82 118c10 6 26 6 36 0v8c-10 4-26 4-36 0z" fill="#120e18" ${OUT}/><path d="M88 126c0 10 0 16 3 18 3-2 3-8 2-18z" fill="#bfeaff" ${OUT}/>
<path d="M66 82l18 4M134 82l-18 4" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>`;

/** New Hire: a fresh graduate in a gown and a crooked mortarboard, grinning like it is the best day of his life, one CV hugged to his chest and another one screwed into a ball he is about to throw at your cards. */
const newHire = `
${shadow}
<!-- paper balls at his feet: rejected drafts -->
<g fill="#f6f0e4" ${OUT}><path d="M38 182l6-8 10 0 6 8-4 8H42z"/><path d="M142 184l5-9 11 1 5 8-5 8h-13z"/></g>
<path d="M44 176l4 6M54 176l-4 8M148 177l4 6M158 177l-5 8" stroke="#8a8478" stroke-width="2"/>
<!-- diploma tube behind the arm -->
<g transform="rotate(14 46 148)"><rect x="38" y="112" width="16" height="64" rx="3" fill="#f6f0e4" ${OUT}/><rect x="38" y="138" width="16" height="9" fill="#ff3d9a" ${OUT}/></g>
<!-- gown -->
<path d="M52 188c0-44 12-80 48-80s48 36 48 80z" fill="#1b2a70" ${OUT}/>
<path d="M100 108v80" stroke="#120e18" stroke-width="3"/>
<path d="M84 108l16 24 16-24" fill="#f6f0e4" ${OUT}/>
<path d="M100 120l-6 10 6 40 6-40z" fill="#ffd900" ${OUT}/>
<path d="M60 150h18M122 150h18" stroke="#3a4ab0" stroke-width="3"/>
<!-- left arm: the CV hugged to the chest -->
<g transform="rotate(-6 78 146)"><rect x="60" y="124" width="36" height="44" fill="#f6f0e4" ${OUT}/><rect x="65" y="129" width="11" height="11" fill="#ff3d9a" ${OUT}/><path d="M80 131h12M80 137h10M65 147h26M65 153h26M65 159h16" stroke="#1c5fd0" stroke-width="3"/></g>
<path d="M62 118c-8 8-8 22-2 34l12-2c-4-8-4-16 2-22z" fill="#1b2a70" ${OUT}/><circle cx="76" cy="160" r="8" fill="#ffd8b8" ${OUT}/>
<!-- right arm up, the crumpled CV ready to fly -->
<g class="limb"><path d="M136 116c14 0 24-10 28-26l-12-4c-2 10-8 16-18 16z" fill="#1b2a70" ${OUT}/>
<circle cx="160" cy="80" r="8" fill="#ffd8b8" ${OUT}/>
<path d="M148 62l8-12 12-2 12 8 4 12-6 12-14 4-12-6z" fill="#f6f0e4" ${OUT}/><path d="M156 52l8 14-6 12M168 48l-4 18 14 4M150 68l14-2" stroke="#8a8478" stroke-width="2.5" fill="none"/>
<path d="M174 46l8-6M180 58l10-2M146 50l-6-6" stroke="#ffd900" stroke-width="3" stroke-linecap="round"/></g>
<!-- head -->
<path d="M70 62c0-22 12-34 30-34s30 12 30 34c0 20-12 34-30 34S70 82 70 62z" fill="#ffd8b8" ${OUT}/>
<ellipse cx="70" cy="66" rx="5" ry="8" fill="#ffd8b8" ${OUT}/><ellipse cx="130" cy="66" rx="5" ry="8" fill="#ffd8b8" ${OUT}/>
<!-- messy hair and the mortarboard, crooked -->
<path d="M72 44c0-12 12-20 28-20s28 8 28 20c-10-8-18-8-28-8s-18 0-28 8z" fill="#6a3a1a" ${OUT}/>
<path d="M46 30l58-18 58 14-58 20z" fill="#1b1830" ${OUT}/><path d="M104 12l58 14" stroke="#3a3560" stroke-width="3"/>
<circle cx="104" cy="28" r="4" fill="#ffd900" ${OUT}/><path d="M104 28L56 32l-2 26" stroke="#ffd900" stroke-width="3" fill="none"/><rect x="50" y="56" width="8" height="12" fill="#ffd900" ${OUT}/>
<!-- round glasses, shining eager eyes -->
<g ${OUT}><circle cx="86" cy="66" r="11" fill="#f6f0e4"/><circle cx="114" cy="66" r="11" fill="#f6f0e4"/></g><path d="M97 66h6" stroke="#120e18" stroke-width="3"/>
<g class="eye"><circle cx="88" cy="66" r="6" fill="#120e18"/><circle cx="112" cy="66" r="6" fill="#120e18"/><circle cx="90" cy="63" r="2.5" fill="#fff"/><circle cx="114" cy="63" r="2.5" fill="#fff"/></g>
<!-- huge hopeful grin and a drop of sweat -->
<path d="M82 80c6 14 30 14 36 0z" fill="#120e18" ${OUT}/><path d="M86 81h28v4H86z" fill="#f6f0e4"/>
<g fill="#ff3d9a" opacity=".5"><circle cx="76" cy="80" r="5"/><circle cx="124" cy="80" r="5"/></g>
<path d="M134 44c4 6 5 10 0 12-5-2-4-6 0-12z" fill="#9ab8f0" ${OUT}/>`;

/** The Boss's Son: a pampered prep-school boy, round and shiny, in a navy blazer and a pink bow tie, cashmere sweater knotted over his shoulders, a gold watch and a phone to CC Dad on, nose in the air. */
const bossSon = `
<defs>${rg('bs-b', '#4a64d8', '#141c60')}${rg('bs-f', '#fff0e0', '#e0a880')}${rg('bs-h', '#fff08a', '#e0a800')}${rg('bs-w', '#ffb8dc', '#e0408a')}</defs>
${shadow}
<path d="M70 182l-6 8h30l-2-14zM106 176l-2 14h30l-6-8z" fill="#8a4a1a" ${OUT}/><path d="M72 180h12M114 180h12" stroke="#ffd900" stroke-width="3"/>
<path d="M76 152h20v26H76zM104 152h20v26h-20z" fill="#f6f0e4" ${OUT}/>
<path d="M68 138h64l4 18H64z" fill="#e0c88a" ${OUT}/>
<ellipse cx="100" cy="124" rx="52" ry="40" fill="url(#bs-b)" ${OUT}/>
<path d="M82 90l18 28 18-28z" fill="#f6f0e4" ${OUT}/><path d="M100 118v26" stroke="#120e18" stroke-width="3"/><circle cx="100" cy="130" r="3" fill="#ffd900"/>
<rect x="118" y="124" width="12" height="8" fill="#ff8ac8" ${OUT}/>
<path d="M60 108c16 12 28 16 40 16s24-4 40-16" fill="none" stroke="#120e18" stroke-width="16" stroke-linecap="round"/><path d="M60 108c16 12 28 16 40 16s24-4 40-16" fill="none" stroke="url(#bs-w)" stroke-width="10" stroke-linecap="round"/>
<circle cx="100" cy="124" r="9" fill="url(#bs-w)" ${OUT}/><path d="M96 130l-6 16M104 130l6 16" stroke="#120e18" stroke-width="3" stroke-linecap="round"/>
<path d="M100 94l-14-8v16zM100 94l14-8v16z" fill="#ff3d9a" ${OUT}/><circle cx="100" cy="94" r="4" fill="#c81a70" ${OUT}/>
<path d="M58 112c-10 8-12 20-8 30l12-4c-2-8 0-14 6-18z" fill="url(#bs-b)" ${OUT}/><circle cx="52" cy="144" r="8" fill="url(#bs-f)" ${OUT}/><rect x="46" y="136" width="13" height="6" fill="#ffd900" ${OUT}/>
<g class="limb"><path d="M142 112c12 2 20 12 20 24l-10 2c0-8-4-12-12-14z" fill="url(#bs-b)" ${OUT}/><circle cx="158" cy="136" r="8" fill="url(#bs-f)" ${OUT}/><rect x="152" y="104" width="22" height="34" rx="4" fill="#120e18" ${OUT}/><rect x="156" y="109" width="14" height="24" fill="#ffd900"/><path d="M159 116h8M159 122h6" stroke="#120e18" stroke-width="2.5"/></g>
<circle cx="100" cy="64" r="38" fill="url(#bs-f)" ${OUT}/>
<path d="M62 56c-2-24 16-38 38-38 24 0 40 14 38 38-6-8-12-12-22-14 4 6 0 10-8 10-12-6-30-4-46 4z" fill="url(#bs-h)" ${OUT}/><path d="M84 28c8-4 18-4 26 0" stroke="#fffbd0" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M74 62h20M106 62h20" stroke="#120e18" stroke-width="5" stroke-linecap="round"/><g ${OUT}><ellipse cx="84" cy="68" rx="9" ry="5" fill="#f6f0e4"/><ellipse cx="116" cy="68" rx="9" ry="5" fill="#f6f0e4"/></g>
<g class="eye" fill="#1c5fd0"><circle cx="86" cy="68" r="3.5"/><circle cx="118" cy="68" r="3.5"/></g>
<path d="M70 52l20 4M130 52l-20 4" stroke="#b07800" stroke-width="4" stroke-linecap="round"/>
<path d="M96 70l-4 12h16z" fill="#ffc8a0"/><path d="M88 90c8 4 16 2 20-4" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#ff8ac8" opacity=".6"><circle cx="76" cy="80" r="6"/><circle cx="124" cy="80" r="6"/></g>`;

/** The Sick Coworker: a feverish man in a bathrobe and bunny slippers, a bag of frozen peas on his head, a thermometer in his mouth, a nose like a stop light and his germs hovering about, cheering him on. */
const germ = (x: number, y: number, r: number): string =>
  `<g transform="translate(${x} ${y})"><circle r="${r + 5}" fill="none" stroke="#120e18" stroke-width="5" stroke-dasharray="3 5"/><circle r="${r}" fill="#7ad03a" ${OUT}/><path d="M-${r * 0.6} -${r * 0.35}l${r * 0.4} ${r * 0.2}M${r * 0.6} -${r * 0.35}l-${r * 0.4} ${r * 0.2}" stroke="#120e18" stroke-width="2.5"/><circle cx="-${r * 0.35}" cy="0" r="${r * 0.16}" fill="#120e18"/><circle cx="${r * 0.35}" cy="0" r="${r * 0.16}" fill="#120e18"/></g>`;
const sickCoworker = `
<defs>${rg('cw-r', '#ffd4c4', '#d8604a')}${rg('cw-o', '#b8d0fa', '#2a4fa0')}${rg('cw-g', '#d8ffb0', '#4a9a2a')}</defs>
${shadow}
<g class="limb">${germ(28, 52, 10)}${germ(172, 40, 8)}${germ(176, 150, 9)}</g>
<!-- bunny slippers -->
<ellipse cx="72" cy="182" rx="24" ry="9" fill="#ff9ad0" ${OUT}/><ellipse cx="128" cy="182" rx="24" ry="9" fill="#ff9ad0" ${OUT}/>
<path d="M56 176c-6-14-2-22 2-22s4 10 4 22zM70 176c-2-14 2-22 6-22s2 10 0 22zM130 176c-2-14 2-22 6-22s2 10 0 22zM144 176c-6-14-2-22 2-22s4 10 4 22z" fill="#ff9ad0" ${OUT}/>
<!-- bathrobe -->
<ellipse cx="100" cy="134" rx="58" ry="50" fill="url(#cw-o)" ${OUT}/>
<path d="M76 92l24 50 24-50-8-6-16 22-16-22z" fill="#f6f0e4" ${OUT}/>
<path d="M44 148c36 12 76 12 112 0v10c-36 12-76 12-112 0z" fill="#ffd900" ${OUT}/>
<path d="M64 124h18v16H64z" fill="#9ab8f0" ${OUT}/><path d="M68 124c2-10 6-12 8-12s4 4 6 12z" fill="#f6f0e4" ${OUT}/>
<!-- left arm: tissue box -->
<g class="limb"><rect x="14" y="124" width="34" height="26" fill="#8db3f2" ${OUT}/><ellipse cx="31" cy="124" rx="10" ry="4" fill="#120e18"/><path d="M26 124c0-12 4-16 6-16s4 6 4 16z" fill="#f6f0e4" ${OUT}/></g>
<path d="M54 118c-10 6-12 18-8 28l12-4c-2-8 0-14 6-18z" fill="url(#cw-o)" ${OUT}/><circle cx="46" cy="146" r="9" fill="url(#cw-r)" ${OUT}/>
<!-- right arm: a crumpled tissue -->
<path d="M146 118c10 6 14 16 12 28l-12 0c2-8 0-14-6-18z" fill="url(#cw-o)" ${OUT}/><circle cx="152" cy="148" r="9" fill="url(#cw-r)" ${OUT}/><path d="M146 138l6-10 10 2 4 10-6 8z" fill="#f6f0e4" ${OUT}/>
<!-- head: feverish flush, peas on the head, bloodshot half-lidded eyes, red nose, thermometer -->
<circle cx="100" cy="76" r="42" fill="url(#cw-r)" ${OUT}/>
<path d="M62 62c-4-20 10-34 24-36l2 10c-8 2-14 12-12 26zM138 62c4-20-10-34-24-36l-2 10c8 2 14 12 12 26z" fill="#6a4a2a" ${OUT}/><path d="M92 36c0-8 4-12 8-12s6 6 4 14z" fill="#6a4a2a" ${OUT}/>
<g transform="rotate(14 118 34)"><rect x="100" y="20" width="44" height="26" rx="4" fill="#d8ffb0" ${OUT}/><path d="M104 24h36" stroke="#4a9a2a" stroke-width="4"/><circle cx="112" cy="36" r="4" fill="#4a9a2a"/><circle cx="124" cy="38" r="4" fill="#4a9a2a"/><circle cx="134" cy="35" r="4" fill="#4a9a2a"/></g>
<g ${OUT}><ellipse cx="84" cy="76" rx="11" ry="9" fill="#f6f0e4"/><ellipse cx="116" cy="76" rx="11" ry="9" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="85" cy="80" r="3.5"/><circle cx="115" cy="80" r="3.5"/></g>
<path d="M72 76a11 9 0 0 1 22 0zM104 76a11 9 0 0 1 22 0z" fill="#e8806a" ${OUT}/>
<path d="M74 90c6 4 14 4 20 0M106 90c6 4 14 4 20 0" stroke="#8a4ad0" stroke-width="3" fill="none"/>
<path d="M72 56l22 6M128 56l-22 6" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<circle cx="100" cy="94" r="12" fill="#f63a1e" ${OUT}/><circle cx="96" cy="90" r="3.5" fill="#fff" opacity=".7"/>
<circle cx="112" cy="106" r="6" fill="#bfeaff" ${OUT}/><path d="M112 100v-4" stroke="#bfeaff" stroke-width="3"/>
<path d="M88 112c6-4 12-2 16 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M100 112l44-10" stroke="#120e18" stroke-width="9" stroke-linecap="round"/><path d="M100 112l44-10" stroke="#f6f0e4" stroke-width="5" stroke-linecap="round"/><circle cx="148" cy="101" r="6" fill="#f63a1e" ${OUT}/>
<path d="M142 50c2 6 0 10-4 12" stroke="#9ad8f0" stroke-width="4" fill="none" stroke-linecap="round"/>`;

/** The Facilities Manager: a stout man in a patched, rusty brown jacket and a flat cap, a clipboard of tickets nobody reads, a huge jangling key ring and a wrench in his belt. */
const facilitiesManager = `
<defs>${rg('fm-j', '#f8a050', '#8a3a10')}${rg('fm-f', '#ffd8b0', '#c88a60')}${rg('fm-k', '#c8c0d8', '#5a5a78')}</defs>
${shadow}
<path d="M64 182l-6 10h38l-2-16zM104 176l-2 16h38l-6-10z" fill="#120e18" ${OUT}/>
<path d="M70 150h24v28H70zM106 150h24v28h-24z" fill="#3a3450" ${OUT}/>
<ellipse cx="100" cy="128" rx="58" ry="46" fill="url(#fm-j)" ${OUT}/>
<path d="M100 88v82" stroke="#120e18" stroke-width="3"/><g fill="#ffd900" ${OUT}><circle cx="92" cy="110" r="3"/><circle cx="92" cy="130" r="3"/></g>
<rect x="60" y="148" width="80" height="10" fill="#120e18"/><rect x="94" y="146" width="12" height="14" fill="#ffd900" ${OUT}/>
<path d="M72 108h20v16H72z" fill="#b8a070" ${OUT}/><path d="M74 116h16" stroke="#6a4a2a" stroke-width="2" stroke-dasharray="3 2"/>
<g fill="#c8501a" opacity=".85"><circle cx="124" cy="118" r="6"/><circle cx="132" cy="132" r="4"/><circle cx="68" cy="140" r="5"/></g>
<!-- wrench in the belt -->
<g transform="rotate(30 124 160)"><rect x="120" y="144" width="8" height="34" rx="3" fill="url(#fm-k)" ${OUT}/><circle cx="124" cy="144" r="8" fill="url(#fm-k)" ${OUT}/><rect x="121" y="134" width="6" height="12" fill="#f6f0e4"/></g>
<!-- left arm: clipboard of tickets -->
<path d="M58 112c-10 6-14 16-10 28l12-4c-2-6 0-12 6-16z" fill="url(#fm-j)" ${OUT}/>
<rect x="20" y="106" width="38" height="50" fill="#c9a060" ${OUT}/><rect x="25" y="116" width="28" height="36" fill="#f6f0e4"/><path d="M29 124h20M29 132h20M29 140h12" stroke="#120e18" stroke-width="3"/><rect x="29" y="102" width="14" height="8" fill="#120e18"/><path d="M44 142l8 8M52 142l-8 8" stroke="#ff3d9a" stroke-width="3"/>
<circle cx="56" cy="144" r="9" fill="url(#fm-f)" ${OUT}/>
<!-- right arm: huge key ring -->
<path d="M142 112c12 6 16 16 14 28l-12 0c2-8 0-14-8-18z" fill="url(#fm-j)" ${OUT}/><circle cx="152" cy="144" r="9" fill="url(#fm-f)" ${OUT}/>
<g class="limb"><circle cx="164" cy="160" r="14" fill="none" stroke="#120e18" stroke-width="8"/><circle cx="164" cy="160" r="14" fill="none" stroke="#c8c0d8" stroke-width="4"/><path d="M152 168l-10 14h8l4 4 6-8M176 168l10 14h-8l-4 4-6-8" fill="#ffd900" ${OUT}/></g>
<!-- head: flat cap, droopy mustache, tired eyes -->
<circle cx="100" cy="66" r="38" fill="url(#fm-f)" ${OUT}/>
<path d="M60 56c0-20 16-34 40-34s40 14 40 34z" fill="#8a4a1a" ${OUT}/><path d="M56 56h88c10 0 18 4 22 10-16-2-26-2-40 0H60c-4-4-4-8-4-10z" fill="#6a3a10" ${OUT}/><circle cx="100" cy="20" r="4" fill="#6a3a10" ${OUT}/>
<g ${OUT}><ellipse cx="84" cy="70" rx="9" ry="7" fill="#f6f0e4"/><ellipse cx="116" cy="70" rx="9" ry="7" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="72" r="3.5"/><circle cx="114" cy="72" r="3.5"/></g>
<path d="M74 66h20M106 66h20" stroke="#120e18" stroke-width="5" stroke-linecap="round"/><path d="M76 86c-4 6-4 12 0 16" stroke="#8a5a30" stroke-width="3" fill="none" opacity=".6"/>
<ellipse cx="100" cy="82" rx="9" ry="7" fill="#e0904a" ${OUT}/>
<path d="M70 92c8-4 18-4 30 2 12-6 22-6 30-2-2 12-12 14-20 8-4 4-14 4-20 0-8 6-18 4-20-8z" fill="#6a4a2a" ${OUT}/>`;

// Title screen props (office and factory): the time clock, a filing cabinet, a sack of money, a toxic barrel.
const timeClock = `
<defs>${lg('tk-m', '#9ab8f0', '#1c4fb0')}${lg('tk-g', '#ffe45a', '#d09a20')}</defs>
${shadow}
<rect x="40" y="16" width="120" height="164" rx="6" fill="url(#tk-m)" ${OUT}/>
<circle cx="100" cy="66" r="36" fill="#f6f0e4" stroke="url(#tk-g)" stroke-width="8"/>
<path d="M100 66V44M100 66l18 10" stroke="#1b1830" stroke-width="7" stroke-linecap="round"/>
<g fill="#1b1830"><rect x="97" y="34" width="6" height="6"/><rect x="97" y="92" width="6" height="6"/><rect x="68" y="63" width="6" height="6"/><rect x="126" y="63" width="6" height="6"/></g>
<rect x="80" y="112" width="40" height="36" fill="#f6f0e4" ${OUT}/>
<g fill="#ff3d9a"><rect x="86" y="118" width="6" height="6"/><rect x="100" y="128" width="6" height="6"/><rect x="108" y="118" width="6" height="6"/></g>
<rect x="58" y="146" width="84" height="12" fill="#1b1830"/>
<rect x="160" y="76" width="16" height="44" fill="url(#tk-g)" ${OUT}/>`;

/** Office Chair: a gaming office chair come alive, an angry face on the backrest, RGB stripes, armrests like fists and five yellow casters. */
const officeChair = `
<defs>${rg('oc-b', '#6a6a8a', '#14143a')}${rg('oc-s', '#ff6a8a', '#8a0a30')}${glow('oc-g', '#ffd900')}</defs>
${shadow}
<!-- star base and casters -->
<path d="M94 130h12v28H94z" fill="#8a94a8" ${OUT}/>
<path d="M100 158l-52 20M100 158l52 20M100 158l-26 28M100 158l26 28M100 158v28" stroke="#120e18" stroke-width="12" stroke-linecap="round"/><path d="M100 158l-52 20M100 158l52 20M100 158l-26 28M100 158l26 28M100 158v28" stroke="#8a94a8" stroke-width="6" stroke-linecap="round"/>
<g fill="#ffd900" ${OUT}><circle cx="46" cy="178" r="9"/><circle cx="154" cy="178" r="9"/><circle cx="72" cy="188" r="9"/><circle cx="128" cy="188" r="9"/><circle cx="100" cy="190" r="9"/></g>
<!-- seat -->
<path d="M40 120c0-10 10-16 60-16s60 6 60 16v16c0 8-10 12-60 12s-60-4-60-12z" fill="url(#oc-b)" ${OUT}/>
<path d="M46 126c20 6 88 6 108 0" stroke="#ff3d9a" stroke-width="5" fill="none"/>
<!-- armrests as fists -->
<g class="limb"><path d="M34 128c-12-10-12-40 0-52l14 4c-8 12-6 30 2 40z" fill="url(#oc-b)" ${OUT}/><circle cx="36" cy="72" r="12" fill="url(#oc-s)" ${OUT}/></g>
<g class="limb"><path d="M166 128c12-10 12-40 0-52l-14 4c8 12 6 30-2 40z" fill="url(#oc-b)" ${OUT}/><circle cx="164" cy="72" r="12" fill="url(#oc-s)" ${OUT}/></g>
<!-- tall backrest with racing stripes and a face -->
<path d="M52 108V46c0-22 22-34 48-34s48 12 48 34v62c-14 8-82 8-96 0z" fill="url(#oc-b)" ${OUT}/>
<path d="M66 100V50c0-14 14-22 34-22s34 8 34 22v50c-12 6-56 6-68 0z" fill="url(#oc-s)" ${OUT}/>
<path d="M56 100V46M144 100V46" stroke="#ffd900" stroke-width="5"/><path d="M62 100V46M138 100V46" stroke="#2ac8e8" stroke-width="3"/>
<path d="M92 12h16v10H92z" fill="#8a94a8" ${OUT}/>
${eyes(84, 116, 56, 6, '#ffd900', 'oc-g')}<circle cx="84" cy="57" r="2.5" fill="#120e18"/><circle cx="116" cy="57" r="2.5" fill="#120e18"/>
<path d="M70 42l26 10M130 42l-26 10" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
<path d="M78 80c10 14 34 14 44 0z" fill="#120e18" ${OUT}/><path d="M82 82l5 7 5-6 5 8 5-8 5 6 5-7" fill="#f6f0e4"/>`;

/** The Overthinker: a pale, bald, wide-eyed round man with worried brows and a hand on his chin, a huge forehead and question marks, equations and tangled arrows orbiting it. */
const overthinker = `
<defs>${rg('ot-f', '#fbf4ec', '#c8b8b0')}${rg('ot-s', '#b8d0f8', '#2a5ab8')}</defs>
${shadow}
<g class="limb" fill="#120e18" font-family="sans-serif"><path d="M24 40c-8-14 6-26 20-22 14 4 14 18 2 22" stroke="#120e18" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="46" cy="50" r="3"/><path d="M148 20c10-10 28-6 28 8M176 28l-8 4M176 28l2 8" stroke="#120e18" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M158 56l22-4M162 66l14-4M164 78l20 6" stroke="#120e18" stroke-width="4" stroke-linecap="round"/><path d="M14 80c14 8 6 24 20 22M30 92l6 8-10 2" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<path d="M72 182l-8 8h26l-2-14zM110 176l-2 14h26l-6-8z" fill="#120e18" ${OUT}/>
<path d="M76 150h20v28H76zM104 150h20v28h-20z" fill="#3a3450" ${OUT}/>
<ellipse cx="100" cy="132" rx="46" ry="40" fill="url(#ot-s)" ${OUT}/>
<path d="M88 96l12 14 12-14" fill="#f6f0e4" ${OUT}/><path d="M96 108h8l3 30-7 6-7-6z" fill="#ff3d9a" ${OUT}/>
<path d="M62 120c-10 8-12 20-8 30l12-4c-2-8 0-14 6-18z" fill="url(#ot-s)" ${OUT}/><circle cx="58" cy="152" r="8" fill="url(#ot-f)" ${OUT}/>
<!-- right arm bent up, hand on the chin -->
<path d="M140 120c14 4 20 12 16 22l-10-2c0-6-4-10-10-12z" fill="url(#ot-s)" ${OUT}/>
<path d="M150 136c6-6 4-18-6-26" stroke="#120e18" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M150 136c6-6 4-18-6-26" stroke="url(#ot-f)" stroke-width="6" fill="none" stroke-linecap="round"/>
<!-- the huge head -->
<ellipse cx="100" cy="64" rx="48" ry="50" fill="url(#ot-f)" ${OUT}/>
<path d="M62 30c14-16 62-16 76 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M72 36c8-6 16-6 22-2M104 30c8-2 16 0 22 6" stroke="#c8b8b0" stroke-width="3" fill="none"/>
<path d="M64 62l22 10M136 62l-22 10" stroke="#120e18" stroke-width="6" stroke-linecap="round"/><path d="M62 52c8 4 16 6 24 8M138 52c-8 4-16 6-24 8" stroke="#120e18" stroke-width="3" fill="none" stroke-linecap="round"/>
<g ${OUT}><circle cx="82" cy="78" r="16" fill="#f6f0e4"/><circle cx="118" cy="78" r="16" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="84" cy="80" r="6"/><circle cx="116" cy="80" r="6"/></g><circle cx="86" cy="77" r="2" fill="#fff"/><circle cx="118" cy="77" r="2" fill="#fff"/>
<path d="M90 106c6-3 14-3 20 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M154 38c4 6 5 10 0 12-5-2-4-6 0-12z" fill="#9ab8f0" ${OUT}/>`;

const hrTv = (angry: boolean): string => `
<defs>${rg('hv-w', '#e0a860', '#6a3a1a')}${angry ? '' : rg('hv-s', '#d8ecff', '#4a86e0')}</defs>
${shadow}
<path d="M72 34L${angry ? 46 : 54} ${angry ? 12 : 8}M128 34l${angry ? 20 : 18}-${angry ? 28 : 26}" stroke="#120e18" stroke-width="5" stroke-linecap="round" fill="none"/>
${angry ? '<path d="M38 4l8 8-10 2 12 8M150 2l2 10 8-4" stroke="#ffd900" stroke-width="3" fill="none"/>' : `<circle cx="54" cy="8" r="8" fill="#ff3d9a" ${OUT}/><circle cx="146" cy="8" r="8" fill="#ffd900" ${OUT}/>`}
<path d="M58 158l-10 14 6 4 8-4 6 10h8l-2-24zM142 158l10 14-6 4-8-4-6 10h-8l2-24z" fill="url(#hv-w)" ${OUT}/>
<path d="M50 176l-6 8M58 178l-2 10M148 176l6 8M142 178l2 10" stroke="#f6f0e4" stroke-width="4" stroke-linecap="round"/>
<rect x="22" y="30" width="156" height="134" rx="22" fill="url(#hv-w)" ${OUT}/>
<rect x="32" y="40" width="116" height="112" rx="26" fill="#120e18" ${OUT}/>
<rect x="40" y="48" width="100" height="96" rx="22" fill="${angry ? '#ff3d9a' : 'url(#hv-s)'}"/>
<path d="M40 72h100M40 96h100M40 120h100" stroke="${angry ? '#120e18' : '#1c5fd0'}" stroke-width="3" opacity=".35"/>
${
  angry
    ? `<path d="M56 70l30 14M124 70l-30 14" stroke="#120e18" stroke-width="8" stroke-linecap="round"/><path d="M60 86l24 8-4 10H62zM120 86l-24 8 4 10h18z" fill="#ffd900" ${OUT}/><g class="eye" fill="#120e18"><circle cx="76" cy="98" r="3.5"/><circle cx="104" cy="98" r="3.5"/></g><path d="M58 112h64l-6 22H64z" fill="#120e18"/><path d="M58 112l6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10z" fill="#f6f0e4"/><path d="M126 50l-12 18 12 6-14 16" stroke="#120e18" stroke-width="3" fill="none"/>`
    : `<path d="M64 84c4-8 14-8 18 0M98 84c4-8 14-8 18 0" stroke="#120e18" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M68 108c12 16 32 16 44 0" stroke="#120e18" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="62" cy="100" r="6" fill="#ff8ac8"/><circle cx="118" cy="100" r="6" fill="#ff8ac8"/><path d="M50 56l16 0" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`
}
<g fill="${angry ? '#ff3d9a' : '#ffd900'}" ${OUT}><circle cx="164" cy="62" r="8"/><circle cx="164" cy="90" r="8"/></g>
<g fill="#120e18"><rect x="154" y="112" width="20" height="4"/><rect x="154" y="122" width="20" height="4"/><rect x="154" y="132" width="20" height="4"/></g>`;

/** HR Orientation Video: a haunted wooden TV on clawed legs, antennae with orbs, a serene smiling face on the screen. */
const hrOrientationVideo = hrTv(false);

/** The same TV at half HP, mask off: a cracked red screen, bent sparking antennae, glaring eyes and a jagged grin. */
const hrOrientationVideoAngry = hrTv(true);

/** Change Manager: an agile archmage in a purple robe with pivot-arrow runes, a pointy hat covered in sticky notes, white sneakers under the hem, a kanban-board staff, a DISRUPT mug and a floating backlog grimoire. */
const changeManager = `
${shadow}
<!-- staff topped with a kanban board -->
<rect x="159" y="46" width="7" height="142" fill="#6a4a2a" ${OUT}/>
<rect x="138" y="8" width="50" height="42" fill="#f6f0e4" ${OUT}/><path d="M154 10v38M170 10v38" stroke="#120e18" stroke-width="2.5"/>
<g ${OUT}><rect x="142" y="14" width="9" height="9" fill="#ffd900"/><rect x="142" y="27" width="9" height="9" fill="#ff3d9a"/><rect x="158" y="14" width="9" height="9" fill="#9ab8f0"/><rect x="174" y="14" width="9" height="9" fill="#ff3d9a"/><rect x="174" y="27" width="9" height="9" fill="#ffd900"/><rect x="174" y="40" width="9" height="7" fill="#9ab8f0"/></g>
<!-- sneakers under the hem -->
<path d="M62 180h32l4 10H58zM106 180h32l4 10h-40z" fill="#f6f0e4" ${OUT}/><path d="M58 188h40M102 188h40" stroke="#ff3d9a" stroke-width="3"/>
<!-- robe with pivot-arrow runes -->
<path d="M52 182c0-52 12-80 48-80s48 28 48 80z" fill="#5a3fb0" ${OUT}/>
<path d="M92 112l8 70 8-70z" fill="#3a2480"/>
<path d="M62 160c8-8 14-8 20 0M62 160l2-8M62 160l8 0M138 160c-8-8-14-8-20 0M138 160l-2-8M138 160l-8 0M70 134c4-6 8-6 12 0M118 134c4-6 8-6 12 0" stroke="#ffd900" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M60 146h80v8H60z" fill="#ffd900" ${OUT}/><rect x="94" y="144" width="12" height="12" fill="#ff3d9a" ${OUT}/>
<!-- left arm: a DISRUPT mug, the backlog grimoire floating above it -->
<g class="limb"><path d="M62 112c-16 6-22 20-18 32l12-2c-2-8 0-14 8-20z" fill="#5a3fb0" ${OUT}/>
<circle cx="48" cy="146" r="8" fill="#ffd8b8" ${OUT}/>
<rect x="30" y="140" width="22" height="26" fill="#f6f0e4" ${OUT}/><path d="M52 146h6c4 0 4 12 0 12h-6" fill="none" stroke="#120e18" stroke-width="3"/><rect x="30" y="148" width="22" height="7" fill="#ff3d9a"/>
<path d="M36 134c-3-4 3-6 0-10M44 134c-3-4 3-6 0-10" stroke="#f6f0e4" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<g transform="rotate(-12 34 84)"><path d="M10 72h24v30H10zM34 72h24v30H34z" fill="#f6f0e4" ${OUT}/><path d="M10 72l-4 4v30l4-4zM58 72l4 4v30l-4-4z" fill="#3a2480" ${OUT}/><path d="M15 80h14M15 87h14M15 94h10M39 80h14M39 87h14M39 94h8" stroke="#1c5fd0" stroke-width="2.5"/></g>
<path d="M18 56l3 6 6 3-6 3-3 6-3-6-6-3 6-3zM60 62l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#ffd900"/>
<!-- right arm on the staff -->
<path d="M136 112c14 4 22 12 24 24l-12 2c-2-8-6-12-14-14z" fill="#5a3fb0" ${OUT}/><circle cx="162" cy="134" r="8" fill="#ffd8b8" ${OUT}/>
<!-- head, goatee -->
<ellipse cx="100" cy="78" rx="26" ry="28" fill="#ffd8b8" ${OUT}/>
<path d="M92 98c4 10 12 10 16 0l-2 16c-4 4-8 4-12 0z" fill="#6a3a1a" ${OUT}/>
<path d="M82 90c10 10 26 10 36 0z" fill="#120e18" ${OUT}/><path d="M86 91h28v4H86z" fill="#f6f0e4"/>
<path d="M78 66l14 4M122 66l-14 4" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<g ${OUT}><ellipse cx="88" cy="76" rx="8" ry="7" fill="#f6f0e4"/><ellipse cx="112" cy="76" rx="8" ry="7" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="90" cy="77" r="3.5"/><circle cx="110" cy="77" r="3.5"/></g>
<!-- pointy hat with sticky notes -->
<ellipse cx="100" cy="58" rx="42" ry="9" fill="#ff3d9a" ${OUT}/>
<path d="M68 56C78 34 92 18 112 8l12 6C112 22 112 38 132 56z" fill="#ff3d9a" ${OUT}/>
<path d="M70 52c20 6 44 6 62 0v6c-20 6-44 6-62 0z" fill="#ffd900" ${OUT}/>
<g ${OUT}><rect x="88" y="26" width="11" height="11" fill="#ffd900" transform="rotate(-10 93 31)"/><rect x="104" y="30" width="11" height="11" fill="#9ab8f0" transform="rotate(8 109 35)"/></g>
<path d="M92 29h5M91 33h5M107 33h5" stroke="#120e18" stroke-width="1.5"/>`;

/** Act 2 stage prop: an office water cooler, upside-down jug on top (CSS adds the rising bubble). */
const waterCooler = `
${shadow}
<path d="M70 16h60c6 0 10 4 10 10v52c0 6-4 10-10 10h-18v10H88V88H70c-6 0-10-4-10-10V26c0-6 4-10 10-10z" fill="#9ab8f0" ${OUT}/>
<path d="M62 48h76v30c0 5-3 8-8 8H70c-5 0-8-3-8-8z" fill="#1c5fd0"/>
<path d="M60 34h80M60 62h80" stroke="#1b1830" stroke-width="3"/>
<rect x="56" y="98" width="88" height="88" fill="#f6f0e4" ${OUT}/>
<rect x="66" y="134" width="68" height="42" fill="#c8c0d8" ${OUT}/>
<rect x="72" y="108" width="14" height="12" fill="#ff3d9a" ${OUT}/><rect x="114" y="108" width="14" height="12" fill="#1c5fd0" ${OUT}/>
<rect x="68" y="124" width="64" height="6" fill="#1b1830"/>
<rect x="144" y="104" width="14" height="44" fill="#f6f0e4" ${OUT}/><path d="M144 116h14M144 128h14" stroke="#1b1830" stroke-width="3"/>`;

/** The Rogue: the temp in a hi-vis rust hoodie and a bandit mask, a lanyard badge reading TEMP, a tote bag full of other people's stationery, a stolen stapler in one hand. */
const rogue = `
<defs>${lg('ro-h', '#f2a05a', '#c25a1c')}${lg('ro-f', '#ffb4d4', '#ff86bc')}${lg('ro-b', '#fbf4df', '#d8d0c0')}</defs>
<path d="M18 200c0-44 34-66 82-66s82 22 82 66z" fill="url(#ro-h)" ${OUT}/>
<path d="M80 134l20 42 20-42" stroke="#ff3d9a" stroke-width="5" fill="none"/>
<rect x="88" y="170" width="24" height="22" fill="#f6f0e4" ${OUT}/><rect x="92" y="175" width="16" height="5" fill="#1c5fd0"/><rect x="92" y="184" width="10" height="3" fill="#1b1830"/>
<path d="M30 146l-6-30M42 146l2-34M54 146l10-28" stroke="#1c5fd0" stroke-width="5" stroke-linecap="round"/>
<path d="M18 150h50l6 46H12z" fill="url(#ro-b)" ${OUT}/>
<path d="M32 150c0-26 22-26 22 0" stroke="#120e18" stroke-width="5" fill="none"/>
<rect x="24" y="168" width="38" height="8" fill="#ff3d9a"/>
<path d="M100 8c-32 6-52 34-52 66 0 22 8 44 14 56h76c6-12 14-34 14-56 0-32-20-60-52-66z" fill="url(#ro-h)" ${OUT}/>
<path d="M72 76c0-18 12-30 28-30s28 12 28 30v18c0 16-12 28-28 28s-28-12-28-28z" fill="#1b1830"/>
<path d="M78 82c0-14 10-22 22-22s22 8 22 22v12c0 12-10 20-22 20s-22-8-22-20z" fill="url(#ro-f)" ${OUT}/>
<path d="M76 78h48v16H76z" fill="#1b1830"/>
<g class="eye"><rect x="82" y="83" width="12" height="6" fill="#f6f0e4"/><rect x="106" y="83" width="12" height="6" fill="#f6f0e4"/><rect x="87" y="83" width="5" height="6" fill="#c85a20"/><rect x="111" y="83" width="5" height="6" fill="#c85a20"/></g>
<path d="M86 104c8 7 20 7 28 0" stroke="#1b1830" stroke-width="3.5" fill="none"/><path d="M100 109l3-5" stroke="#f6f0e4" stroke-width="3"/>
<g class="limb"><path d="M128 140c14 2 22 12 22 22l-16 4z" fill="url(#ro-h)" ${OUT}/><circle cx="144" cy="164" r="9" fill="url(#ro-f)" ${OUT}/>
<g transform="rotate(-18 150 150)"><rect x="132" y="148" width="46" height="12" fill="#ff3d9a" ${OUT}/><path d="M132 148c0-10 8-14 20-16l26-4v20z" fill="#d03a8a" ${OUT}/><rect x="170" y="140" width="6" height="6" fill="#f6f0e4"/></g></g>`;

const warrior = `
<defs>${lg('wa-h', '#9ac0f8', '#1c5fd0', 1, 1)}${lg('wa-s', '#ffb4d4', '#ff86bc')}${lg('wa-a', '#ff8ac8', '#d03a8a')}${lg('wa-y', '#ffc890', '#ffbc80')}</defs>
<path d="M14 200c0-46 36-70 86-70 34 0 58 10 70 30l6 40z" fill="url(#wa-a)" ${OUT}/>
<path d="M14 176c0-28 18-46 44-48l14 46z" fill="url(#wa-h)" ${OUT}/>
<path d="M22 142l-10-20 22 8zM40 130l-4-22 16 14z" fill="#fbf4df" ${OUT}/>
<!-- right arm lost on the job: a bandaged stump -->
<path d="M132 132c16-8 38-4 46 12 6 12 0 26-14 28l-34-14z" fill="#f6f0e4" ${OUT}/>
<path d="M146 134l-8 28M160 136l-8 30M172 144l-6 26" stroke="#c9bd98" stroke-width="4"/>
<circle cx="168" cy="160" r="6" fill="#ff3d9a"/>
<path d="M72 120h56v26H72z" fill="url(#wa-s)" ${OUT}/>
<path d="M50 86c0-40 22-66 50-66s50 26 50 66v22c0 24-22 40-50 40S50 132 50 108z" fill="url(#wa-s)" ${OUT}/>
<path d="M72 34c7-7 15-10 22-10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
<path d="M50 60c0-30 22-46 50-46s50 16 50 46z" fill="#ffd900" ${OUT}/><path d="M95 16h10v44H95z" fill="#e8b820"/>
<path d="M46 60h108v18H46z" fill="url(#wa-h)" ${OUT}/>
<path d="M58 62v14M142 62v14M100 62v14" stroke="#fbf4df" stroke-width="3"/>
<path d="M46 76h18v40c-10-4-18-16-18-28zM154 76h-18v40c10-4 18-16 18-28z" fill="url(#wa-h)" ${OUT}/>
<path d="M95 76h10v26H95z" fill="url(#wa-h)" ${OUT}/>
<path d="M68 84l24 8M132 84l-24 8" stroke="#1b1830" stroke-width="6" stroke-linecap="square"/>
<rect x="74" y="92" width="14" height="8" fill="#f6f0e4" ${OUT}/><rect x="112" y="92" width="14" height="8" fill="#f6f0e4" ${OUT}/>
<rect x="78" y="92" width="7" height="8" fill="#2a8a4a"/><rect x="116" y="92" width="7" height="8" fill="#2a8a4a"/>
<rect x="80" y="94" width="3" height="4" fill="#0c3a1a"/><rect x="118" y="94" width="3" height="4" fill="#0c3a1a"/>
<path d="M120 80l8 28" stroke="#d03a8a" stroke-width="4"/>
<path d="M52 102h96v8c-4 24-22 38-48 38s-44-14-48-38z" fill="url(#wa-y)" ${OUT}/>
<path d="M78 112c8-5 15-5 22-1 7-4 14-4 22 1-4 6-14 7-22 3-8 4-18 3-22-3z" fill="#e8b820" ${OUT}/>
<path d="M88 124h24" stroke="#1b1830" stroke-width="5"/>
<path d="M60 116h4M70 128h4M130 128h4M136 116h4M84 136h4M112 136h4M98 142h4" stroke="#b08a10" stroke-width="3"/>
<g fill="#ffd900" ${OUT}><circle cx="56" cy="152" r="5"/><circle cx="144" cy="152" r="5"/></g>`;

const mage = `
<defs>${lg('ma-h', '#6a9af8', '#1c4fb0')}${lg('ma-f', '#ffb4d4', '#ff86bc')}${lg('ma-b', '#fbf4df', '#d8d0c0')}</defs>
<path d="M18 200c0-44 34-66 82-66s82 22 82 66z" fill="url(#ma-h)" ${OUT}/>
<path d="M100 150l-12 50h24z" fill="#ffd900" opacity=".85"/>
<path d="M100 2c-8 22-24 40-44 56-4 18-2 34 4 46h80c6-12 8-28 4-46C124 42 108 24 100 2z" fill="url(#ma-h)" ${OUT}/>
<path d="M66 70c0-14 14-22 34-22s34 8 34 22v30H66z" fill="url(#ma-f)" ${OUT}/>
<path d="M62 92l6 36c4 14 16 24 32 24s28-10 32-24l6-36-10 4-8 10H80l-8-10z" fill="url(#ma-b)" ${OUT}/>
<path d="M76 104c8-6 16-6 24-2 8-4 16-4 24 2-6 6-16 6-24 2-8 4-18 4-24-2z" fill="url(#ma-b)" ${OUT}/>
<path d="M84 124v14M100 126v18M116 124v14" stroke="#a89880" stroke-width="3"/>
<path d="M60 62c10-10 24-14 40-14s30 4 40 14l-4 12c-10-6-22-8-36-8s-26 2-36 8z" fill="url(#ma-h)" ${OUT}/>
<path d="M60 50c20-8 60-8 80 0" stroke="#1b1830" stroke-width="6" fill="none"/>
<circle cx="84" cy="46" r="10" fill="#1c5fd0" stroke="#ffd900" stroke-width="4"/><circle cx="116" cy="46" r="10" fill="#1c5fd0" stroke="#ffd900" stroke-width="4"/>
<path d="M74 76l16 2M126 76l-16 2" stroke="#1b1830" stroke-width="4"/>
<g fill="#3a3450" opacity=".7"><rect x="70" y="100" width="6" height="4"/><rect x="124" y="96" width="5" height="4"/></g>
<circle cx="85" cy="88" r="10" fill="#f6f0e4" stroke="#1b1830" stroke-width="4"/>
<circle cx="115" cy="88" r="10" fill="#f6f0e4" stroke="#1b1830" stroke-width="4"/>
<path d="M95 88h10M75 86l-9-3M125 86l9-3" stroke="#1b1830" stroke-width="3"/>
<rect x="81" y="84" width="8" height="8" fill="#c85a20"/><rect x="111" y="84" width="8" height="8" fill="#c85a20"/>
<rect x="83" y="86" width="4" height="4" fill="#3a1a08"/><rect x="113" y="86" width="4" height="4" fill="#3a1a08"/>
<path d="M78 82l4-2" stroke="#fff" stroke-width="2"/>
<g fill="#ffe08a"><path d="M78 30l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z"/><path d="M120 44l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></g>`;

const necromancer = `
<defs>${lg('ne-h', '#3aa05a', '#1a5a30')}${lg('ne-f', '#eee6f4', '#b8a8d0')}${lg('ne-s', '#fbf4df', '#f6e27a')}${lg('ne-e', '#ffb0d0', '#e07aa8')}</defs>
<path d="M18 200c0-44 34-66 82-66s82 22 82 66z" fill="url(#ne-h)" ${OUT}/>
<path d="M100 136l-18 64h36z" fill="#1b1830"/>
<path d="M60 134l40 20 40-20" stroke="#ff3d9a" stroke-width="5" fill="none"/>
<path d="M100 8c-30 6-50 34-50 66 0 20 6 42 12 56h76c6-14 12-36 12-56 0-32-20-60-50-66z" fill="url(#ne-h)" ${OUT}/>
<path d="M60 70c-22-10-40-6-44 6-2 12 14 22 42 22zM140 70c22-10 40-6 44 6 2 12-14 22-42 22z" fill="url(#ne-f)" ${OUT}/>
<path d="M58 76c-14-4-26-2-30 4 2 6 14 10 30 10zM142 76c14-4 26-2 30 4-2 6-14 10-30 10z" fill="url(#ne-e)"/>
<path d="M72 76c0-18 12-30 28-30s28 12 28 30v18c0 16-12 28-28 28s-28-12-28-28z" fill="#1b1830"/>
<path d="M78 80c0-14 10-22 22-22s22 8 22 22v12c0 12-10 20-22 20s-22-8-22-20z" fill="url(#ne-f)" ${OUT}/>
<path d="M82 76l12 3M118 76l-12 3" stroke="#1b1830" stroke-width="4"/>
<rect x="84" y="82" width="12" height="9" fill="#f6f0e4" ${OUT}/><rect x="104" y="82" width="12" height="9" fill="#f6f0e4" ${OUT}/>
<rect x="87" y="82" width="7" height="9" fill="#c85a20"/><rect x="107" y="82" width="7" height="9" fill="#c85a20"/>
<rect x="89" y="84" width="3" height="5" fill="#3a1a08"/><rect x="109" y="84" width="3" height="5" fill="#3a1a08"/>
<path d="M98 94l2 6 2-6" stroke="#1b1830" stroke-width="2.5" fill="none"/>
<path d="M90 104c6 3 14 3 20 0" stroke="#1b1830" stroke-width="3" fill="none"/>
<path d="M84 134l16 30 16-30" stroke="#1c5fd0" stroke-width="4" fill="none"/><rect x="90" y="162" width="20" height="24" fill="#f6f0e4" ${OUT}/><rect x="94" y="166" width="12" height="8" fill="#3aa05a"/>
<circle cx="62" cy="168" r="11" fill="#ff3d9a" ${OUT}/><rect x="58" y="161" width="8" height="12" rx="2" fill="#ffd900"/>
<path d="M150 200l8-150" stroke="#1b1830" stroke-width="8"/>
<path d="M146 44c0-12 20-12 20 0 0 8-4 12-10 14-6-2-10-6-10-14z" fill="url(#ne-s)" ${OUT}/>
<circle cx="152" cy="46" r="2.5" fill="#1b1830"/><circle cx="160" cy="46" r="2.5" fill="#1b1830"/>`;

// ------------------------------------------------------------------ Act 2: the afternoon shift

/** Meticulous Colleague: a round green praying mantis in an argyle vest, a ruler in one claw and a magnifying glass in the other, measuring you up. */
const meticulousColleague = `
<defs>${rg('mc-b', '#d8f88a', '#3a8a28')}${rg('mc-v', '#ffd0e8', '#c0508a')}${rg('mc-e', '#fff4a0', '#c88a00')}</defs>
${shadow}
<path d="M84 160l-14 28h18l8-24zM116 160l14 28h-18l-8-24z" fill="url(#mc-b)" ${OUT}/>
<ellipse cx="100" cy="130" rx="46" ry="42" fill="url(#mc-b)" ${OUT}/>
<path d="M62 118c6-16 20-22 38-22s32 6 38 22c4 14 0 30-10 40-8 6-18 8-28 8s-20-2-28-8c-10-10-14-26-10-40z" fill="url(#mc-v)" ${OUT}/>
<path d="M100 100l16 22-16 22-16-22zM100 144l16 20h-32zM76 122l-12 18 12 18M124 122l12 18-12 18" fill="none" stroke="#7a1a4a" stroke-width="3"/>
<path d="M100 100v66" stroke="#120e18" stroke-width="3"/>
<!-- folded forelegs: ruler (left), magnifier (right) -->
<g class="limb"><path d="M64 108l-24-34 10-6 18 26z" fill="url(#mc-b)" ${OUT}/><path d="M42 74l-10-22 10 0z" fill="url(#mc-b)" ${OUT}/><rect x="18" y="52" width="14" height="70" rx="2" fill="#ffd900" ${OUT}/><path d="M18 62h7M18 72h5M18 82h7M18 92h5M18 102h7M18 112h5" stroke="#120e18" stroke-width="2"/></g>
<path d="M60 112c-10 4-12 14-8 22l10-2z" fill="url(#mc-b)" ${OUT}/>
<g class="limb"><path d="M136 108l24-30-10-8-20 26z" fill="url(#mc-b)" ${OUT}/><circle cx="164" cy="60" r="20" fill="#d8ecff" opacity=".8" stroke="#120e18" stroke-width="5"/><circle cx="164" cy="60" r="20" fill="none" stroke="#ffd900" stroke-width="2.5"/><path d="M152 72l-14 24" stroke="#6a3a1a" stroke-width="8" stroke-linecap="round"/><path d="M156 52c4-4 10-4 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<path d="M140 112c10 4 12 14 8 22l-10-2z" fill="url(#mc-b)" ${OUT}/>
<!-- triangular head, antennae, huge compound eyes -->
<path d="M84 34c-4-14-2-24 6-28M116 34c4-14 2-24-6-28" stroke="#120e18" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M84 34c-4-14-2-24 6-28M116 34c4-14 2-24-6-28" stroke="#3a8a28" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M60 52c0-18 18-26 40-26s40 8 40 26c0 22-16 42-40 50-24-8-40-28-40-50z" fill="url(#mc-b)" ${OUT}/>
<g ${OUT}><ellipse cx="78" cy="56" rx="17" ry="20" fill="url(#mc-e)"/><ellipse cx="122" cy="56" rx="17" ry="20" fill="url(#mc-e)"/></g>
<g class="eye" fill="#120e18"><ellipse cx="80" cy="58" rx="6" ry="9"/><ellipse cx="120" cy="58" rx="6" ry="9"/></g>
<circle cx="82" cy="52" r="2.5" fill="#fff"/><circle cx="122" cy="52" r="2.5" fill="#fff"/>
<path d="M62 38l30 14M138 38l-30 14" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<path d="M88 88c8 8 16 8 24 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>`;

/** Dave: a big grey troll slumped in an orange beanbag, hoodie up, red headphones on, eyes half shut, thumb on his phone, a bag of crisps on his belly. */
const dave = `
<defs>${rg('dv-t', '#d8dce8', '#5a6078')}${rg('dv-h', '#7a86d0', '#1c2260')}${rg('dv-b', '#ffb060', '#c04a10')}</defs>
${shadow}
<path d="M20 186c-8-30 4-60 36-70 20-6 68-6 88 0 32 10 44 40 36 70z" fill="url(#dv-b)" ${OUT}/>
<path d="M50 130c10 4 14 12 12 24M150 130c-10 4-14 12-12 24" stroke="#8a2a00" stroke-width="3" fill="none" opacity=".6"/>
<ellipse cx="100" cy="132" rx="52" ry="42" fill="url(#dv-h)" ${OUT}/>
<path d="M74 104c8 4 18 6 26 6s18-2 26-6" stroke="#120e18" stroke-width="3" fill="none"/><path d="M86 112v18M114 112v18" stroke="#f6f0e4" stroke-width="3"/>
<rect x="76" y="136" width="48" height="24" rx="4" fill="#4a5ac8" ${OUT}/><path d="M80 144h40" stroke="#120e18" stroke-width="2"/>
<!-- crisp bag on the belly -->
<path d="M114 124h30l-3 24h-24z" fill="#ff3d9a" ${OUT}/><path d="M114 124l4-6h22l4 6" fill="#ffd900" ${OUT}/><circle cx="129" cy="136" r="5" fill="#ffd900"/>
<!-- arms: phone glowing in his hand -->
<path d="M58 120c-10 8-14 20-8 30l14-6c-4-6-2-14 4-18z" fill="url(#dv-h)" ${OUT}/>
<g class="limb"><rect x="52" y="140" width="22" height="34" rx="4" fill="#120e18" ${OUT}/><rect x="56" y="145" width="14" height="24" fill="#9ab8f0"/><path d="M59 152h8M59 158h6" stroke="#1c5fd0" stroke-width="2.5"/></g>
<circle cx="60" cy="168" r="9" fill="url(#dv-t)" ${OUT}/>
<path d="M142 124c10 6 12 16 10 28l-12-2c2-8 0-14-8-16z" fill="url(#dv-h)" ${OUT}/><circle cx="148" cy="154" r="9" fill="url(#dv-t)" ${OUT}/>
<!-- head under the hood, headphones -->
<path d="M52 82c0-34 20-56 48-56s48 22 48 56c0 10-6 16-12 18H64c-6-2-12-8-12-18z" fill="url(#dv-h)" ${OUT}/>
<ellipse cx="100" cy="76" rx="36" ry="34" fill="url(#dv-t)" ${OUT}/>
<path d="M62 70c0-10 6-16 14-16h48c8 0 14 6 14 16-8-6-16-8-38-8s-30 2-38 8z" fill="#2a2a48" opacity=".5"/>
<path d="M58 66c0-30 18-44 42-44s42 14 42 44" fill="none" stroke="#120e18" stroke-width="9"/><path d="M58 66c0-30 18-44 42-44s42 14 42 44" fill="none" stroke="#ff3d9a" stroke-width="4"/>
<rect x="46" y="62" width="18" height="30" rx="8" fill="#ff3d9a" ${OUT}/><rect x="136" y="62" width="18" height="30" rx="8" fill="#ff3d9a" ${OUT}/>
<g ${OUT}><ellipse cx="86" cy="72" rx="10" ry="8" fill="#f6f0e4"/><ellipse cx="114" cy="72" rx="10" ry="8" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="76" r="4"/><circle cx="114" cy="76" r="4"/></g>
<path d="M74 72a10 8 0 0 1 24 0zM102 72a10 8 0 0 1 24 0z" fill="#8a90a8" ${OUT}/>
<ellipse cx="100" cy="88" rx="10" ry="7" fill="#9aa0b8" ${OUT}/>
<path d="M90 98c6 2 14 2 20 0M92 104l-3 7M108 104l3 7" stroke="#120e18" stroke-width="3" fill="none" stroke-linecap="round"/>`;

/** The Printer: a cursed photocopier, lid open like a jaw full of teeth, one green scanner eye, cables for tentacles. */
const printer = `
<defs>${lg('pr-b', '#ece6d8', '#9a94ac')}${glow('pr-g', '#1cffc0')}</defs>
${shadow}
<path class="limb" d="M40 150c-24 6-30 24-22 38M160 150c24 6 30 24 22 38" stroke="#1b1830" stroke-width="8" fill="none" stroke-linecap="round"/>
<path class="limb" d="M40 150c-24 6-30 24-22 38M160 150c24 6 30 24 22 38" stroke="#ff3d9a" stroke-width="3" fill="none" stroke-linecap="round"/>
<rect x="34" y="92" width="132" height="82" fill="url(#pr-b)" ${OUT}/>
<rect x="44" y="150" width="112" height="16" fill="#6d6680" ${OUT}/><rect x="88" y="155" width="24" height="6" fill="#1b1830"/>
<rect x="118" y="100" width="40" height="24" fill="#1b1830" ${OUT}/><rect x="122" y="104" width="16" height="9" fill="#1cc0a0"/><circle cx="148" cy="107" r="3.5" fill="#ffd900"/><circle cx="148" cy="117" r="3.5" fill="#ff3d9a"/>
<path d="M40 92l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8z" fill="#f6f0e4" ${OUT}/>
<path d="M44 80l6-50h100l6 50z" fill="url(#pr-b)" ${OUT}/>
<path d="M44 80h112l-2 6-6-6-8 8-8-8-8 8-8-8-8 8-8-8-8 8-8-8-8 8-8-8-8 8-8-8-8 8-6-6z" fill="#f6f0e4" ${OUT}/>
<path d="M58 40h84" stroke="#1cc0a0" stroke-width="5"/>
<circle cx="100" cy="58" r="14" fill="#1b1830" ${OUT}/>
<g class="eye"><circle cx="100" cy="58" r="22" fill="url(#pr-g)"/><circle cx="100" cy="58" r="8" fill="#1cffc0"/><circle cx="97" cy="55" r="3" fill="#fff"/></g>
<g class="limb"><path d="M156 128l38-10 4 22-38 10z" fill="#f6f0e4" ${OUT}/><path d="M164 132l24-6M166 140l24-6" stroke="#1b1830" stroke-width="2.5"/></g>`;

/** The Nerd: the IT guy. Round and pimply, in a shirt with a code bracket and pocket pens, taped glasses and braces; a laptop on a blue screen in one hand, a "well, actually" finger up in the other. */
const theNerd = `
<defs>${rg('nd-f', '#fff0e0', '#e0a890')}${rg('nd-s', '#8ae0c8', '#1a8a78')}${rg('nd-l', '#c8d0e8', '#4a5a88')}</defs>
${shadow}
<path d="M70 182l-8 8h26l-2-14zM112 176l-2 14h26l-6-8z" fill="#f6f0e4" ${OUT}/><path d="M64 188h22M112 188h22" stroke="#ff3d9a" stroke-width="3"/>
<path d="M76 150h20v28H76zM104 150h20v28h-20z" fill="#5a5a78" ${OUT}/>
<ellipse cx="100" cy="128" rx="54" ry="44" fill="url(#nd-s)" ${OUT}/>
<path d="M86 96l14 12 14-12" fill="#f6f0e4" ${OUT}/>
<path d="M88 114l-8 6 8 6M112 114l8 6-8 6M104 112l-8 18" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M120 116h22v22h-22z" fill="#f6f0e4" ${OUT}/><path d="M124 108v12M130 106v14M136 108v12" stroke="#1c5fd0" stroke-width="3"/><path d="M124 108v-1M130 106v-1" stroke="#ff3d9a" stroke-width="3"/>
<path d="M62 150c10 10 66 10 76 0v8c-10 10-66 10-76 0z" fill="#120e18"/><rect x="92" y="148" width="16" height="12" fill="#c8c0d8" ${OUT}/>
<!-- left arm: laptop on a blue screen of death -->
<path d="M58 118c-10 6-12 18-8 28l12-4c-2-6 0-12 4-14z" fill="url(#nd-s)" ${OUT}/>
<g class="limb"><rect x="14" y="108" width="46" height="34" rx="3" fill="#c8c0d8" ${OUT}/><rect x="19" y="113" width="36" height="24" fill="#1c5fd0"/><path d="M24 120h26M24 126h20M24 132h14" stroke="#f6f0e4" stroke-width="2.5"/><path d="M8 144h58l-4 8H12z" fill="#8a94a8" ${OUT}/></g>
<circle cx="56" cy="148" r="8" fill="url(#nd-f)" ${OUT}/>
<!-- right arm: finger up -->
<path d="M140 118c10 2 14 10 12 20l-12 0c2-6 0-10-6-12z" fill="url(#nd-s)" ${OUT}/>
<g class="limb"><circle cx="152" cy="142" r="9" fill="url(#nd-f)" ${OUT}/><rect x="148" y="108" width="8" height="30" rx="4" fill="url(#nd-f)" ${OUT}/></g>
<!-- head: wild hair, taped glasses, pimples, braces -->
<circle cx="100" cy="70" r="40" fill="url(#nd-f)" ${OUT}/>
<path d="M60 62c-4-24 12-42 40-42s44 18 40 42c-6-10-14-14-22-14-6 8-20 8-26 0-12 0-20 6-32 14z" fill="#6a3a1a" ${OUT}/>
<g ${OUT}><circle cx="84" cy="70" r="15" fill="#e0f0ff"/><circle cx="116" cy="70" r="15" fill="#e0f0ff"/></g><path d="M99 70h2" stroke="#120e18" stroke-width="4"/><path d="M96 66l8 6" stroke="#f6f0e4" stroke-width="4"/><path d="M96 66l8 6" stroke="#8a8468" stroke-width="1.5"/>
<g class="eye" fill="#120e18"><circle cx="86" cy="72" r="4"/><circle cx="114" cy="72" r="4"/></g>
<path d="M68 52l16 4M132 52l-16 4" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<g fill="#e04a4a"><circle cx="72" cy="88" r="2.5"/><circle cx="130" cy="86" r="2.5"/><circle cx="124" cy="94" r="2"/></g>
<path d="M82 92c10 10 26 10 36 0z" fill="#120e18" ${OUT}/><path d="M84 93h32v4H86z" fill="#f6f0e4"/><path d="M84 95h32" stroke="#c8c0d8" stroke-width="2.5" stroke-dasharray="2 3"/>`;

/** Chief Happiness Officer: a round pink imp in a party hat, little horns, a grin stretched far too wide and a pizza box held high, confetti everywhere. */
const happinessOfficer = `
<defs>${rg('ho-b', '#ffb8dc', '#c0206a')}${rg('ho-h', '#ffec6a', '#e08a00')}</defs>
${shadow}
<g fill="#ffd900" ${OUT}><rect x="22" y="30" width="8" height="8" transform="rotate(20 26 34)"/><rect x="170" y="60" width="8" height="8" transform="rotate(-20 174 64)"/><rect x="30" y="100" width="8" height="8" transform="rotate(40 34 104)"/></g><g fill="#9ab8f0" ${OUT}><rect x="168" y="22" width="8" height="8" transform="rotate(-30 172 26)"/><rect x="14" y="66" width="8" height="8" transform="rotate(30 18 70)"/></g>
<path d="M170 132c14 4 20-8 14-20" stroke="#ff3d9a" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M70 182l-8 8h28l-2-14zM110 176l-2 14h28l-6-8z" fill="#ffd900" ${OUT}/>
<ellipse cx="100" cy="134" rx="56" ry="46" fill="url(#ho-b)" ${OUT}/>
<path d="M62 124c12 10 28 14 38 14s26-4 38-14" fill="none" stroke="#f6f0e4" stroke-width="5"/>
<g fill="#ffd900" ${OUT}><circle cx="88" cy="150" r="5"/><circle cx="112" cy="156" r="5"/><circle cx="100" cy="168" r="4"/></g>
<!-- both arms up, pizza box on top -->
<path d="M52 130c-14-6-20-24-14-40l12 2c-2 12 2 22 10 28z" fill="url(#ho-b)" ${OUT}/><path d="M148 130c14-6 20-24 14-40l-12 2c2 12-2 22-10 28z" fill="url(#ho-b)" ${OUT}/>
<g class="limb"><rect x="30" y="64" width="140" height="22" rx="3" fill="#c9a060" ${OUT}/><rect x="30" y="64" width="140" height="8" fill="#e0b878"/><circle cx="100" cy="75" r="7" fill="#ff3d9a" opacity="0"/><path d="M76 72l6 6 8-8M110 72h20" stroke="#ff3d9a" stroke-width="4" fill="none"/></g>
<circle cx="38" cy="88" r="9" fill="url(#ho-b)" ${OUT}/><circle cx="162" cy="88" r="9" fill="url(#ho-b)" ${OUT}/>
<!-- head -->
<path d="M64 64l-10-22 22 10zM136 64l10-22-22 10z" fill="#ffd900" ${OUT}/>
<circle cx="100" cy="46" r="0" fill="none"/>
<path d="M76 62c0-24 10-42 24-42s24 18 24 42z" fill="url(#ho-h)" ${OUT}/><path d="M80 52l40 6M82 38l32 6" stroke="#ff3d9a" stroke-width="5"/><circle cx="100" cy="18" r="7" fill="#ff3d9a" ${OUT}/>
<ellipse cx="100" cy="86" rx="38" ry="30" fill="url(#ho-b)" ${OUT}/>
<g ${OUT}><circle cx="84" cy="80" r="10" fill="#f6f0e4"/><circle cx="116" cy="80" r="10" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="82" r="4"/><circle cx="118" cy="82" r="4"/></g>
<path d="M66 100c6 22 62 22 68 0z" fill="#120e18" ${OUT}/><path d="M72 102h56v6H74zM80 112c10 6 30 6 40 0z" fill="#f6f0e4"/><path d="M80 102v6M90 102v6M100 102v6M110 102v6M120 102v6" stroke="#120e18" stroke-width="2"/>
<circle cx="70" cy="94" r="5" fill="#ff3d9a" opacity=".6"/><circle cx="130" cy="94" r="5" fill="#ff3d9a" opacity=".6"/>`;

/** Wellness Coach: a round blue spirit floating in lotus pose over a yoga mat, sweatband on, eyes serenely shut, a green smoothie hovering at hand. */
const wellnessCoach = `
<defs>${rg('wc-b', '#c8e8ff', '#2a6ad8')}${rg('wc-m', '#9af0d0', '#1a9a78')}${rg('wc-s', '#d8ff9a', '#5aa81a')}</defs>
${shadow}
<ellipse cx="100" cy="182" rx="76" ry="10" fill="url(#wc-m)" ${OUT}/><path d="M40 182h120" stroke="#f6f0e4" stroke-width="2" opacity=".6"/>
<!-- smoothie -->
<g class="limb"><path d="M150 120h24l-4 40h-16z" fill="url(#wc-s)" ${OUT}/><path d="M150 120h24l-1 6h-22z" fill="#f6f0e4" ${OUT}/><path d="M166 120l6-18h8" stroke="#120e18" stroke-width="4" fill="none"/><circle cx="162" cy="140" r="4" fill="#ff3d9a"/></g>
<!-- crossed legs and a wispy tail -->
<path d="M100 150c-30 6-50 16-50 26 8 4 30 0 50-6 20 6 42 10 50 6 0-10-20-20-50-26z" fill="url(#wc-b)" ${OUT}/>
<path d="M60 170c14 4 28 4 40-2 12 6 26 6 40 2" stroke="#2a6ad8" stroke-width="3" fill="none" opacity=".6"/>
<ellipse cx="100" cy="126" rx="44" ry="42" fill="url(#wc-b)" ${OUT}/>
<path d="M62 130c16 12 60 12 76 0" stroke="#f6f0e4" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
<!-- arms resting on the knees, fingers in a mudra -->
<path d="M62 116c-12 10-16 26-10 40l14-4c-4-10-2-20 6-28z" fill="url(#wc-b)" ${OUT}/><circle cx="56" cy="158" r="9" fill="url(#wc-b)" ${OUT}/><circle cx="56" cy="158" r="4" fill="none" stroke="#120e18" stroke-width="2.5"/>
<path d="M138 116c12 10 16 26 10 40l-14-4c4-10 2-20-6-28z" fill="url(#wc-b)" ${OUT}/><circle cx="144" cy="158" r="9" fill="url(#wc-b)" ${OUT}/><circle cx="144" cy="158" r="4" fill="none" stroke="#120e18" stroke-width="2.5"/>
<!-- head: topknot, sweatband, shut eyes, tiny smile -->
<circle cx="100" cy="58" r="12" fill="url(#wc-b)" ${OUT}/><circle cx="100" cy="30" r="14" fill="url(#wc-b)" ${OUT}/>
<circle cx="100" cy="72" r="38" fill="url(#wc-b)" ${OUT}/>
<path d="M62 62c12-6 26-8 38-8s26 2 38 8v12c-12-6-26-8-38-8s-26 2-38 8z" fill="#ff3d9a" ${OUT}/><path d="M72 64h56" stroke="#f6f0e4" stroke-width="3"/>
<path d="M74 82c6 6 14 6 20 0M106 82c6 6 14 6 20 0" stroke="#120e18" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M88 98c8 6 16 6 24 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="72" cy="92" r="5" fill="#ff8ac8" opacity=".6"/><circle cx="128" cy="92" r="5" fill="#ff8ac8" opacity=".6"/>
<g class="eye" fill="#f6f0e4" ${OUT}><circle cx="100" cy="40" r="0"/></g>`;

/** Exaggerated Girl: a sleek, impossibly elegant colleague with huge glossy hair, a red pencil skirt and heels, one hand on her hip and a phone held out for the next selfie, duck-face and a pose that is a little too much. */
const exaggeratedGirl = `
<defs>${rg('eg-h', '#8a4ad0', '#1a0a50')}${rg('eg-f', '#fff0e0', '#e0a890')}${rg('eg-r', '#ff6a8a', '#a0102a')}${rg('eg-t', '#fbf6e6', '#b8b0d0')}</defs>
${shadow}
<g fill="#ffd900" ${OUT}><path d="M164 24l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M26 56l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>
<!-- big glossy hair -->
<path d="M44 80c-6-46 20-66 56-66s62 20 56 66c-2 40-10 66-22 78l-12-70H78l-12 70C54 146 46 120 44 80z" fill="url(#eg-h)" ${OUT}/>
<path d="M70 34c10-6 24-8 36-6" stroke="#c8a0f8" stroke-width="4" fill="none" stroke-linecap="round"/>
<!-- legs and heels -->
<path d="M82 152h14v28H82zM106 152h14l-2 28h-12z" fill="url(#eg-f)" ${OUT}/>
<path d="M74 190l8-12 14 2-4 10zM108 190l4-10 14-2 8 12z" fill="url(#eg-r)" ${OUT}/><path d="M76 190v-2M124 190v-2" stroke="#120e18" stroke-width="3"/>
<!-- pencil skirt and tiny top -->
<path d="M70 124h60l-6 34H76z" fill="url(#eg-r)" ${OUT}/><path d="M88 128v28M112 128v28" stroke="#a0102a" stroke-width="2" opacity=".6"/>
<path d="M72 98c8-6 18-8 28-8s20 2 28 8l2 26H70z" fill="url(#eg-t)" ${OUT}/><path d="M86 94l14 10 14-10" fill="url(#eg-f)" ${OUT}/>
<!-- hand on hip (left), phone out for the selfie (right) -->
<path d="M70 102c-12 8-18 20-10 32l10-10c2 0 4 0 6 2" fill="none" stroke="#120e18" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 102c-12 8-18 20-10 32l10-10" fill="none" stroke="url(#eg-f)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<g class="limb"><path d="M130 102c14-6 26-18 32-36" stroke="#120e18" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M130 102c14-6 26-18 32-36" stroke="url(#eg-f)" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="156" y="40" width="22" height="34" rx="4" fill="#120e18" ${OUT}/><rect x="160" y="45" width="14" height="24" fill="#ff8ac8"/><circle cx="167" cy="56" r="4" fill="#fff" opacity=".7"/></g>
<!-- head: huge lashes, duck-face -->
<circle cx="100" cy="62" r="34" fill="url(#eg-f)" ${OUT}/>
<path d="M66 56c4-24 20-34 34-34s30 10 34 34c-8-12-20-18-34-18-8 0-18 4-24 10 0 0 2 8-10 8z" fill="url(#eg-h)" ${OUT}/>
<g ${OUT}><ellipse cx="86" cy="64" rx="10" ry="9" fill="#f6f0e4"/><ellipse cx="114" cy="64" rx="10" ry="9" fill="#f6f0e4"/></g>
<g class="eye" fill="#8a4ad0"><circle cx="88" cy="65" r="5"/><circle cx="116" cy="65" r="5"/></g><g fill="#120e18"><circle cx="88" cy="65" r="2.5"/><circle cx="116" cy="65" r="2.5"/></g>
<path d="M74 58l-6-6M78 54l-4-7M94 54l4-7M106 54l-4-7M122 54l4-7M126 58l6-6" stroke="#120e18" stroke-width="3" stroke-linecap="round"/>
<path d="M78 50c6-4 14-4 18 0M104 50c6-4 14-4 18 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M90 82c4-5 16-5 20 0-2 6-18 6-20 0z" fill="#ff3d9a" ${OUT}/><path d="M92 82h16" stroke="#a0102a" stroke-width="2"/>
<circle cx="74" cy="76" r="6" fill="#ff8ac8" opacity=".6"/><circle cx="126" cy="76" r="6" fill="#ff8ac8" opacity=".6"/>`;

/** Bean Counter: a round brown mole in shirtsleeves and a green visor, thick glasses, punching an adding machine that spits out a long curling receipt. */
const beanCounter = `
<defs>${rg('bc-b', '#c8946a', '#5a3418')}${rg('bc-s', '#fbf6e6', '#b8b098')}${rg('bc-m', '#9ab8f0', '#2a4fa0')}</defs>
${shadow}
<!-- receipt tape curling to the floor -->
<path d="M146 112c14 0 20 10 16 22s-4 22 6 28c-8 14-26 6-22-8 4-14-4-22-14-22z" fill="#f6f0e4" ${OUT}/><path d="M154 126h8M156 140h8M152 152h10" stroke="#120e18" stroke-width="2"/>
<path d="M70 182l-8 8h26l-2-14zM112 176l-2 14h26l-6-8z" fill="#ff8ac8" ${OUT}/>
<ellipse cx="100" cy="132" rx="52" ry="46" fill="url(#bc-s)" ${OUT}/>
<path d="M62 150c10 16 66 16 76 0v8c-10 18-66 18-76 0z" fill="#5a3418" ${OUT}/>
<path d="M86 96l14 14 14-14" fill="none" stroke="#120e18" stroke-width="3"/><path d="M96 108h8l3 30-7 6-7-6z" fill="#2a8a4a" ${OUT}/>
<path d="M62 124c18 10 58 10 76 0" stroke="#120e18" stroke-width="10" fill="none" stroke-linecap="round" opacity="0"/>
<g fill="#5a3418" ${OUT}><path d="M72 112h6v36h-6zM122 112h6v36h-6z"/></g>
<!-- adding machine -->
<g class="limb"><rect x="116" y="130" width="46" height="40" rx="5" fill="url(#bc-m)" ${OUT}/><rect x="122" y="136" width="34" height="10" fill="#c8f0a0" ${OUT}/><path d="M126 141h14" stroke="#120e18" stroke-width="3"/><g fill="#f6f0e4" ${OUT}><rect x="122" y="152" width="8" height="6"/><rect x="134" y="152" width="8" height="6"/><rect x="146" y="152" width="8" height="6"/><rect x="122" y="161" width="8" height="6"/><rect x="134" y="161" width="8" height="6"/><rect x="146" y="161" width="8" height="6" fill="#ff3d9a"/></g></g>
<path d="M142 118c-8 6-8 16-4 24l12-4c-2-4-2-8 2-12z" fill="url(#bc-s)" ${OUT}/><circle cx="144" cy="150" r="8" fill="url(#bc-b)" ${OUT}/>
<path d="M58 116c-10 6-12 18-6 28l12-4c-2-6 0-12 4-14z" fill="url(#bc-s)" ${OUT}/><circle cx="58" cy="148" r="8" fill="url(#bc-b)" ${OUT}/><path d="M52 154l-4 6M58 156v7M64 154l4 6" stroke="#f6f0e4" stroke-width="3" stroke-linecap="round"/>
<!-- head: little ears, snout, thick glasses, visor -->
<circle cx="64" cy="50" r="12" fill="url(#bc-b)" ${OUT}/><circle cx="136" cy="50" r="12" fill="url(#bc-b)" ${OUT}/>
<circle cx="100" cy="74" r="40" fill="url(#bc-b)" ${OUT}/>
<ellipse cx="100" cy="92" rx="18" ry="14" fill="#e0b890" ${OUT}/><ellipse cx="100" cy="86" rx="10" ry="7" fill="#ff8ac8" ${OUT}/>
<path d="M92 98l3 8h10l3-8" fill="#f6f0e4" ${OUT}/><path d="M100 98v8" stroke="#120e18" stroke-width="2"/>
<g ${OUT}><circle cx="84" cy="68" r="16" fill="#e0f0ff"/><circle cx="116" cy="68" r="16" fill="#e0f0ff"/></g><path d="M100 68h0" stroke="#120e18" stroke-width="4"/>
<g class="eye" fill="#120e18"><circle cx="86" cy="70" r="3.5"/><circle cx="114" cy="70" r="3.5"/></g>
<path d="M72 62c4-4 8-4 12-2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M58 42c4-10 20-16 42-16s38 6 42 16c-10-2-26-4-42-4s-32 2-42 4z" fill="#2a8a4a" ${OUT}/><path d="M56 44c-4 4-2 8 6 8h76c8 0 10-4 6-8-14-4-30-6-44-6s-30 2-44 6z" fill="#3ab85a" ${OUT}/>`;

/** Compliance Officer: a one-eyed ogre in a yellow hard hat and an orange hi-vis vest, checklist in one hand, a giant rubber stamp raised in the other, about to reject something. */
const complianceOfficer = `
<defs>${rg('co-b', '#c8a0f0', '#5a2aa0')}${rg('co-v', '#ffb060', '#d05a10')}${rg('co-h', '#fff08a', '#e0a000')}${glow('co-g', '#ff3b3b')}</defs>
${shadow}
<path d="M70 182l-8 8h28l-2-14zM112 176l-2 14h28l-6-8z" fill="#120e18" ${OUT}/>
<path d="M72 150h24v28H72zM108 150h24v28h-24z" fill="#3a3450" ${OUT}/>
<ellipse cx="100" cy="128" rx="56" ry="46" fill="url(#co-b)" ${OUT}/>
<path d="M62 110c8-10 18-14 30-14l4 70c-12 4-24 2-34-6-4-14-4-34 0-50zM138 110c-8-10-18-14-30-14l-4 70c12 4 24 2 34-6 4-14 4-34 0-50z" fill="url(#co-v)" ${OUT}/>
<path d="M62 134h34M104 134h34M64 154h32M104 154h32" stroke="#f6f0e4" stroke-width="7"/>
<!-- checklist (left) -->
<path d="M58 116c-10 6-14 18-8 28l12-4c-2-6-2-12 2-16z" fill="url(#co-b)" ${OUT}/>
<rect x="14" y="104" width="38" height="54" fill="#c9a060" ${OUT}/><rect x="19" y="114" width="28" height="40" fill="#f6f0e4"/><rect x="23" y="100" width="14" height="8" fill="#120e18"/>
<path d="M24 122l3 3 5-6M24 134l3 3 5-6M24 146l3 3 5-6" stroke="#2ac84a" stroke-width="2.5" fill="none"/><path d="M36 124h8M36 136h8M36 148h8" stroke="#120e18" stroke-width="2.5"/>
<circle cx="56" cy="148" r="9" fill="url(#co-b)" ${OUT}/>
<!-- stamp (right) -->
<path d="M142 116c12 0 20-8 22-22l-12-4c-2 8-6 12-14 12z" fill="url(#co-b)" ${OUT}/>
<g class="limb"><path d="M150 54h26v14h-26z" fill="#6a3a1a" ${OUT}/><path d="M158 68h10v14h-10z" fill="#6a3a1a" ${OUT}/><rect x="144" y="82" width="38" height="14" rx="2" fill="#ff3d9a" ${OUT}/><rect x="144" y="96" width="38" height="5" fill="#c02a80"/></g>
<circle cx="164" cy="98" r="0" fill="none"/>
<!-- head: horns, hard hat, one big eye, tusks -->
<path d="M66 54l-14-20 24 8zM134 54l14-20-24 8z" fill="#f6f0e4" ${OUT}/>
<circle cx="100" cy="72" r="40" fill="url(#co-b)" ${OUT}/>
<path d="M62 62c0-24 16-38 38-38s38 14 38 38z" fill="url(#co-h)" ${OUT}/><path d="M58 62h84c0 6-4 8-10 8H68c-6 0-10-2-10-8z" fill="#e0a000" ${OUT}/><rect x="92" y="14" width="16" height="12" rx="3" fill="url(#co-h)" ${OUT}/>
<ellipse cx="100" cy="82" rx="24" ry="18" fill="#f6f0e4" ${OUT}/>
<g class="eye"><circle cx="100" cy="82" r="13" fill="#ffd900"/><circle cx="100" cy="82" r="6" fill="#120e18"/><circle cx="96" cy="78" r="2.5" fill="#fff"/></g>
<path d="M72 74l24 4M128 74l-24 4" stroke="#120e18" stroke-width="6" stroke-linecap="round"/>
<path d="M72 106c10 8 46 8 56 0v6c-10 8-46 8-56 0z" fill="#120e18" ${OUT}/><path d="M80 106l4 10 5-8M111 108l5 8 4-10" fill="#f6f0e4" ${OUT}/>`;

/** The Veteran: a round mummy who has worked here since forever, a brown cardigan, a cane, thick glasses and a "#1" mug, bandages unravelling. */
const veteran = `
<defs>${rg('vt-b', '#fbf6e6', '#b8ac8a')}${rg('vt-c', '#c8946a', '#5a3418')}</defs>
${shadow}
<path d="M72 182l-8 8h26l-2-14zM112 176l-2 14h26l-6-8z" fill="#3a3450" ${OUT}/>
<path d="M76 150h20v28H76zM104 150h20v28h-20z" fill="url(#vt-b)" ${OUT}/><path d="M76 160h20M76 170h20M104 160h20M104 170h20" stroke="#8a7e5a" stroke-width="2"/>
<ellipse cx="100" cy="130" rx="54" ry="44" fill="url(#vt-c)" ${OUT}/>
<path d="M100 92v82" stroke="#120e18" stroke-width="3"/><g fill="#ffd900" ${OUT}><circle cx="92" cy="110" r="4"/><circle cx="92" cy="130" r="4"/><circle cx="92" cy="150" r="4"/></g>
<path d="M82 94l18 14 18-14" fill="#e8e0f8" ${OUT}/><path d="M96 106h8l3 34-7 6-7-6z" fill="#ff3d9a" ${OUT}/>
<path d="M118 120h22v22h-22z" fill="#a07848" ${OUT}/>
<g fill="#fff" opacity=".0"><circle cx="0" cy="0" r="0"/></g>
<!-- bandage trail -->
<path d="M62 160c-12 4-20 12-18 24 8 0 12-6 14-10" fill="none" stroke="#120e18" stroke-width="9" stroke-linecap="round"/><path d="M62 160c-12 4-20 12-18 24 8 0 12-6 14-10" fill="none" stroke="#fbf6e6" stroke-width="5" stroke-linecap="round"/>
<!-- left: #1 mug -->
<path d="M58 116c-10 6-14 18-8 28l12-4c-2-6-2-12 2-16z" fill="url(#vt-c)" ${OUT}/>
<g class="limb"><rect x="18" y="130" width="28" height="30" fill="#f6f0e4" ${OUT}/><path d="M46 138h8c6 0 6 14 0 14h-8" fill="none" stroke="#120e18" stroke-width="3"/><path d="M26 140l4-4v18M36 140h6M36 148h6" stroke="#ff3d9a" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M26 126c-3-4 3-6 0-10M36 126c-3-4 3-6 0-10" stroke="#f6f0e4" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<circle cx="50" cy="148" r="9" fill="url(#vt-b)" ${OUT}/>
<!-- right: cane -->
<path d="M142 118c12 6 16 16 14 26l-12 0c2-8 0-14-8-18z" fill="url(#vt-c)" ${OUT}/>
<g class="limb"><path d="M158 190V142c0-14 22-14 22 0" fill="none" stroke="#120e18" stroke-width="9" stroke-linecap="round"/><path d="M158 190V142c0-14 22-14 22 0" fill="none" stroke="#c9a060" stroke-width="4.5" stroke-linecap="round"/></g>
<circle cx="152" cy="146" r="9" fill="url(#vt-b)" ${OUT}/>
<!-- bandaged head, thick glasses -->
<circle cx="100" cy="68" r="38" fill="url(#vt-b)" ${OUT}/>
<path d="M64 52c20-8 52-8 72 0M62 68c24-8 54-8 76 0M66 84c22-6 46-6 68 0" stroke="#8a7e5a" stroke-width="3" fill="none"/><path d="M62 52c-10-2-14 6-8 12M138 84c10 4 14 12 6 14" stroke="#120e18" stroke-width="3" fill="none"/>
<path d="M72 58h56v22H72z" fill="#120e18"/>
<g ${OUT}><circle cx="86" cy="68" r="14" fill="#e0f0ff"/><circle cx="114" cy="68" r="14" fill="#e0f0ff"/></g><path d="M100 68h0" stroke="#120e18" stroke-width="4"/>
<g class="eye" fill="#120e18"><circle cx="88" cy="70" r="4"/><circle cx="112" cy="70" r="4"/></g><path d="M76 64c4-4 8-4 12-2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M88 92c8 4 16 4 24 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>`;

/** Night Janitor: a hooded wraith with glowing yellow eyes and a wispy hem, a mop and a bucket, a ring of keys at his belt; the light bulb above him is dead. */
const nightJanitor = `
<defs>${rg('nj-c', '#6a5ab0', '#14103a')}${rg('nj-k', '#e8e0f8', '#7a70a8')}${glow('nj-g', '#ffd900')}</defs>
${shadow}
<!-- dead bulb on its cord -->
<path d="M160 0v22" stroke="#120e18" stroke-width="3"/><rect x="154" y="20" width="12" height="8" fill="#3a3450" ${OUT}/><circle cx="160" cy="40" r="12" fill="#c8c0d8" opacity=".5" stroke="#120e18" stroke-width="3"/><path d="M155 38l5 6 5-6" stroke="#120e18" stroke-width="2" fill="none"/>
<!-- bucket -->
<path d="M140 150h36l-4 36h-28z" fill="#ffd900" ${OUT}/><ellipse cx="158" cy="150" rx="18" ry="5" fill="#4a86e0" ${OUT}/><path d="M142 162h32" stroke="#120e18" stroke-width="3"/><path d="M142 150c0-14 34-14 34 0" fill="none" stroke="#120e18" stroke-width="3"/>
<!-- the mop -->
<g class="limb"><path d="M42 40l22 150" stroke="#120e18" stroke-width="9" stroke-linecap="round"/><path d="M42 40l22 150" stroke="#c9a060" stroke-width="4.5" stroke-linecap="round"/><path d="M52 150c-14 6-24 22-16 38h46c8-16-2-34-16-40z" fill="#e8e0f8" ${OUT}/><path d="M44 164v22M54 160v26M64 160v26M74 164v22" stroke="#8a80b8" stroke-width="2.5"/></g>
<!-- wispy cloak -->
<path d="M50 184c-6-50 10-86 50-90 40 4 56 40 50 90-8 6-12-2-18 4-4 6-10 0-16 6-6-6-10-2-16 0-6-6-12 0-16-6-6-6-12 2-18-4z" fill="url(#nj-c)" ${OUT}/>
<path d="M100 100v80" stroke="#14103a" stroke-width="3" opacity=".6"/>
<rect x="64" y="144" width="72" height="8" fill="#120e18"/><circle cx="130" cy="156" r="9" fill="none" stroke="#c8c0d8" stroke-width="4"/><path d="M122 164l-4 10h6zM136 164l4 10h-6z" fill="#ffd900" ${OUT}/>
<path d="M58 118c-8 8-10 20-6 30l12-4c-2-8 0-16 4-20z" fill="url(#nj-c)" ${OUT}/><circle cx="56" cy="150" r="9" fill="url(#nj-k)" ${OUT}/>
<path d="M142 118c8 8 10 18 6 28l-12-4c2-8 0-14-4-18z" fill="url(#nj-c)" ${OUT}/><circle cx="144" cy="148" r="9" fill="url(#nj-k)" ${OUT}/>
<!-- hood, empty dark face, two glowing eyes, a hint of a smile -->
<path d="M56 98c-6-44 8-80 44-84 36 4 50 40 44 84-14 12-74 12-88 0z" fill="url(#nj-c)" ${OUT}/>
<path d="M68 90c-4-30 6-52 32-54 26 2 36 24 32 54-12 8-52 8-64 0z" fill="#0c0818"/>
${eyes(86, 114, 66, 6, '#ffd900', 'nj-g')}
<path d="M84 90c10 8 22 8 32 0" stroke="#e8e0f8" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="3 4"/>`;

/** The Micromanager: a floating eye-tyrant in a headset and tie, every stalk-eye on your work. */
const micromanager = `
<defs>${rg('mm-b', '#ff9ad0', '#8a1a5a')}${glow('mm-g', '#ff3b3b')}</defs>
${shadow}
<path d="M94 162h12l8 26H86z" fill="#1c5fd0" ${OUT}/>
<g class="limb" fill="none" stroke-linecap="round">
<path d="M66 70C48 50 44 30 50 14M84 56c-6-18-2-34 10-44M116 56c6-18 2-34-10-44M134 70c18-20 22-40 16-56M152 98c20-6 32 2 38 16M48 98c-20-6-32 2-38 16" stroke="#120e18" stroke-width="11"/>
<path d="M66 70C48 50 44 30 50 14M84 56c-6-18-2-34 10-44M116 56c6-18 2-34-10-44M134 70c18-20 22-40 16-56M152 98c20-6 32 2 38 16M48 98c-20-6-32 2-38 16" stroke="#e0408a" stroke-width="5"/>
</g>
<g fill="#f6f0e4" ${OUT}><circle cx="50" cy="14" r="10"/><circle cx="94" cy="12" r="10"/><circle cx="106" cy="12" r="10"/><circle cx="150" cy="14" r="10"/><circle cx="190" cy="114" r="10"/><circle cx="10" cy="114" r="10"/></g>
<g class="eye" fill="#ff3b3b"><circle cx="52" cy="16" r="4"/><circle cx="94" cy="14" r="4"/><circle cx="106" cy="14" r="4"/><circle cx="148" cy="16" r="4"/><circle cx="188" cy="116" r="4"/><circle cx="12" cy="116" r="4"/></g>
<circle cx="100" cy="108" r="58" fill="url(#mm-b)" ${OUT}/>
<path d="M44 100c0-38 24-60 56-60s56 22 56 60" stroke="#120e18" stroke-width="7" fill="none"/>
<rect x="36" y="92" width="14" height="28" fill="#1b1830" ${OUT}/><path d="M42 120c0 16 14 26 30 26" stroke="#120e18" stroke-width="4" fill="none"/><rect x="70" y="142" width="12" height="8" fill="#1b1830"/>
<ellipse cx="100" cy="100" rx="30" ry="24" fill="#f6f0e4" ${OUT}/>
<g class="eye"><circle cx="100" cy="100" r="14" fill="#ff3b3b"/><circle cx="100" cy="100" r="6" fill="#120e18"/><circle cx="95" cy="95" r="3" fill="#fff"/></g>
<path d="M64 80l26 10M136 80l-26 10" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
<path d="M74 134c12 14 40 14 52 0z" fill="#1b1830" ${OUT}/><path d="M80 136l4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6" stroke="#f6f0e4" stroke-width="2.5" fill="none"/>`;

/** Work Wife: a pale ghost girl in a pink cardigan, bow in her hair and a too-wide smile, heart eyes, a #1 mug in one hand and her boxes moving in with you. */
const workWife = `
<defs>${rg('ww-c', '#ffb0dc', '#c02a80')}${rg('ww-s', '#fbf4ff', '#a898d8')}${rg('ww-h', '#8a4ad0', '#2a1060')}${glow('ww-g', '#ff3d9a')}</defs>
${shadow}
<!-- boxes -->
<rect x="8" y="148" width="60" height="40" fill="#d8b070" ${OUT}/><path d="M8 160h60M38 148v12" stroke="#8a5a2a" stroke-width="4"/>
<rect x="16" y="116" width="44" height="32" fill="#e8c080" ${OUT}/><path d="M16 126h44M38 116v10" stroke="#8a5a2a" stroke-width="4"/><path d="M40 110c-5-3-7-6-4-9 2-2 4-1 4 1 1-2 3-3 5-1 2 3 0 6-5 9z" fill="#ff3d9a" ${OUT}/>
<!-- ghost body: wavy hem and a big cardigan -->
<path d="M52 186c-4-8 0-14 8-12 4-10 12-10 16 0 4-8 12-8 16 0 4-8 12-8 16 0 4-8 12-8 16 0 4-10 12-10 16 0 8-2 12 4 8 12 8-60-12-86-50-86S44 126 52 186z" fill="url(#ww-s)" ${OUT}/>
<path d="M54 160c-6-20 0-44 22-52l24 14 24-14c22 8 28 32 22 52-12 10-28 14-46 14s-34-4-46-14z" fill="url(#ww-c)" ${OUT}/>
<path d="M100 122v52" stroke="#120e18" stroke-width="3"/><g fill="#ffd900" ${OUT}><circle cx="92" cy="136" r="4"/><circle cx="92" cy="154" r="4"/></g>
<path d="M74 116l26 14 26-14" fill="#f6f0e4" ${OUT}/>
<!-- arms: hugging her box and holding the mug -->
<path d="M58 132c-8 4-10 14-6 22l12-2c-2-4 0-8 4-10z" fill="url(#ww-c)" ${OUT}/><circle cx="58" cy="152" r="8" fill="url(#ww-s)" ${OUT}/>
<g class="limb"><path d="M142 128c12 0 20 6 22 14l-10 4c-2-4-6-6-12-6z" fill="url(#ww-c)" ${OUT}/><rect x="152" y="108" width="26" height="30" fill="#f6f0e4" ${OUT}/><path d="M178 114c10 0 10 16 0 16" stroke="#120e18" stroke-width="4" fill="none"/><path d="M165 130c-6-4-8-8-5-11 2-2 4-1 5 1 1-2 3-3 5-1 3 3 1 7-5 11z" fill="#ff3d9a"/></g>
<!-- head: long dark hair, huge bow, heart eyes, too-wide smile -->
<path d="M58 66c0-32 16-50 42-50s42 18 42 50v40c-8 8-18 8-26 0V72H84v34c-8 8-18 8-26 0z" fill="url(#ww-h)" ${OUT}/>
<circle cx="100" cy="68" r="36" fill="url(#ww-s)" ${OUT}/>
<path d="M66 60c4-24 18-34 34-34s30 10 34 34c-10-12-20-14-26-14l-8 10-8-10c-8 0-18 2-26 14z" fill="url(#ww-h)" ${OUT}/>
<path d="M100 22l-26-14v28zM100 22l26-14v28z" fill="#ff3d9a" ${OUT}/><circle cx="100" cy="22" r="7" fill="#ffd900" ${OUT}/>
<g class="eye"><circle cx="84" cy="70" r="11" fill="url(#ww-g)"/><circle cx="116" cy="70" r="11" fill="url(#ww-g)"/><path d="M84 78c-8-5-10-10-6-13 2-2 5-1 6 1 1-2 4-3 6-1 4 3 2 8-6 13zM116 78c-8-5-10-10-6-13 2-2 5-1 6 1 1-2 4-3 6-1 4 3 2 8-6 13z" fill="#ff3d9a" stroke="#120e18" stroke-width="2"/></g>
<path d="M78 88c12 12 32 12 44 0z" fill="#120e18" ${OUT}/><path d="M82 90h36l-4 5H86z" fill="#f6f0e4"/>
<circle cx="72" cy="84" r="5" fill="#ff8ac8"/><circle cx="128" cy="84" r="5" fill="#ff8ac8"/>`;

/** The Leaver: a round red imp on his last day, badge already cut in two, a resignation letter in one claw and a lit bomb in the other, whistling. */
const leaver = `
<defs>${rg('lv-b', '#ff9a8a', '#a01a1a')}${rg('lv-s', '#8a9ab0', '#2a3a58')}${glow('lv-g', '#ffd900')}</defs>
${shadow}
<path d="M70 182l-8 8h26l-2-14zM112 176l-2 14h26l-6-8z" fill="#120e18" ${OUT}/>
<path d="M76 150h20v28H76zM104 150h20v28h-20z" fill="url(#lv-s)" ${OUT}/>
<ellipse cx="100" cy="130" rx="46" ry="42" fill="url(#lv-s)" ${OUT}/>
<path d="M86 96l14 14 14-14" fill="#f6f0e4" ${OUT}/><path d="M98 108h4l2 26-4 4-4-4z" fill="#ffd900" ${OUT}/>
<!-- cut badge on a lanyard -->
<path d="M78 98l14 40M122 98l-14 40" stroke="#1c5fd0" stroke-width="3"/><g transform="rotate(-12 86 150)"><rect x="76" y="140" width="12" height="16" fill="#f6f0e4" ${OUT}/></g><g transform="rotate(14 112 154)"><rect x="106" y="144" width="12" height="16" fill="#f6f0e4" ${OUT}/></g>
<!-- left claw: resignation letter -->
<path d="M62 116c-12 4-16 16-12 26l12-2c-2-6 0-12 6-14z" fill="url(#lv-s)" ${OUT}/>
<g transform="rotate(-8 34 136)"><rect x="14" y="108" width="40" height="52" fill="#f6f0e4" ${OUT}/><path d="M20 120h28M20 128h28M20 136h18" stroke="#120e18" stroke-width="3"/><path d="M22 150c6-6 8 2 14-2" stroke="#1c5fd0" stroke-width="2.5" fill="none"/></g>
<circle cx="56" cy="146" r="8" fill="url(#lv-b)" ${OUT}/>
<!-- right claw: a lit bomb -->
<path d="M140 116c12 4 18 14 16 24l-12 0c2-8-2-12-8-14z" fill="url(#lv-s)" ${OUT}/>
<g class="limb"><circle cx="164" cy="142" r="20" fill="#2a2a48" ${OUT}/><path d="M154 132c4-4 8-6 12-6" stroke="#8a8ab8" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="158" y="116" width="12" height="8" fill="#6d6680" ${OUT}/><path d="M164 116c0-8 6-10 10-14" stroke="#120e18" stroke-width="3" fill="none"/><path d="M174 98l4 4 6-8-8 2 2-8-6 6z" fill="#ffd900" ${OUT}/></g>
<circle cx="150" cy="144" r="8" fill="url(#lv-b)" ${OUT}/>
<!-- head: horns, grin -->
<path d="M64 52l-14-26 28 10zM136 52l14-26-28 10z" fill="#1b1830" ${OUT}/>
<circle cx="100" cy="70" r="38" fill="url(#lv-b)" ${OUT}/>
<g ${OUT}><ellipse cx="86" cy="66" rx="9" ry="8" fill="#f6f0e4"/><ellipse cx="114" cy="66" rx="9" ry="8" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="88" cy="68" r="3.5"/><circle cx="116" cy="68" r="3.5"/></g>
<path d="M72 54l20 6M128 54l-20 6" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<path d="M78 86c8 12 36 12 44 0z" fill="#120e18" ${OUT}/><path d="M84 88l4 7 4-6 4 7 4-6 4 7 4-6 4 7" stroke="#f6f0e4" stroke-width="3" fill="none"/>
<path d="M134 90c4 4 8 4 12 0" stroke="#120e18" stroke-width="3" fill="none"/>`;

/** Contract Lawyer: a round green crocodile in a pinstripe suit, a briefcase in one claw and a contract (fine print and all) in the other, grinning with far too many teeth. */
const contractLawyer = `
<defs>${rg('cl-b', '#a8e070', '#2a6a28')}${rg('cl-s', '#5a5a90', '#14143a')}${rg('cl-c', '#c8864a', '#6a3a1a')}</defs>
${shadow}
<path d="M148 150c26 0 40 16 36 34-10-6-22-10-36-8z" fill="url(#cl-b)" ${OUT}/><path d="M164 162l6 6M172 166l4 6" stroke="#2a6a28" stroke-width="3"/>
<path d="M70 182l-8 8h28l-2-14zM112 178l-2 12h28l-6-8z" fill="#120e18" ${OUT}/>
<ellipse cx="100" cy="134" rx="54" ry="46" fill="url(#cl-s)" ${OUT}/>
<path d="M72 106v70M86 98v78M114 98v78M128 106v70" stroke="#8a8ad0" stroke-width="2" opacity=".6"/>
<path d="M82 96l18 22 18-22z" fill="#f6f0e4" ${OUT}/><path d="M96 108h8l4 34-8 6-8-6z" fill="#ff3d9a" ${OUT}/><rect x="124" y="122" width="14" height="10" fill="#f6f0e4" ${OUT}/>
<!-- left claw: briefcase -->
<path d="M58 116c-10 8-12 20-8 30l12-4c-2-8 0-14 6-18z" fill="url(#cl-s)" ${OUT}/>
<g class="limb"><rect x="14" y="140" width="46" height="34" rx="4" fill="url(#cl-c)" ${OUT}/><rect x="30" y="134" width="14" height="8" fill="none" stroke="#120e18" stroke-width="3"/><rect x="33" y="152" width="8" height="8" fill="#ffd900" ${OUT}/></g>
<circle cx="54" cy="148" r="8" fill="url(#cl-b)" ${OUT}/>
<!-- right claw: the contract -->
<path d="M142 116c12 6 16 14 14 24l-12 0c0-6-2-10-8-14z" fill="url(#cl-s)" ${OUT}/>
<g class="limb"><rect x="146" y="86" width="40" height="56" fill="#f6f0e4" ${OUT}/><path d="M152 96h28M152 102h28M152 108h20" stroke="#120e18" stroke-width="3"/><path d="M152 118h28M152 122h28M152 126h28M152 130h20" stroke="#120e18" stroke-width="1.5"/><path d="M158 138c4-6 8 2 14-4" stroke="#1c5fd0" stroke-width="2.5" fill="none"/></g>
<circle cx="146" cy="140" r="8" fill="url(#cl-b)" ${OUT}/>
<!-- head: long snout full of teeth, bulging eyes, slick hair -->
<circle cx="76" cy="46" r="15" fill="url(#cl-b)" ${OUT}/><circle cx="124" cy="46" r="15" fill="url(#cl-b)" ${OUT}/>
<path d="M54 74c0-24 20-32 46-32s46 8 46 32v14c0 10-8 18-18 18H72c-10 0-18-8-18-18z" fill="url(#cl-b)" ${OUT}/>
<g ${OUT}><circle cx="76" cy="44" r="10" fill="#fff08a"/><circle cx="124" cy="44" r="10" fill="#fff08a"/></g><g class="eye" fill="#120e18"><rect x="74" y="36" width="4" height="16" rx="2"/><rect x="122" y="36" width="4" height="16" rx="2"/></g>
<path d="M62 30c10-8 28-10 38-4 10-6 28-4 38 4-10-2-26-2-38 6-12-8-28-8-38-6z" fill="#120e18" ${OUT}/>
<circle cx="90" cy="64" r="2.5" fill="#120e18"/><circle cx="110" cy="64" r="2.5" fill="#120e18"/>
<path d="M62 82c16 14 60 14 76 0v14c-16 12-60 12-76 0z" fill="#120e18" ${OUT}/>
<path d="M66 84l4 8 4-6 4 8 4-6 4 8 4-6 4 8 4-6 4 8 4-6 4 8 4-6 4 8 4-6 4 8" stroke="#f6f0e4" stroke-width="3" fill="none" stroke-linejoin="round"/>`;

/** Outgoing VP: a heavy orange ogre in a burgundy suit, gold chain and cigar, a golden parachute pack on his back and a bag of severance in his fist, grinning on his way out. */
const outgoingVp = `
<defs>${rg('vp-s', '#d8506a', '#4a0a20')}${rg('vp-f', '#ffc080', '#c8602a')}${rg('vp-g', '#fff08a', '#c88a00')}</defs>
${shadow}
<!-- golden parachute pack -->
<path d="M50 90c0-44 30-72 50-72s50 28 50 72z" fill="url(#vp-g)" ${OUT}/><path d="M100 18v72M76 26l-14 64M124 26l14 64" stroke="#8a5a00" stroke-width="3" fill="none"/>
<path d="M62 90l24 30M138 90l-24 30" stroke="#120e18" stroke-width="4"/>
<path d="M74 182l-6 8h28l-2-14zM106 176l-2 14h28l-6-8z" fill="#120e18" ${OUT}/>
<ellipse cx="100" cy="136" rx="58" ry="48" fill="url(#vp-s)" ${OUT}/>
<path d="M100 100v84" stroke="#120e18" stroke-width="3"/><path d="M70 110v70M130 110v70" stroke="#ff8a9a" stroke-width="2" opacity=".5"/>
<path d="M82 98l18 24 18-24z" fill="#f6f0e4" ${OUT}/><path d="M96 112h8l4 36-8 6-8-6z" fill="#ffd900" ${OUT}/>
<path d="M66 108c4 28 20 40 34 40s30-12 34-40" fill="none" stroke="#120e18" stroke-width="10" stroke-linecap="round"/><path d="M66 108c4 28 20 40 34 40s30-12 34-40" fill="none" stroke="#ffd900" stroke-width="5" stroke-dasharray="6 3" stroke-linecap="round"/>
<circle cx="100" cy="150" r="9" fill="#ffd900" ${OUT}/>
<!-- left fist: severance bag -->
<path d="M52 118c-12 8-16 22-12 32l14-4c-2-8 0-14 6-18z" fill="url(#vp-s)" ${OUT}/>
<g class="limb"><path d="M18 150c0-12 8-16 18-16s18 4 18 16c4 10 2 28-18 28S14 160 18 150z" fill="url(#vp-g)" ${OUT}/><path d="M26 134l-4-8h28l-4 8z" fill="#8a5a00" ${OUT}/><path d="M36 146v20M30 150c0-4 12-4 12 0s-12 6-12 10 12 4 12 0" stroke="#8a5a00" stroke-width="3" fill="none"/></g>
<circle cx="50" cy="150" r="10" fill="url(#vp-f)" ${OUT}/>
<path d="M148 118c12 6 16 16 14 26l-12 0c2-8 0-12-8-16z" fill="url(#vp-s)" ${OUT}/><circle cx="156" cy="146" r="10" fill="url(#vp-f)" ${OUT}/>
<!-- head: tusks, cigar, sunglasses up on the forehead -->
<circle cx="100" cy="72" r="40" fill="url(#vp-f)" ${OUT}/>
<path d="M60 70l-14-6 6 14zM140 70l14-6-6 14z" fill="url(#vp-f)" ${OUT}/>
<path d="M66 50c10-14 56-14 68 0-8-4-18-6-34-6s-26 2-34 6z" fill="#e0e0e0" ${OUT}/>
<g ${OUT}><ellipse cx="84" cy="66" rx="9" ry="6" fill="#f6f0e4"/><ellipse cx="116" cy="66" rx="9" ry="6" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="67" r="3.5"/><circle cx="114" cy="67" r="3.5"/></g>
<path d="M72 54l20 4M128 54l-20 4" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="100" cy="82" rx="9" ry="6" fill="#e0804a" ${OUT}/>
<path d="M74 94c14 14 38 14 52 0z" fill="#120e18" ${OUT}/><path d="M78 96l6 12 6-10M110 98l6 10 6-12" fill="#f6f0e4" ${OUT}/>
<path d="M120 100l34-12" stroke="#120e18" stroke-width="10" stroke-linecap="round"/><path d="M120 100l34-12" stroke="#8a5a2a" stroke-width="6" stroke-linecap="round"/><circle cx="158" cy="87" r="5" fill="#ff8a1e" ${OUT}/>
<path d="M164 78c-4-6 2-10-2-16" stroke="#c8c0d8" stroke-width="3" fill="none" stroke-linecap="round"/>`;

/** The Graveyard Intern: a hooded intern asleep on his feet at 3 a.m., drool on his chin, lanyard swinging, an empty jumbo coffee in one fist. */
const graveyardIntern = `
<defs>${rg('gi-h', '#7a8ae0', '#1c2a70')}${rg('gi-f', '#fff0e0', '#d8a08a')}</defs>
${shadow}
<g class="eye" fill="#f6f0e4" ${OUT}><path d="M138 34h16v5l-10 11h10v5h-16v-5l10-11h-10z"/><path d="M162 8h22v6l-14 15h14v6h-22v-6l14-15h-14z"/></g>
<path d="M70 182l-8 8h26l-2-14zM112 176l-2 14h26l-6-8z" fill="#f6f0e4" ${OUT}/>
<path d="M76 150h20v28H76zM104 150h20v28h-20z" fill="#3a3450" ${OUT}/>
<ellipse cx="100" cy="132" rx="52" ry="44" fill="url(#gi-h)" ${OUT}/>
<path d="M76 100c4 8 14 12 24 12s20-4 24-12" stroke="#120e18" stroke-width="3" fill="none"/><path d="M88 108v16M112 108v16" stroke="#f6f0e4" stroke-width="3"/>
<path d="M70 140h60v20H70z" fill="#4a5ac8" ${OUT}/><path d="M100 140v20" stroke="#120e18" stroke-width="2"/>
<!-- swinging lanyard and badge -->
<path d="M82 100l14 40M118 100l-14 40" stroke="#ff3d9a" stroke-width="3"/><g transform="rotate(14 100 150)"><rect x="88" y="138" width="24" height="20" rx="2" fill="#f6f0e4" ${OUT}/><rect x="92" y="142" width="8" height="8" fill="#ff3d9a"/><path d="M103 144h6M103 150h6" stroke="#120e18" stroke-width="2"/></g>
<!-- limp arm and a jumbo empty coffee -->
<path d="M58 118c-10 8-12 22-6 34l12-4c-2-8 0-16 4-22z" fill="url(#gi-h)" ${OUT}/><circle cx="56" cy="154" r="8" fill="url(#gi-f)" ${OUT}/>
<path d="M142 118c10 6 14 14 12 24l-12 0c2-6 0-10-6-14z" fill="url(#gi-h)" ${OUT}/>
<g class="limb"><path d="M146 116h36l-5 54h-26z" fill="#f6f0e4" ${OUT}/><path d="M146 116h36l-1 10h-34z" fill="#ff3d9a" ${OUT}/><path d="M164 116l4-18h10" stroke="#120e18" stroke-width="4" fill="none"/><path d="M152 138h24M152 150h24" stroke="#8a5a2a" stroke-width="3"/></g>
<circle cx="150" cy="146" r="9" fill="url(#gi-f)" ${OUT}/>
<!-- hood, sleepy face, drool -->
<path d="M56 74c0-34 18-54 44-54s44 20 44 54c0 14-8 22-12 24H68c-4-2-12-10-12-24z" fill="url(#gi-h)" ${OUT}/>
<ellipse cx="100" cy="76" rx="32" ry="32" fill="url(#gi-f)" ${OUT}/>
<path d="M72 58c4-14 16-20 28-20s24 6 28 20c-10-6-18-8-28-8s-18 2-28 8z" fill="#2a2a48" ${OUT}/>
<path d="M76 74c6 6 14 6 20 0M104 74c6 6 14 6 20 0" stroke="#120e18" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M76 84c4 6 10 6 14 0M110 84c4 6 10 6 14 0" stroke="#8a4ad0" stroke-width="3" fill="none" opacity=".7"/>
<ellipse cx="100" cy="94" rx="8" ry="6" fill="#120e18" ${OUT}/><path d="M100 98c0 10 0 16 3 18 3-2 3-8 2-18z" fill="#bfeaff" ${OUT}/>
<circle cx="76" cy="88" r="5" fill="#ff8ac8" opacity=".5"/><circle cx="124" cy="88" r="5" fill="#ff8ac8" opacity=".5"/>`;

/** The Rate Limiter: a rack-mounted router with a stop sign for a face, antennas up, a row of angry red status lights and port teeth. */
const rateLimiter = `
<defs>${rg('rl-b', '#8a94c8', '#14183a')}${rg('rl-s', '#ff7a7a', '#a00a0a')}${glow('rl-g', '#ff3b3b')}</defs>
${shadow}
<path d="M70 52L50 14M130 52l20-38" stroke="#120e18" stroke-width="7" stroke-linecap="round"/><path d="M70 52L50 14M130 52l20-38" stroke="#8a94a8" stroke-width="3" stroke-linecap="round"/>
<circle cx="50" cy="12" r="9" fill="#ff3b3b" ${OUT}/><circle cx="150" cy="12" r="9" fill="#ff3b3b" ${OUT}/>
<g class="limb" fill="none" stroke-linecap="round"><path d="M92 176c-10 12-4 16 10 14M108 176c10 12 4 16-10 14" stroke="#120e18" stroke-width="9"/><path d="M92 176c-10 12-4 16 10 14M108 176c10 12 4 16-10 14" stroke="#2ac8e8" stroke-width="4"/></g>
<rect x="38" y="174" width="30" height="14" rx="3" fill="#3a3450" ${OUT}/><rect x="132" y="174" width="30" height="14" rx="3" fill="#3a3450" ${OUT}/>
<!-- rack unit with rack ears -->
<rect x="14" y="50" width="172" height="126" rx="18" fill="url(#rl-b)" ${OUT}/>
<rect x="6" y="60" width="14" height="106" rx="4" fill="#8a94a8" ${OUT}/><rect x="180" y="60" width="14" height="106" rx="4" fill="#8a94a8" ${OUT}/>
<g fill="#120e18"><circle cx="13" cy="76" r="3"/><circle cx="13" cy="150" r="3"/><circle cx="187" cy="76" r="3"/><circle cx="187" cy="150" r="3"/></g>
<!-- stop-sign face -->
<path d="M72 54h56l24 24v44l-24 24H72l-24-24V78z" fill="url(#rl-s)" ${OUT}/>
<path d="M76 62h48l18 18v40l-18 18H76l-18-18V80z" fill="none" stroke="#f6f0e4" stroke-width="3"/>
<g ${OUT}><ellipse cx="84" cy="88" rx="10" ry="9" fill="#f6f0e4"/><ellipse cx="116" cy="88" rx="10" ry="9" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="90" r="4"/><circle cx="114" cy="90" r="4"/></g>
<path d="M70 74l26 10M130 74l-26 10" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
<rect x="76" y="106" width="48" height="18" rx="3" fill="#120e18" ${OUT}/><path d="M84 106v18M92 106v18M100 106v18M108 106v18M116 106v18" stroke="#f6f0e4" stroke-width="3"/>
<!-- status lights and ports -->
<g ${OUT}><circle cx="30" cy="148" r="5" fill="#ff3b3b"/><circle cx="44" cy="148" r="5" fill="#ff3b3b"/><circle cx="156" cy="148" r="5" fill="#ff3b3b"/><circle cx="170" cy="148" r="5" fill="#ff3b3b"/></g>
<g fill="#120e18" ${OUT}><rect x="64" y="154" width="14" height="10"/><rect x="84" y="154" width="14" height="10"/><rect x="104" y="154" width="14" height="10"/><rect x="124" y="154" width="14" height="10"/></g>`;

/** The Line Lead: a bristling, stocky foreman in a yellow hard hat and orange coveralls, a whistle between his teeth, a big moustache and one boot up on the line. */
const lineLead = `
<defs>${rg('ll-f', '#ffd8b0', '#c88a60')}${rg('ll-o', '#ffb060', '#d05a10')}${rg('ll-h', '#fff08a', '#e0a000')}</defs>
${shadow}
<!-- a bit of conveyor under the boot -->
<rect x="4" y="170" width="192" height="18" rx="4" fill="#3a3450" ${OUT}/><path d="M16 178h168" stroke="#8a94a8" stroke-width="4" stroke-dasharray="10 8"/><rect x="150" y="150" width="30" height="20" fill="#c9a060" ${OUT}/>
<path d="M72 150h22v22H72z" fill="url(#ll-o)" ${OUT}/><path d="M104 148l26-8 6 14-28 10z" fill="url(#ll-o)" ${OUT}/>
<path d="M66 174l-8 10h34v-12zM122 140l28 8-6 18-28-6z" fill="#120e18" ${OUT}/>
<ellipse cx="100" cy="124" rx="56" ry="42" fill="url(#ll-o)" ${OUT}/>
<path d="M100 88v68" stroke="#120e18" stroke-width="3"/><g fill="#ffd900" ${OUT}><circle cx="92" cy="104" r="3"/><circle cx="92" cy="124" r="3"/></g>
<path d="M62 126h38M104 126h38M62 142h38M104 142h38" stroke="#f6f0e4" stroke-width="6"/>
<rect x="60" y="150" width="80" height="10" fill="#120e18"/>
<!-- left arm: pointing at you -->
<path d="M62 106c-16 0-28 8-34 22l10 8c4-8 12-12 22-12z" fill="url(#ll-o)" ${OUT}/><g class="limb"><circle cx="26" cy="134" r="9" fill="url(#ll-f)" ${OUT}/><rect x="6" y="118" width="26" height="9" rx="4" fill="url(#ll-f)" ${OUT}/></g>
<!-- right arm on the hip -->
<path d="M138 106c14 2 22 12 20 26l-10-2c0-8-4-12-12-14z" fill="url(#ll-o)" ${OUT}/><circle cx="154" cy="136" r="9" fill="url(#ll-f)" ${OUT}/>
<!-- head: hard hat, bushy brows, whistle -->
<circle cx="100" cy="68" r="38" fill="url(#ll-f)" ${OUT}/>
<path d="M60 58c0-24 16-38 40-38s40 14 40 38z" fill="url(#ll-h)" ${OUT}/><path d="M56 58h88c0 6-4 8-10 8H66c-6 0-10-2-10-8z" fill="#e0a000" ${OUT}/><rect x="90" y="14" width="20" height="12" rx="3" fill="url(#ll-h)" ${OUT}/><path d="M96 20h8" stroke="#120e18" stroke-width="3"/>
<g ${OUT}><ellipse cx="84" cy="74" rx="9" ry="7" fill="#f6f0e4"/><ellipse cx="116" cy="74" rx="9" ry="7" fill="#f6f0e4"/></g>
<g class="eye" fill="#120e18"><circle cx="86" cy="75" r="4"/><circle cx="114" cy="75" r="4"/></g>
<path d="M68 62l26 10M132 62l-26 10" stroke="#6a3a10" stroke-width="8" stroke-linecap="round"/>
<ellipse cx="100" cy="86" rx="8" ry="6" fill="#e0904a" ${OUT}/>
<path d="M66 96c10-8 22-8 34 0 12-8 24-8 34 0-4 12-16 14-22 8-4 4-16 4-24 0-6 6-18 4-22-8z" fill="#6a3a10" ${OUT}/>
<rect x="94" y="102" width="14" height="10" rx="5" fill="#c8c0d8" ${OUT}/><path d="M112 104l10-2M112 108l12 4M110 100l8-8" stroke="#120e18" stroke-width="2.5" stroke-linecap="round"/>`;

/** The VIP Client: a pompous elven noble in a green velvet robe with an ermine collar, a gold crown and a monocle glinting, a scepter raised in one hand and a purse of coins in the other. */
const vipClient = `
<defs>${rg('vc-r', '#4ac860', '#0a4a22')}${rg('vc-f', '#fff0e0', '#e0a890')}${rg('vc-g', '#fff08a', '#c88a00')}${rg('vc-w', '#ffffff', '#b8b0d0')}</defs>
${shadow}
<path d="M72 184l-8 6h28l-2-12zM110 178l-2 12h28l-6-6z" fill="#8a4a1a" ${OUT}/>
<path d="M40 188c-8-52 6-90 60-92 54 2 68 40 60 92z" fill="url(#vc-r)" ${OUT}/>
<path d="M100 96v92" stroke="url(#vc-g)" stroke-width="10"/><path d="M100 96v92" stroke="#120e18" stroke-width="2"/>
<g fill="url(#vc-g)" ${OUT}><circle cx="100" cy="116" r="5"/><circle cx="100" cy="140" r="5"/><circle cx="100" cy="164" r="5"/></g>
<!-- ermine collar -->
<path d="M58 106c6-12 22-18 42-18s36 6 42 18c-10 12-28 18-42 18s-32-6-42-18z" fill="url(#vc-w)" ${OUT}/><g fill="#120e18"><path d="M70 104l2 6 2-6zM90 112l2 6 2-6zM110 112l2 6 2-6zM130 104l2 6 2-6z"/></g>
<!-- left: purse of coins -->
<path d="M58 124c-12 6-16 18-12 28l14-4c-2-6 0-12 6-16z" fill="url(#vc-r)" ${OUT}/>
<g class="limb"><path d="M18 154c0-12 8-16 18-16s18 4 18 16c4 10 2 24-18 24S14 164 18 154z" fill="#c8864a" ${OUT}/><path d="M26 138l-4-8h28l-4 8z" fill="#6a3a1a" ${OUT}/><circle cx="36" cy="156" r="8" fill="url(#vc-g)" ${OUT}/><path d="M36 150v12" stroke="#8a5a00" stroke-width="2.5"/></g>
<circle cx="52" cy="152" r="8" fill="url(#vc-f)" ${OUT}/>
<!-- right: scepter -->
<path d="M142 124c12 0 18-8 20-20l-12-2c-2 8-6 12-12 12z" fill="url(#vc-r)" ${OUT}/>
<g class="limb"><rect x="160" y="40" width="8" height="120" rx="3" fill="url(#vc-g)" ${OUT}/><circle cx="164" cy="30" r="14" fill="#ff3d9a" ${OUT}/><circle cx="164" cy="30" r="14" fill="none" stroke="url(#vc-g)" stroke-width="4"/><circle cx="160" cy="26" r="3.5" fill="#fff" opacity=".8"/></g>
<circle cx="164" cy="108" r="8" fill="url(#vc-f)" ${OUT}/>
<!-- head: long ears, a long nose in the air, monocle, crown -->
<path d="M62 70L24 52l28 30zM138 70l38-18-28 30z" fill="url(#vc-f)" ${OUT}/>
<circle cx="100" cy="68" r="36" fill="url(#vc-f)" ${OUT}/>
<path d="M92 70c-2 10 2 20 10 22 4 0 6-2 6-4-6 0-8-4-6-10z" fill="#ffc8a0" ${OUT}/>
<path d="M64 38l8 14 14-14 14 14 14-14 14 14 8-14 6 24H58z" fill="url(#vc-g)" ${OUT}/><circle cx="72" cy="52" r="0" fill="none"/><g fill="#ff3d9a" ${OUT}><circle cx="86" cy="42" r="4"/><circle cx="114" cy="42" r="4"/></g>
<path d="M62 62h76v6H62z" fill="url(#vc-g)" ${OUT}/>
<g ${OUT}><ellipse cx="84" cy="76" rx="8" ry="5" fill="#f6f0e4"/><ellipse cx="116" cy="76" rx="8" ry="5" fill="#f6f0e4"/></g>
<g class="eye" fill="#1c5fd0"><circle cx="86" cy="77" r="3"/><circle cx="118" cy="77" r="3"/></g>
<path d="M70 72h28M102 72h28" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<circle cx="116" cy="76" r="13" fill="none" stroke="#ffd900" stroke-width="3"/><path d="M126 86c6 8 8 14 8 22" stroke="#ffd900" stroke-width="2" fill="none"/>
<path d="M82 98c8-3 16-3 24 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M82 100l-4 8c4 4 8 2 10-2" stroke="#e0e0e0" stroke-width="4" fill="none" stroke-linecap="round" opacity="0"/>`;

/** The Helpdesk Chatbot: a speech bubble on wheels with a headset, a screen for a face with glowing eyes and a grin that is slightly too wide, ticket notifications floating about. */
const helpdeskChatbot = `
<defs>${rg('hd-b', '#ffffff', '#a8b0d8')}${rg('hd-s', '#4a6ad8', '#0a1048')}${glow('hd-g', '#5aff9a')}</defs>
${shadow}
<!-- notifications -->
<g class="limb"><circle cx="166" cy="40" r="12" fill="#ff3d9a" ${OUT}/><path d="M166 34v8M166 46v1" stroke="#f6f0e4" stroke-width="3.5" stroke-linecap="round"/><circle cx="30" cy="48" r="9" fill="#ffd900" ${OUT}/><path d="M30 44v6" stroke="#120e18" stroke-width="3" stroke-linecap="round"/></g>
<!-- wheels -->
<circle cx="68" cy="178" r="12" fill="#3a3450" ${OUT}/><circle cx="68" cy="178" r="4" fill="#c8c0d8"/><circle cx="132" cy="178" r="12" fill="#3a3450" ${OUT}/><circle cx="132" cy="178" r="4" fill="#c8c0d8"/>
<!-- the bubble body with its tail -->
<path d="M30 80c0-34 30-52 70-52s70 18 70 52v34c0 28-24 44-70 44-12 0-22-2-30-4l-28 16 6-26c-10-8-18-20-18-30z" fill="url(#hd-b)" ${OUT}/>
<!-- headset -->
<path d="M44 82c0-34 24-48 56-48s56 14 56 48" fill="none" stroke="#120e18" stroke-width="9"/><path d="M44 82c0-34 24-48 56-48s56 14 56 48" fill="none" stroke="#ff3d9a" stroke-width="4"/>
<rect x="34" y="76" width="16" height="30" rx="7" fill="#ff3d9a" ${OUT}/><rect x="150" y="76" width="16" height="30" rx="7" fill="#ff3d9a" ${OUT}/>
<path d="M40 104c0 20 14 30 36 34" stroke="#120e18" stroke-width="4" fill="none"/><circle cx="80" cy="138" r="6" fill="#120e18" ${OUT}/>
<!-- screen face -->
<rect x="56" y="62" width="88" height="64" rx="12" fill="#120e18" ${OUT}/><rect x="61" y="67" width="78" height="54" rx="8" fill="url(#hd-s)"/>
<g class="eye"><circle cx="82" cy="90" r="14" fill="url(#hd-g)"/><circle cx="118" cy="90" r="14" fill="url(#hd-g)"/><circle cx="82" cy="90" r="7" fill="#5aff9a"/><circle cx="118" cy="90" r="7" fill="#5aff9a"/></g>
<path d="M72 106c8 14 48 14 56 0z" fill="#5aff9a" ${OUT}/><path d="M80 108v6M90 108v8M100 108v8M110 108v8M120 108v6" stroke="#120e18" stroke-width="2"/>
<path d="M66 72h18" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<!-- little arms -->
<path d="M30 126c-12 2-16 12-8 20l12-6z" fill="url(#hd-b)" ${OUT}/><path d="M170 126c12 2 16 12 8 20l-12-6z" fill="url(#hd-b)" ${OUT}/>`;

/** The Punch Clock: a chunky wall clock-in machine with a clock dial for a forehead, a time-card slot for a mouth, a lever for an arm and a card poking out like a tongue. */
const punchClock = `
<defs>${rg('pc-b', '#c8d8f0', '#3a56a0')}${rg('pc-d', '#ffffff', '#c8c0d8')}${glow('pc-g', '#ff3d9a')}</defs>
${shadow}
<path d="M62 176l-8 14h28l-2-14zM118 176l-2 14h28l-6-14z" fill="#3a3450" ${OUT}/>
<rect x="30" y="22" width="140" height="160" rx="20" fill="url(#pc-b)" ${OUT}/>
<g fill="#120e18"><circle cx="42" cy="34" r="3"/><circle cx="158" cy="34" r="3"/><circle cx="42" cy="170" r="3"/><circle cx="158" cy="170" r="3"/></g>
<!-- clock dial forehead -->
<circle cx="100" cy="62" r="30" fill="url(#pc-d)" ${OUT}/><circle cx="100" cy="62" r="24" fill="none" stroke="#120e18" stroke-width="2" stroke-dasharray="2 6"/>
<path d="M100 62V44M100 62l14 8" stroke="#120e18" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="62" r="4" fill="#ff3d9a" ${OUT}/>
<!-- eyes as little displays -->
<rect x="48" y="104" width="38" height="28" rx="6" fill="#120e18" ${OUT}/><rect x="114" y="104" width="38" height="28" rx="6" fill="#120e18" ${OUT}/>
<g class="eye"><circle cx="67" cy="118" r="14" fill="url(#pc-g)"/><circle cx="133" cy="118" r="14" fill="url(#pc-g)"/><circle cx="67" cy="118" r="8" fill="#ff3d9a"/><circle cx="133" cy="118" r="8" fill="#ff3d9a"/><circle cx="67" cy="118" r="3.5" fill="#120e18"/><circle cx="133" cy="118" r="3.5" fill="#120e18"/></g>
<path d="M44 96l38 10M156 96l-38 10" stroke="#120e18" stroke-width="6" stroke-linecap="round"/>
<!-- time-card slot mouth with a card -->
<rect x="56" y="148" width="88" height="18" rx="4" fill="#120e18" ${OUT}/><path d="M64 148l4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8" stroke="#f6f0e4" stroke-width="3" fill="none"/>
<g class="limb"><rect x="76" y="150" width="46" height="34" fill="#f6f0e4" ${OUT}/><path d="M82 158h34M82 166h34M82 174h20" stroke="#1c5fd0" stroke-width="2.5"/><rect x="82" y="152" width="12" height="4" fill="#ff3d9a"/></g>
<!-- lever arm -->
<g class="limb"><path d="M172 96c14 0 22-8 24-22" stroke="#120e18" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M172 96c14 0 22-8 24-22" stroke="#8a94a8" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="196" cy="70" r="9" fill="#ff3d9a" ${OUT}/></g>`;

/** The Smoke Detector: a ceiling disc dangling by its wires, one big red eye, vents like a ring of teeth and a nine-volt battery swinging from a lead, beeping. */
const smokeDetector = `
<defs>${rg('sd-b', '#ffffff', '#a8b0d0')}${glow('sd-g', '#ff3b3b')}</defs>
<rect x="0" y="0" width="200" height="18" fill="#3a3450" ${OUT}/><path d="M0 8h200" stroke="#6d6680" stroke-width="3" stroke-dasharray="14 6"/>
${shadow}
<path d="M84 18c-6 14 6 22-2 38M100 18v34M116 18c6 14-6 22 2 38" stroke="#120e18" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M84 18c-6 14 6 22-2 38M100 18v34M116 18c6 14-6 22 2 38" stroke="#ff3d9a" stroke-width="3" fill="none" stroke-linecap="round"/>
<g class="limb" fill="none" stroke="#120e18" stroke-width="4" stroke-linecap="round"><path d="M22 60c-8 6-8 14 0 20M12 54c-14 10-14 28 0 38M178 60c8 6 8 14 0 20M188 54c14 10 14 28 0 38"/></g>
<!-- the disc -->
<ellipse cx="100" cy="104" rx="74" ry="62" fill="url(#sd-b)" ${OUT}/>
<ellipse cx="100" cy="104" rx="56" ry="46" fill="none" stroke="#8a94b8" stroke-width="3" stroke-dasharray="10 6"/>
<ellipse cx="100" cy="104" rx="38" ry="31" fill="#120e18" ${OUT}/>
<g class="eye"><circle cx="100" cy="104" r="30" fill="url(#sd-g)"/><circle cx="100" cy="104" r="19" fill="#ff3b3b" ${OUT}/><circle cx="100" cy="104" r="8" fill="#120e18"/><circle cx="94" cy="98" r="4" fill="#fff"/></g>
<path d="M54 76l32 14M146 76l-32 14" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
<path d="M60 150c14 10 66 10 80 0" stroke="#120e18" stroke-width="4" fill="none"/><path d="M70 152v8M82 156v8M94 158v8M106 158v8M118 156v8M130 152v8" stroke="#120e18" stroke-width="4" stroke-linecap="round"/>
<circle cx="150" cy="140" r="6" fill="#ff3b3b" ${OUT}/><circle cx="50" cy="140" r="6" fill="#ffd900" ${OUT}/>
<!-- swinging 9V battery -->
<g class="limb"><path d="M152 162c10 6 14 14 12 22" stroke="#120e18" stroke-width="3" fill="none"/><g transform="rotate(16 168 178)"><rect x="154" y="176" width="28" height="22" rx="3" fill="#2a2a48" ${OUT}/><rect x="154" y="176" width="28" height="8" fill="#ffd900" ${OUT}/><circle cx="162" cy="172" r="3.5" fill="#c8c0d8" ${OUT}/><circle cx="174" cy="172" r="3.5" fill="#c8c0d8" ${OUT}/><path d="M162 190h12" stroke="#f6f0e4" stroke-width="3"/></g></g>`;

/** The Microwave: an old break-room microwave, its window a dark mouth full of fangs with hungry eyes, a smear of old lasagna on the door and sparks in the corners. */
const microwave = `
<defs>${rg('mw-b', '#fbf6e6', '#a89f84')}${rg('mw-w', '#4a3a6a', '#0a0818')}${glow('mw-g', '#ffd900')}</defs>
${shadow}
<path d="M44 176l-6 14h26l-2-14zM136 176l-2 14h26l-6-14z" fill="#3a3450" ${OUT}/>
<g class="eye" fill="#ffd900" ${OUT}><path d="M24 28l12 8-6 4 12 10-14-4 4-4-10-6z"/><path d="M178 20l-12 10 6 2-10 12 14-6-4-4 10-6z"/><path d="M178 148l-10 6 6 4-10 8 14-4-4-4 8-4z"/></g>
<rect x="14" y="52" width="172" height="130" rx="22" fill="url(#mw-b)" ${OUT}/>
<!-- door window as a mouth -->
<rect x="26" y="64" width="108" height="106" rx="16" fill="#120e18" ${OUT}/><rect x="32" y="70" width="96" height="94" rx="12" fill="url(#mw-w)"/>
<g class="eye"><circle cx="64" cy="100" r="16" fill="url(#mw-g)"/><circle cx="102" cy="100" r="16" fill="url(#mw-g)"/><circle cx="64" cy="100" r="9" fill="#ffd900"/><circle cx="102" cy="100" r="9" fill="#ffd900"/><circle cx="64" cy="100" r="3.5" fill="#120e18"/><circle cx="102" cy="100" r="3.5" fill="#120e18"/></g>
<path d="M44 86l32 10M120 86l-32 10" stroke="#120e18" stroke-width="6" stroke-linecap="round"/>
<path d="M40 124c14 14 62 14 76 0v26c-14 10-62 10-76 0z" fill="#120e18" ${OUT}/><path d="M44 126l6 12 6-10 6 12 6-10 6 12 6-10 6 12 6-10 6 12 6-10 6 12" fill="#f6f0e4" stroke="#120e18" stroke-width="2" stroke-linejoin="round"/>
<path d="M50 148l8-8 8 8 8-8 8 8 8-8 8 8 8-8" stroke="#f6f0e4" stroke-width="3" fill="none"/>
<path d="M36 74c6-4 14-4 20 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
<!-- lasagna smear -->
<path d="M110 150c8-6 16-2 14 6s-12 8-14 2z" fill="#e0502a" ${OUT}/>
<!-- control panel -->
<rect x="142" y="64" width="38" height="106" rx="8" fill="#c8c0a8" ${OUT}/>
<rect x="148" y="72" width="26" height="14" fill="#120e18" ${OUT}/><path d="M152 79h8" stroke="#ff3b3b" stroke-width="3"/>
<g fill="#ffd900" ${OUT}><rect x="148" y="94" width="12" height="9"/><rect x="162" y="94" width="12" height="9"/></g><g fill="#2a8ae8" ${OUT}><rect x="148" y="108" width="12" height="9"/><rect x="162" y="108" width="12" height="9"/></g><g fill="#ff3d9a" ${OUT}><rect x="148" y="122" width="12" height="9"/><rect x="162" y="122" width="12" height="9"/></g>
<circle cx="161" cy="152" r="10" fill="#8a94a8" ${OUT}/><path d="M161 144v8" stroke="#120e18" stroke-width="3"/>`;

/** The Withered Ficus: a big dried-out office plant in a pink pot, drooping brown leaves, spikes and a sour face. */
const witheredFicus = `
<defs>${glow('wf-g', '#ff3d9a')}${rg('wf-p', '#ff8ac8', '#d4287a')}</defs>
${shadow}
<path d="M100 120C80 90 50 80 24 92c8 6 12 14 12 24-8-2-14 2-18 8 22 6 52 4 82-4zM100 120c20-30 50-40 76-28-8 6-12 14-12 24 8-2 14 2 18 8-22 6-52 4-82-4z" fill="#8a6a2a" ${OUT}/>
<path d="M100 120C86 84 72 54 76 22c14 18 22 38 24 98zM100 120c14-36 28-66 24-98-14 18-22 38-24 98z" fill="#5a8a3a" ${OUT}/>
<path d="M100 120c-4-30-2-60 0-88 2 28 4 58 0 88z" fill="#8aaa4a" ${OUT}/>
<g class="limb" fill="#8a6a2a" ${OUT}><path d="M22 150l24-10-4 14zM178 150l-24-10 4 14zM62 100l-8-14 12 4zM138 100l8-14-12 4z"/></g>
<path d="M54 126h92l-10 54c-1 6-6 8-12 8H76c-6 0-11-2-12-8z" fill="url(#wf-p)" ${OUT}/>
<rect x="48" y="118" width="104" height="16" rx="3" fill="#ff3d9a" ${OUT}/>
<path d="M76 138l-4 40M124 138l4 40" stroke="#d4287a" stroke-width="3" opacity=".6"/>
<path d="M76 146l20 8M124 146l-20 8" stroke="#120e18" stroke-width="7" stroke-linecap="round"/>
${eyes(82, 118, 160, 6, '#ffd900', 'wf-g')}
<path d="M84 176c10-8 22-8 32 0" fill="none" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<g fill="none" stroke="#120e18" stroke-width="3" stroke-linecap="round"><path d="M30 92l-8-6M170 92l8-6M84 52l-6-8M116 52l6-8"/></g>`;

/** The Factory Siren: a mermaid with an alarm beacon for a crown and loudspeaker horns for ears, singing the end-of-shift song through a megaphone. */
const factorySiren = `
<defs>${rg('fs-b', '#5ad0e0', '#1c5fd0')}${glow('fs-g', '#ff3b3b')}</defs>
${shadow}
<path d="M64 120h72c6 26-2 44-24 54-8 4-16 6-24 6z" fill="url(#fs-b)" ${OUT}/>
<path d="M92 180c-12 4-32 12-54 6 12-8 14-20 12-34 16 8 34 14 42 28z" fill="#ff3d9a" ${OUT}/>
<path d="M76 132q8 8 16 0M104 132q8 8 16 0M88 148q8 8 16 0M112 150q8 8 14 0M96 164q8 8 14 0" stroke="#120e18" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M66 124c-2-26 10-42 34-42s36 16 34 42z" fill="#d8c8f8" ${OUT}/>
<path d="M68 106h64v16H68z" fill="#8a84a0" ${OUT}/><circle cx="78" cy="114" r="3" fill="#f6f0e4"/><circle cx="100" cy="114" r="3" fill="#f6f0e4"/><circle cx="122" cy="114" r="3" fill="#f6f0e4"/>
<path d="M66 54c-12 30-8 62 4 76 2-14 4-28 8-40zM134 54c12 30 8 62-4 76-2-14-4-28-8-40z" fill="#1b1830" ${OUT}/>
<path d="M70 70c-4 18-2 36 2 50M130 70c4 18 2 36-2 50" stroke="#ff3d9a" stroke-width="4" fill="none" stroke-linecap="round"/>
<g class="limb"><path d="M132 108c14 2 22 10 26 20l-10 8c-4-8-10-12-18-14z" fill="#d8c8f8" ${OUT}/><path d="M148 122l38-26v52z" fill="#ffd900" ${OUT}/><path d="M158 118l14-8M158 128l16-2" stroke="#e0a800" stroke-width="3" stroke-linecap="round"/><rect x="142" y="116" width="10" height="16" rx="2" fill="#3a3450" ${OUT}/></g>
<path d="M68 108c-12 4-14 16-10 26l12-4z" fill="#d8c8f8" ${OUT}/>
<path d="M62 52l-30-14v46l30-14z" fill="#8a84a0" ${OUT}/><path d="M50 50q-6 8 0 16M42 46q-12 14 0 28" stroke="#3a3450" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M138 52l30-14v46l-30-14z" fill="#8a84a0" ${OUT}/><path d="M150 50q6 8 0 16M158 46q12 14 0 28" stroke="#3a3450" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M66 60c0-22 14-34 34-34s34 12 34 34c0 22-14 38-34 38S66 82 66 60z" fill="#d8c8f8" ${OUT}/>
<path d="M62 52c4-24 22-34 38-34s34 10 38 34c-12-10-24-14-38-14s-26 4-38 14z" fill="#1b1830" ${OUT}/>
<g class="eye"><circle cx="100" cy="10" r="30" fill="url(#fs-g)"/></g>
<path d="M80 30c0-16 8-24 20-24s20 8 20 24z" fill="#ff3b3b" ${OUT}/><rect x="74" y="28" width="52" height="9" fill="#3a3450" ${OUT}/><path d="M90 14c2-4 6-6 10-6" stroke="#ffd0d0" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M76 56q8-8 16 0M108 56q8-8 16 0" stroke="#120e18" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M74 46l18 6M126 46l-18 6" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="78" cy="72" rx="7" ry="4.5" fill="#ff3d9a" opacity=".6"/><ellipse cx="122" cy="72" rx="7" ry="4.5" fill="#ff3d9a" opacity=".6"/>
<ellipse cx="100" cy="80" rx="10" ry="12" fill="#120e18" ${OUT}/><ellipse cx="100" cy="86" rx="6" ry="5" fill="#ff3d9a"/>
<g fill="none" stroke="#ff3d9a" stroke-width="4" stroke-linecap="round"><path d="M22 100q-8 10 0 20M10 92q-14 18 0 36"/></g>`;

/** The Tourist: a round, tanned, sunglassed dude in a loud Hawaiian shirt, socks and flip-flops, a selfie stick held high and a suitcase he swears is his rolling behind. */
const tourist = `
<defs>${rg('to-s', '#ff8ac8', '#b0105a')}${rg('to-f', '#ffd0a0', '#c88050')}${rg('to-c', '#6a9af8', '#1c3a98')}${rg('to-k', '#fff08a', '#e0a800')}</defs>
${shadow}
<!-- suitcase -->
<rect x="128" y="120" width="52" height="60" rx="8" fill="url(#to-c)" ${OUT}/><path d="M142 120V108c0-4 4-6 12-6s12 2 12 6v12" fill="none" stroke="#120e18" stroke-width="5"/><path d="M128 140h52M128 160h52" stroke="#120e18" stroke-width="3"/>
<g ${OUT}><circle cx="144" cy="132" r="6" fill="#ffd900"/><circle cx="164" cy="150" r="6" fill="#ff3d9a"/><rect x="138" y="164" width="12" height="10" fill="#f6f0e4"/></g>
<circle cx="140" cy="184" r="5" fill="#120e18"/><circle cx="168" cy="184" r="5" fill="#120e18"/>
<!-- legs, socks and flip-flops -->
<path d="M68 150h20v22H68zM100 150h20v22h-20z" fill="url(#to-f)" ${OUT}/><path d="M68 170h20v8H68zM100 170h20v8h-20z" fill="#f6f0e4" ${OUT}/><path d="M68 174h20M100 174h20" stroke="#ff3d9a" stroke-width="2.5"/>
<path d="M62 182l28 0 0 8H58zM96 182h28l4 8H92z" fill="#2ac8b8" ${OUT}/>
<path d="M62 142h66l4 12H58z" fill="url(#to-k)" ${OUT}/>
<!-- shirt -->
<ellipse cx="94" cy="118" rx="52" ry="40" fill="url(#to-s)" ${OUT}/>
<path d="M76 84l18 22 18-22" fill="url(#to-f)" ${OUT}/><path d="M94 106v50" stroke="#120e18" stroke-width="3"/>
<g fill="#ffd900" ${OUT}><circle cx="70" cy="122" r="7"/><circle cx="116" cy="128" r="7"/><circle cx="82" cy="146" r="6"/></g><g fill="#2ac8b8" ${OUT}><circle cx="108" cy="108" r="6"/><circle cx="62" cy="106" r="5"/><circle cx="120" cy="148" r="5"/></g>
<path d="M70 122l-10-6M70 122l8-8M116 128l8-4" stroke="#2a8a3a" stroke-width="3"/>
<!-- left arm: selfie stick -->
<path d="M52 112c-8 8-8 18-4 26l12-2z" fill="url(#to-s)" ${OUT}/>
<g class="limb"><path d="M38 144L14 36" stroke="#120e18" stroke-width="7" stroke-linecap="round"/><path d="M38 144L14 36" stroke="#8a94a8" stroke-width="3" stroke-linecap="round"/><rect x="2" y="6" width="22" height="34" rx="4" fill="#120e18" ${OUT}/><rect x="6" y="11" width="14" height="24" fill="#9ab8f0"/><circle cx="13" cy="23" r="4" fill="#ff3d9a"/></g>
<circle cx="46" cy="140" r="8" fill="url(#to-f)" ${OUT}/>
<!-- right arm pulling the suitcase -->
<path d="M138 108c10 4 14 12 12 22l-10 0c2-6 0-10-6-12z" fill="url(#to-s)" ${OUT}/><circle cx="148" cy="130" r="8" fill="url(#to-f)" ${OUT}/>
<!-- head: shades, huge grin, slicked hair -->
<circle cx="94" cy="62" r="36" fill="url(#to-f)" ${OUT}/>
<path d="M60 52c2-22 18-34 34-34s32 12 34 34c-8-10-18-14-34-14s-26 4-34 14z" fill="#6a3a1a" ${OUT}/>
<g ${OUT}><rect x="66" y="56" width="26" height="16" rx="6" fill="#120e18"/><rect x="96" y="56" width="26" height="16" rx="6" fill="#120e18"/></g><path d="M92 62h4" stroke="#120e18" stroke-width="4"/>
<path d="M70 60h8M100 60h8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M68 82c8 14 36 14 44 0z" fill="#120e18" ${OUT}/><path d="M72 84h36v5H74z" fill="#f6f0e4"/>
<circle cx="66" cy="78" r="5" fill="#ff8ac8" opacity=".6"/><circle cx="122" cy="78" r="5" fill="#ff8ac8" opacity=".6"/>
<g class="eye" fill="#120e18"><circle cx="0" cy="0" r="0"/></g>`;

/** Conveyor Sis: a conveyor belt standing up on its rollers, a furious face on the top roller, boxing gloves up and a box riding her front. */
const conveyorSis = `
<defs>${rg('cs-r', '#e0e8f8', '#4a5a98')}${rg('cs-b', '#5a5a78', '#14142a')}${rg('cs-g', '#ff7a8a', '#a0102a')}${glow('cs-e', '#ffd900')}</defs>
${shadow}
<!-- the belt loop standing up -->
<path d="M56 56c-14 4-22 16-22 32v62c0 16 8 28 22 32h88c14-4 22-16 22-32V88c0-16-8-28-22-32z" fill="url(#cs-b)" ${OUT}/>
<path d="M46 96h108M44 116h112M44 136h112M44 156h112" stroke="#8a94b8" stroke-width="4" stroke-dasharray="10 8"/>
<path d="M62 104l8 8-8 8M62 128l8 8-8 8M130 104l8 8-8 8M130 128l8 8-8 8" stroke="#ffd900" stroke-width="4" fill="none" stroke-linejoin="round"/>
<!-- bottom roller as the feet -->
<ellipse cx="100" cy="178" rx="60" ry="14" fill="url(#cs-r)" ${OUT}/><path d="M60 178h80" stroke="#4a5a98" stroke-width="3" stroke-dasharray="6 6"/>
<circle cx="52" cy="184" r="8" fill="#3a3450" ${OUT}/><circle cx="148" cy="184" r="8" fill="#3a3450" ${OUT}/>
<!-- a box riding her front -->
<rect x="66" y="120" width="68" height="46" fill="#d8b070" ${OUT}/><path d="M66 134h68M100 120v14" stroke="#8a5a2a" stroke-width="4"/><path d="M76 146h22" stroke="#120e18" stroke-width="3"/><circle cx="116" cy="150" r="5" fill="#ff3d9a" ${OUT}/>
<!-- top roller with her face -->
<ellipse cx="100" cy="58" rx="62" ry="40" fill="url(#cs-r)" ${OUT}/>
<path d="M46 58c0-20 24-34 54-34" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M62 42l30 12M138 42l-30 12" stroke="#120e18" stroke-width="8" stroke-linecap="round"/>
<g ${OUT}><ellipse cx="82" cy="62" rx="12" ry="10" fill="#f6f0e4"/><ellipse cx="118" cy="62" rx="12" ry="10" fill="#f6f0e4"/></g>
<g class="eye"><circle cx="84" cy="64" r="8" fill="url(#cs-e)"/><circle cx="84" cy="64" r="4" fill="#120e18"/><circle cx="116" cy="64" r="8" fill="url(#cs-e)"/><circle cx="116" cy="64" r="4" fill="#120e18"/></g>
<path d="M76 80c8 10 40 10 48 0z" fill="#120e18" ${OUT}/><path d="M80 82h40v5H82z" fill="#f6f0e4"/>
<!-- boxing gloves up -->
<g class="limb"><path d="M34 100c-14 0-22-8-24-22" stroke="#120e18" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M34 100c-14 0-22-8-24-22" stroke="#5a5a78" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="12" cy="66" r="15" fill="url(#cs-g)" ${OUT}/><path d="M4 62c2-6 8-8 14-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></g>
<g class="limb"><path d="M166 100c14 0 22-8 24-22" stroke="#120e18" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M166 100c14 0 22-8 24-22" stroke="#5a5a78" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="188" cy="66" r="15" fill="url(#cs-g)" ${OUT}/><path d="M180 62c2-6 8-8 14-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></g>`;

/** The Board: three porcelain-masked directors in hats on one brass-and-steel chassis, a silent grin, a frown and a monocle, ticker tape pouring from its chest. */
const theBoard = `
<defs>${rg('tb-m', '#ffffff', '#b8b0d0')}${rg('tb-b', '#ffe8a0', '#8a5a10')}${rg('tb-s', '#6a76c8', '#141c60')}</defs>
${shadow}
<!-- ticker tape pouring out -->
<path d="M82 130c-8 20 6 30-6 44s-4 18 6 16" fill="none" stroke="#120e18" stroke-width="14" stroke-linecap="round"/><path d="M82 130c-8 20 6 30-6 44s-4 18 6 16" fill="none" stroke="#f6f0e4" stroke-width="9" stroke-linecap="round" stroke-dasharray="8 3"/>
<!-- chassis on wheels -->
<circle cx="52" cy="176" r="14" fill="#3a3450" ${OUT}/><circle cx="52" cy="176" r="5" fill="#ffd900"/><circle cx="148" cy="176" r="14" fill="#3a3450" ${OUT}/><circle cx="148" cy="176" r="5" fill="#ffd900"/>
<ellipse cx="100" cy="140" rx="68" ry="40" fill="url(#tb-b)" ${OUT}/>
<g fill="#8a5a10" ${OUT}><circle cx="46" cy="130" r="3.5"/><circle cx="154" cy="130" r="3.5"/><circle cx="60" cy="158" r="3.5"/><circle cx="140" cy="158" r="3.5"/></g>
<path d="M62 126c10 14 66 14 76 0v10c-10 14-66 14-76 0z" fill="#120e18"/><path d="M70 130h60" stroke="#ffd900" stroke-width="3" stroke-dasharray="6 4"/>
<g class="limb" fill="url(#tb-b)" ${OUT}><circle cx="100" cy="150" r="16"/><path d="M100 138v24M88 150h24M92 140l16 20M108 140l-16 20" stroke="#8a5a10" stroke-width="3" fill="none"/></g>
<!-- three necks and three porcelain masks -->
<path d="M66 108c0-10-4-20-8-28M134 108c0-10 4-20 8-28M100 104V84" stroke="#120e18" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M66 108c0-10-4-20-8-28M134 108c0-10 4-20 8-28M100 104V84" stroke="url(#tb-s)" stroke-width="8" fill="none" stroke-linecap="round"/>
<!-- left: bowler, calm smile -->
<ellipse cx="46" cy="64" rx="26" ry="28" fill="url(#tb-m)" ${OUT}/>
<path d="M28 46c0-14 8-20 18-20s18 6 18 20z" fill="url(#tb-s)" ${OUT}/><path d="M22 46h48" stroke="#120e18" stroke-width="5"/>
<path d="M34 62c3-4 7-4 10 0M50 62c3-4 7-4 10 0" stroke="#120e18" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M36 76c6 8 16 8 22 0" stroke="#120e18" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="72" r="4" fill="#ff8ac8" opacity=".7"/><circle cx="62" cy="72" r="4" fill="#ff8ac8" opacity=".7"/>
<!-- right: crown, frown -->
<ellipse cx="154" cy="64" rx="26" ry="28" fill="url(#tb-m)" ${OUT}/>
<path d="M134 40l8 10 6-12 6 12 6-12 8 14z" fill="url(#tb-b)" ${OUT}/>
<g class="eye" fill="#120e18"><circle cx="144" cy="64" r="4"/><circle cx="164" cy="64" r="4"/></g><path d="M136 56l16 6M172 56l-16 6" stroke="#120e18" stroke-width="3.5" stroke-linecap="round"/><path d="M142 80c6-6 16-6 22 0" stroke="#120e18" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<!-- middle: top hat, monocle, deadpan -->
<ellipse cx="100" cy="52" rx="28" ry="30" fill="url(#tb-m)" ${OUT}/>
<path d="M80 26V4h40v22z" fill="url(#tb-s)" ${OUT}/><rect x="80" y="16" width="40" height="6" fill="#ff3d9a"/><path d="M72 28h56" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<g ${OUT}><ellipse cx="88" cy="50" rx="6" ry="5" fill="#120e18"/></g><circle cx="112" cy="50" r="10" fill="none" stroke="#ffd900" stroke-width="3"/><g class="eye" fill="#120e18"><circle cx="112" cy="50" r="4"/></g><path d="M112 60c2 12 4 18 8 26" stroke="#ffd900" stroke-width="2" fill="none"/>
<path d="M86 68h28" stroke="#120e18" stroke-width="3.5" stroke-linecap="round"/><path d="M90 64l4 0M106 64h4" stroke="#120e18" stroke-width="0"/>`;

/** Power Socket: a cheeky two-prong plug with a rubber cable tail, a cream round body, big eyes, stubby arms and yellow sparks arcing all around it. */
const powerSocket = `
<defs>${rg('ps-b', '#fffbe8', '#c8bc98')}${rg('ps-m', '#e8f0f8', '#6a7ea0')}${glow('ps-e', '#ffd900')}</defs>
${shadow}
<!-- cable tail -->
<path d="M100 150c0 24-34 20-34 34 0 8 22 6 44 4" fill="none" stroke="#120e18" stroke-width="16" stroke-linecap="round"/><path d="M100 150c0 24-34 20-34 34 0 8 22 6 44 4" fill="none" stroke="#2a2a48" stroke-width="9" stroke-linecap="round"/>
<!-- prongs -->
<rect x="68" y="10" width="16" height="40" rx="3" fill="url(#ps-m)" ${OUT}/><rect x="116" y="10" width="16" height="40" rx="3" fill="url(#ps-m)" ${OUT}/>
<rect x="72" y="18" width="8" height="9" fill="#120e18"/><rect x="120" y="18" width="8" height="9" fill="#120e18"/>
<!-- round plug body -->
<ellipse cx="100" cy="100" rx="58" ry="56" fill="url(#ps-b)" ${OUT}/>
<path d="M54 142h92" stroke="#120e18" stroke-width="3" opacity=".5"/><rect x="82" y="152" width="36" height="12" rx="3" fill="#2a2a48" ${OUT}/>
<!-- stubby arms -->
<g class="limb"><path d="M50 96c-14 2-26 10-30 22 4 2 8 0 10-4 4 4 10 4 14 0 8-6 12-12 12-18z" fill="url(#ps-b)" ${OUT}/></g>
<g class="limb"><path d="M150 96c14 2 26 10 30 22-4 2-8 0-10-4-4 4-10 4-14 0-8-6-12-12-12-18z" fill="url(#ps-b)" ${OUT}/></g>
<!-- face -->
<g ${OUT}><circle cx="78" cy="86" r="15" fill="#f6f0e4"/><circle cx="122" cy="86" r="15" fill="#f6f0e4"/></g>
<g class="eye"><circle cx="78" cy="86" r="10" fill="url(#ps-e)"/><circle cx="122" cy="86" r="10" fill="url(#ps-e)"/><circle cx="80" cy="88" r="5" fill="#120e18"/><circle cx="124" cy="88" r="5" fill="#120e18"/><circle cx="82" cy="85" r="2" fill="#fff"/><circle cx="126" cy="85" r="2" fill="#fff"/></g>
<path d="M62 68l24 8M138 68l-24 8" stroke="#120e18" stroke-width="5" stroke-linecap="round"/>
<path d="M76 112c10 14 38 14 48 0z" fill="#120e18" ${OUT}/><path d="M84 114v6M94 116v7M106 116v7M116 114v6" stroke="#f6f0e4" stroke-width="3"/>
<circle cx="66" cy="106" r="5" fill="#ff8ac8" opacity=".7"/><circle cx="134" cy="106" r="5" fill="#ff8ac8" opacity=".7"/>
<!-- electricity -->
<g class="eye" fill="#ffd900" ${OUT}>
<path d="M28 40l14 10-8 4 14 12-6 2 10 10-18-8 6-4-12-10 8-2z"/>
<path d="M172 36l-14 12 8 2-14 12 6 2-10 10 18-10-6-2 12-10-8-2z"/>
<path d="M172 138l-12 6 6 4-12 8 16-4-4-4 10-4z"/>
<path d="M28 140l12 6-6 4 12 8-16-4 4-4-10-4z"/>
</g>`;

/** The Debug Enemy: an empty square, nothing in it. */
const debugEnemy = `
${shadow}
<path fill-rule="evenodd" d="M40 40h120v120H40zM54 54v92h92V54z" fill="#f6f0e4" ${OUT}/>`;

export const CREATURES: Record<string, string> = {
  debugEnemy,
  leaver,
  workWife,
  exaggeratedGirl,
  powerSocket,
  snitch,
  seniorBoomer,
  toxicCoworker,
  teamLeader,
  goblinConsultant,
  securityMonitor,
  slavesCeo,
  hrBitch,
  guyAsleep,
  newHire,
  bossSon,
  sickCoworker,
  facilitiesManager,
  meticulousColleague,
  dave,
  printer,
  theNerd,
  happinessOfficer,
  officeChair,
  hrOrientationVideo,
  hrOrientationVideoAngry,
  changeManager,
  overthinker,
  wellnessCoach,
  beanCounter,
  complianceOfficer,
  veteran,
  nightJanitor,
  micromanager,
  tourist,
  conveyorSis,
  theBoard,
  punchClock,
  smokeDetector,
  microwave,
  witheredFicus,
  factorySiren,
  graveyardIntern,
  rateLimiter,
  lineLead,
  vipClient,
  helpdeskChatbot,
  contractLawyer,
  outgoingVp,
  timeClock,
  waterCooler,
  warrior,
  mage,
  necromancer,
  rogue,
};

/** Riso-pixel sprite of a creature (see riso.ts). */
export function creature(id: string, cls = ''): string {
  return sprite(id, cls);
}
