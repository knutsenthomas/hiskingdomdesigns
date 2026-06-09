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
    { name: 'Grå', r: 229, g: 231, b: 235, hex: '#E5E7EB' },
    { name: 'Blå', r: 59, g: 130, b: 246, hex: '#3b82f6' },
    { name: 'Mørkeblå', r: 27, g: 73, b: 101, hex: '#1B4965' },
    { name: 'Rød', r: 239, g: 68, b: 68, hex: '#ef4444' },
    { name: 'Grønn', r: 22, g: 163, b: 74, hex: '#16a34a' },
    { name: 'Gul', r: 234, g: 179, b: 8, hex: '#eab308' },
    { name: 'Rosa', r: 219, g: 39, b: 119, hex: '#db2777' },
    { name: 'Beige', r: 212, g: 196, b: 181, hex: '#d4c4b5' },
    { name: 'Terrakotta', r: 204, g: 113, b: 43, hex: '#CC712B' },
    { name: 'Orange', r: 249, g: 115, b: 22, hex: '#f97316' },
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

export const resolveColor = (rawName) => {
  if (!rawName) return { name: 'Sort', hex: '#151A21' };
  
  let trimName = rawName.trim();
  
  const capitalize = (str) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // If it's a dual color split by /
  if (trimName.includes('/')) {
    const parts = trimName.split('/');
    const res1 = resolveColor(parts[0]);
    const res2 = resolveColor(parts[1]);
    const formattedName = [res1.name, res2.name].join('/');
    const gradient = `linear-gradient(135deg, ${res1.hex} 50%, ${res2.hex} 50%)`;
    return { name: formattedName, hex: gradient };
  }

  const lower = trimName.toLowerCase();
  
  // 1. Check if it's an rgb or hex code and classify using RGB distance
  if (lower.startsWith('rgb') || lower.startsWith('#')) {
    const { r, g, b } = lower.startsWith('#') ? parseHex(lower) : parseRgb(lower);
    const closest = getClosestColor(r, g, b);
    return { name: closest.name, hex: closest.hex };
  }

  // 2. Friendly name matching with expanded dictionary
  let displayName = capitalize(trimName);
  let hexCode = '#888888';

  if (lower.includes('sort') || lower.includes('svart') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('dark grey') || lower.includes('night')) {
    displayName = 'Sort';
    hexCode = '#151A21';
  } else if (lower.includes('hvit') || lower.includes('white') || lower.includes('off-white') || lower.includes('weiß') || lower.includes('ivory') || lower.includes('bone') || lower.includes('soft cream')) {
    displayName = 'Hvit';
    hexCode = '#FFFFFF';
  } else if (lower.includes('navy') || lower.includes('marine') || lower.includes('mørkeblå') || lower.includes('deep teal') || lower.includes('teal') || lower.includes('sapphire') || lower.includes('storm')) {
    displayName = 'Mørkeblå';
    hexCode = '#1B4965';
  } else if (lower.includes('royalblue') || lower.includes('royal') || lower.includes('carolina blue') || lower.includes('blue') || lower.includes('blå') || lower.includes('denim') || lower.includes('cornflower') || lower.includes('aqua') || lower.includes('caribbean') || lower.includes('chambray') || lower.includes('sky') || lower.includes('ocean') || lower.includes('chill')) {
    displayName = 'Blå';
    hexCode = '#3b82f6';
  } else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('burgundy') || lower.includes('garnet') || lower.includes('cherry') || lower.includes('cardinal') || lower.includes('bright salmon') || lower.includes('watermelon')) {
    displayName = 'Rød';
    hexCode = '#ef4444';
  } else if (lower.includes('grønn') || lower.includes('green') || lower.includes('forest') || lower.includes('olive') || lower.includes('oliven') || lower.includes('military') || lower.includes('kelly') || lower.includes('irish') || lower.includes('army') || lower.includes('mint') || lower.includes('dusty sage') || lower.includes('fern') || lower.includes('kiwi') || lower.includes('neo mint') || lower.includes('cool mint') || lower.includes('chalky mint') || lower.includes('pistachio')) {
    displayName = 'Grønn';
    hexCode = '#16a34a';
  } else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('butter') || lower.includes('citron') || lower.includes('daisy') || lower.includes('mustard')) {
    displayName = 'Gul';
    hexCode = '#eab308';
  } else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('azalea') || lower.includes('heliconia') || lower.includes('orchid') || lower.includes('fuchsia') || lower.includes('cotton candy') || lower.includes('peach') || lower.includes('coral') || lower.includes('coral silk') || lower.includes('tangerine') || lower.includes('berry') || lower.includes('mauve') || lower.includes('hibiscus')) {
    displayName = 'Rosa';
    hexCode = '#db2777';
  } else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('stone') || lower.includes('khaki') || lower.includes('tan') || lower.includes('rope') || lower.includes('toast') || lower.includes('saddle') || lower.includes('cocoa') || lower.includes('umber') || lower.includes('dark chocolate') || lower.includes('triblend brown') || lower.includes('natur')) {
    displayName = 'Beige';
    hexCode = '#d4c4b5';
  } else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('clay')) {
    displayName = 'Terrakotta';
    hexCode = '#CC712B';
  } else if (lower.includes('orange') || lower.includes('tangerine')) {
    displayName = 'Orange';
    hexCode = '#f97316';
  } else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('lavender') || lower.includes('amethyst') || lower.includes('lilak') || lower.includes('future lavender')) {
    displayName = 'Lilla';
    hexCode = '#a855f7';
  } else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('sport grey') || lower.includes('heather') || lower.includes('gravel') || lower.includes('smoke') || lower.includes('paragon')) {
    displayName = 'Grå';
    hexCode = '#E5E7EB';
  }

  // Fallback to closest color if we resolved to standard gray fallback but have a specific name
  if (hexCode === '#888888' && trimName) {
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
