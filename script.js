const openMonthInputBtn = document.querySelector("#open-month-input-btn");
const addMonthInput = document.querySelector("#add-month-input");
const cancelMonthInput = document.querySelector("#cancel-month-input");
const monthInputDialog = document.querySelector("#month-input-dialog");
const monthInput = document.querySelector("#month-input");
const monthInputForm = document.querySelector("#input-month-form");
const maxLimitInput = document.querySelector("#max-limit-input");
const monthList = document.querySelector("#month-list");
const mainPanelHeader = document.querySelector("#main-panel-header");
const percentageBar = document.querySelector("#percentage-bar");
const budgetText = document.querySelector("#budgets");
const expenseForm = document.querySelector("#expense-form");
const expInput = document.querySelector("#exp-input");
const amountInput = document.querySelector("#amount-input");
const expenseList = document.querySelector("#expense-list");
const editDialog = document.querySelector("#edit-expense-dialog");
const editForm = document.querySelector("#edit-expense-form");
const newExp = document.querySelector("#new-exp");
const newAmount = document.querySelector("#new-amount");
const cancelEditBtn = document.querySelector("#cancel-edit");
const editExpBtn = document.querySelector("#edit-exp-btn");

let monthExpensesData =
  JSON.parse(localStorage.getItem("month-expenses")) || [];
const validMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let currentMonthOpenedId = null;
let currentExpenseEditedId = null;

function saveData() {
  localStorage.setItem("month-expenses", JSON.stringify(monthExpensesData));
}

function renderMonths() {
  monthList.innerHTML = "";

  monthExpensesData.forEach((month) => {
    const li = document.createElement("li");
    li.className = "month";

    if (month.id === currentMonthOpenedId) {
      li.classList.add("active");
    }

    const button = document.createElement("button");
    button.id = month.id;
    button.textContent = month.month;

    button.addEventListener("click", () => {
      currentMonthOpenedId = month.id;

      const currActive = document.querySelector(".month.active");
      if (currActive) {
        currActive.classList.remove("active");
      }
      li.classList.add("active");

      updateMainPanelStats();
      renderExpenses();
      expenseForm.reset();
    });

    const delBtn = document.createElement("button");
    delBtn.className = "del-month-btn";

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteMonth(month.id);
    });

    const i = document.createElement("i");
    i.className = "fa-regular fa-calendar-xmark";

    delBtn.appendChild(i);

    li.appendChild(delBtn);
    li.appendChild(button);
    monthList.appendChild(li);
  });
}

function addMonth() {
  const month = monthInput.value.trim().toLowerCase();
  if (!month) {
    monthInput.setCustomValidity("Please enter a month.");
    monthInput.reportValidity("");
    return;
  }
  monthInput.setCustomValidity("");

  const cleanedMonth = month[0].toUpperCase() + month.slice(1);
  const maxLimit = maxLimitInput.value.trim();
  const floatParsedLimit = parseFloat(maxLimit);
  if (!validMonths.includes(cleanedMonth)) {
    monthInput.setCustomValidity("Please enter a valid month of the year.");
    monthInput.reportValidity();
    return;
  }

  const dupedMonth = monthExpensesData.some((i) => i.month === cleanedMonth);
  if (dupedMonth) {
    monthInput.setCustomValidity("This month already existed.");
    monthInput.reportValidity();
    return;
  }

  monthInput.setCustomValidity("");
  if (floatParsedLimit <= 0 || isNaN(floatParsedLimit)) {
    maxLimitInput.setCustomValidity(
      "Please enter a valid number as the budget limit.",
    );
    maxLimitInput.reportValidity();
    return;
  }
  maxLimitInput.setCustomValidity("");

  const toAdd = {
    id: Date.now(),
    month: cleanedMonth,
    limit: floatParsedLimit,
    expenses: [],
  };

  monthExpensesData.push(toAdd);
  saveData();
  renderMonths();
  monthInputForm.reset();
  monthInputDialog.close();
}

function updateMainPanelStats() {
  const month = monthExpensesData.find((m) => m.id === currentMonthOpenedId);

  if (month) {
    mainPanelHeader.textContent = month.month;
    const totalExpenses =
      month.expenses.length === 0
        ? 0
        : month.expenses.reduce((a, b) => a + b.amount, 0);
    const percentage = (totalExpenses / month.limit) * 100;
    if (percentage < 75) {
      percentageBar.style.backgroundColor = "green";
    } else if (percentage >= 75 && percentage < 100) {
      percentageBar.style.backgroundColor = "yellow";
    } else {
      percentageBar.style.backgroundColor = "red";
    }
    percentageBar.style.width =
      percentage > 100 ? "100%" : `${percentage.toFixed(2)}%`;
    budgetText.textContent = `$${totalExpenses.toFixed(2)}/$${month.limit.toFixed(2)}`;
  }
}

