/* ---------- Local storage helpers ---------- */
function getCustomers() {
    return JSON.parse(localStorage.getItem("expenses")) || [];
}
function setCustomers(list) {
    localStorage.setItem("expenses", JSON.stringify(list));
}

/* ---------- Customer table ---------- */
function addCustomerToTable(customer) {
    const tr = document.createElement("tr");
    const valuesFor = record => [
        record.date || "",
        ...Array.from({ length: 4 }, (_, index) =>
            (record.names || [record.name])[index] || ""
        ),
        record.comment || ""
    ];

    function renderRow(editing = false) {
        tr.replaceChildren();
        const values = valuesFor(customer);

        values.forEach((value, index) => {
            const td = document.createElement("td");
            if (editing) {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "edit-input";
                input.value = value || "";
                input.setAttribute("aria-label", ["Date", "Name", "Panel", "Amount", "Days", "Comment"][index]);
                td.appendChild(input);
            } else {
                td.textContent = value || "";
            }
            tr.appendChild(td);
        });

        const actionTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = editing ? "Save" : "Edit";
        editBtn.className = "edit-btn";
        editBtn.addEventListener("click", () => {
            if (editing) {
                const inputs = tr.querySelectorAll(".edit-input");
                const updated = {
                    ...customer,
                    date: inputs[0].value.trim(),
                    names: Array.from(inputs).slice(1, 5).map(input => input.value.trim()),
                    comment: inputs[5].value.trim()
                };
                const customers = getCustomers().map(item => item.id === customer.id ? updated : item);
                setCustomers(customers);
                Object.assign(customer, updated);
                renderRow();
                filterCustomers();
            } else {
                renderRow(true);
            }
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "del-btn";
        delBtn.addEventListener("click", () => {
            tr.remove();
            setCustomers(getCustomers().filter(c => c.id !== customer.id));
            filterCustomers();
        });

        actionTd.append(editBtn, delBtn);
        if (editing) {
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancel";
            cancelBtn.className = "btn-gray";
            cancelBtn.addEventListener("click", () => renderRow());
            actionTd.appendChild(cancelBtn);
        }
        tr.appendChild(actionTd);
    }

    renderRow();
    document.querySelector("#expense-list").appendChild(tr);
}

function loadCustomers() {
    let customers = getCustomers();

    // give an id to old records that don't have one
    let changed = false;
    customers.forEach(c => {
        if (!c.id) {
            c.id = Date.now().toString() + Math.random().toString(16).slice(2);
            changed = true;
        }
    });
    if (changed) setCustomers(customers);

    customers.forEach(addCustomerToTable);
}

document.querySelector("#addBtn").addEventListener("click", () => {
    const date = document.querySelector("#customer-date").value;
    const names = Array.from({ length: 4 }, (_, index) =>
        document.querySelector(`#customer-name-${index + 1}`).value.trim()
    );
    const comment = document.querySelector("#customer-comment").value.trim();
    if (!names.some(Boolean)) {
        alert("Please enter at least one customer name");
        return;
    }

    const customer = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        date,
        names,
        comment,
    };

    addCustomerToTable(customer);

    const list = getCustomers();
    list.push(customer);
    setCustomers(list);

    filterCustomers();

    document.querySelector("#customer-date").value = "";
    for (let index = 1; index <= 4; index++) {
        document.querySelector(`#customer-name-${index}`).value = "";
    }
    document.querySelector("#customer-comment").value = "";
});

/* ---------- Search ---------- */
const searchInput = document.querySelector("#searchInput");

function filterCustomers() {
    const term = searchInput.value.trim().toLowerCase();
    const rows = document.querySelectorAll("#expense-list tr:not(.no-result)");
    let visible = 0;

    rows.forEach(tr => {
        const names = Array.from(tr.cells).slice(1, 5);
        const match = names.some(cell => cell.textContent.toLowerCase().includes(term));
        tr.style.display = match ? "" : "none";
        if (match) visible++;
    });

    // "No customer found" message
    let msg = document.querySelector("#expense-list .no-result");
    if (rows.length > 0 && visible === 0) {
        if (!msg) {
            msg = document.createElement("tr");
            msg.className = "no-result";
            msg.innerHTML = '<td colspan="7">No customer found</td>';
            document.querySelector("#expense-list").appendChild(msg);
        }
    } else if (msg) {
        msg.remove();
    }
}

searchInput.addEventListener("input", filterCustomers);

document.querySelector("#printBtn").addEventListener("click", () => window.print());

window.addEventListener("load", loadCustomers);