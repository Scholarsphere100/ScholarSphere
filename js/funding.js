document.addEventListener('DOMContentLoaded', function () {
    const grantForm = document.querySelector('.grant-form');

    if (grantForm) {
        grantForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form field values
            const title = document.getElementById('grant-title').value;
            const grantId = document.getElementById('grant-id').value;
            const amount = document.getElementById('grant-amount').value;
            const currency = document.getElementById('grant-currency').value;
            const startDate = document.getElementById('grant-start-date').value;
            const endDate = document.getElementById('grant-end-date').value;
            const agency = document.getElementById('grant-agency').value;
            const description = document.getElementById('grant-description').value;

            const formattedAmount = `${currency} ${parseFloat(amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            const period = `${formattedStartDate} - ${formattedEndDate}`;

            // Build HTML string
            const newGrantHTML = `
                <article class="grant-item">
                    <header class="grant-header">
                        <h3>${title}</h3>
                        <mark class="grant-status active">Active</mark>
                    </header>
                    <section class="grant-details">
                        <dl class="grant-info">
                            <dt><strong>Grant ID:</strong></dt>
                            <dd>${grantId}</dd>
                            <dt><strong>Amount:</strong></dt>
                            <dd>${formattedAmount}</dd>
                            <dt><strong>Period:</strong></dt>
                            <dd>${period}</dd>
                            <dt><strong>Agency:</strong></dt>
                            <dd>${agency}</dd>
                        </dl>
                        <figure class="grant-progress">
                            <figcaption class="progress-label">
                                <span>Budget Utilization</span>
                                <span>0%</span>
                            </figcaption>
                            <progress value="0" max="100"></progress>
                        </figure>
                    </section>
                    <footer class="grant-actions">
                        <button class="action-btn view-btn">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                            View Details
                        </button>
                        <button class="action-btn edit-btn">
                            <i class="fas fa-edit" aria-hidden="true"></i>
                            Edit
                        </button>
                    </footer>
                </article>
            `;

            const grantsList = document.querySelector('.grants-list');
            if (grantsList) {
                grantsList.insertAdjacentHTML('beforeend', newGrantHTML);
            }

            // Optionally hide the modal
            const modal = document.getElementById('add-grant-modal');
            if (modal) modal.classList.remove('active');

            // Reset the form
            grantForm.reset();
            document.getElementById('selected-grant-files').textContent = 'No files selected';

            updateFundingSummary();
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function updateFundingSummary() {
        const amounts = Array.from(document.querySelectorAll('.grant-info dd:nth-of-type(2)')).map(dd => {
            const num = parseFloat(dd.textContent.replace(/[^\d.-]/g, ''));
            return isNaN(num) ? 0 : num;
        });

        const total = amounts.reduce((acc, val) => acc + val, 0);

        const totalEl = document.querySelector('.summary-card:nth-child(1) .amount');
        if (totalEl) {
            totalEl.textContent = `R${total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        const spentEl = document.querySelector('.summary-card:nth-child(2) .amount');
        const remainingEl = document.querySelector('.summary-card:nth-child(3) .amount');

        if (spentEl && remainingEl) {
            const spent = parseFloat(spentEl.textContent.replace(/[^\d.-]/g, '')) || 0;
            const remaining = total - spent;
            remainingEl.textContent = `R${remaining.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    }
});

//for the expenses modal
document.addEventListener("DOMContentLoaded", function() {
    // Expense Form Handling
    const expenseForm = document.querySelector(".expense-form");
    const expenseModal = document.getElementById("add-expense-modal");
    const closeExpenseModal = document.getElementById("close-expense-modal");
    const expenseFile = document.getElementById("expense-file");
    const selectedExpenseFile = document.getElementById("selected-expense-file");
    const expensesTable = document.querySelector(".expenses-table tbody");

    // Check if all required elements exist
    if (!expenseForm || !expenseModal || !closeExpenseModal || !expenseFile || !selectedExpenseFile || !expensesTable) {
        console.error("One or more required elements for expense form not found");
        return;
    }

    // Handle form submission
    expenseForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Get form values
        const description = document.getElementById("expense-description").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const date = document.getElementById("expense-date").value;
        const category = document.getElementById("expense-category-select").value;
        const grant = document.getElementById("expense-grant-select").value;
        const notes = document.getElementById("expense-notes").value;

        // Format values
        const formattedDate = formatDateForDisplay(date);
        const formattedAmount = `R${amount.toFixed(2)}`;
        const formattedCategory = capitalizeFirstLetter(category);
        const formattedGrant = grant === "nsf" ? "NSF Research Grant" : "Industry Partnership";

        // Create new table row
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${formattedDate}</td>
            <td>${description}</td>
            <td>${formattedCategory}</td>
            <td>${formattedGrant}</td>
            <td>${formattedAmount}</td>
            <td><mark class="status-badge pending">Pending</mark></td>
            <td>
                <menu class="table-actions">
                    <li>
                        <button class="icon-btn" title="View Details">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                        </button>
                    </li>
                    <li>
                        <button class="icon-btn" title="Edit">
                            <i class="fas fa-edit" aria-hidden="true"></i>
                        </button>
                    </li>
                </menu>
            </td>
        `;

        // Append to table
        expensesTable.appendChild(newRow);

        // Reset form and close modal
        expenseForm.reset();
        selectedExpenseFile.textContent = "No file selected";
        expenseModal.classList.remove("active");

        // Update expenses summary
        updateExpensesSummary();
    });

    // Close modal button
    closeExpenseModal.addEventListener("click", function() {
        expenseModal.classList.remove("active");
    });

    // File input display
    expenseFile.addEventListener("change", function() {
        if (this.files.length > 0) {
            selectedExpenseFile.textContent = this.files[0].name;
        } else {
            selectedExpenseFile.textContent = "No file selected";
        }
    });

    // Helper functions
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateExpensesSummary() {
        // Get all expense amounts
        const amounts = Array.from(document.querySelectorAll(".expenses-table tbody tr td:nth-child(5)"))
            .map(td => {
                const text = td.textContent.trim();
                return parseFloat(text.replace(/[^\d.]/g, ''));
            })
            .filter(amount => !isNaN(amount));

        // Calculate totals
        const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);
        const pendingApproval = amounts[amounts.length - 1] || 0; // Assuming last added is pending

        // Update summary
        const totalElement = document.querySelector(".expenses-summary .summary-item:nth-child(1) span:last-child");
        const pendingElement = document.querySelector(".expenses-summary .summary-item:nth-child(2) span:last-child");

        if (totalElement) totalElement.textContent = `R${totalExpenses.toFixed(2)}`;
        if (pendingElement) pendingElement.textContent = `R${pendingApproval.toFixed(2)}`;
    }
});

