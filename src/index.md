---
toc: false
---

<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist-min"></script>

```js data-import
// Load CSV files from src/data
const emotions_df = await FileAttachment(
  "data/DisplayAppMeans.csv"
).csv({ typed: true });

const metadata_df = await FileAttachment(
  "data/Metadata_StreetArt4Sustainability.csv"
).csv({ typed: true });

// Quick sanity checks
emotions_df.slice(0, 3);
metadata_df.length;
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

<div id="scatterplot-container"></div>
<div id="point-details" class="card" style="margin-top: 1rem;">
  <em>Click a point to see details.</em>
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

// Grab DOM elements
const countrySelect = document.getElementById("country-select");
const xSelect = document.getElementById("x-select");
const ySelect = document.getElementById("y-select");
const plotEl = document.getElementById("scatterplot-container");
const detailsBox = document.getElementById("point-details");

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
        mode: "markers",
        type: "scatter",
        marker: { size: 8, opacity: 0.7 }
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

  detailsBox.innerHTML = `
    <strong>Selected artwork</strong><br>
    <b>Country:</b> ${d.Group}<br>
    <b>${xSelect.value}:</b> ${d[xSelect.value]}<br>
    <b>${ySelect.value}:</b> ${d[ySelect.value]}<br>
    <b>PictureID:</b> ${d.PictureID ?? "NA"}
  `;
});
```

<style>

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



</style>
