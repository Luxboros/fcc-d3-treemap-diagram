const URLS = [
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
];
const LINKS = [
  {
    a: "Kickstarter",
    title: "Kickstarter Pledges",
    description:
      "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
  },
  {
    a: "Movies",
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
  },
  {
    a: "Video Games",
    title: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
  },
];
const WIDTH = 1600;
const HEIGHT = 700;
const LEGEND_WIDTH = WIDTH * 0.8;
const LEGEND_HEIGHT = HEIGHT * 0.2;
const DATA = [];
let currentIndex = Math.floor(Math.random() * 3);
const getDataAndDrawTreeMap = () => {
  Promise.all([d3.json(URLS[0]), d3.json(URLS[1]), d3.json(URLS[2])]).then(
    (data) => {
      DATA.push(...data);
      drawTreeMap(String(currentIndex));
    }
  );
};
const body = d3
  .select("body")
  .attr(
    "class",
    "bg-gray-900 text-gray-200 font-sans subpixel-antialiased h-screen w-screen flex flex-col items-center"
  );

body
  .append("h1")
  .text(LINKS[currentIndex].title)
  .attr("id", "title")
  .attr("class", "text-4xl my-2");
body
  .append("h2")
  .text(LINKS[currentIndex].description)
  .attr("id", "description")
  .attr("class", "text-2xl my-2");

const links = body
  .append("div")
  .attr("id", "links")
  .attr("class", "w-1/3 justify-around flex flex-row my-2");

links
  .selectAll("h3")
  .data(LINKS)
  .enter()
  .append("h3")
  .attr("id", (d, i) => i)
  .text((d) => d.a.toUpperCase())
  .attr(
    "class",
    (d, i) =>
      `${
        i === currentIndex ? "text-indigo-600" : "text-gray-200"
      } cursor-pointer`
  )
  .on("click", (e) => {
    if (e.target.id === currentIndex) return;
    d3.selectAll("g").remove();
    tooltip.remove();
    legend.remove();
    drawTreeMap(e.target.id);
    d3.select("#title").text(LINKS[e.target.id].title);
    d3.select("#description").text(LINKS[e.target.id].description);
    d3.selectAll("h3").attr("class", "text-gray-200 cursor-pointer");
    d3.select(e.target).attr("class", "text-indigo-600 cursor-pointer");
  });

const svg = body
  .append("svg")
  .style("width", `${WIDTH}px`)
  .style("height", `${HEIGHT}px`);

const drawTreeMap = (index) => {
  currentIndex = index;
  const names = DATA[index].children.map((d) => d.name);
  const root = d3.hierarchy(DATA[index]).sum((d) => d.value);

  d3.treemap().size([WIDTH, HEIGHT]).padding(1)(root);
  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

  cell
    .append("rect")
    .attr("id", (d) => d.data.name)
    .attr("class", "tile overflow-hidden")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("fill", (d) =>
      d3.interpolateRainbow(names.indexOf(d.data.category) / (names.length - 1))
    )
    .on("mouseover", (e, d) => {
      d3.select("#tooltip")
        .style("opacity", 0.9)
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 10}px`)
        .style("background-color", e.target.attributes.fill.value)
        .attr("data-value", d.data.value)
        .html(
          `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
        );
    })

    .on("mouseout", (e, d) => {
      d3.select("#tooltip").style("opacity", 0);
    });

  cell
    .append("text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("class", "fill-gray-100 text-xs")
    .attr("x", 5)
    .attr("y", (d, i) => 20 + i * 15)
    .text((d) => d);
  const tooltip = body
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .attr(
      "class",
      "border border-gray-200 text-black absolute p-4 rounded pointer-events-none text-center"
    );
  const legend = body.append("svg").attr("id", "legend");
  legend
    .attr("width", LEGEND_WIDTH)
    .attr("height", LEGEND_HEIGHT)
    .attr("class", "absolute bottom-0");

  legend
    .selectAll("rect")
    .data(names)
    .enter()
    .append("rect")
    .attr("x", (d, i) => (LEGEND_WIDTH / 6) * (i % 6))
    .attr("y", (d, i) => Math.floor(i / 6) * 35)
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", (d, i) => d3.interpolateRainbow(i / (names.length - 1)))
    .attr("class", "legend-item");
  legend
    .selectAll("text")
    .data(names)
    .enter()
    .append("text")
    .attr("x", (d, i) => (LEGEND_WIDTH / 6) * (i % 6) + 35)
    .attr("y", (d, i) => Math.floor(i / 6) * 35 + 16 * 1.25)
    .text((d) => d)
    .attr("class", "legend-item fill-gray-200 text-xl");
};
getDataAndDrawTreeMap();
