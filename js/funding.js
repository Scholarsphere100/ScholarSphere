import { db, auth } from './search.js';

export function updateFundingSummary() {
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

export function updateExpensesSummary() {
    const amounts = Array.from(document.querySelectorAll(".expenses-table tbody tr td:nth-child(5)"))
        .map(td => parseFloat(td.textContent.replace(/[^\d.]/g, '')))
        .filter(amount => !isNaN(amount));

    const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);
    const pendingApproval = amounts.filter((_, i) => {
        const statusCell = document.querySelectorAll(".expenses-table tbody tr td:nth-child(6)")[i];
        return statusCell.textContent.includes("Pending");
    }).reduce((sum, amount) => sum + amount, 0);

    const totalElement = document.querySelector(".expenses-summary .summary-item:nth-child(1) span:last-child");
    const pendingElement = document.querySelector(".expenses-summary .summary-item:nth-child(2) span:last-child");

    if (totalElement) totalElement.textContent = `R${totalExpenses.toFixed(2)}`;
    if (pendingElement) pendingElement.textContent = `R${pendingApproval.toFixed(2)}`;
}

    export function formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

     export  function formatDateForDisplay(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

 export  function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

export  function getInitialStatus(dueDate) {
            if (!dueDate) return { class: "pending", text: "Pending" };
            
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

document.addEventListener('DOMContentLoaded', async function () {
    // Wait for auth state to be initialized
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log("No user logged in");
            // Redirect to login or show login modal
            window.location.href = '/login.html';
            return;
        }

        const userId = user.uid;
        console.log("Current user ID:", userId);

        // GRANTS FUNCTIONALITY
        const grantForm = document.querySelector('.grant-form');
        const grantsList = document.querySelector('.grants-list');

        // Fetch all grants for current user
        async function fetchGrants() {
            try {
                const querySnapshot = await db.collection("grants")
                    .where("userId", "==", userId)
                    .get();
                
                grantsList.innerHTML = ''; // Clear existing grants
                
                querySnapshot.forEach((doc) => {
                    const grantData = doc.data();
                    grantData.id = doc.id; // Include document ID
                    renderGrant(grantData);
                });
                
                updateFundingSummary();
            } catch (error) {
                console.error("Error fetching grants: ", error);
                alert("Error loading grants. Please check console for details.");
            }
        }

        // Render a single grant to the DOM
        function renderGrant(grantData) {
            const formattedAmount = `${grantData.currency} ${parseFloat(grantData.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            const formattedStartDate = formatDate(grantData.startDate);
            const formattedEndDate = formatDate(grantData.endDate);
            const period = `${formattedStartDate} - ${formattedEndDate}`;

            const newGrantHTML = `
                <article class="grant-item" data-id="${grantData.id || ''}">
                    <header class="grant-header">
                        <h3>${grantData.title}</h3>
                        <mark class="grant-status active">Active</mark>
                    </header>
                    <section class="grant-details">
                        <dl class="grant-info">
                            <dt><strong>Grant ID:</strong></dt>
                            <dd>${grantData.grantId}</dd>
                            <dt><strong>Amount:</strong></dt>
                            <dd>${formattedAmount}</dd>
                            <dt><strong>Period:</strong></dt>
                            <dd>${period}</dd>
                            <dt><strong>Agency:</strong></dt>
                            <dd>${grantData.agency}</dd>
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

            grantsList.insertAdjacentHTML('beforeend', newGrantHTML);
        }

        if (grantForm) {
            grantForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                // Get form field values
                const grantData = {
                    title: document.getElementById('grant-title').value,
                    grantId: document.getElementById('grant-id').value,
                    amount: parseFloat(document.getElementById('grant-amount').value),
                    currency: document.getElementById('grant-currency').value,
                    startDate: document.getElementById('grant-start-date').value,
                    endDate: document.getElementById('grant-end-date').value,
                    agency: document.getElementById('grant-agency').value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'active',
                    utilization: 0,
                    userId: userId  // Add current user ID
                };

                try {
                    // Add new grant to Firestore
                    const docRef = await db.collection("grants").add(grantData);
                    
                    // Add the ID to our data and render
                    grantData.id = docRef.id;
                    renderGrant(grantData);

                    // Hide the modal
                    const modal = document.getElementById('add-grant-modal');
                    if (modal) modal.classList.remove('active');

                    // Reset the form
                    grantForm.reset();
                    document.getElementById('selected-grant-files').textContent = 'No files selected';

                    updateFundingSummary();
                } catch (error) {
                    console.error("Error adding grant: ", error);
                    alert("Error saving grant. Please try again.");
                }
            });
        }

        // EXPENSES FUNCTIONALITY 
        const expenseForm = document.querySelector(".expense-form");
        const expenseModal = document.getElementById("add-expense-modal");
        const closeExpenseModal = document.getElementById("close-expense-modal");
        const expenseFile = document.getElementById("expense-file");
        const selectedExpenseFile = document.getElementById("selected-expense-file");
        const expensesTable = document.querySelector(".expenses-table tbody");

        // Load existing expenses for current user
        async function fetchExpenses() {
            try {
                const querySnapshot = await db.collection("expenses")
                    .where("userId", "==", userId)
                    .orderBy("date", "desc")
                    .get();
                
                // Clear existing expenses
                while (expensesTable.firstChild) {
                    expensesTable.removeChild(expensesTable.firstChild);
                }
                
                querySnapshot.forEach((doc) => {
                    const expenseData = doc.data();
                    expenseData.id = doc.id;
                    renderExpenseRow(expenseData);
                });
                
                updateExpensesSummary();
                updateFundingSummary();
            } catch (error) {
                console.error("Error loading expenses: ", error);
                alert("Error loading expenses. Please check console for details.");
            }
        }

        // Render a single expense row
        function renderExpenseRow(expenseData) {
            const formattedDate = formatDateForDisplay(expenseData.date);
            const formattedAmount = `R${expenseData.amount.toFixed(2)}`;
            const formattedCategory = capitalizeFirstLetter(expenseData.category);
            const statusClass = expenseData.status || "pending";

            const newRow = document.createElement("tr");
            newRow.dataset.id = expenseData.id;
            newRow.innerHTML = `
                <td>${formattedDate}</td>
                <td>${expenseData.description}</td>
                <td>${formattedCategory}</td>
                <td>${expenseData.grant || "General"}</td>
                <td>${formattedAmount}</td>
                <td><mark class="status-badge ${statusClass}">${capitalizeFirstLetter(statusClass)}</mark></td>
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
            expensesTable.appendChild(newRow);
        }

        if (expenseForm) {
            expenseForm.addEventListener("submit", async function(e) {
                e.preventDefault();
                
                // Get form values
                const expenseData = {
                    description: document.getElementById("expense-description").value,
                    amount: parseFloat(document.getElementById("expense-amount").value),
                    date: document.getElementById("expense-date").value,
                    category: document.getElementById("expense-category-select").value,
                    grant: document.getElementById("expense-grant-select").value,
                    notes: document.getElementById("expense-notes").value,
                    status: "pending",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: userId  // Add current user ID
                };

                try {
                    // Add to Firestore
                    const docRef = await db.collection("expenses").add(expenseData);
                    
                    // Add ID to data and render
                    expenseData.id = docRef.id;
                    renderExpenseRow(expenseData);

                    // Reset form and close modal
                    expenseForm.reset();
                    selectedExpenseFile.textContent = "No file selected";
                    expenseModal.classList.remove("active");

                    updateExpensesSummary();
                    updateFundingSummary();
                } catch (error) {
                    console.error("Error adding expense: ", error);
                    alert("Failed to save expense. Please try again.");
                }
            });
        }

        // Close modal button
        if (closeExpenseModal) {
            closeExpenseModal.addEventListener("click", function() {
                expenseModal.classList.remove("active");
            });
        }

        // File input display
        if (expenseFile && selectedExpenseFile) {
            expenseFile.addEventListener("change", function() {
                if (this.files.length > 0) {
                    selectedExpenseFile.textContent = this.files[0].name;
                } else {
                    selectedExpenseFile.textContent = "No file selected";
                }
            });
        }

        // REQUIREMENTS FUNCTIONALITY 
        const requirementForm = document.querySelector(".requirement-form");
        const requirementModal = document.getElementById("add-requirement-modal");
        const closeRequirementModal = document.getElementById("close-requirement-modal");
        const recurringCheckbox = document.getElementById("requirement-recurring");
        const recurringOptions = document.querySelector(".recurring-options");
        const requirementsList = document.querySelector(".requirements-list");

        // Load existing requirements for current user
        async function fetchRequirements() {
            try {
                const querySnapshot = await db.collection("requirements")
                    .where("userId", "==", userId)
                    .orderBy("dueDate", "asc")
                    .get();
                
                // Clear existing requirements
                while (requirementsList.firstChild) {
                    requirementsList.removeChild(requirementsList.firstChild);
                }
                
                querySnapshot.forEach((doc) => {
                    const requirementData = doc.data();
                    requirementData.id = doc.id;
                    renderRequirement(requirementData);
                });
            } catch (error) {
                console.error("Error loading requirements: ", error);
                alert("Error loading requirements. Please check console for details.");
            }
        }

        // Render a single requirement
        function renderRequirement(requirementData) {
            const formattedDueDate = formatDateForDisplay(requirementData.dueDate);
            const formattedGrant = requirementData.grant === "nsf" ? "NSF Research Grant" : "Industry Partnership";
            const formattedType = capitalizeFirstLetter(requirementData.type);
            const status = getInitialStatus(requirementData.dueDate);
            const isRecurring = requirementData.frequency && requirementData.frequency !== "none";

            const newRequirement = document.createElement("article");
            newRequirement.className = "requirement-item";
            newRequirement.dataset.id = requirementData.id;
            
            newRequirement.innerHTML = `
                <header class="requirement-header">
                    <h3>${requirementData.title}</h3>
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
                        ${isRecurring ? `<dt><strong>Frequency:</strong></dt><dd>${capitalizeFirstLetter(requirementData.frequency)}</dd>` : ''}
                        <dt><strong>Description:</strong></dt>
                        <dd>${requirementData.description || 'No description'}</dd>
                    </dl>
                    ${requirementData.type === 'publication' ? `
                    <figure class="requirement-progress">
                        <figcaption class="progress-label">
                            <span>Progress</span>
                            <span>${requirementData.progress || 0}%</span>
                        </figcaption>
                        <progress value="${requirementData.progress || 0}" max="100"></progress>
                    </figure>
                    ` : ''}
                </section>
                <footer class="requirement-actions">
                    <button class="action-btn ${requirementData.type === 'publication' ? 'update-btn' : 'start-btn'}">
                        <i class="fas ${requirementData.type === 'publication' ? 'fa-edit' : 'fa-play'}" aria-hidden="true"></i>
                        ${requirementData.type === 'publication' ? 'Update Progress' : 'Start Preparation'}
                    </button>
                </footer>
            `;

            requirementsList.appendChild(newRequirement);
        }

        // Toggle recurring options
        if (recurringCheckbox && recurringOptions) {
            recurringCheckbox.addEventListener("change", function() {
                recurringOptions.style.display = this.checked ? "block" : "none";
            });
        }

        if (requirementForm) {
            requirementForm.addEventListener("submit", async function(e) {
                e.preventDefault();
                
                // Get form values
                const requirementData = {
                    title: document.getElementById("requirement-title").value,
                    grant: document.getElementById("requirement-grant").value,
                    type: document.getElementById("requirement-type").value,
                    dueDate: document.getElementById("requirement-due-date").value,
                    description: document.getElementById("requirement-description").value,
                    isRecurring: recurringCheckbox.checked,
                    frequency: recurringCheckbox.checked ? document.getElementById("requirement-frequency").value : "none",
                    status: "pending",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    progress: 0,
                    userId: userId  // Add current user ID
                };

                try {
                    // Add to Firestore
                    const docRef = await db.collection("requirements").add(requirementData);
                    
                    // Add ID to data and render
                    requirementData.id = docRef.id;
                    renderRequirement(requirementData);

                    // Reset form and close modal
                    requirementForm.reset();
                    if (recurringOptions) recurringOptions.style.display = "none";
                    requirementModal.classList.remove("active");
                } catch (error) {
                    console.error("Error adding requirement: ", error);
                    alert("Failed to save requirement. Please try again.");
                }
            });
        }

        // Close modal button
        if (closeRequirementModal) {
            closeRequirementModal.addEventListener("click", function() {
                requirementModal.classList.remove("active");
            });
        }



   

     

        // Initialize all data
        fetchGrants();
        fetchExpenses();
        fetchRequirements();
    });
});

  