// Global State
let state = {
  pizzaFlavors: [
    { id: "1", name: "Hawaiana", available: true },
    { id: "2", name: "Jamón con Queso", available: true },
    { id: "3", name: "Jamón con Pollo", available: true },
    { id: "4", name: "Champiñones con Pollo", available: true },
    { id: "5", name: "Pepperoni", available: true },
    { id: "6", name: "Campesina", available: true },
    { id: "7", name: "Vasqueza", available: true },
    { id: "8", name: "Salami", available: true },
    { id: "9", name: "Mexicana", available: true },
    { id: "10", name: "Carnes Frías", available: true },
  ],
  drinks: [
    { id: "1", name: "Coca Cola 1.5lt", price: 7500, available: true },
    { id: "2", name: "Agua", price: 1000, available: true },
    { id: "3", name: "HIT", price: 3500, available: true },
  ],
  personalSodas: [
    {
      id: "1",
      brand: "Coca Cola",
      flavors: [{ id: "1", name: "Original", available: true }],
      price: 2000,
      available: true,
    },
    {
      id: "2",
      brand: "Postobón",
      flavors: [
        { id: "1", name: "Manzana", available: true },
        { id: "2", name: "Uva", available: true },
        { id: "3", name: "Piña", available: true },
        { id: "4", name: "Pepsi", available: true },
        { id: "5", name: "Naranja", available: true },
        { id: "6", name: "Colombiana", available: true },
        { id: "7", name: "Kola", available: true },
      ],
      price: 2000,
      available: true,
    },
  ],
  pizzaInventory: [],
  sales: [],
  expenses: [],
  tables: Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    isOccupied: false,
    customerName: "",
    orders: [],
    totalAmount: 0,
  })),
  selectedTable: null,
}

// Constants
const PIZZA_PRICES = {
  local: 54000,
  takeaway: 56000,
  perSlice: 4500,
  caja: 56000,
  bolsa: 54000,
}

// Utility Functions
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price)
}

function saveState() {
  localStorage.setItem("pizzeriaState", JSON.stringify(state))
}

function loadState() {
  const saved = localStorage.getItem("pizzeriaState")
  if (saved) {
    state = { ...state, ...JSON.parse(saved) }
  }
}

// Tab Management
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab

      // Remove active class from all tabs and contents
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      btn.classList.add("active")
      document.getElementById(tabId).classList.add("active")
    })
  })

  // Sub tabs
  const subTabBtns = document.querySelectorAll(".sub-tab-btn")
  subTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const subtabId = btn.dataset.subtab
      const parent = btn.closest(".card-content")

      // Remove active class from sibling sub-tabs
      parent.querySelectorAll(".sub-tab-btn").forEach((b) => b.classList.remove("active"))
      parent.querySelectorAll(".sub-tab-content").forEach((c) => c.classList.remove("active"))

      // Add active class
      btn.classList.add("active")
      parent.querySelector(`#${subtabId}`).classList.add("active")
    })
  })
}

// Modal Management
function openModal(title, body, footer = "") {
  document.getElementById("modalTitle").textContent = title
  document.getElementById("modalBody").innerHTML = body
  document.getElementById("modalFooter").innerHTML =
    footer + '<button onclick="closeModal()" class="btn-secondary">Cancelar</button>'
  document.getElementById("modal").classList.add("active")
}

function closeModal() {
  document.getElementById("modal").classList.remove("active")
}

// Pizza Flavors Management
function addPizzaFlavor() {
  const nameInput = document.getElementById("newFlavorName")
  const name = nameInput.value.trim()

  if (name) {
    const newFlavor = {
      id: generateId(),
      name: name,
      available: true,
    }
    state.pizzaFlavors.push(newFlavor)
    nameInput.value = ""
    renderPizzaFlavors()
    updateFlavorSelectors()
    saveState()
  }
}

function toggleFlavorAvailability(id) {
  const flavor = state.pizzaFlavors.find((f) => f.id === id)
  if (flavor) {
    flavor.available = !flavor.available
    renderPizzaFlavors()
    updateFlavorSelectors()
    saveState()
  }
}

function editPizzaFlavor(id) {
  const flavor = state.pizzaFlavors.find((f) => f.id === id)
  if (flavor) {
    const body = `
            <div class="form-group">
                <label>Nombre del sabor</label>
                <input type="text" id="editFlavorName" value="${flavor.name}">
            </div>
        `
    const footer = `<button onclick="saveFlavorEdit('${id}')" class="btn-primary">Guardar cambios</button>`
    openModal("Editar Sabor de Pizza", body, footer)
  }
}

function saveFlavorEdit(id) {
  const newName = document.getElementById("editFlavorName").value.trim()
  if (newName) {
    const flavor = state.pizzaFlavors.find((f) => f.id === id)
    if (flavor) {
      flavor.name = newName
      renderPizzaFlavors()
      updateFlavorSelectors()
      closeModal()
      saveState()
    }
  }
}

function deletePizzaFlavor(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este sabor?")) {
    state.pizzaFlavors = state.pizzaFlavors.filter((f) => f.id !== id)
    renderPizzaFlavors()
    updateFlavorSelectors()
    saveState()
  }
}

