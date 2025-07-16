const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');
const filterCategory = document.getElementById('filter-category');
const ctx = document.getElementById('expenseChart').getContext('2d');

let expenses = [];
let expenseChart;

// Handle form submission
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const expenseName = document.getElementById('expense-name').value;
  const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
  const expenseCategory = document.getElementById('expense-category').value;
  const expenseDate = document.getElementById('expense-date').value;

  const expense = {
    name: expenseName,
    amount: expenseAmount,
    category: expenseCategory,
    date: expenseDate,
  };

  // Send data to backend
  fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save expense');
      return res.text();
    })
    .then(() => {
      expenses.push(expense);
      updateExpenseList();
      updateTotalAmount();
      updatePieChart();

      // Reset form
      expenseForm.reset();
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error saving expense');
    });
});

// Filter handler
filterCategory.addEventListener('change', () => {
  updateExpenseList();
  updateTotalAmount();
  updatePieChart();
});

// Render list of expenses
function updateExpenseList() {
  const filteredExpenses = expenses.filter((expense) => {
    if (filterCategory.value === 'All') return true;
    return expense.category === filterCategory.value;
  });

  const expenseListHtml = filteredExpenses.map((expense, index) => {
    return `
      <tr>
        <td>${expense.name}</td>
        <td>$${expense.amount.toFixed(2)}</td>
        <td>${expense.category}</td>
        <td>${expense.date}</td>
        <td>
          <button class="delete-button" data-index="${index}">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  expenseList.innerHTML = expenseListHtml;

  // Delete event listeners
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      expenses.splice(index, 1);
      updateExpenseList();
      updateTotalAmount();
      updatePieChart();
    });
  });
}

// Calculate total
function updateTotalAmount() {
  const total = expenses
    .filter(exp => filterCategory.value === 'All' || exp.category === filterCategory.value)
    .reduce((acc, expense) => acc + expense.amount, 0);

  totalAmount.textContent = total.toFixed(2);
}

// Draw pie chart
function updatePieChart() {
  const filteredExpenses = expenses.filter((expense) => {
    if (filterCategory.value === 'All') return true;
    return expense.category === filterCategory.value;
  });

  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses by Category',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Expenses by Category' },
      }
    }
  });
}
