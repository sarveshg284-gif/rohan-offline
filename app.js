
// ==========================================
// TRANSACTION MANAGEMENT SYSTEM
// Complete Updated JavaScript
// ==========================================


// DOM ELEMENTS

const form = document.getElementById("transactionForm");

const transactionList = document.getElementById("transactionList");

const totalTransactions = document.getElementById("totalTransactions");

const totalQuantity = document.getElementById("totalQuantity");

const totalClients = document.getElementById("totalClients");


// ==========================================
// 1. NAVIGATION
// ==========================================

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        button.classList.add("active");

        const pageId = button.dataset.page;

        document.getElementById(pageId).classList.add("active");

        document.getElementById("pageTitle").textContent =
            button.textContent.trim();

        refreshApp();

    });

});


// ==========================================
// 2. DEFAULT DATE
// ==========================================

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


// ==========================================
// 3. ADD TRANSACTION
// ==========================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const transaction = {

        item: document.getElementById("item").value.trim(),

        quantity: Number(document.getElementById("quantity").value),

        fromLocation: document.getElementById("fromLocation").value.trim(),

        client: document.getElementById("client").value.trim(),

        employee: document.getElementById("employee").value.trim(),

        date: document.getElementById("date").value,

        status: document.getElementById("status").value,

        remarks: document.getElementById("remarks").value

    };

    try {

        await addTransaction(transaction);

        alert("Transaction saved successfully!");

        form.reset();

        document.getElementById("date").value =
            new Date().toISOString().split("T")[0];

        await refreshApp();

    } catch (error) {

        alert("Error saving transaction!");

        console.error(error);

    }

});


// ==========================================
// 4. VIEW TRANSACTIONS
// ==========================================

async function displayTransactions() {

    const data = await getTransactions();

    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    const startDate = document.getElementById("startDate").value;

    const endDate = document.getElementById("endDate").value;

    const filteredData = data
        .filter(t => {

            const matchesSearch =
                String(t.item || "").toLowerCase().includes(search) ||
                String(t.client || "").toLowerCase().includes(search);

            const matchesStart =
                !startDate || t.date >= startDate;

            const matchesEnd =
                !endDate || t.date <= endDate;

            return matchesSearch && matchesStart && matchesEnd;

        })
        .sort((a, b) => b.id - a.id);


    if (filteredData.length === 0) {

        transactionList.innerHTML =
            "<p>No transactions found.</p>";

        return;

    }


    let html = `
        <div class="table-wrapper">

        <table class="transaction-table">

        <thead>
            <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>From</th>
                <th>Client</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
            </tr>
        </thead>

        <tbody>
    `;


    filteredData.forEach(t => {

        html += `
            <tr>

                <td>${t.id}</td>

                <td>${escapeHTML(t.item)}</td>

                <td>${t.quantity}</td>

                <td>${escapeHTML(t.fromLocation)}</td>

                <td>${escapeHTML(t.client)}</td>

                <td>${escapeHTML(t.employee)}</td>

                <td>${escapeHTML(t.date)}</td>

                <td>${escapeHTML(t.status)}</td>

                <td>${escapeHTML(t.remarks)}</td>

                <td>
                    <button class="delete-btn"
                        onclick="removeTransaction(${t.id})">
                        Delete
                    </button>
                </td>

            </tr>
        `;

    });


    html += `
        </tbody>
        </table>
        </div>
    `;

    transactionList.innerHTML = html;

}


// ==========================================
// 5. DASHBOARD
// ==========================================

