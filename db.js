
const DB_NAME = "TransactionManagerDB";
const DB_VERSION = 1;
const STORE_NAME = "transactions";

let db;

function openDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


async function addTransaction(transaction) {
    if (!db) {
        await openDatabase();
    }

    return new Promise((resolve, reject) => {

        const transactionDB = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transactionDB.objectStore(STORE_NAME);

        const request = store.add(transaction);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);
    });
}


async function getTransactions() {
    if (!db) {
        await openDatabase();
    }

    return new Promise((resolve, reject) => {

        const transactionDB = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transactionDB.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);
    });
}


async function deleteTransaction(id) {
    if (!db) {
        await openDatabase();
    }

    return new Promise((resolve, reject) => {

        const transactionDB = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transactionDB.objectStore(STORE_NAME);

        const request = store.delete(Number(id));

        request.onsuccess = () => resolve();

        request.onerror = () => reject(request.error);
    });
}


openDatabase().catch((error) => {
    console.error("Database Error:", error);
});
