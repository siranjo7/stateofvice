// Static homepage data that isn't an article (articles come from the content collection).
export const LAUNCH_ISO = '2026-11-19T05:00:00Z';
const P = '/assets/press/';

export interface Region { name: string; note: string; postcard: string; shot: string; blurb: string }
export const REGIONS: Region[] = [
  { name: 'Vice City', note: 'The neon heart of Leonida', postcard: P + 'postcard-vice-city.webp', shot: P + 'vice-city-01.webp', blurb: 'Rockstar’s modern Miami — beaches, nightlife, influencers and money moving fast.' },
  { name: 'Leonida Keys', note: 'Islands, boats and bridges', postcard: P + 'postcard-leonida-keys.webp', shot: P + 'leonida-keys-01.webp', blurb: 'A chain of islands south of the mainland, where Jason’s story begins.' },
  { name: 'Grassrivers', note: 'Wetlands, gators, airboats', postcard: P + 'postcard-grassrivers.webp', shot: P + 'grassrivers-01.webp', blurb: 'Leonida’s take on the Everglades — swamp, wildlife and hiding places.' },
  { name: 'Port Gellhorn', note: 'A faded seaside town', postcard: P + 'postcard-port-gellhorn.webp', shot: P + 'port-gellhorn-01.webp', blurb: 'A worn-down Gulf Coast port that has seen better days.' },
  { name: 'Ambrosia', note: 'Sugar country and refineries', postcard: P + 'postcard-ambrosia.webp', shot: P + 'ambrosia-01.webp', blurb: 'Industrial farmland built around sugar, bikers and back roads.' },
  { name: 'Mount Kalaga', note: 'National park backcountry', postcard: P + 'postcard-mount-kalaga-national-park.webp', shot: P + 'mount-kalaga-01.webp', blurb: 'Forests, trails and hunting grounds in the north of the state.' },
];

export interface Character { name: string; role: string; video: string; poster: string; still: string; bio: string }
export const CAST: Character[] = [
  { name: 'Lucia Caminos', role: 'Playable lead', video: P + 'clips/lucia.mp4', poster: P + 'lucia-01.webp', still: P + 'lucia-03.webp', bio: 'The first woman to headline a mainline GTA. Fresh out of the Leonida Penitentiary and determined to get ahead.' },
  { name: 'Jason Duval', role: 'Playable lead', video: P + 'clips/jason.mp4', poster: P + 'jason-01.webp', still: P + 'jason-03.webp', bio: 'Ex-Army, raised among grifters, now doing shakedown work for drug runners in the Leonida Keys.' },
  { name: 'Boobie Ike', role: 'Vice City mogul', video: P + 'clips/boobie.mp4', poster: P + 'boobie-01.webp', still: P + 'boobie-02.webp', bio: 'A Vice City street legend turned mogul — real estate, a strip club and a recording studio.' },
  { name: 'Dre’Quan Priest', role: 'Aspiring label boss', video: P + 'clips/drequan.mp4', poster: P + 'drequan-01.webp', still: P + 'drequan-02.webp', bio: 'Runs Only Raw Records with Boobie’s backing, chasing the whole Vice City music scene.' },
  { name: 'Real Dimez', role: 'Viral rap duo', video: P + 'clips/dimez.mp4', poster: P + 'dimez-01.webp', still: P + 'dimez-02.webp', bio: 'Bae-Luxe and Roxy — school friends turned viral rap duo, now signed to Only Raw Records.' },
  { name: 'Raul Bautista', role: 'Veteran bank robber', video: P + 'clips/raul.mp4', poster: P + 'raul-01.webp', still: P + 'raul-02.webp', bio: 'A seasoned, charming bank robber always recruiting talent for bigger, riskier scores.' },
  { name: 'Cal Hampton', role: 'Paranoid associate', video: P + 'clips/cal.mp4', poster: P + 'cal-01.webp', still: P + 'cal-02.webp', bio: 'Jason’s conspiracy-theorist friend, who stays home snooping on Coast Guard radio.' },
  { name: 'Brian Heder', role: 'Keys smuggler', video: P + 'clips/brian.mp4', poster: P + 'brian-01.webp', still: P + 'brian-02.webp', bio: 'A drug runner from the golden age of Keys smuggling — Jason’s landlord and first employer.' },
];

export interface Trailer { id: string; title: string; sub: string; href?: string }
export const TRAILERS: Trailer[] = [
  { id: 'rz1B4B2yBZY', title: 'Launch Trailer', sub: 'Oct 15, 2026', href: '/articles/gta-6-launch-trailer.html' },
  { id: 'tJbzMqJGH4k', title: 'An Extended Look', sub: '26 min gameplay · Aug 27, 2026', href: '/articles/gta-6-extended-look-netflix-everything-shown.html' },
  { id: 'VQRLujxTm3c', title: 'Trailer 2', sub: 'Jason & Lucia · May 2025' },
  { id: 'QdBZY2fkU-0', title: 'Trailer 1', sub: 'Vice City · Dec 2023' },
];

export type Verdict = 'CONFIRMED' | 'RUMOR' | 'UNKNOWN';
export interface Fact { k: string; v: string; tag: Verdict; href: string }
export const FACTS: Fact[] = [
  { k: 'Release', v: 'Nov 19, 2026', tag: 'CONFIRMED', href: '/articles/gta-6-release-date-platforms-pc.html' },
  { k: 'Pre-load', v: 'Nov 12', tag: 'CONFIRMED', href: '/articles/gta-6-release-date-platforms-pc.html' },
  { k: 'Price', v: '$79.99 / $99.99', tag: 'CONFIRMED', href: '/articles/gta-6-price-what-to-budget.html' },
  { k: 'Platforms', v: 'PS5 · Xbox Series X|S', tag: 'CONFIRMED', href: '/articles/gta-6-release-date-platforms-pc.html' },
  { k: 'Rating', v: 'ESRB M 17+', tag: 'CONFIRMED', href: '/articles/gta-6-esrb-rating-mature.html' },
  { k: 'Online at launch', v: 'Not announced', tag: 'CONFIRMED', href: '/articles/gta-6-extended-look-netflix-everything-shown.html' },
  { k: 'PC', v: 'Q1 2027?', tag: 'RUMOR', href: '/articles/gta-6-pc-release-q1-2027-report.html' },
  { k: 'File size', v: 'Not announced', tag: 'UNKNOWN', href: '/articles/gta-6-gameplay-leak-dev-build-file-size.html' },
];

export const tagClass = (t: string): string => (t === 'CONFIRMED' ? 'c' : t === 'RUMOR' ? 'r' : 'a');
