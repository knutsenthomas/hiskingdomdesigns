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
    { name: 'Blå', r: 59, g: 130, b: 246, hex: '#3b82f6' },
    { name: 'Mørkeblå', r: 27, g: 73, b: 101, hex: '#1B4965' },
    { name: 'Rød', r: 239, g: 68, b: 68, hex: '#ef4444' },
    { name: 'Grønn', r: 22, g: 163, b: 74, hex: '#16a34a' },
    { name: 'Lysegrønn', r: 131, g: 162, b: 117, hex: '#83A275' },
    { name: 'Gul', r: 234, g: 179, b: 8, hex: '#eab308' },
    { name: 'Rosa', r: 255, g: 138, b: 201, hex: '#FF8AC9' },
    { name: 'Mørk Rosa', r: 219, g: 39, b: 119, hex: '#db2777' },
    { name: 'Beige', r: 221, g: 214, b: 214, hex: '#DDD6D6' },
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

  // Helper to extract clean human-friendly color name from any string or description
  const getFriendlyName = (text) => {
    if (!text) return '';
    const t = text.toLowerCase();
    if (t.includes('army') || t.includes('camo') || t.includes('kamuflasje') || t.includes('militær')) return 'Army';
    if (t.includes('sort') || t.includes('svart') || t.includes('black') || t.includes('charcoal') || t.includes('coal') || t.includes('vintage black')) return 'Sort';
    if (t.includes('hvit') || t.includes('white') || t.includes('off-white') || t.includes('ivory') || t.includes('cream')) return 'Hvit';
    if (t.includes('mørkeblå') || t.includes('navy') || t.includes('marine') || t.includes('deep teal') || t.includes('teal') || t.includes('storm')) return 'Mørkeblå';
    if (t.includes('kongeblå') || t.includes('royal blue') || t.includes('royalblue')) return 'Kongeblå';
    if (t.includes('blå') || t.includes('blue') || t.includes('denim') || t.includes('aqua') || t.includes('sky')) return 'Blå';
    if (t.includes('burgundy') || t.includes('maroon') || t.includes('burgunder')) return 'Burgunder';
    if (t.includes('rød') || t.includes('red') || t.includes('cherry') || t.includes('cardinal')) return 'Rød';
    if (t.includes('lysegrønn') || t.includes('lys grønn') || t.includes('mint') || t.includes('sage')) return 'Lysegrønn';
    if (t.includes('grønn') || t.includes('green') || t.includes('forest') || t.includes('olive') || t.includes('oliven')) return 'Grønn';
    if (t.includes('gul') || t.includes('yellow') || t.includes('gold') || t.includes('mustard')) return 'Gul';
    if (t.includes('mørk rosa') || t.includes('fuchsia') || t.includes('hot pink')) return 'Mørk Rosa';
    if (t.includes('rosa') || t.includes('pink') || t.includes('peach') || t.includes('coral') || t.includes('mauve')) return 'Rosa';
    if (t.includes('beige') || t.includes('sand') || t.includes('khaki') || t.includes('natural') || t.includes('stone') || t.includes('tan') || t.includes('natur')) return 'Beige';
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

    return { 
      name: resolvedName, 
      hex: lower 
    };
  }

  // 2. Friendly text name matching:
  const friendlyName = getFriendlyName(inputStr) || (desc ? getFriendlyName(desc) : '');
  let displayName = friendlyName || capitalize(inputStr);
  let hexCode = '#888888';

  if (displayName === 'Army') hexCode = '#405F48';
  else if (displayName === 'Sort') hexCode = '#151A21';
  else if (displayName === 'Hvit') hexCode = '#FFFFFF';
  else if (displayName === 'Mørkeblå') hexCode = '#1B4965';
  else if (displayName === 'Kongeblå') hexCode = '#4743f7';
  else if (displayName === 'Blå') hexCode = '#3b82f6';
  else if (displayName === 'Burgunder') hexCode = '#800020';
  else if (displayName === 'Rød') hexCode = '#ef4444';
  else if (displayName === 'Lysegrønn') hexCode = '#83A275';
  else if (displayName === 'Grønn') hexCode = '#16a34a';
  else if (displayName === 'Gul') hexCode = '#eab308';
  else if (displayName === 'Mørk Rosa') hexCode = '#db2777';
  else if (displayName === 'Rosa') hexCode = '#FF8AC9';
  else if (displayName === 'Beige') hexCode = '#DDD6D6';
  else if (displayName === 'Terrakotta') hexCode = '#CC712B';
  else if (displayName === 'Orange') hexCode = '#f18820';
  else if (displayName === 'Lilla') hexCode = '#a855f7';
  else if (displayName === 'Lys Grå') hexCode = '#DCDCDC';
  else if (displayName === 'Mørk Grå') hexCode = '#595858';
  else if (displayName === 'Grå') hexCode = '#A8A8A8';

  return { name: displayName, hex: hexCode };
};
