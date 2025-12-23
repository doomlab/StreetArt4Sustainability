---
toc: false
---

<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist-min"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

```js data-import
// Load CSV files from src/data
const emotions_df = await FileAttachment(
  "data/DisplayAppMeans.csv"
).csv({ typed: true });

const metadata_df = await FileAttachment(
  "data/Metadata_StreetArt4Sustainability.csv"
).csv({ typed: true });
```

<div class="card" style="margin-bottom: 1.5rem;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
    <div class="inline-control">
      <span class="inline-label"><strong>Country</strong></span>
      <select id="country-select"></select>
    </div>
    <div class="inline-control">
      <span class="inline-label"><strong>X variable</strong></span>
      <select id="x-select"></select>
    </div>
    <div class="inline-control">
      <span class="inline-label"><strong>Y variable</strong></span>
      <select id="y-select"></select>
    </div>
  </div>
</div>

<div class="card collapsible">
  <button class="collapse-toggle" aria-expanded="true">
    Scatterplot
  </button>
  <div class="collapse-content open">
    <div id="scatterplot-container"></div>
  </div>
</div>
<div id="point-details" class="card collapsible" style="margin-top: 1rem;">
  <button class="collapse-toggle" aria-expanded="true">
    Artwork Details
  </button>
  <div class="collapse-content open">
    <em>Click a point to see details.</em>
  </div>
</div>

```js plotly-scatter

// Build dropdown options
const countries = Array.from(
  new Set(emotions_df.map(d => d.Group))
).filter(Boolean).sort();

const excluded = new Set(["PictureID", "n"]);

const numericColumns = Object.keys(emotions_df[0]).filter(col =>
  col !== "Group" &&
  !excluded.has(col) &&
  emotions_df.some(d => typeof d[col] === "number")
);

// Build a quick lookup: PictureID -> Title
const titleById = new Map(
  metadata_df.map(d => [String(d.Number), d.Title])
);

// Grab DOM elements
const countrySelect = document.getElementById("country-select");
const xSelect = document.getElementById("x-select");
const ySelect = document.getElementById("y-select");
const plotEl = document.getElementById("scatterplot-container");
const detailsBox = document.querySelector("#point-details .collapse-content");

// Populate selects
countrySelect.innerHTML = countries
  .map(c => `<option value="${c}">${c}</option>`)
  .join("");

xSelect.innerHTML = numericColumns
  .map(v => `<option value="${v}">${v}</option>`)
  .join("");

ySelect.innerHTML = numericColumns
  .map(v => `<option value="${v}">${v}</option>`)
  .join("");

// Initial values
countrySelect.value = countries[0];
xSelect.value = numericColumns[0];
ySelect.value = numericColumns[1];

// Plot update function
function updatePlot() {
  const selectedCountry = countrySelect.value;
  const x = xSelect.value;
  const y = ySelect.value;

  const filtered = emotions_df.filter(d => d.Group === selectedCountry);

  Plotly.react(
    plotEl,
    [
      {
        x: filtered.map(d => d[x]),
        y: filtered.map(d => d[y]),
        customdata: filtered,
        text: filtered.map(d =>
          titleById.get(String(d.PictureID)) ?? "Unknown artwork"
        ),
        mode: "markers",
        type: "scatter",
        marker: { size: 8, opacity: 0.7 },
        hovertemplate:
          `<b>%{text}</b><br>` +
          `<b>${x}:</b> %{x:.2f}<br>` +
          `<b>${y}:</b> %{y:.2f}<extra></extra>`
      }
    ],
    {
      title: { text: `${y} vs ${x} (${selectedCountry})` },
      xaxis: { title: { text: x }, automargin: true },
      yaxis: { title: { text: y }, automargin: true },
      margin: { t: 60, r: 20, b: 60, l: 70 }
    }
  );
}

// Initial render
updatePlot();

// Update on dropdown change
countrySelect.addEventListener("change", updatePlot);
xSelect.addEventListener("change", updatePlot);
ySelect.addEventListener("change", updatePlot);

// Click handler
plotEl.on("plotly_click", (event) => {
  const d = event.points[0].customdata;

  // Join metadata: PictureID (emotions) ↔ Number (metadata)
  const meta = metadata_df.find(
    m => String(m.Number) === String(d.PictureID)
  );

  detailsBox.innerHTML = `
    <strong>Selected artwork</strong><br>
    <b>Country:</b> ${d.Group}<br>
    <b>${xSelect.value}:</b> ${Number(d[xSelect.value]).toFixed(2)}<br>
    <b>${ySelect.value}:</b> ${Number(d[ySelect.value]).toFixed(2)}<br>
    <b>Picture ID:</b> ${d.PictureID ?? "NA"}<br><br>
    <img src="https://raw.githubusercontent.com/doomlab/StreetArt4Sustainability/refs/heads/main/src/imgs/${String(d.PictureID).padStart(3, "0")}.jpg">
    <br><br>
    <strong>Metadata</strong><br>
    <b>Artist:</b> ${meta?.Artist ?? "NA"}<br>
    <b>Title:</b> ${meta?.Title ?? "NA"}<br>
    <b>Year:</b> ${meta?.Year ?? "NA"}<br>
    <b>Location:</b> ${meta?.Location ?? "NA"}<br>
    <b>Description:</b> ${meta?.Description ?? "NA"}<br>
    ${
      meta?.Link
        ? `<b>Link:</b> <a href="${meta.Link}" target="_blank" rel="noopener">View artwork</a><br>`
        : ""
    }
    <b>Copyright:</b> ${meta?.Copyright ?? "NA"}
  `;
});

// Collapsible card toggle
document.querySelectorAll(".collapsible").forEach(card => {
  const toggle = card.querySelector(".collapse-toggle");
  const content = card.querySelector(".collapse-content");

  toggle.addEventListener("click", () => {
    const isOpen = content.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });
});
```

<style>

body {
  font-size: 1.15rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

/* Larger dropdown controls for embedded dashboard */
.card select,
.card label {
  font-size: 1.15rem;
}

.card {
  font-size: 1.15rem !important;
}

.card select {
  padding: 0.6rem 0.75rem;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inline-control select {
  min-width: 200px;
}

.inline-label {
  white-space: nowrap;
  font-weight: 600;
}

/* Collapsible card */
.collapsible {
  padding: 0;
}

.collapse-toggle {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.collapse-content {
  padding: 0 1rem 1rem;
  display: none;
}

.collapse-content.open {
  display: block;
}

</style>
