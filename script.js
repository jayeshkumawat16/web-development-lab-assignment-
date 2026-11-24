var EXPENSES_KEY = "campus_wallet_expenses";
var BUDGET_KEY = "campus_wallet_budget";

var expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
var monthlyBudget = Number(localStorage.getItem(BUDGET_KEY)) || 4000;

document.getElementById("budgetInput").value = monthlyBudget;

function saveExpenses() {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

function saveBudget() {
  var val = Number(document.getElementById("budgetInput").value);
  if (!isNaN(val) && val > 0) {
    monthlyBudget = val;
    localStorage.setItem(BUDGET_KEY, String(monthlyBudget));
    showExpenses();
  }
}

function addExpense() {
  var name = document.getElementById("name").value.trim();
  var amount = document.getElementById("amount").value;
  var category = document.getElementById("category").value;
  var error = document.getElementById("error");

  if (name === "" || amount === "" || category === "") {
    error.innerText = "Please fill in item name, amount, and category.";
    return;
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    error.innerText = "Amount must be greater than 0.";
    return;
  }

  error.innerText = "";

  expenses.unshift({
    id: Date.now(),
    name: name,
    amount: Number(amount),
    category: category
  });

  saveExpenses();

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  showExpenses();
}

function deleteExpense(id) {
  expenses = expenses.filter(function (item) {
    return item.id !== id;
  });
  saveExpenses();
  showExpenses();
}

function clearAllExpenses() {
  expenses = [];
  saveExpenses();
  showExpenses();
}

function updateSummary(spent, count) {
  var left = monthlyBudget - spent;
  var vibe = document.getElementById("vibeMessage");

  document.getElementById("totalSpent").innerText = "Rs. " + spent.toFixed(2);
  document.getElementById("remainingBudget").innerText = "Rs. " + left.toFixed(2);
  document.getElementById("entryCount").innerText = count;

  if (spent === 0) {
    vibe.innerText = "Fresh start! Log your daily expenses in Rs.";
  } else if (left < 0) {
    vibe.innerText = "Heads up! You went over your monthly budget.";
  } else if (spent >= monthlyBudget * 0.8) {
    vibe.innerText = "Careful! You have used 80%+ of your budget.";
  } else {
    vibe.innerText = "Nice pace! Your budget is looking healthy.";
  }
}

function updateBreakdown(spent) {
  var box = document.getElementById("categoryBreakdown");

  if (spent === 0) {
    box.innerHTML = '<p class="empty-text">Add expenses to see colorful category bars.</p>';
    return;
  }

  var totals = {};
  for (var i = 0; i < expenses.length; i++) {
    var cat = expenses[i].category;
    totals[cat] = (totals[cat] || 0) + expenses[i].amount;
  }

  var html = "";
  for (var key in totals) {
    var pct = Math.round((totals[key] / spent) * 100);
    html +=
      '<div class="bar-item">' +
        '<div class="bar-top">' +
          '<span>' + key + '</span>' +
          '<span>Rs. ' + totals[key].toFixed(2) + ' (' + pct + '%)</span>' +
        '</div>' +
        '<div class="bar-bg">' +
          '<div class="bar-fill fill-' + key + '" style="width:' + pct + '%"></div>' +
        '</div>' +
      '</div>';
  }

  box.innerHTML = html;
}

function showExpenses() {
  var list = document.getElementById("expenseList");
  var filter = document.getElementById("filter").value;

  var totalSpent = 0;
  for (var i = 0; i < expenses.length; i++) {
    totalSpent += expenses[i].amount;
  }

  updateSummary(totalSpent, expenses.length);
  updateBreakdown(totalSpent);

  list.innerHTML = "";
  var shown = 0;

  for (var j = 0; j < expenses.length; j++) {
    var exp = expenses[j];
    if (filter === "All" || exp.category === filter) {
      shown++;
      var li = document.createElement("li");
      li.className = "expense-row";
      li.innerHTML =
        '<div class="row-left">' +
          '<span class="cat-pill pill-' + exp.category + '">' + exp.category + '</span>' +
          '<span class="row-title">' + exp.name + '</span>' +
        '</div>' +
        '<div class="row-right">' +
          '<span class="row-amount">Rs. ' + exp.amount.toFixed(2) + '</span>' +
          '<button type="button" class="btn-del" onclick="deleteExpense(' + exp.id + ')">Delete</button>' +
        '</div>';
      list.appendChild(li);
    }
  }

  if (shown === 0) {
    list.innerHTML = '<p class="empty-text">No expenses match this filter yet.</p>';
  }
}

showExpenses();