function addExpense() {
  if (currentMonthOpenedId === null) {
    alert("You can only add expenses if you have a month opened");
    return;
  }

  const currentMonth = monthExpensesData.find(
    (m) => m.id === currentMonthOpenedId,
  );

  const expenseInput = expInput.value.trim().toLowerCase();

  if (!expenseInput) {
    expInput.setCustomValidity("Please enter an expense.");
    expInput.reportValidity();
    return;
  }
  expInput.setCustomValidity("");

  const cleanedExp = expenseInput[0].toUpperCase() + expenseInput.slice(1);
  const amount = amountInput.value.trim();
  const parsedAmount = parseFloat(amount);

  if (parsedAmount <= 0 || isNaN(parsedAmount)) {
    amountInput.setCustomValidity("Please enter a valid amount.");
    amountInput.reportValidity();
    return;
  }
  amountInput.setCustomValidity("");

  const newExpense = {
    id: Date.now(),
    expense: cleanedExp,
    amount: parsedAmount,
  };

  currentMonth.expenses.push(newExpense);
  saveData();
  expenseForm.reset();
  updateMainPanelStats();
  renderExpenses();
}

function renderExpenses() {
  const month = monthExpensesData.find((e) => e.id === currentMonthOpenedId);
  expenseList.innerHTML = "";

  month.expenses.forEach((e) => {
    const li = document.createElement("li");
    li.className = "expense-item";
    li.id = e.id;

    const spanExp = document.createElement("span");
    spanExp.className = "expense-name";
    spanExp.textContent = e.expense;

    const spanAmount = document.createElement("span");
    spanAmount.className = "expense-amount";
    spanAmount.textContent = `$${e.amount.toFixed(2)}`;

    const delBtn = document.createElement("button");
    delBtn.ariaLabel = "Delete expense";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", () => {
      deleteExpense(e.id);
    });

    const i = document.createElement("i");
    i.className = "fa-solid fa-trash";

    const editBtn = document.createElement("button");
    editBtn.ariaLabel = "Edit expense";
    editBtn.className = "edit-exp-btn";

    editBtn.addEventListener("click", () => {
      openEditExpense(e.id);
    });

    const i2 = document.createElement("i");
    i2.className = "fa-regular fa-pen-to-square";

    delBtn.appendChild(i);
    editBtn.appendChild(i2);

    li.appendChild(spanExp);
    li.appendChild(spanAmount);
    li.appendChild(delBtn);
    li.appendChild(editBtn);

    expenseList.appendChild(li);
  });
}

function openEditExpense(id) {
  const month = monthExpensesData.find((m) => m.id === currentMonthOpenedId);
  const expe = month.expenses.find((e) => e.id === id);

  currentExpenseEditedId = id;

  newExp.value = expe.expense;
  newAmount.value = expe.amount.toFixed(2);

  editDialog.showModal();
}

function editExpense() {
  const month = monthExpensesData.find((m) => m.id === currentMonthOpenedId);
  const expe = month.expenses.find((e) => e.id === currentExpenseEditedId);

  const newExpInput = newExp.value.trim();
  if (!newExpInput) {
    newExp.setCustomValidity("Please enter a valid expense.");
    newExp.reportValidity();
    return;
  }
  newExp.setCustomValidity("");
  const cleanedNewExp =
    newExpInput[0].toUpperCase() + newExpInput.slice(1).toLowerCase();
  const parsedNewAmount = parseFloat(newAmount.value.trim());

  if (parsedNewAmount <= 0 || isNaN(parsedNewAmount)) {
    newAmount.setCustomValidity("Please enter a valid amount.");
    newAmount.reportValidity();
    return;
  }
  newAmount.setCustomValidity("");

  expe.expense = cleanedNewExp;
  expe.amount = parsedNewAmount;

  saveData();
  renderExpenses();
  updateMainPanelStats();
  editForm.reset();
  editDialog.close();
  currentExpenseEditedId = null;
}

function deleteExpense(id) {
  const month = monthExpensesData.find((m) => m.id === currentMonthOpenedId);

  const newExpenses = month.expenses.filter((e) => e.id !== id);
  month.expenses = newExpenses;
  saveData();
  updateMainPanelStats();
  renderExpenses();
}

function deleteMonth(id) {
  if (
    !confirm(
      "Are you sure you wanna delete this month including every expenses in it ?",
    )
  ) {
    return;
  }

  monthExpensesData = monthExpensesData.filter((m) => m.id !== id);
  saveData();
  renderMonths();

  if (currentMonthOpenedId === id) {
    currentMonthOpenedId = null;
    mainPanelHeader.textContent = "";
    percentageBar.style.width = "0%";
    budgetText.textContent = "";
    expenseList.innerHTML = "";
  }
}

monthInputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addMonth();
});

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addExpense();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  editExpense();
});

openMonthInputBtn.addEventListener("click", () => {
  monthInputDialog.showModal();
});

cancelMonthInput.addEventListener("click", () => {
  monthInputDialog.close();
});

monthInputDialog.addEventListener("close", () => {
  monthInputForm.reset();
  monthInput.setCustomValidity("");
  maxLimitInput.setCustomValidity("");
});

cancelEditBtn.addEventListener("click", (e) => {
  editDialog.close();
});

editDialog.addEventListener("close", () => {
  editForm.reset();
  newExp.setCustomValidity("");
  newAmount.setCustomValidity("");
  currentExpenseEditedId = null;
});

monthInput.addEventListener("input", () => monthInput.setCustomValidity(""));
maxLimitInput.addEventListener("input", () =>
  maxLimitInput.setCustomValidity(""),
);
expInput.addEventListener("input", () => expInput.setCustomValidity(""));
amountInput.addEventListener("input", () => amountInput.setCustomValidity(""));
newExp.addEventListener("input", () => newExp.setCustomValidity(""));
newAmount.addEventListener("input", () => newAmount.setCustomValidity(""));

window.addEventListener("DOMContentLoaded", renderMonths);