// for requirements..
document.addEventListener("DOMContentLoaded", function() {
    // Requirement Form Handling
    const requirementForm = document.querySelector(".requirement-form");
    const requirementModal = document.getElementById("add-requirement-modal");
    const closeRequirementModal = document.getElementById("close-requirement-modal");
    const recurringCheckbox = document.getElementById("requirement-recurring");
    const recurringOptions = document.querySelector(".recurring-options");
    const requirementsList = document.querySelector(".requirements-list");

    // Check if all required elements exist
    if (!requirementForm || !requirementModal || !closeRequirementModal || !requirementsList) {
        console.error("One or more required elements for requirement form not found");
        return;
    }

    // Toggle recurring options visibility
    if (recurringCheckbox && recurringOptions) {
        recurringCheckbox.addEventListener("change", function() {
            recurringOptions.style.display = this.checked ? "block" : "none";
        });
    }

    // Handle form submission
    requirementForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById("requirement-title").value;
        const grant = document.getElementById("requirement-grant").value;
        const type = document.getElementById("requirement-type").value;
        const dueDate = document.getElementById("requirement-due-date").value;
        const description = document.getElementById("requirement-description").value;
        const isRecurring = recurringCheckbox.checked;
        const frequency = isRecurring ? document.getElementById("requirement-frequency").value : null;

        // Format values
        const formattedDueDate = formatDateForDisplay(dueDate);
        const formattedGrant = grant === "nsf" ? "NSF Research Grant" : "Industry Partnership";
        const formattedType = capitalizeFirstLetter(type);
        const status = getInitialStatus(dueDate);

        // Create new requirement item
        const newRequirement = document.createElement("article");
        newRequirement.className = "requirement-item";
        
        // Build the requirement HTML
        newRequirement.innerHTML = `
            <header class="requirement-header">
                <h3>${title}</h3>
                <mark class="requirement-status ${status.class}">${status.text}</mark>
            </header>
            <section class="requirement-details">
                <dl>
                    <dt><strong>Grant:</strong></dt>
                    <dd>${formattedGrant}</dd>
                    <dt><strong>Type:</strong></dt>
                    <dd>${formattedType}</dd>
                    <dt><strong>Due Date:</strong></dt>
                    <dd>${formattedDueDate}</dd>
                    ${isRecurring ? `<dt><strong>Frequency:</strong></dt><dd>${capitalizeFirstLetter(frequency)}</dd>` : ''}
                    <dt><strong>Description:</strong></dt>
                    <dd>${description}</dd>
                </dl>
                ${type === 'publication' ? `
                <figure class="requirement-progress">
                    <figcaption class="progress-label">
                        <span>Progress</span>
                        <span>0%</span>
                    </figcaption>
                    <progress value="0" max="100"></progress>
                </figure>
                ` : ''}
            </section>
            <footer class="requirement-actions">
                <button class="action-btn ${type === 'publication' ? 'update-btn' : 'start-btn'}">
                    <i class="fas ${type === 'publication' ? 'fa-edit' : 'fa-play'}" aria-hidden="true"></i>
                    ${type === 'publication' ? 'Update Progress' : 'Start Preparation'}
                </button>
            </footer>
        `;

        // Append to requirements list
        requirementsList.appendChild(newRequirement);

        // Reset form and close modal
        requirementForm.reset();
        if (recurringOptions) recurringOptions.style.display = "none";
        requirementModal.classList.remove("active");
    });

    // Close modal button
    closeRequirementModal.addEventListener("click", function() {
        requirementModal.classList.remove("active");
    });

    // Helper functions
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getInitialStatus(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { class: "overdue", text: "Overdue" };
        } else if (diffDays <= 30) {
            return { class: "upcoming", text: "Due Soon" };
        } else {
            return { class: "pending", text: "Pending" };
        }
    }
});