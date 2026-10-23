// These delivery-region codes match the choices in the Wix-hosted Norwegian checkout.
export const norwegianCheckoutRegions = [
  ['NO-02', 'Akershus'], ['NO-09', 'Aust-Agder'], ['NO-06', 'Buskerud'],
  ['NO-20', 'Finnmark'], ['NO-04', 'Hedmark'], ['NO-12', 'Hordaland'],
  ['NO-15', 'Møre og Romsdal'], ['NO-17', 'Nord-Trøndelag'], ['NO-18', 'Nordland'],
  ['NO-05', 'Oppland'], ['NO-03', 'Oslo'], ['NO-01', 'Østfold'],
  ['NO-11', 'Rogaland'], ['NO-14', 'Sogn og Fjordane'], ['NO-16', 'Sør-Trøndelag'],
  ['NO-08', 'Telemark'], ['NO-19', 'Troms'], ['NO-10', 'Vest-Agder'], ['NO-07', 'Vestfold'],
];

export const formatStreetAddress = address => {
  if (typeof address === 'string') return address.trim();
  if (!address || typeof address !== 'object') return '';
  return [address.name, address.number].filter(Boolean).join(' ').trim();
};

export const toWixStreetAddress = address => {
  if (address && typeof address === 'object' && address.name) {
    return { name: address.name, ...(address.number ? { number: address.number } : {}) };
  }
  const line = formatStreetAddress(address);
  if (!line) return undefined;
  const match = line.match(/^(.*\S)\s+(\d+\s*[A-Za-zÆØÅæøå]?(?:[-/]\d+\s*[A-Za-zÆØÅæøå]?)?)$/);
  return match ? { name: match[1], number: match[2] } : { name: line };
};
