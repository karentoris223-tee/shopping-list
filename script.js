const itemInput = document.getElementById("itemInput");
const priceInput = document.getElementById("priceInput");
const taskList = document.getElementById("taskList");

let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let editingItemId = null;

function saveToStorage() {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

function addTask() {
    const name = itemInput.value.trim();
    const price = parseFloat(priceInput.value);

    if (!name) {
        alert("Please enter an item name");
        return;
    }
    if (isNaN(price) || price < 0) {
        alert("Please enter a valid price");
        return;
    }

    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        purchased: false
    };

    shoppingList.push(newItem);
    saveToStorage();
    renderList();

    itemInput.value = "";
    priceInput.value = "";
    itemInput.focus();
}

function togglePurchased(id) {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
        item.purchased = !item.purchased;
        saveToStorage();
        renderList();
    }
}

function markAsPurchased() {
    renderList();
}

function editItem(id) {
    editingItemId = id;
    renderList();
}

function saveEdit(id) {
    const item = shoppingList.find(i => i.id === id);
    const row = [...taskList.querySelectorAll('li')].find(li => Number(li.dataset.id) === id);
    if (!item || !row) return;

    const name = row.querySelector('.edit-name').value.trim();
    const price = parseFloat(row.querySelector('.edit-price').value);
    if (!name) {
        alert("Please enter an item name");
        return;
    }
    if (isNaN(price) || price < 0) {
        alert("Please enter a valid price");
        return;
    }

    item.name = name;
    item.price = price;
    editingItemId = null;
    saveToStorage();
    renderList();
}

function cancelEdit() {
    editingItemId = null;
    renderList();
}

function deleteItem(id) {
    shoppingList = shoppingList.filter(i => i.id !== id);
    saveToStorage();
    renderList();
}

function clearList() {
    if (confirm("Clear entire list?")) {
        shoppingList = [];
        editingItemId = null;
        const filterPurchased = document.getElementById('markAsPurchased');
        if (filterPurchased) {
            filterPurchased.checked = false;
        }
        saveToStorage();
        renderList();
    }
}

function renderList() {
    taskList.innerHTML = "";

    const filterPurchased = document.getElementById('markAsPurchased');
    let itemsToShow = shoppingList;

    if (filterPurchased && filterPurchased.checked) {
        itemsToShow = shoppingList.filter(i => i.purchased);
    }

    itemsToShow.forEach(item => {
        const li = document.createElement('li');
        li.dataset.id = item.id;
        li.className = item.purchased ? 'purchased' : '';

        const purchasedCheckbox = document.createElement('input');
        purchasedCheckbox.type = 'checkbox';
        purchasedCheckbox.checked = item.purchased;
        purchasedCheckbox.setAttribute('aria-label', `Mark ${item.name} as purchased`);
        purchasedCheckbox.onchange = () => togglePurchased(item.id);
        li.appendChild(purchasedCheckbox);

        if (editingItemId === item.id) {
            const editFields = document.createElement('div');
            editFields.className = 'edit-fields';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'edit-name';
            nameInput.setAttribute('aria-label', 'Item name');
            nameInput.value = item.name;

            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.min = '0';
            priceInput.step = '0.01';
            priceInput.className = 'edit-price';
            priceInput.setAttribute('aria-label', 'Item price');
            priceInput.value = item.price;

            editFields.append(nameInput, priceInput);
            li.appendChild(editFields);

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.textContent = 'Save';
            saveButton.onclick = () => saveEdit(item.id);
            li.appendChild(saveButton);

            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.textContent = 'Cancel';
            cancelButton.onclick = cancelEdit;
            li.appendChild(cancelButton);
        } else {
            const name = document.createElement('span');
            name.className = 'item-name';
            name.textContent = item.name;

            const price = document.createElement('span');
            price.className = 'item-price';
            price.textContent = `Ksh ${Number(item.price).toFixed(2)}`;
            li.append(name, price);

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.textContent = 'Edit';
            editButton.onclick = () => editItem(item.id);
            li.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.textContent = 'X';
            deleteButton.setAttribute('aria-label', `Delete ${item.name}`);
            deleteButton.onclick = () => deleteItem(item.id);
            li.appendChild(deleteButton);
        }

        taskList.appendChild(li);
    });

    let totalDiv = document.getElementById('totalDisplay');
    if (!totalDiv) {
        totalDiv = document.createElement('div');
        totalDiv.id = 'totalDisplay';
        totalDiv.style.marginTop = '15px';
        totalDiv.style.fontWeight = 'bold';
        document.getElementById('taskListContainer').appendChild(totalDiv);
    }
    const totalCost = shoppingList.reduce((total, item) => total + Number(item.price), 0);
    const purchasedTotal = shoppingList.reduce(
        (total, item) => total + (item.purchased ? Number(item.price) : 0),
        0
    );
    totalDiv.textContent =
        `Total: Ksh ${totalCost.toFixed(2)} | Purchased: Ksh ${purchasedTotal.toFixed(2)}`;
}

renderList();

itemInput.addEventListener('keypress', (e) => {if (e.key === 'Enter') addTask(); });
priceInput.addEventListener('keypress', (e) => {if (e.key === 'Enter') addTask(); });