async function updateDashboard() {

    const data = await getTransactions();

    totalTransactions.textContent = data.length;

    totalQuantity.textContent = data.reduce(
        (sum, t) => sum + Number(t.quantity || 0),
        0
    );

    totalClients.textContent = new Set(

        data.map(t =>
            String(t.client || "").trim().toLowerCase()
        )

    ).size;


    // Recent Transactions

    const recent = [...data]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    const recentElement =
        document.getElementById("recentTransactions");


    if (recent.length === 0) {

        recentElement.innerHTML =
            "<p>No recent transactions.</p>";

        return;

    }


    recentElement.innerHTML = `

        <div class="table-wrapper">

        <table class="transaction-table">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Client</th>
                    <th>Quantity</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>

                ${recent.map(t => `

                    <tr>

                        <td>${t.id}</td>

                        <td>${escapeHTML(t.item)}</td>

                        <td>${escapeHTML(t.client)}</td>

                        <td>${t.quantity}</td>

                        <td>${escapeHTML(t.status)}</td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

        </div>

    `;

}


// ==========================================
// 6. REPORTS AND ANALYTICS
// ==========================================

async function updateReports() {

    const data = await getTransactions();

    const clientData = {};

    const employeeData = {};

    const statusData = {};


    data.forEach(t => {

        const client = t.client || "Unknown";

        const employee = t.employee || "Not Assigned";

        const status = t.status || "Unknown";


        // Client Wise Quantity

        clientData[client] =
            (clientData[client] || 0) +
            Number(t.quantity || 0);


        // Employee Wise Quantity

        employeeData[employee] =
            (employeeData[employee] || 0) +
            Number(t.quantity || 0);


        // Status Wise Transactions

        statusData[status] =
            (statusData[status] || 0) + 1;

    });


    drawBarChart(
        "clientChart",
        clientData,
        "Client Wise Quantity"
    );


    drawBarChart(
        "employeeChart",
        employeeData,
        "Employee Wise Quantity"
    );


    drawPieChart(
        "statusChart",
        statusData,
        "Status Wise Transactions"
    );

}


// ==========================================
// 7. BAR GRAPH
// ==========================================

function drawBarChart(canvasId, data, title) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = 750;

    const height = 300;

    canvas.width = width;

    canvas.height = height;

    ctx.clearRect(0, 0, width, height);


    // Graph Title

    ctx.fillStyle = "#1e293b";

    ctx.font = "bold 18px Arial";

    ctx.fillText(title, 20, 25);


    const entries = Object.entries(data);


    if (entries.length === 0) {

        ctx.fillStyle = "#64748b";

        ctx.font = "16px Arial";

        ctx.fillText("No Data Available", 20, 80);

        return;

    }


    const maxValue = Math.max(
        ...entries.map(entry => entry[1]),
        1
    );


    const chartHeight = 190;

    const chartTop = 60;

    const chartWidth = 650;

    const slotWidth = chartWidth / entries.length;

    const barWidth = Math.min(55, slotWidth * 0.55);


    entries.forEach(([label, value], index) => {

        const x =
            50 + index * slotWidth +
            (slotWidth - barWidth) / 2;

        const barHeight =
            (value / maxValue) * chartHeight;

        const y =
            chartTop + chartHeight - barHeight;


        // Bar

        ctx.fillStyle = "#2563eb";

        ctx.fillRect(
            x,
            y,
            barWidth,
            barHeight
        );


        // Value

        ctx.fillStyle = "#1e293b";

        ctx.font = "bold 13px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            value,
            x + barWidth / 2,
            y - 8
        );


        // Label

        ctx.font = "12px Arial";

        const shortLabel =
            label.length > 12
                ? label.substring(0, 12) + "..."
                : label;

        ctx.fillText(
            shortLabel,
            x + barWidth / 2,
            chartTop + chartHeight + 20
        );

    });


    ctx.textAlign = "left";

}


// ==========================================
// 8. PIE CHART
// ==========================================

function drawPieChart(canvasId, data, title) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = 750;

    const height = 320;

    canvas.width = width;

    canvas.height = height;

    ctx.clearRect(0, 0, width, height);


    // Title

    ctx.fillStyle = "#1e293b";

    ctx.font = "bold 18px Arial";

    ctx.fillText(title, 20, 25);


    const entries = Object.entries(data);


    if (entries.length === 0) {

        ctx.fillStyle = "#64748b";

        ctx.font = "16px Arial";

        ctx.fillText("No Data Available", 20, 80);

        return;

    }


    const colors = [
        "#2563eb",
        "#16a34a",
        "#f59e0b",
        "#dc2626",
        "#9333ea"
    ];


    const total = entries.reduce(
        (sum, entry) => sum + entry[1],
        0
    );


    let startAngle = -Math.PI / 2;

    const centerX = 190;

    const centerY = 180;

    const radius = 110;


    // Draw Pie Slices

    entries.forEach(([label, value], index) => {

        const sliceAngle =
            (value / total) * Math.PI * 2;


        ctx.beginPath();

        ctx.moveTo(centerX, centerY);

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            startAngle + sliceAngle
        );

        ctx.closePath();

        ctx.fillStyle =
            colors[index % colors.length];

        ctx.fill();


        startAngle += sliceAngle;

    });


    // Legend

    entries.forEach(([label, value], index) => {

        const y = 85 + index * 35;

        ctx.fillStyle =
            colors[index % colors.length];

        ctx.fillRect(
            370,
            y - 12,
            16,
            16
        );


        ctx.fillStyle = "#1e293b";

        ctx.font = "14px Arial";

        const percentage =
            ((value / total) * 100).toFixed(1);


        ctx.fillText(
            `${label}: ${value} (${percentage}%)`,
            400,
            y
        );

    });

}


// ==========================================
// 9. DELETE TRANSACTION
// ==========================================

async function removeTransaction(id) {

    if (!confirm(
        "Are you sure you want to delete this transaction?"
    )) {

        return;

    }


    try {

        await deleteTransaction(id);

        await refreshApp();

        alert("Transaction deleted successfully!");

    } catch (error) {

        alert("Error deleting transaction!");

        console.error(error);

    }

}


// Make Function Available for Delete Button

window.removeTransaction = removeTransaction;


// ==========================================
// 10. SEARCH AND DATE FILTERS
// ==========================================

document.getElementById("searchInput").addEventListener(
    "input",
    displayTransactions
);


document.getElementById("startDate").addEventListener(
    "change",
    displayTransactions
);


document.getElementById("endDate").addEventListener(
    "change",
    displayTransactions
);


// ==========================================
// 11. CLEAR FILTERS
// ==========================================

document.getElementById("clearFilters").addEventListener(
    "click",
    () => {

        document.getElementById("searchInput").value = "";

        document.getElementById("startDate").value = "";

        document.getElementById("endDate").value = "";

        displayTransactions();

    }
);


// ==========================================
// 12. EXPORT CSV
// ==========================================

document.getElementById("exportExcel").addEventListener(
    "click",
    async () => {

        const data = await getTransactions();

        if (data.length === 0) {

            alert("No transactions to export!");

            return;

        }


        const headers = [

            "ID",
            "Item",
            "Quantity",
            "From Location",
            "Client",
            "Employee",
            "Date",
            "Status",
            "Remarks"

        ];


        const rows = data.map(t => [

            t.id,
            t.item,
            t.quantity,
            t.fromLocation,
            t.client,
            t.employee,
            t.date,
            t.status,
            t.remarks

        ]);


        const csv = [headers, ...rows]

            .map(row =>

                row.map(value =>

                    `"${String(value ?? "").replace(/"/g, '""')}"`

                ).join(",")

            )

            .join("\r\n");


        const blob = new Blob(

            ["\uFEFF" + csv],

            { type: "text/csv;charset=utf-8;" }

        );


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "transactions.csv";

        link.click();

        URL.revokeObjectURL(url);

    }
);


// ==========================================
// 13. HTML SAFETY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => {

            const entities = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#39;"

            };

            return entities[character];

        }
    );

}


// ==========================================
// 14. REFRESH ALL DATA
// ==========================================

async function refreshApp() {

    try {

        await updateDashboard();

        await displayTransactions();

        await updateReports();

    } catch (error) {

        console.error("Application Refresh Error:", error);

    }

}


// ==========================================
// 15. INITIAL LOAD
// ==========================================

refreshApp();


// ==========================================
// 16. SERVICE WORKER REGISTRATION
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            await navigator.serviceWorker.register(
                "./service-worker.js"
            );

            console.log(
                "Service Worker Registered Successfully!"
            );

        } catch (error) {

            console.error(
                "Service Worker Registration Failed:",
                error
            );

        }

    });

}
