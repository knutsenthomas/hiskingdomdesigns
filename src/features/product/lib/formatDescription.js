function formatDescription(html, lang = "no") {
  if (!html) return "";
  if (!html.toLowerCase().includes("measurements")) return html;

  const parts = html.split(/<\/p>/i);

  const before = [];
  const sizeRows = [];
  const after = [];
  let inMeasurements = false;
  let headerHtml = "";

  const isNo = lang === "no";
  const isEs = lang === "es";

  const headerText = isNo
    ? "Størrelsesmål:"
    : isEs
      ? "Medidas:"
      : "Measurements:";
  const footerText = isNo
    ? "Alle mål er veiledende med en minimumstoleranse på 1 cm."
    : isEs
      ? "Todas las medidas son indicativas con una tolerancia mínima de 1 cm."
      : "All measurements are indicative with minimum tolerance of 1 cm.";

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const p = part + "</p>";

    // Strip HTML tags to check text content
    const text = p
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\u00A0/g, " ")
      .trim();

    if (text.toLowerCase() === "measurements:") {
      inMeasurements = true;
      headerHtml = `<p><strong>${headerText}</strong></p>`;
      continue;
    }

    if (text.toLowerCase().includes("all measurements are indicative")) {
      after.push(`<p>${footerText}</p>`);
      continue;
    }

    if (inMeasurements) {
      const firstWord = text.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, "");
      const isSize = [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "XXS",
        "XXL",
        "4XL",
      ].includes(firstWord.toUpperCase());

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
    const headers = isNo
      ? ["Størrelse", "Lengde", "Brystvidde (½ Chest)"]
      : isEs
        ? ["Talla", "Largo", "½ Pecho"]
        : ["Size", "Length", "½ Chest"];

    sizeRows.forEach((row) => {
      const cleanText = row.replace(/[\s\u00A0]+/g, " ").trim();
      const tokens = cleanText.split(" ");

      if (
        tokens[0].toUpperCase() === "XS" &&
        cleanText.toLowerCase().includes("body")
      ) {
        // mixed row: "XS Body Length 66. ½ Chest 46"
        tableRows.push({
          size: "XS",
          length: "66 cm",
          chest: "46 cm",
        });
      } else {
        const size = tokens[0].replace(/\.$/, ""); // remove trailing dot like "M."
        const length = tokens[1] ? tokens[1].replace(/\.$/, "") + " cm" : "";
        const chest = tokens[2] ? tokens[2].replace(/\.$/, "") + " cm" : "";
        tableRows.push({
          size,
          length,
          chest,
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
      ${tableRows
        .map(
          (r) => `
      <tr class="hover:bg-onyx/5 transition-colors">
        <td class="p-3 font-bold text-terracotta">${r.size}</td>
        <td class="p-3 font-medium text-secondary">${r.length}</td>
        <td class="p-3 font-medium text-secondary">${r.chest}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>`;

    const beforeHtml = before.join("");
    const afterHtml = after.join("");
    return beforeHtml + headerHtml + tableHtml + afterHtml;
  }

  return html;
}

export { formatDescription };