function renderPizzaFlavors() {
  const container = document.getElementById("pizzaFlavorsList")
  container.innerHTML = state.pizzaFlavors
    .map(
      (flavor) => `
        <div class="item">
            <div class="item-info">
                <div class="item-name">${flavor.name}</div>
            </div>
            <div class="item-actions">
                <span class="badge ${flavor.available ? "badge-success" : "badge-secondary"}">
                    ${flavor.available ? "Disponible" : "No disponible"}
                </span>
                <button onclick="editPizzaFlavor('${flavor.id}')" class="btn-outline btn-sm">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleFlavorAvailability('${flavor.id}')" class="btn-outline btn-sm">
                    ${flavor.available ? "Desactivar" : "Activar"}
                </button>
                <button onclick="deletePizzaFlavor('${flavor.id}')" class="btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Drinks Management
function addDrink() {
  const nameInput = document.getElementById("newDrinkName")
  const priceInput = document.getElementById("newDrinkPrice")
  const name = nameInput.value.trim()
  const price = Number.parseFloat(priceInput.value)

  if (name && price) {
    const newDrink = {
      id: generateId(),
      name: name,
      price: price,
      available: true,
    }
    state.drinks.push(newDrink)
    nameInput.value = ""
    priceInput.value = ""
    renderDrinks()
    renderSellDrinks()
    saveState()
  }
}

function editDrink(id) {
  const drink = state.drinks.find((d) => d.id === id)
  if (drink) {
    const body = `
            <div class="form-group">
                <label>Nombre de la bebida</label>
                <input type="text" id="editDrinkName" value="${drink.name}">
            </div>
            <div class="form-group">
                <label>Precio</label>
                <input type="number" id="editDrinkPrice" value="${drink.price}">
            </div>
        `
    const footer = `<button onclick="saveDrinkEdit('${id}')" class="btn-primary">Guardar cambios</button>`
    openModal("Editar Bebida", body, footer)
  }
}

function saveDrinkEdit(id) {
  const newName = document.getElementById("editDrinkName").value.trim()
  const newPrice = Number.parseFloat(document.getElementById("editDrinkPrice").value)

  if (newName && newPrice) {
    const drink = state.drinks.find((d) => d.id === id)
    if (drink) {
      drink.name = newName
      drink.price = newPrice
      renderDrinks()
      renderSellDrinks()
      closeModal()
      saveState()
    }
  }
}

function toggleDrinkAvailability(id) {
  const drink = state.drinks.find((d) => d.id === id)
  if (drink) {
    drink.available = !drink.available
    renderDrinks()
    renderSellDrinks()
    saveState()
  }
}

function deleteDrink(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta bebida?")) {
    state.drinks = state.drinks.filter((d) => d.id !== id)
    renderDrinks()
    renderSellDrinks()
    saveState()
  }
}

function renderDrinks() {
  const container = document.getElementById("drinksList")
  container.innerHTML = state.drinks
    .map(
      (drink) => `
        <div class="item">
            <div class="item-info">
                <div class="item-name">${drink.name}</div>
                <div class="item-price">${formatPrice(drink.price)}</div>
            </div>
            <div class="item-actions">
                <span class="badge ${drink.available ? "badge-success" : "badge-secondary"}">
                    ${drink.available ? "Disponible" : "No disponible"}
                </span>
                <button onclick="editDrink('${drink.id}')" class="btn-outline btn-sm">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleDrinkAvailability('${drink.id}')" class="btn-outline btn-sm">
                    ${drink.available ? "Desactivar" : "Activar"}
                </button>
                <button onclick="deleteDrink('${drink.id}')" class="btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Personal Sodas Management
function addPersonalSoda() {
  const brandInput = document.getElementById("newSodaBrand")
  const priceInput = document.getElementById("newSodaPrice")
  const brand = brandInput.value.trim()
  const price = Number.parseFloat(priceInput.value)

  if (brand && price) {
    const newSoda = {
      id: generateId(),
      brand: brand,
      flavors: [{ id: generateId(), name: "Original", available: true }],
      price: price,
      available: true,
    }
    state.personalSodas.push(newSoda)
    brandInput.value = ""
    priceInput.value = ""
    renderPersonalSodas()
    renderSellPersonalSodas()
    saveState()
  }
}

function editPersonalSoda(id) {
  const soda = state.personalSodas.find((s) => s.id === id)
  if (soda) {
    const body = `
            <div class="form-group">
                <label>Marca de la gaseosa</label>
                <input type="text" id="editSodaBrand" value="${soda.brand}">
            </div>
            <div class="form-group">
                <label>Precio</label>
                <input type="number" id="editSodaPrice" value="${soda.price}">
            </div>
        `
    const footer = `<button onclick="saveSodaEdit('${id}')" class="btn-primary">Guardar cambios</button>`
    openModal("Editar Gaseosa", body, footer)
  }
}

function saveSodaEdit(id) {
  const newBrand = document.getElementById("editSodaBrand").value.trim()
  const newPrice = Number.parseFloat(document.getElementById("editSodaPrice").value)

  if (newBrand && newPrice) {
    const soda = state.personalSodas.find((s) => s.id === id)
    if (soda) {
      soda.brand = newBrand
      soda.price = newPrice
      renderPersonalSodas()
      renderSellPersonalSodas()
      closeModal()
      saveState()
    }
  }
}

function toggleSodaAvailability(id) {
  const soda = state.personalSodas.find((s) => s.id === id)
  if (soda) {
    soda.available = !soda.available
    renderPersonalSodas()
    renderSellPersonalSodas()
    saveState()
  }
}

function deletePersonalSoda(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta gaseosa?")) {
    state.personalSodas = state.personalSodas.filter((s) => s.id !== id)
    renderPersonalSodas()
    renderSellPersonalSodas()
    saveState()
  }
}

function addFlavorToSoda(sodaId, flavorName) {
  const soda = state.personalSodas.find((s) => s.id === sodaId)
  if (soda && flavorName.trim()) {
    const newFlavor = {
      id: generateId(),
      name: flavorName.trim(),
      available: true,
    }
    soda.flavors.push(newFlavor)
    renderPersonalSodas()
    renderSellPersonalSodas()
    saveState()
  }
}

function removeFlavorFromSoda(sodaId, flavorId) {
  const soda = state.personalSodas.find((s) => s.id === sodaId)
  if (soda) {
    soda.flavors = soda.flavors.filter((f) => f.id !== flavorId)
    renderPersonalSodas()
    renderSellPersonalSodas()
    saveState()
  }
}

function toggleSodaFlavorAvailability(sodaId, flavorId) {
  const soda = state.personalSodas.find((s) => s.id === sodaId)
  if (soda) {
    const flavor = soda.flavors.find((f) => f.id === flavorId)
    if (flavor) {
      flavor.available = !flavor.available
      renderPersonalSodas()
      renderSellPersonalSodas()
      saveState()
    }
  }
}

function renderPersonalSodas() {
  const container = document.getElementById("personalSodasList")
  container.innerHTML = state.personalSodas
    .map(
      (soda) => `
        <div class="item" style="flex-direction: column; align-items: stretch;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div class="item-info">
                    <div class="item-name">${soda.brand}</div>
                    <div class="item-price">${formatPrice(soda.price)}</div>
                </div>
                <div class="item-actions">
                    <span class="badge ${soda.available ? "badge-success" : "badge-secondary"}">
                        ${soda.available ? "Disponible" : "No disponible"}
                    </span>
                    <button onclick="editPersonalSoda('${soda.id}')" class="btn-outline btn-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleSodaAvailability('${soda.id}')" class="btn-outline btn-sm">
                        ${soda.available ? "Desactivar" : "Activar"}
                    </button>
                    <button onclick="deletePersonalSoda('${soda.id}')" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div>
                <label style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; display: block;">Sabores disponibles:</label>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <input type="text" id="newFlavor_${soda.id}" placeholder="Nuevo sabor" style="flex: 1;">
                    <button onclick="addFlavorToSoda('${soda.id}', document.getElementById('newFlavor_${soda.id}').value); document.getElementById('newFlavor_${soda.id}').value = '';" class="btn-primary btn-sm">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div style="display: grid; gap: 0.25rem;">
                    ${soda.flavors
                      .map(
                        (flavor) => `
                        <div class="flavor-item">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="flavor-name">${flavor.name}</span>
                                <span class="badge ${flavor.available ? "badge-success" : "badge-secondary"}" style="font-size: 0.625rem;">
                                    ${flavor.available ? "Disponible" : "No disponible"}
                                </span>
                            </div>
                            <div style="display: flex; gap: 0.25rem;">
                                <button onclick="toggleSodaFlavorAvailability('${soda.id}', '${flavor.id}')" class="btn-outline btn-sm" style="padding: 0.125rem 0.25rem; font-size: 0.75rem;">
                                    ${flavor.available ? "Desactivar" : "Activar"}
                                </button>
                                <button onclick="removeFlavorFromSoda('${soda.id}', '${flavor.id}')" class="btn-danger btn-sm" style="padding: 0.125rem 0.25rem;">
                                    <i class="fas fa-trash" style="font-size: 0.625rem;"></i>
                                </button>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Pizza Inventory Management
function updateFlavorSelectors() {
  const count = Number.parseInt(document.getElementById("flavorCount").value)
  const container = document.getElementById("flavorSelectors")

  const sliceDistribution = {
    1: [12],
    2: [6, 6],
    3: [3, 3, 6],
    4: [3, 3, 3, 3],
  }

  container.innerHTML = ""
  for (let i = 0; i < count; i++) {
    const slices = sliceDistribution[count][i]
    container.innerHTML += `
            <div class="form-group">
                <label>Sabor ${i + 1} (${slices} porciones)</label>
                <select id="flavor_${i}">
                    <option value="">Seleccionar sabor</option>
                    ${state.pizzaFlavors
                      .filter((f) => f.available)
                      .map((flavor) => `<option value="${flavor.id}">${flavor.name}</option>`)
                      .join("")}
                </select>
            </div>
        `
  }
}

function addPizzaToInventory() {
  const count = Number.parseInt(document.getElementById("flavorCount").value)
  const type = document.getElementById("pizzaType").value
  const selectedFlavors = []

  // Get selected flavors
  for (let i = 0; i < count; i++) {
    const flavorId = document.getElementById(`flavor_${i}`).value
    if (!flavorId) return // Exit if any flavor is not selected
    selectedFlavors.push(flavorId)
  }

  // Create flavor distribution
  const sliceDistribution = {
    1: [12],
    2: [6, 6],
    3: [3, 3, 6],
    4: [3, 3, 3, 3],
  }

  const flavors = selectedFlavors.map((flavorId, index) => {
    const flavor = state.pizzaFlavors.find((f) => f.id === flavorId)
    const slices = sliceDistribution[count][index]
    return {
      name: flavor.name,
      slices: slices,
      remainingSlices: slices,
    }
  })

  const newPizza = {
    id: generateId(),
    flavors: flavors,
    totalSlices: 12,
    remainingSlices: 12,
    type: type,
    pricePerSlice: PIZZA_PRICES.perSlice,
    totalPrice: PIZZA_PRICES[type],
  }

  state.pizzaInventory.push(newPizza)

  // Reset form
  document.getElementById("flavorCount").value = "1"
  updateFlavorSelectors()

  renderPizzaInventory()
  saveState()
}

function sellPizzaSlices(pizzaId, slices, specificFlavor = null) {
  const pizza = state.pizzaInventory.find((p) => p.id === pizzaId)
  if (!pizza || pizza.remainingSlices < slices) return

  const updatedFlavors = [...pizza.flavors]
  let slicesToSell = slices
  const flavorsSold = []

  if (specificFlavor) {
    // Sell specific flavor
    const flavorIndex = updatedFlavors.findIndex((f) => f.name === specificFlavor)
    if (flavorIndex !== -1 && updatedFlavors[flavorIndex].remainingSlices >= slices) {
      updatedFlavors[flavorIndex].remainingSlices -= slices
      flavorsSold.push(`${slices} de ${specificFlavor}`)
    } else {
      return // Can't sell
    }
  } else {
    // Sell automatically
    for (let i = 0; i < updatedFlavors.length && slicesToSell > 0; i++) {
      const availableSlices = Math.min(updatedFlavors[i].remainingSlices, slicesToSell)
      if (availableSlices > 0) {
        updatedFlavors[i].remainingSlices -= availableSlices
        slicesToSell -= availableSlices
        flavorsSold.push(`${availableSlices} de ${updatedFlavors[i].name}`)
      }
    }
  }

  const newRemainingSlices = updatedFlavors.reduce((sum, f) => sum + f.remainingSlices, 0)

  // Update pizza
  pizza.flavors = updatedFlavors
  pizza.remainingSlices = newRemainingSlices

  // Add sale
  const sale = {
    id: generateId(),
    type: "pizza",
    item: `Pizza (${flavorsSold.join(", ")}) - ${pizza.type === "local" ? "Local" : "Para llevar"}`,
    quantity: slices,
    price: pizza.pricePerSlice * slices,
    timestamp: new Date(),
  }
  state.sales.push(sale)

  renderPizzaInventory()
  renderSales()
  updateStatistics()
  saveState()
}

function sellWholePizza(pizzaId, packageType) {
  const pizza = state.pizzaInventory.find((p) => p.id === pizzaId)
  if (!pizza || pizza.remainingSlices !== 12) return

  const flavorNames = pizza.flavors.map((f) => f.name).join(", ")
  const packagePrice = packageType === "caja" ? PIZZA_PRICES.caja : PIZZA_PRICES.bolsa

  // Update pizza
  pizza.flavors = pizza.flavors.map((f) => ({ ...f, remainingSlices: 0 }))
  pizza.remainingSlices = 0

  // Add sale
  const sale = {
    id: generateId(),
    type: "pizza",
    item: `Pizza completa (${flavorNames}) - ${packageType === "caja" ? "En Caja" : "En Bolsa"}`,
    quantity: 1,
    price: packagePrice,
    timestamp: new Date(),
  }
  state.sales.push(sale)

  renderPizzaInventory()
  renderSales()
  updateStatistics()
  saveState()
}

function renderPizzaInventory() {
  const container = document.getElementById("pizzaInventoryList")

  if (state.pizzaInventory.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No hay pizzas en inventario. Agrega una pizza completa para comenzar.</div>'
    return
  }

  container.innerHTML = state.pizzaInventory
    .map(
      (pizza) => `
        <div class="pizza-item">
            <div class="pizza-header">
                <div class="pizza-info">
                    <h4>Pizza ${pizza.flavors.length > 1 ? "Mixta" : pizza.flavors[0]?.name}</h4>
                    <div class="pizza-flavors">
                        ${pizza.flavors
                          .map((flavor) => `• ${flavor.name}: ${flavor.remainingSlices}/${flavor.slices} porciones`)
                          .join("<br>")}
                    </div>
                    <div class="pizza-type">
                        ${pizza.type === "local" ? "Para consumir aquí" : "Para llevar"} - ${formatPrice(pizza.pricePerSlice)} por porción
                    </div>
                </div>
                <span class="badge ${pizza.remainingSlices > 0 ? "badge-success" : "badge-danger"}">
                    ${pizza.remainingSlices}/${pizza.totalSlices} porciones
                </span>
            </div>
            
            ${
              pizza.flavors.length > 1
                ? `
                <div class="flavor-actions">
                    <div class="action-group">
                        <label>Vender por sabor:</label>
                        <div>
                            ${pizza.flavors
                              .map(
                                (flavor) => `
                                <div class="flavor-item">
                                    <span class="flavor-name">${flavor.name} (${flavor.remainingSlices} disponibles)</span>
                                    <div class="action-buttons">
                                        ${[1, 2, 3]
                                          .map(
                                            (slices) => `
                                            <button onclick="sellPizzaSlices('${pizza.id}', ${slices}, '${flavor.name}')" 
                                                    class="btn-outline btn-sm" 
                                                    ${flavor.remainingSlices < slices ? "disabled" : ""}>
                                                ${slices}
                                            </button>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            `
                : ""
            }
            
            <div class="pizza-actions">
                <div class="action-group">
                    <label>Vender porciones mixtas:</label>
                    <div class="action-buttons">
                        ${[1, 2, 3, 4, 6]
                          .map(
                            (slices) => `
                            <button onclick="sellPizzaSlices('${pizza.id}', ${slices})" 
                                    class="btn-outline btn-sm" 
                                    ${pizza.remainingSlices < slices ? "disabled" : ""}>
                                ${slices}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                ${
                  pizza.remainingSlices === 12
                    ? `
                    <div class="action-group">
                        <label>Vender pizza completa:</label>
                        <div class="action-buttons">
                            <button onclick="sellWholePizza('${pizza.id}', 'bolsa')" class="btn-primary btn-sm">
                                <i class="fas fa-shopping-cart"></i> En Bolsa (${formatPrice(PIZZA_PRICES.bolsa)})
                            </button>
                            <button onclick="sellWholePizza('${pizza.id}', 'caja')" class="btn-primary btn-sm">
                                <i class="fas fa-shopping-cart"></i> En Caja (${formatPrice(PIZZA_PRICES.caja)})
                            </button>
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
            
            <div class="progress-bars">
                ${pizza.flavors
                  .map(
                    (flavor) => `
                    <div class="progress-item">
                        <div class="progress-label">${flavor.name}:</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(flavor.remainingSlices / flavor.slices) * 100}%"></div>
                        </div>
                        <div class="progress-text">${flavor.remainingSlices}/${flavor.slices}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("")
}

// Drinks Sales
function sellDrink(drinkId, quantity) {
  const drink = state.drinks.find((d) => d.id === drinkId)
  if (!drink || !drink.available) return

  const sale = {
    id: generateId(),
    type: "drink",
    item: drink.name,
    quantity: quantity,
    price: drink.price * quantity,
    timestamp: new Date(),
  }
  state.sales.push(sale)

  renderSales()
  updateStatistics()
  saveState()
}

function sellPersonalSoda(sodaId, flavorId, quantity) {
  const soda = state.personalSodas.find((s) => s.id === sodaId)
  const flavor = soda?.flavors.find((f) => f.id === flavorId)

  if (soda && flavor && flavor.available) {
    const sale = {
      id: generateId(),
      type: "drink",
      item: `${soda.brand} ${flavor.name}`,
      quantity: quantity,
      price: soda.price * quantity,
      timestamp: new Date(),
    }
    state.sales.push(sale)

    renderSales()
    updateStatistics()
    saveState()
  }
}

function renderSellDrinks() {
  const container = document.getElementById("sellGeneralDrinks")
  container.innerHTML = state.drinks
    .filter((d) => d.available)
    .map(
      (drink) => `
        <div class="item">
            <div class="item-info">
                <div class="item-name">${drink.name}</div>
                <div class="item-price">${formatPrice(drink.price)}</div>
            </div>
            <div class="item-actions">
                ${[1, 2, 3, 5]
                  .map(
                    (qty) => `
                    <button onclick="sellDrink('${drink.id}', ${qty})" class="btn-outline btn-sm">
                        ${qty}
                    </button>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("")
}

function renderSellPersonalSodas() {
  const container = document.getElementById("sellPersonalSodas")
  container.innerHTML = state.personalSodas
    .filter((soda) => soda.available)
    .map(
      (soda) => `
        <div class="item" style="flex-direction: column; align-items: stretch;">
            <h4 style="margin-bottom: 0.75rem;">${soda.brand} - ${formatPrice(soda.price)}</h4>
            <div class="grid-auto">
                ${soda.flavors
                  .filter((flavor) => flavor.available)
                  .map(
                    (flavor) => `
                    <div class="item">
                        <div class="item-info">
                            <div class="item-name">${flavor.name}</div>
                            <div class="item-price">${formatPrice(soda.price)}</div>
                        </div>
                        <div class="item-actions">
                            ${[1, 2, 3, 5]
                              .map(
                                (qty) => `
                                <button onclick="sellPersonalSoda('${soda.id}', '${flavor.id}', ${qty})" class="btn-outline btn-sm">
                                    ${qty}
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("")
}

// Sales Management
function renderSales() {
  const container = document.getElementById("salesList")

  if (state.sales.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay ventas registradas</div>'
    return
  }

  container.innerHTML = state.sales
    .map(
      (sale) => `
        <div class="sale-item">
            <div class="sale-info">
                <div class="sale-name">${sale.item}</div>
                <div class="sale-time">${sale.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="sale-price">${formatPrice(sale.price)}</div>
        </div>
    `,
    )
    .join("")
}

// Tables Management
function selectTable(tableId) {
  state.selectedTable = tableId
  renderTables()
  renderTableControl()
  renderTableOrders()
}

function occupyTable(tableId, customerName) {
  const table = state.tables.find((t) => t.id === tableId)
  if (table && customerName.trim()) {
    table.isOccupied = true
    table.customerName = customerName.trim()
    renderTables()
    renderTableControl()
    saveState()
  }
}

function freeTable(tableId) {
  const table = state.tables.find((t) => t.id === tableId)
  if (table && table.orders.length > 0) {
    // Add all orders to general sales
    table.orders.forEach((order) => {
      const sale = {
        id: generateId(),
        type: order.type,
        item: `Mesa ${tableId} - ${order.item}`,
        quantity: order.quantity,
        price: order.price,
        timestamp: new Date(),
      }
      state.sales.push(sale)
    })
  }

  // Reset table
  const tableIndex = state.tables.findIndex((t) => t.id === tableId)
  state.tables[tableIndex] = {
    id: tableId,
    isOccupied: false,
    customerName: "",
    orders: [],
    totalAmount: 0,
  }

  renderTables()
  renderTableControl()
  renderTableOrders()
  renderSales()
  updateStatistics()
  saveState()
}

function addOrderToTable(tableId) {
  const orderType = document.getElementById("orderType").value
  const quantity = Number.parseInt(document.getElementById("orderQuantity").value)
  let orderItem = ""
  let orderPrice = 0

  if (orderType === "pizza") {
    const pizzaId = document.getElementById("tablePizza").value
    const flavorName = document.getElementById("tablePizzaFlavor").value
    const pizza = state.pizzaInventory.find((p) => p.id === pizzaId)
    const selectedFlavor = pizza?.flavors.find((f) => f.name === flavorName)

    if (pizza && selectedFlavor && selectedFlavor.remainingSlices >= quantity) {
      orderItem = `${flavorName} (${quantity} porciones)`
      orderPrice = pizza.pricePerSlice * quantity

      // Update inventory
      sellPizzaSlices(pizzaId, quantity, flavorName)
    } else {
      alert("No hay suficientes porciones disponibles de este sabor")
      return
    }
  } else if (orderType === "drink") {
    const drinkType = document.getElementById("drinkType").value

    if (drinkType === "general") {
      const drinkId = document.getElementById("tableDrink").value
      const drink = state.drinks.find((d) => d.id === drinkId)
      if (drink) {
        orderItem = drink.name
        orderPrice = drink.price * quantity
      }
    } else if (drinkType === "personal") {
      const sodaId = document.getElementById("tableSoda").value
      const flavorId = document.getElementById("tableSodaFlavor").value
      const soda = state.personalSodas.find((s) => s.id === sodaId)
      const flavor = soda?.flavors.find((f) => f.id === flavorId)
      if (soda && flavor) {
        orderItem = `${soda.brand} ${flavor.name}`
        orderPrice = soda.price * quantity
      }
    }
  }

  if (orderItem && orderPrice > 0) {
    const newOrder = {
      id: generateId(),
      type: orderType,
      item: orderItem,
      quantity: quantity,
      price: orderPrice,
      timestamp: new Date(),
    }

    const table = state.tables.find((t) => t.id === tableId)
    table.orders.push(newOrder)
    table.totalAmount += orderPrice

    // Reset form
    document.getElementById("tablePizza").value = ""
    document.getElementById("tablePizzaFlavor").value = ""
    document.getElementById("tableDrink").value = ""
    document.getElementById("tableSoda").value = ""
    document.getElementById("tableSodaFlavor").value = ""
    document.getElementById("orderQuantity").value = "1"

    renderTables()
    renderTableControl()
    renderTableOrders()
    renderPizzaInventory()
    saveState()
  }
}

function renderTables() {
  const container = document.getElementById("tablesGrid")
  container.innerHTML = state.tables
    .map(
      (table) => `
        <div class="table-card ${table.isOccupied ? "table-occupied" : "table-available"}" 
             onclick="selectTable(${table.id})">
            <div class="table-number">Mesa ${table.id}</div>
            <div class="table-status">
                <span class="badge ${table.isOccupied ? "badge-danger" : "badge-success"}">
                    ${table.isOccupied ? "Ocupada" : "Disponible"}
                </span>
            </div>
            ${
              table.isOccupied
                ? `
                <div class="table-customer">${table.customerName}</div>
                <div class="table-orders">${table.orders.length} órdenes</div>
                <div class="table-total">${formatPrice(table.totalAmount)}</div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

function renderTableControl() {
  const titleEl = document.getElementById("tableControlTitle")
  const descEl = document.getElementById("tableControlDesc")
  const contentEl = document.getElementById("tableControlContent")

  if (!state.selectedTable) {
    titleEl.textContent = "Selecciona una Mesa"
    descEl.textContent = "Haz clic en una mesa para gestionarla"
    contentEl.innerHTML = ""
    return
  }

  const table = state.tables.find((t) => t.id === state.selectedTable)
  titleEl.textContent = `Mesa ${state.selectedTable}`

  if (!table.isOccupied) {
    descEl.textContent = "Ocupar mesa"
    contentEl.innerHTML = `
            <div class="form-group">
                <label>Nombre del cliente</label>
                <input type="text" id="customerName" placeholder="Nombre del cliente">
            </div>
            <button onclick="occupyTable(${state.selectedTable}, document.getElementById('customerName').value); document.getElementById('customerName').value = '';" class="btn-primary full-width">
                Ocupar Mesa ${state.selectedTable}
            </button>
        `
  } else {
    descEl.textContent = "Tomar pedido"
    contentEl.innerHTML = `
            <div style="background: #f3f4f6; padding: 0.5rem; border-radius: 0.375rem; margin-bottom: 1rem; font-size: 0.875rem;">
                <strong>Cliente:</strong> ${table.customerName}
            </div>
            
            <div class="form-group">
                <label>Tipo de pedido</label>
                <select id="orderType" onchange="updateOrderForm()">
                    <option value="pizza">Pizza</option>
                    <option value="drink">Bebida</option>
                </select>
            </div>
            
            <div id="orderForm"></div>
            
            <div class="form-group">
                <label>Cantidad</label>
                <select id="orderQuantity">
                    ${[1, 2, 3, 4, 5, 6].map((qty) => `<option value="${qty}">${qty}</option>`).join("")}
                </select>
            </div>
            
            <button onclick="addOrderToTable(${state.selectedTable})" class="btn-primary full-width">
                <i class="fas fa-plus"></i> Agregar al Pedido
            </button>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 1rem;">
                <button onclick="freeTable(${state.selectedTable})" class="btn-outline full-width">
                    <i class="fas fa-shopping-cart"></i> Finalizar y Cobrar Mesa
                </button>
            </div>
        `
    updateOrderForm()
  }
}

function updateOrderForm() {
  const orderType = document.getElementById("orderType").value
  const container = document.getElementById("orderForm")

  if (orderType === "pizza") {
    container.innerHTML = `
            <div class="form-group">
                <label>Seleccionar Pizza</label>
                <select id="tablePizza" onchange="updatePizzaFlavors()">
                    <option value="">Seleccionar pizza</option>
                    ${state.pizzaInventory
                      .filter((p) => p.remainingSlices > 0)
                      .map(
                        (pizza) => `
                        <option value="${pizza.id}">
                            ${pizza.flavors.map((f) => f.name).join(", ")} (${pizza.remainingSlices} porciones)
                        </option>
                    `,
                      )
                      .join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Seleccionar Sabor</label>
                <select id="tablePizzaFlavor">
                    <option value="">Seleccionar sabor</option>
                </select>
            </div>
        `
  } else {
    container.innerHTML = `
            <div class="form-group">
                <label>Tipo de bebida</label>
                <select id="drinkType" onchange="updateDrinkOptions()">
                    <option value="general">Bebidas Generales</option>
                    <option value="personal">Gaseosas Personales</option>
                </select>
            </div>
            <div id="drinkOptions"></div>
        `
    updateDrinkOptions()
  }
}

function updatePizzaFlavors() {
  const pizzaId = document.getElementById("tablePizza").value
  const container = document.getElementById("tablePizzaFlavor")

  if (!pizzaId) {
    container.innerHTML = '<option value="">Seleccionar sabor</option>'
    return
  }

  const pizza = state.pizzaInventory.find((p) => p.id === pizzaId)
  container.innerHTML = `
        <option value="">Seleccionar sabor</option>
        ${pizza.flavors
          .filter((f) => f.remainingSlices > 0)
          .map(
            (flavor) => `
            <option value="${flavor.name}">
                ${flavor.name} (${flavor.remainingSlices} porciones disponibles)
            </option>
        `,
          )
          .join("")}
    `
}

function updateDrinkOptions() {
  const drinkType = document.getElementById("drinkType").value
  const container = document.getElementById("drinkOptions")

  if (drinkType === "general") {
    container.innerHTML = `
            <div class="form-group">
                <label>Bebida</label>
                <select id="tableDrink">
                    <option value="">Seleccionar bebida</option>
                    ${state.drinks
                      .filter((d) => d.available)
                      .map(
                        (drink) => `
                        <option value="${drink.id}">
                            ${drink.name} - ${formatPrice(drink.price)}
                        </option>
                    `,
                      )
                      .join("")}
                </select>
            </div>
        `
  } else {
    container.innerHTML = `
            <div class="form-group">
                <label>Gaseosa</label>
                <select id="tableSoda" onchange="updateSodaFlavors()">
                    <option value="">Seleccionar gaseosa</option>
                    ${state.personalSodas
                      .filter((s) => s.available)
                      .map(
                        (soda) => `
                        <option value="${soda.id}">
                            ${soda.brand} - ${formatPrice(soda.price)}
                        </option>
                    `,
                      )
                      .join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Sabor</label>
                <select id="tableSodaFlavor">
                    <option value="">Seleccionar sabor</option>
                </select>
            </div>
        `
  }
}

function updateSodaFlavors() {
  const sodaId = document.getElementById("tableSoda").value
  const container = document.getElementById("tableSodaFlavor")

  if (!sodaId) {
    container.innerHTML = '<option value="">Seleccionar sabor</option>'
    return
  }

  const soda = state.personalSodas.find((s) => s.id === sodaId)
  container.innerHTML = `
        <option value="">Seleccionar sabor</option>
        ${soda.flavors
          .filter((f) => f.available)
          .map(
            (flavor) => `
            <option value="${flavor.id}">${flavor.name}</option>
        `,
          )
          .join("")}
    `
}

function renderTableOrders() {
  const card = document.getElementById("tableOrdersCard")
  const title = document.getElementById("tableOrdersTitle")
  const customer = document.getElementById("tableOrdersCustomer")
  const container = document.getElementById("tableOrdersList")

  if (!state.selectedTable) {
    card.style.display = "none"
    return
  }

  const table = state.tables.find((t) => t.id === state.selectedTable)

  if (!table.isOccupied) {
    card.style.display = "none"
    return
  }

  card.style.display = "block"
  title.textContent = `Pedidos de Mesa ${state.selectedTable}`
  customer.textContent = `Cliente: ${table.customerName}`

  if (table.orders.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay pedidos aún</div>'
    return
  }

  container.innerHTML = `
        ${table.orders
          .map(
            (order) => `
            <div class="sale-item">
                <div class="sale-info">
                    <div class="sale-name">${order.item} x${order.quantity}</div>
                    <div class="sale-time">${order.timestamp.toLocaleTimeString()}</div>
                </div>
                <div class="sale-price">${formatPrice(order.price)}</div>
            </div>
        `,
          )
          .join("")}
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.125rem; font-weight: bold;">Total:</span>
            <span style="font-size: 1.25rem; font-weight: bold; color: #059669;">
                ${formatPrice(table.totalAmount)}
            </span>
        </div>
    `
}

// Expenses Management
function addExpense() {
  const descInput = document.getElementById("expenseDescription")
  const amountInput = document.getElementById("expenseAmount")
  const description = descInput.value.trim()
  const amount = Number.parseFloat(amountInput.value)

  if (description && amount) {
    const expense = {
      id: generateId(),
      description: description,
      amount: amount,
      timestamp: new Date(),
    }
    state.expenses.push(expense)

    descInput.value = ""
    amountInput.value = ""

    renderExpenses()
    updateStatistics()
    saveState()
  }
}

function renderExpenses() {
  const container = document.getElementById("expensesList")

  if (state.expenses.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay gastos registrados</div>'
    return
  }

  container.innerHTML = state.expenses
    .map(
      (expense) => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-name">${expense.description}</div>
                <div class="expense-time">${expense.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="expense-price">-${formatPrice(expense.amount)}</div>
        </div>
    `,
    )
    .join("")
}

// Statistics and Reports
function updateStatistics() {
  const totalSales = state.sales.reduce((sum, sale) => sum + sale.price, 0)
  const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = totalSales - totalExpenses

  document.getElementById("totalSales").textContent = formatPrice(totalSales)
  document.getElementById("salesCount").textContent = `${state.sales.length} ventas realizadas`

  document.getElementById("totalExpenses").textContent = formatPrice(totalExpenses)
  document.getElementById("expensesCount").textContent = `${state.expenses.length} gastos registrados`

  const profitEl = document.getElementById("profit")
  profitEl.textContent = formatPrice(profit)
  profitEl.className = `stat-value ${profit >= 0 ? "green" : "red"}`

  document.getElementById("profitDesc").textContent = profit >= 0 ? "Ganancia del día" : "Pérdida del día"
}

function generateReport() {
  const totalSales = state.sales.reduce((sum, sale) => sum + sale.price, 0)
  const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = totalSales - totalExpenses

  const reportText = `
REPORTE DIARIO - ${new Date().toLocaleDateString()}
================================

VENTAS:
${state.sales.map((sale) => `- ${sale.item}: ${formatPrice(sale.price)}`).join("\n")}

GASTOS:
${state.expenses.map((expense) => `- ${expense.description}: ${formatPrice(expense.amount)}`).join("\n")}

RESUMEN:
- Total Ventas: ${formatPrice(totalSales)}
- Total Gastos: ${formatPrice(totalExpenses)}
- Ganancia: ${formatPrice(profit)}

PRECIOS DE REFERENCIA:
- Pizza completa (local): ${formatPrice(PIZZA_PRICES.local)}
- Pizza completa (para llevar): ${formatPrice(PIZZA_PRICES.takeaway)}
- Precio por porción: ${formatPrice(PIZZA_PRICES.perSlice)}
    `

  alert(reportText)
}

// Initialization
function init() {
  loadState()
  initTabs()

  // Render all components
  renderPizzaFlavors()
  renderDrinks()
  renderPersonalSodas()
  updateFlavorSelectors()
  renderPizzaInventory()
  renderSellDrinks()
  renderSellPersonalSodas()
  renderSales()
  renderTables()
  renderTableControl()
  renderTableOrders()
  renderExpenses()
  updateStatistics()
}

// Start the application
document.addEventListener("DOMContentLoaded", init)
