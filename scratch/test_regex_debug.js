const specRegex = /(?:papirfinish|paper\s+finish|paper\s+finishing|papirvekt|paper\s+weight|tykkelse|thickness|bærekraftig|sustainable|materiale|material|koppehøyde|mug\s+height|bunndiameter|bottom\s+diameter|leveringstid|delivery|størrelse|size|vaskeanvisning|care\s+instructions|produktsikkerhet|safety|frakt|shipping|vekt|weight)\s*:/i;

const text = "Tro som et sennepsfrø... Plakat laget på vårt lettere, ubestrøkede klassiske matte papir. Det perfekte valget for å vare over tid: Papirfinish: Matt, glatt, ikke-reflekterende overflate. Papirvekt: 170 g/m² (65 lb), tykkelse: 0,19 mm (7,5 mils), solid og slitesterkt. Bærekraftig papir: FSC-sertifisert eller tilsvarende for bærekraft.Designet av Jaana Särg-Raani for His Kingdom Designs.Global frakt.";

const match = specRegex.exec(text);
if (match) {
  console.log("Matched:", match[0]);
  console.log("At index:", match.index);
} else {
  console.log("No match!");
}
