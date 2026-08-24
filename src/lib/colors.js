export const parseHex = (hexStr) => {
  let hex = hexStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

export const parseRgb = (rgbStr) => {
  const match = rgbStr.match(/\d+/g);
  if (match && match.length >= 3) {
    return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
  }
  return { r: 128, g: 128, b: 128 };
};

export const getClosestColor = (r, g, b) => {
  const standards = [
    { name: 'Sort', r: 21, g: 26, b: 33, hex: '#151A21' },
    { name: 'Hvit', r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    { name: 'Grå', r: 168, g: 168, b: 168, hex: '#A8A8A8' },
    { name: 'Lys Grå', r: 220, g: 220, b: 220, hex: '#DCDCDC' },
    { name: 'Mørk Grå', r: 89, g: 88, b: 88, hex: '#595858' },
    { name: 'Lyseblå', r: 146, g: 199, b: 227, hex: '#92C7E3' },
    { name: 'Blå', r: 59, g: 130, b: 246, hex: '#3b82f6' },
    { name: 'Mørkeblå', r: 27, g: 73, b: 101, hex: '#1B4965' },
    { name: 'Rød', r: 239, g: 68, b: 68, hex: '#ef4444' },
    { name: 'Grønn', r: 22, g: 163, b: 74, hex: '#16a34a' },
    { name: 'Lysegrønn', r: 131, g: 162, b: 117, hex: '#83A275' },
    { name: 'Gul', r: 234, g: 179, b: 8, hex: '#eab308' },
    { name: 'Rosa', r: 255, g: 138, b: 201, hex: '#FF8AC9' },
    { name: 'Mørk Rosa', r: 219, g: 39, b: 119, hex: '#db2777' },
    { name: 'Beige', r: 221, g: 214, b: 214, hex: '#DDD6D6' },
    { name: 'Sand', r: 227, g: 218, b: 192, hex: '#E3DAC0' },
    { name: 'Terrakotta', r: 204, g: 113, b: 43, hex: '#CC712B' },
    { name: 'Orange', r: 241, g: 136, b: 32, hex: '#f18820' },
    { name: 'Lilla', r: 168, g: 85, b: 247, hex: '#a855f7' }
  ];

  let minDistance = Infinity;
  let closest = standards[0];

  standards.forEach(std => {
    const dist = Math.sqrt(
      Math.pow(r - std.r, 2) +
      Math.pow(g - std.g, 2) +
      Math.pow(b - std.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = std;
    }
  });

  return closest;
};

export const PRODUCT_COLOR_ORDER_OVERRIDES = {
  // LOVED - babysmekke
  '43ced8bd-218e-a5dd-0185-df6c13f54691': [
    { name: 'Rosa', hex: '#FF8DA1', image: 'https://static.wixstatic.com/media/3a1544_1712758067814192932cd35348660f65~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Rød', hex: '#E31647', image: 'https://static.wixstatic.com/media/3a1544_450b863bf0cd4d46a3b45c038c208840~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Grå', hex: '#A8A8A8', image: 'https://static.wixstatic.com/media/3a1544_9fa88c959dc844308d0cd382ac4f2c78~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Lyseblå', hex: '#92C7E3', image: 'https://static.wixstatic.com/media/3a1544_5bda2e9e2dea4284ad74a5a48ef1308b~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Sort', hex: '#151A21', image: 'https://static.wixstatic.com/media/3a1544_9b8fb1e9adef439c90de6414f7420995~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' }
  ],
  // Jesus passer på oss - smekke
  '9f55138f-b127-a7e9-db63-017bcfd820b3': [
    { name: 'Hvit', hex: '#FFFFFF', image: 'https://static.wixstatic.com/media/3a1544_116d099a0a6f4fd3a10dbe984a2f6959~mv2.png/v1/fit/w_1262,h_1482,q_90/file.png' },
    { name: 'Rød', hex: '#D70E0E', image: 'https://static.wixstatic.com/media/3a1544_5db0a80225144360aa7c7b43117aab90~mv2.png/v1/fit/w_1286,h_1480,q_90/file.png' },
    { name: 'Rosa', hex: '#ED2EBD', image: 'https://static.wixstatic.com/media/3a1544_7c324fc200bb4946b3344f2f7bbb2335~mv2.png/v1/fit/w_1304,h_1508,q_90/file.png' },
    { name: 'Grå', hex: '#A8A8A8', image: 'https://static.wixstatic.com/media/3a1544_3de976fe5fc34b91ba9f097b2a2b8f95~mv2.png/v1/fit/w_1164,h_1476,q_90/file.png' }
  ],
  // Organic Cotton Baby Bodysuit - Cute Lamb
  '86bb3ff5-1d3c-2400-433c-156cdf78751b': [
    { name: 'Grønn', hex: '#81D0B2', image: 'https://static.wixstatic.com/media/3a1544_f433ebb2c2ee440f8bb7c7fcbb0e7373~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Gammelrosa', hex: '#D98D8D', image: 'https://static.wixstatic.com/media/3a1544_89081a2c740b4145a70b1eab1a5bb094~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Burgunder', hex: '#722F37', image: 'https://static.wixstatic.com/media/3a1544_f684bfbecee84b7ab69a08b43824650d~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Lyserosa', hex: '#F595DD', image: 'https://static.wixstatic.com/media/3a1544_4ea7decda6df47b3b6653376a7bab537~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Hvit', hex: '#F5F4F4', image: 'https://static.wixstatic.com/media/3a1544_267e9e50660d4420af678195a5b80774~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Mørkeblå', hex: '#1364AC', image: 'https://static.wixstatic.com/media/3a1544_547864a3ed084ac496273b5d37b86713~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Blå', hex: '#396EF9', image: 'https://static.wixstatic.com/media/3a1544_2a8ccc7bf2904927a71960a61d8fca09~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' },
    { name: 'Lyseblå', hex: '#82B1F1', image: 'https://static.wixstatic.com/media/3a1544_1ff917d9a31f4c85937afe95e8e5f1a6~mv2.jpg/v1/fit/w_1080,h_1350,q_90/file.jpg' }
  ]
};

export const resolveColor = (rawName, fallbackDescription = '') => {
  const inputStr = (rawName || fallbackDescription || '').trim();
  if (!inputStr) return { name: 'Sort', hex: '#151A21' };

  if (inputStr.includes('/')) {
    const parts = inputStr.split('/');
    const res1 = resolveColor(parts[0], fallbackDescription);
    const res2 = resolveColor(parts[1], fallbackDescription);
    const formattedName = [res1.name, res2.name].join('/');
    const gradient = `linear-gradient(135deg, ${res1.hex} 50%, ${res2.hex} 50%)`;
    return { name: formattedName, hex: gradient };
  }

  const capitalize = (str) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const lower = inputStr.toLowerCase();
  const desc = (fallbackDescription || '').trim();

  const getStandardHex = (name, fallbackHex) => {
    if (name === 'Mørkeblå') return '#1B4965';
    if (name === 'Kongeblå') return '#2563EB';
    if (name === 'Lyseblå' || name === 'Babyblå') return '#92C7E3';
    if (name === 'Burgunder') return '#722F37';
    if (name === 'Army') return '#405F48';
    if (name === 'Sort') return '#151A21';
    if (name === 'Hvit') return '#FFFFFF';
    if (name === 'Blå') return '#3B82F6';
    if (name === 'Rød') return '#DC2626';
    if (name === 'Lysegrønn') return '#83A275';
    if (name === 'Grønn') return '#16A34A';
    if (name === 'Gul') return '#EAB308';
    if (name === 'Mørk Rosa') return '#DB2777';
    if (name === 'Rosa') return '#FF8AC9';
    if (name === 'Sand') return '#E3DAC0';
    if (name === 'Beige') return '#DDD6D6';
    if (name === 'Terrakotta') return '#CC712B';
    if (name === 'Orange') return '#F18820';
    if (name === 'Lilla') return '#A855F7';
    if (name === 'Lys Grå') return '#DCDCDC';
    if (name === 'Mørk Grå') return '#595858';
    if (name === 'Grå') return '#A8A8A8';
    return fallbackHex;
  };

  // Helper to extract clean human-friendly color name from any string or description
  const getFriendlyName = (text) => {
    if (!text) return '';
    const t = text.toLowerCase();
    if (t.includes('army') || t.includes('camo') || t.includes('kamuflasje') || t.includes('militær')) return 'Army';
    if (t.includes('sort') || t.includes('svart') || t.includes('black') || t.includes('charcoal') || t.includes('coal') || t.includes('vintage black')) return 'Sort';
    if (t.includes('hvit') || t.includes('white') || t.includes('off-white') || t.includes('ivory') || t.includes('cream')) return 'Hvit';
    if (t.includes('mørkeblå') || t.includes('navy') || t.includes('marine') || t.includes('deep teal') || t.includes('teal') || t.includes('storm')) return 'Mørkeblå';
    if (t.includes('kongeblå') || t.includes('royal blue') || t.includes('royalblue')) return 'Kongeblå';
    if (t.includes('lyseblå') || t.includes('lys blå') || t.includes('baby blue') || t.includes('babyblå') || t.includes('light blue') || t === '#92c7e3') return 'Lyseblå';
    if (t.includes('blå') || t.includes('blue') || t.includes('denim') || t.includes('aqua') || t.includes('sky')) return 'Blå';
    if (t.includes('burgundy') || t.includes('maroon') || t.includes('burgunder') || t.includes('begunder')) return 'Burgunder';
    if (t.includes('rød') || t.includes('red') || t.includes('cherry') || t.includes('cardinal')) return 'Rød';
    if (t.includes('lysegrønn') || t.includes('lys grønn') || t.includes('mint') || t.includes('sage')) return 'Lysegrønn';
    if (t.includes('grønn') || t.includes('green') || t.includes('forest') || t.includes('olive') || t.includes('oliven')) return 'Grønn';
    if (t.includes('gul') || t.includes('yellow') || t.includes('gold') || t.includes('mustard')) return 'Gul';
    if (t.includes('mørk rosa') || t.includes('fuchsia') || t.includes('hot pink')) return 'Mørk Rosa';
    if (t.includes('rosa') || t.includes('pink') || t.includes('peach') || t.includes('coral') || t.includes('mauve')) return 'Rosa';
    if (t === 'sand' || t.includes(' sand') || t.startsWith('sand ')) return 'Sand';
    if (t.includes('beige') || t.includes('khaki') || t.includes('natural') || t.includes('stone') || t.includes('tan') || t.includes('natur')) return 'Beige';
    if (t.includes('terrakotta') || t.includes('terracotta') || t.includes('clay') || t.includes('burnt orange')) return 'Terrakotta';
    if (t.includes('oransje') || t.includes('orange')) return 'Orange';
    if (t.includes('lilla') || t.includes('purple') || t.includes('lavender')) return 'Lilla';
    if (t.includes('lys grå') || t.includes('light grey') || t.includes('ash') || t.includes('silver')) return 'Lys Grå';
    if (t.includes('mørk grå') || t.includes('dark grey') || t.includes('graphite')) return 'Mørk Grå';
    if (t.includes('grå') || t.includes('grey') || t.includes('gray')) return 'Grå';
    return '';
  };

  // 1. If input is a hex code or rgb code:
  if (lower.startsWith('rgb') || lower.startsWith('#')) {
    let resolvedName = desc ? getFriendlyName(desc) : '';
    if (!resolvedName && desc && !desc.startsWith('#') && !desc.startsWith('rgb')) {
      resolvedName = capitalize(desc);
    }

    if (!resolvedName) {
      const { r, g, b } = lower.startsWith('#') ? parseHex(lower) : parseRgb(lower);
      const closest = getClosestColor(r, g, b);
      resolvedName = closest.name;
    }

    const standardHex = getStandardHex(resolvedName, lower);

    return { 
      name: resolvedName, 
      hex: standardHex 
    };
  }

  // 2. Friendly text name matching:
  const friendlyName = getFriendlyName(inputStr) || (desc ? getFriendlyName(desc) : '');
  let displayName = friendlyName || capitalize(inputStr);
  let hexCode = getStandardHex(displayName, '#888888');

  return { name: displayName, hex: hexCode };
};
