let boards = []
let currentPage = 1
const cardsPerPage = 6

fetch("data/data.json")
  .then(res => res.json())
  .then(data => {
    boards = data
    renderCards()
  })

function badge(status) {
  if (status === "verified") return `<span class="badge bg-success">Verified</span>`
  if (status === "unverified") return `<span class="badge bg-warning text-dark">Unverified</span>`
  if (status === "danger") return `<span class="badge bg-danger">Danger</span>`
  return ""
}

function confirmDanger(url) {
  const modal = new bootstrap.Modal(document.getElementById("dangerModal"))
  document.getElementById("confirmDangerBtn").href = url
  modal.show()
}

/* lormex lormex lormex.. lormex support by sloppey */
async function getLormex() {
  let revivals = {};

  /* first pass compute current ccu */
  await fetch("https://lormex.xyz/api/revivals?page=1&pageSize=69&fast=1")
    .then(res => res.json())
    .then(json => {
      for (var i in json.items) {
        var rev = json.items[i];
        // name and slug is stored because some revs like syntax have a slug of synt2x when on this site its listed as syntax 2. dumb hack
        revivals[rev.slug] = rev.dynamic.online
        revivals[rev.name.toLowerCase()] = rev.dynamic.online
      }
    })
    .catch(err => console.error("Error:", err));

    return revivals
}

async function renderCards() {
  const container = document.getElementById("cardContainer")
  container.innerHTML = ""

  const start = (currentPage - 1) * cardsPerPage
  const end = start + cardsPerPage
  const paginated = boards.slice(start, end)

  const lormexData = await getLormex(); // camel case FTW

  paginated.forEach(board => {
    const col = document.createElement("div")
    col.className = "col-md-6 col-lg-4"

    let clickAction = ""
    if (board.url) {
      if (board.status === "danger") {
        clickAction = `onclick="confirmDanger('${board.url}')"`
      } else {
        clickAction = `onclick="window.open('${board.url}','_blank')"`
      }
    }

    let discordBtn = ""
    if (board.discord_url) {
      discordBtn = `<a href="${board.discord_url}" target="_blank" class="btn btn-info btn-sm me-2" onclick="event.stopPropagation()">Discord</a>`
    }

    let iconImg = ""
    if (board.icon) {
      iconImg = `<img src="${board.icon}" alt="${board.name}" class="rounded me-3" style="width:56px;height:56px;object-fit:cover;">`
    }

    col.innerHTML = `
      <div class="card h-100 shadow-sm" style="cursor:pointer" ${clickAction}>
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center mb-3">
            ${iconImg}
            <div>
              <h5 class="card-title mb-1">
                ${board.name}
                <small class="text-muted">${board.version}</small>
              </h5>
              ${badge(board.status)}
            </div>
          </div>
          <p class="card-text flex-grow-1">${board.description}</p>
          <div class="mt-auto">
            <button class="btn btn-primary btn-sm me-2">Visit</button>
            ${discordBtn}
          </div>
          <span style="position:absolute; bottom:6px; right:10px; font-size:0.85rem; color:#6c757d;">CCU: ${lormexData[board.name.toLowerCase()] ?? "N/A"} </span>        
        </div>
      </div>
    `

    container.appendChild(col)
  })

  renderPagination()
}

function renderPagination() {
  const pagination = document.getElementById("pagination")
  pagination.innerHTML = ""
  const totalPages = Math.ceil(boards.length / cardsPerPage)

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li")
    li.className = `page-item ${i === currentPage ? "active" : ""}`
    li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`
    pagination.appendChild(li)
  }
}

function changePage(page) {
  currentPage = page
  renderCards()
}

twemoji.parse(document.querySelector("body"));
