const rawHtml = `<p>Hettejakke med ton-i-ton glidelås, To lommer i front og flatt snøre. Mykt stoff som er egnet for intensiv vasking med anti-pilling-finish. Elastisk ribb i ermet og nederkant. Tilpasset for hodetelefoner. Snoren til hetten er avtagbar og kan derfor byttes ut med andre farger.<br><strong>Tekstil:</strong>&nbsp;65% polyester, 35% bomull.</p><p><strong>Measurements:</strong></p><p><strong>XS</strong>&nbsp;Body Length 66.&nbsp;½ Chest 46</p><p>S &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;69. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 50 &nbsp; &nbsp; &nbsp;&nbsp;</p><p>M. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;72. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;54</p><p>L &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 75 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 59</p><p>XL &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;78. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 64</p><p>2XL &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;81 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 69</p><p>3XL &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 84 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;75&nbsp;</p><p>All measurements are indicative with minimum tolerance of 1 cm.</p>`;

function formatDescription(html) {
  if (!html) return '';
  if (!html.toLowerCase().includes('measurements')) return html;
  
  const parts = html.split(/<\/p>/i);
  
  const before = [];
  const sizeRows = [];
  const after = [];
  let inMeasurements = false;
  let headerHtml = '';
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const p = part + '</p>';
    
    // Strip HTML tags to check text content
    const text = p.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ').trim();
    
    if (text.toLowerCase() === 'measurements:') {
      inMeasurements = true;
      headerHtml = p;
      continue;
    }
    
    if (inMeasurements) {
      const firstWord = text.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '');
      const isSize = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'XXS', 'XXL', '4XL'].includes(firstWord.toUpperCase());
      
      if (isSize) {
        sizeRows.push(text);
      } else {
        if (sizeRows.length > 0) {
          after.push(p);
          inMeasurements = false;
        } else {
          before.push(p);
        }
      }
    } else {
      before.push(p);
    }
  }
  
  if (sizeRows.length > 0) {
    const tableRows = [];
    const headers = ['Størrelse (Size)', 'Lengde (Length)', 'Brystvidde (½ Chest)'];
    
    sizeRows.forEach(row => {
      const cleanText = row.replace(/[\s\u00A0]+/g, ' ').trim();
      const tokens = cleanText.split(' ');
      
      if (tokens[0].toUpperCase() === 'XS' && cleanText.toLowerCase().includes('body')) {
        // mixed row: "XS Body Length 66. ½ Chest 46"
        tableRows.push({
          size: 'XS',
          length: '66 cm',
          chest: '46 cm'
        });
      } else {
        const size = tokens[0].replace(/\.$/, ''); // remove trailing dot like "M."
        const length = tokens[1] ? tokens[1].replace(/\.$/, '') + ' cm' : '';
        const chest = tokens[2] ? tokens[2].replace(/\.$/, '') + ' cm' : '';
        tableRows.push({
          size,
          length,
          chest
        });
      }
    });
    
    const tableHtml = `
<div class="my-4 overflow-x-auto border border-outline-variant/30 rounded-2xl bg-white/40 shadow-xs">
  <table class="w-full border-collapse text-left text-sm text-onyx">
    <thead>
      <tr class="bg-onyx/5 border-b border-outline-variant/40">
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[0]}</th>
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[1]}</th>
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[2]}</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-outline-variant/20">
      ${tableRows.map(r => `
      <tr class="hover:bg-onyx/5 transition-colors">
        <td class="p-3 font-bold text-terracotta">${r.size}</td>
        <td class="p-3 font-medium text-secondary">${r.length}</td>
        <td class="p-3 font-medium text-secondary">${r.chest}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>`;
    
    const beforeHtml = before.join('');
    const afterHtml = after.join('');
    return beforeHtml + headerHtml + tableHtml + afterHtml;
  }
  
  return html;
}

console.log('Result HTML:');
console.log(formatDescription(rawHtml));
