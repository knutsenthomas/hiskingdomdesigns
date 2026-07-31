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

  const lower = inputStr.toLowerCase();
  const descLower = (fallbackDescription || '').toLowerCase();
  
  // 1. If input is a hex code or rgb code:
  if (lower.startsWith('rgb') || lower.startsWith('#')) {
    let resolvedName = '';
    if (descLower) {
      if (descLower.includes('grå') || descLower.includes('grey') || descLower.includes('gray')) resolvedName = 'Grå';
      else if (descLower.includes('rosa') || descLower.includes('pink')) resolvedName = 'Rosa';
      else if (descLower.includes('lysegrønn') || descLower.includes('lys grønn') || descLower.includes('mint')) resolvedName = 'Lysegrønn';
      else if (descLower.includes('grønn') || descLower.includes('green')) resolvedName = 'Grønn';
      else if (descLower.includes('khaki') || descLower.includes('beige') || descLower.includes('sand')) resolvedName = 'Beige';
      else if (descLower.includes('oransje') || descLower.includes('orange')) resolvedName = 'Orange';
      else if (descLower.includes('hvit') || descLower.includes('white')) resolvedName = 'Hvit';
      else if (descLower.includes('sort') || descLower.includes('svart') || descLower.includes('black')) resolvedName = 'Sort';
    }

    const { r, g, b } = lower.startsWith('#') ? parseHex(lower) : parseRgb(lower);
    const closest = getClosestColor(r, g, b);

    return { 
      name: resolvedName || closest.name, 
      hex: lower 
    };
  }

  // 2. Friendly text name matching:
  const capitalize = (str) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  let displayName = capitalize(inputStr);
  let hexCode = '#888888';

  if (lower.includes('sort') || lower.includes('svart') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('dark grey') || lower.includes('night') || lower.includes('vintage black')) {
    displayName = 'Sort';
    hexCode = '#151A21';
  } else if (lower.includes('hvit') || lower.includes('white') || lower.includes('off-white') || lower.includes('weiß') || lower.includes('ivory') || lower.includes('bone') || lower.includes('soft cream') || lower.includes('cornsilk')) {
    displayName = 'Hvit';
    hexCode = '#FFFFFF';
  } else if (lower.includes('navy') || lower.includes('marine') || lower.includes('mørkeblå') || lower.includes('deep teal') || lower.includes('teal') || lower.includes('sapphire') || lower.includes('storm') || lower.includes('french navy')) {
    displayName = 'Mørkeblå';
    hexCode = '#1B4965';
  } else if (lower.includes('royalblue') || lower.includes('royal') || lower.includes('carolina blue') || lower.includes('blue') || lower.includes('blå') || lower.includes('denim') || lower.includes('cornflower') || lower.includes('aqua') || lower.includes('caribbean') || lower.includes('chambray') || lower.includes('sky') || lower.includes('ocean') || lower.includes('chill') || lower.includes('baby blue') || lower.includes('light blue') || lower.includes('columbia blue')) {
    displayName = 'Blå';
    hexCode = '#3b82f6';
  } else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('burgundy') || lower.includes('garnet') || lower.includes('cherry') || lower.includes('cardinal') || lower.includes('bright salmon') || lower.includes('watermelon')) {
    displayName = 'Rød';
    hexCode = '#ef4444';
  } else if (lower.includes('lysegrønn') || lower.includes('lys grønn') || lower.includes('mint') || lower.includes('sage') || lower.includes('dusty sage') || lower.includes('pistachio') || lower.includes('sea green') || lower.includes('grass green')) {
    displayName = 'Lysegrønn';
    hexCode = '#83A275';
  } else if (lower.includes('grønn') || lower.includes('green') || lower.includes('forest') || lower.includes('olive') || lower.includes('oliven') || lower.includes('military') || lower.includes('kelly') || lower.includes('irish') || lower.includes('army') || lower.includes('fern') || lower.includes('kiwi') || lower.includes('bottle green') || lower.includes('evergreen')) {
    displayName = 'Grønn';
    hexCode = '#16a34a';
  } else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('butter') || lower.includes('citron') || lower.includes('daisy') || lower.includes('mustard')) {
    displayName = 'Gul';
    hexCode = '#eab308';
  } else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('azalea') || lower.includes('heliconia') || lower.includes('orchid') || lower.includes('fuchsia') || lower.includes('cotton candy') || lower.includes('peach') || lower.includes('coral') || lower.includes('coral silk') || lower.includes('berry') || lower.includes('mauve') || lower.includes('hibiscus') || lower.includes('pale pink') || lower.includes('light pink') || lower.includes('hot pink')) {
    displayName = 'Rosa';
    hexCode = '#FF8AC9';
  } else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('stone') || lower.includes('khaki') || lower.includes('lys khaki') || lower.includes('tan') || lower.includes('rope') || lower.includes('toast') || lower.includes('saddle') || lower.includes('cocoa') || lower.includes('umber') || lower.includes('dark chocolate') || lower.includes('triblend brown') || lower.includes('natur') || lower.includes('dust')) {
    displayName = 'Beige';
    hexCode = '#DDD6D6';
  } else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('clay') || lower.includes('burnt orange')) {
    displayName = 'Terrakotta';
    hexCode = '#CC712B';
  } else if (lower.includes('orange') || lower.includes('oransje') || lower.includes('tangerine')) {
    displayName = 'Orange';
    hexCode = '#f18820';
  } else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('lavender') || lower.includes('amethyst') || lower.includes('lilak') || lower.includes('future lavender')) {
    displayName = 'Lilla';
    hexCode = '#a855f7';
  } else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('sport grey') || lower.includes('gravel') || lower.includes('smoke') || lower.includes('paragon') || lower.includes('graphite') || lower.includes('ice grey') || lower.includes('melange')) {
    displayName = 'Grå';
    hexCode = '#A8A8A8';
  }

  // Fallback to closest color if we resolved to standard gray fallback but have a specific name
  if (hexCode === '#888888' && inputStr) {
    try {
      // Create a dummy canvas to resolve standard CSS color names to RGB
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = lower;
        ctx.fillRect(0, 0, 1, 1);
        const imgData = ctx.getImageData(0, 0, 1, 1).data;
        if (imgData && imgData[3] > 0) {
          const closest = getClosestColor(imgData[0], imgData[1], imgData[2]);
          displayName = closest.name;
          hexCode = closest.hex;
        }
      }
    } catch (e) {}
  }

  return { name: displayName, hex: hexCode };
};
