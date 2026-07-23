async function displayDataset(toggle){

    if(toggle === true){
        datasetSelectionButton.classList.add("active")
        datasetWrapper.innerHTML = /* html */ `
            <div class="searchbar-wrapper">
                <input class="admin-search-input" placeholder="Search Datasets by Name"></input>
            </div>
            <div class="card-wrapper">
                <div class="card" id="add-card">
                    <span class="add-card-plus">+</span>
                    <span class="add-card-text">Add Dataset</span>
                </div>
            </div>
        `
        const cardWrapper = datasetWrapper.querySelector(".card-wrapper")
        datasetWrapper.classList.add("show")
        datasets =  await fetchDatasets()
        datasets.forEach((dataset) => {
            const datasetCard = document.createElement("div")
            datasetCard.className = "card"

            dataset.name = dataset["name"]
            dataset.description = dataset["description"]
            dataset.path = dataset["path"]
            dataset.format = dataset["format"]
            dataset.stramable = dataset["streamable"]
            dataset.access = dataset["access"]
            dataset.tags = dataset["tags"]
            datasetCard.id = dataset["id"]

            datasetCard.innerHTML = /* html */ `
                <div class="text-wrapper">
                    <span class="datasetName">${dataset["name"]}</span>
                    <span class="datasetDescription">${dataset["path"]}</span>
                </div>
                <div class="modify-wrapper">
                    <i class="fa fa-edit" id="modify-btn"></i>
                    <i class="fa fa-trash" id="remove-btn"></i>
                </div>

            `
            const modifybtn = datasetCard.querySelector("#modify-btn")
            const removeBtn = datasetCard.querySelector("#remove-btn")
            modifybtn.addEventListener("click", async () =>{
                editDataset(dataset)
                displayDataset(true)
            })
            removeBtn.addEventListener("click", async ()=>{
                const result = await removeDataset(datasetCard.id)
                if (!result.ok) {
                    showToast(result.error, "error")
                    return
                }
                showToast(`"${dataset.name}" deleted.`, "success")
                displayDataset(true)

            })
            cardWrapper.appendChild(datasetCard)
        })
        const addDatasetCard = datasetWrapper.querySelector("#add-card")
        addDatasetCard.addEventListener("click", () =>{
            addDataset()
        })

        return
    }
    datasetWrapper.classList.remove("show")
    datasetSelectionButton.classList.remove("active")
}

async function displayCategory(toggle){
    if(toggle === true){
        categorySelectionButton.classList.add("active")
        categoryWrapper.innerHTML = /* html */ `
            <div class="searchbar-wrapper">
                <input class="admin-search-input" placeholder="Search Categories by Name"></input>
            </div>
            <div class="card-wrapper">
                <div class="card" id="add-card">

                    <span class="add-card-plus">+</span>
                    <span class="add-card-text">Add Category</span>
                </div>
            </div>
        `
        categoryWrapper.classList.add("show")
        const cardWrapper = categoryWrapper.querySelector(".card-wrapper")
        categories =  await fetchCategories()
        categories.forEach((category) => {
            const categoryCard = document.createElement("div")
            categoryCard.className = "card"

            category.name = category["name"]
            category.description = category["description"]
            category.urlSlug = category["url"]
            category.imgPath = category["icon"]
  

            categoryCard.innerHTML = /* html */ `
                <div class="text-wrapper">
                    <span class="datasetName">${category["name"]}</span>
                    <span class="datasetDescription">${category["url"]}</span>
                </div>
                <div class="modify-wrapper">
                    <i class="fa fa-edit" id="modify-btn"></i>
                    <i class="fa fa-trash" id="remove-btn"></i>
                </div>

            `
            const modifybtn = categoryCard.querySelector("#modify-btn")
            const removeBtn = categoryCard.querySelector("#remove-btn")
            modifybtn.addEventListener("click", async () =>{
                editCategory(category)
                displayCategory(true)
            })
            removeBtn.addEventListener("click", async ()=>{
                const result = await removeCategory(category.urlSlug)
                if (!result.ok) {
                    showToast(result.error, "error")
                    return
                }
                showToast(`"${category.name}" deleted.`, "success")
                displayCategory(true)

            })
            cardWrapper.appendChild(categoryCard)
        })





        const addCategoryCard = categoryWrapper.querySelector("#add-card")
        addCategoryCard.addEventListener("click", () => {
            console.log("test")
            addCategory()
        })
        return
    }
    categoryWrapper.classList.remove("show")
    categorySelectionButton.classList.remove("active")

}

async function displayAuthorizedUsers(toggle){
    if(toggle === true){
        authorizedUsersSelectionButton.classList.add("active")
        authorizedUsersWrapper.innerHTML = /* html */ `
            <div class="searchbar-wrapper">
                <input class="admin-search-input" placeholder="Search Authorized Users by Name"></input>
            </div>
            <div class="card-wrapper">
                <div class="card" id="add-card">
                    <span class="add-card-plus">+</span>
                    <span class="add-card-text">Add User</span>
                </div>
            </div>
            `
        const cardWrapper = authorizedUsersWrapper.querySelector(".card-wrapper")
        const users = await fetchUsers()
        users.forEach((user) => {
            const userCard = document.createElement("div")
            userCard.className = "card"

            userCard.name = user["name"]

            userCard.innerHTML = /* html */ `
                <div class="text-wrapper">
                    <span class="datasetName">${user["name"]}</span>
                </div>
                <div class="modify-wrapper">
                    <i class="fa fa-trash" id="remove-btn"></i>
                </div>
                `


            const removeBtn = userCard.querySelector("#remove-btn")
            removeBtn.addEventListener("click", async ()=>{
                const result = await removeUser(userCard.name)
                if (!result.ok) {
                    showToast(result.error, "error")
                    return
                }
                showToast(`"${userCard.name}" removed.`, "success")
                displayAuthorizedUsers(true)

            })
            cardWrapper.appendChild(userCard)
            })

        const addUserCard = authorizedUsersWrapper.querySelector("#add-card")
        addUserCard.addEventListener("click", () => {
            addUser()
            console.log("Test")
        })
        authorizedUsersWrapper.classList.add("show")
        return
    }
    authorizedUsersWrapper.classList.remove("show")
    authorizedUsersSelectionButton.classList.remove("active")
}

const datasetWrapper = document.querySelector(".dataset-wrapper")
const categoryWrapper = document.querySelector(".category-wrapper")
const authorizedUsersWrapper = document.querySelector(".user-authorization-wrapper")

const datasetSelectionButton = document.querySelector("#dataset-selection")
const categorySelectionButton = document.querySelector("#category-selection")
const authorizedUsersSelectionButton = document.querySelector("#auth-users-selection")

datasetSelectionButton.addEventListener("click", () =>{
    displayDataset(true)
    displayCategory(false)
    displayAuthorizedUsers(false)
})

categorySelectionButton.addEventListener("click", () =>{
    displayDataset(false)
    displayCategory(true)
    displayAuthorizedUsers(false)
})

authorizedUsersSelectionButton.addEventListener("click", () =>{
    displayDataset(false)
    displayCategory(false)
    displayAuthorizedUsers(true)
})

function editCategory(originalCategory){
    const overlay = document.querySelector(".modal-overlay")
    overlay.innerHTML = /* html */ `
        <div class="add-dataset-modal">
            <div class="add-dataset-close-btn">
                <span>&times;</span>
            </div>
            <div class="add-dataset-header-wrapper">
                <span>Edit Category</span>
            </div>
            <div class="header-split"></div>
            <div class="add-dataset-inputs-wrapper">
                <div class="form-field">
                    <label for="category-name">Name</label>
                    <input type="text" id="category-name">
                </div>

                <div class="form-field">
                    <label for="category-description">Description</label>
                    <textarea id="category-description"></textarea>
                </div>

                <div class="form-field">
                    <label for="url-slug">URL slug</label>
                    <input type="text" id="url-slug">
                </div>

                <div class="form-field">
                    <label for="image-path">Image path</label>
                    <input type="text" id="image-path">
                </div>

            </div>
            <div class="submit-btn-wrapper">
                <div class="submit-btn"><span>Submit</span></div>
            </div>
        </div>
    `

    document.querySelector('#category-name').value = originalCategory.name
    document.querySelector('#category-description').value = originalCategory.description
    document.querySelector('#url-slug').value = originalCategory.url
    document.querySelector('#image-path').value = originalCategory.icon

    const closeBtn = document.querySelector(".add-dataset-close-btn")
    const submitButton = document.querySelector(".submit-btn")

    submitButton.addEventListener("click", async () => {
        const category = {
            name: document.querySelector('#category-name').value,
            description: document.querySelector('#category-description').value,
            url: document.querySelector('#url-slug').value,
            icon: document.querySelector('#image-path').value
        }
        const result = await submitCategoryChange(category, originalCategory.url)
        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        showToast(`Category "${category.name}" updated.`, "success")
        toggleOverlay(false)
        displayCategory(true)
    })

    closeBtn.addEventListener("click", () => {
        toggleOverlay(false)
    })

    toggleOverlay(true)
}


function editDataset(originalDataset){
    const overlay = document.querySelector(".modal-overlay")
    overlay.innerHTML = /* html */ `
        <div class="add-dataset-modal">
            <div class="add-dataset-close-btn">
                <span>&times;</span>
            </div>
            <div class="add-dataset-header-wrapper">
                <span>Edit Dataset</span>
            </div>
            <div class="header-split"></div>
            <div class="add-dataset-inputs-wrapper">
                <div class="form-field">
                    <label for="dataset-name">Name</label>
                    <input type="text" id="dataset-name">
                </div>

                <div class="form-field">
                    <label for="dataset-description">Description</label>
                    <textarea id="dataset-description"></textarea>
                </div>

                <div class="form-field">
                    <label for="dataset-path">Path</label>
                    <input type="text" id="dataset-path">
                </div>

                <div class="form-field">
                    <label for="dataset-format">Format</label>
                    <input type="text" id="dataset-format">
                </div>

                <div class="form-field">
                    <label for="dataset-access">Access</label>
                    <input type="text" id="dataset-access">
                </div>
                <div class="form-field">
                    <label>Categories</label>
                    <div class="category-checklist" id="dataset-tags">
    
                    </div>
                </div>
                <div class="form-field checkbox-field">
                    <input type="checkbox" id="dataset-streamable">
                    <label for="dataset-streamable">Streamable</label>
                </div>
            </div>
            <div class="submit-btn-wrapper">
                <div class="submit-btn"><span>Submit</span></div>
            </div>
        </div>
    `
    


    document.querySelector('#dataset-name').value = originalDataset.name
    document.querySelector('#dataset-description').value = originalDataset.description
    document.querySelector('#dataset-path').value = originalDataset.path
    document.querySelector('#dataset-format').value = originalDataset.format
    document.querySelector('#dataset-access').value = originalDataset.access
    document.querySelector('#dataset-streamable').checked = originalDataset.streamable
    populateCategoryDropdown().then(() => {
        document.querySelectorAll('#dataset-tags input[type="checkbox"]').forEach(checkbox => {
            if (originalDataset.tags.includes(checkbox.value)) {
                checkbox.checked = true
            }
        })
    })
    const closeBtn = document.querySelector(".add-dataset-close-btn")
    const submitButton = document.querySelector(".submit-btn")
    submitButton.addEventListener("click", async () =>{
        const tags = Array.from(document.querySelectorAll('#dataset-tags input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        const dataset = {
        name: document.querySelector('#dataset-name').value,
        description: document.querySelector('#dataset-description').value,
        path: document.querySelector('#dataset-path').value,
        format: document.querySelector('#dataset-format').value,
        streamable: document.querySelector('#dataset-streamable').checked,
        access: document.querySelector('#dataset-access').value,
        tags: tags
    }
        const result = await submitDatasetChange(dataset, originalDataset.id)
        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        showToast(`Dataset "${dataset.name}" updated.`, "success")
        toggleOverlay(false)
        displayDataset(true)
    })
    closeBtn.addEventListener("click", () =>{
        toggleOverlay(false)
    })


    toggleOverlay(true)
}

function addDataset(){
    const overlay = document.querySelector(".modal-overlay")
    overlay.innerHTML = /* html */ `
        <div class="add-dataset-modal">
            <div class="add-dataset-close-btn">
                <span>&times;</span>
            </div>
            <div class="add-dataset-header-wrapper">
                <span>Add Dataset</span>
            </div>
            <div class="header-split"></div>
            <div class="add-dataset-inputs-wrapper">
                <div class="form-field">
                    <label for="dataset-name">Name</label>
                    <input type="text" id="dataset-name">
                </div>

                <div class="form-field">
                    <label for="dataset-description">Description</label>
                    <textarea id="dataset-description"></textarea>
                </div>

                <div class="form-field">
                    <label for="dataset-path">Path</label>
                    <input type="text" id="dataset-path">
                </div>

                <div class="form-field">
                    <label for="dataset-format">Format</label>
                    <input type="text" id="dataset-format">
                </div>

                <div class="form-field">
                    <label for="dataset-access">Access</label>
                    <input type="text" id="dataset-access">
                </div>
                <div class="form-field">
                    <label>Categories</label>
                    <div class="category-checklist" id="dataset-tags">
    
                    </div>
                </div>
                <div class="form-field checkbox-field">
                    <input type="checkbox" id="dataset-streamable">
                    <label for="dataset-streamable">Streamable</label>
                </div>
            </div>
            <div class="submit-btn-wrapper">
                <div class="submit-btn"><span>Submit</span></div>
            </div>
        </div>
    `
    populateCategoryDropdown() 
   
    const closeBtn = document.querySelector(".add-dataset-close-btn")
    const submitButton = document.querySelector(".submit-btn")
    submitButton.addEventListener("click", async () =>{
        const tags = Array.from(document.querySelectorAll('#dataset-tags input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        const dataset = {
        name: document.querySelector('#dataset-name').value,
        description: document.querySelector('#dataset-description').value,
        path: document.querySelector('#dataset-path').value,
        format: document.querySelector('#dataset-format').value,
        streamable: document.querySelector('#dataset-streamable').checked,
        access: document.querySelector('#dataset-access').value,
        tags: tags
    }
        const result = await submitDataset(dataset)
        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        showToast(`Dataset "${dataset.name}" added.`, "success")
        toggleOverlay(false)
        displayDataset(true)
        displayCategory(false)
        displayAuthorizedUsers(false)
    })
    closeBtn.addEventListener("click", () =>{
        toggleOverlay(false)
    })


    toggleOverlay(true)
}

function addCategory(){
    const overlay = document.querySelector(".modal-overlay")
    overlay.innerHTML = /* html */ `
        <div class="add-dataset-modal">
            <div class="add-dataset-close-btn">
                <span>&times;</span>
            </div>
            <div class="add-dataset-header-wrapper">
                <span>Add Category</span>
            </div>
            <div class="header-split"></div>
            <div class="add-dataset-inputs-wrapper">
                <div class="form-field">
                    <label for="category-name">Name</label>
                    <input type="text" id="category-name">
                </div>

                <div class="form-field">
                    <label for="category-description">Description</label>
                    <textarea id="category-description"></textarea>
                </div>

                <div class="form-field">
                    <label for="url-slug">URL SLUG</label>
                    <input type="text" id="url-slug">
                </div>

                <div class="form-field">
                    <label for="image-path">Image Path</label>
                    <input type="text" id="image-path">
                </div>

            </div>
            <div class="submit-btn-wrapper">
                <div class="submit-btn"><span>Submit</span></div>
            </div>
        </div>
    `
    populateCategoryDropdown() 
    const closeBtn = document.querySelector(".add-dataset-close-btn")
    const submitButton = document.querySelector(".submit-btn")
    submitButton.addEventListener("click", async () =>{
        const category = {
        name: document.querySelector('#category-name').value,
        description: document.querySelector('#category-description').value,
        url: document.querySelector('#url-slug').value,
        icon: document.querySelector('#image-path').value
    }
        const result = await submitCategory(category)
        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        showToast(`Category "${category.name}" added.`, "success")
        toggleOverlay(false)
        displayCategory(true)

    })
    closeBtn.addEventListener("click", () =>{
        toggleOverlay(false)
    })


    toggleOverlay(true)
}

function addUser(){
    const overlay = document.querySelector(".modal-overlay")
    overlay.innerHTML = /* html */ `
        <div class="add-user-modal">
            <div class="add-dataset-close-btn">
                <span>&times;</span>
            </div>
            <div class="add-user-header-wrapper">
                <span>Add User</span>
            </div>
            <div class="header-split"></div>
            <div class="add-user-inputs-wrapper">
                <div class="form-field">
                    <label for="user-name">Name</label>
                    <input type="text" id="user-name">
                </div>
            </div>

              
            <div class="submit-btn-wrapper">
                <div class="submit-btn"><span>Submit</span></div>
            </div>
        </div>
    `
    const closeBtn = document.querySelector(".add-dataset-close-btn")
    const submitButton = document.querySelector(".submit-btn")
    submitButton.addEventListener("click", async () =>{
        const name = overlay.querySelector('#user-name').value
        const result = await submitUser(name)
        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        showToast(`"${name}" added as an authorized user.`, "success")
        toggleOverlay(false)
        displayAuthorizedUsers(true)
    })

    closeBtn.addEventListener("click", () =>{
        toggleOverlay(false)
    })


    toggleOverlay(true)
}

/**
 * Single shared fetch wrapper for every admin mutation/read below — reads
 * the JSON body either way so a failed request can surface the backend's
 * specific `detail` message (validation error, duplicate name, etc.)
 * instead of a generic "something went wrong."
 * @returns {Promise<{ok: boolean, data: any, error: string|null}>}
 */
async function adminRequest(url, options){
    try{
        const response = await fetch(url, options)
        let data = null
        try{ data = await response.json() }catch(_){}
        if(!response.ok){
            const detail = (data && data.detail) ? data.detail : `Request failed (status ${response.status}).`
            return { ok: false, data, error: detail }
        }
        return { ok: true, data, error: null }
    }catch(error){
        console.log(error)
        return { ok: false, data: null, error: "Couldn't reach the server. Check your connection and try again." }
    }
}

async function fetchDatasets(){
    const result = await adminRequest(`${window.ROOT_PATH}/retrieve-datasets`)
    if(!result.ok){
        showToast(result.error, "error")
        return []
    }
    return result.data
}

async function fetchCategories(){
    const result = await adminRequest(`${window.ROOT_PATH}/retrieve-categories`)
    if(!result.ok){
        showToast(result.error, "error")
        return []
    }
    return result.data
}

async function fetchUsers(){
    const result = await adminRequest(`${window.ROOT_PATH}/admin/retrieve-users`)
    if(!result.ok){
        showToast(result.error, "error")
        return []
    }
    return result.data
}

async function submitUser(user){
    return adminRequest(`${window.ROOT_PATH}/admin/add-user?user=${encodeURIComponent(user)}`, {
        method: "POST",
    })
}
async function removeUser(user){
    return adminRequest(`${window.ROOT_PATH}/admin/remove-user?user=${encodeURIComponent(user)}`, {
        method: "POST",
    })
}

document.addEventListener("DOMContentLoaded", (event) => {
    displayDataset(true);
})

function toggleOverlay(toggle){
    const overlay = document.querySelector(".modal-overlay")
    if(toggle === true){
        overlay.classList.add("show")
        return
    }
    overlay.classList.remove("show")
    overlay.innerHTML = ``
}

async function populateCategoryDropdown(){
    const categories = await fetchCategories();
    const container = document.querySelector('#dataset-tags');

    container.innerHTML = '';

    categories.forEach(category => {
        const row = document.createElement('div');
        row.className = 'category-row';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category.url;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = category.name;

        row.appendChild(checkbox);
        row.appendChild(nameSpan);


        row.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });

        container.appendChild(row);
    });
}

async function submitDataset(dataset){
    return adminRequest(`${window.ROOT_PATH}/admin/add-dataset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataset),
    })
}

async function removeDataset(id){
    return adminRequest(`${window.ROOT_PATH}/admin/remove-dataset?dataset_id=${id}`, {
        method: "POST",
    })
}

async function submitDatasetChange(dataset, id){
    return adminRequest(`${window.ROOT_PATH}/admin/modify-dataset?dataset_id=${id}`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(dataset)
    })
}

async function submitCategory(category){
    return adminRequest(`${window.ROOT_PATH}/admin/add-category`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(category),
    })
}
async function removeCategory(url){
    return adminRequest(`${window.ROOT_PATH}/admin/remove-category?category_url=${encodeURIComponent(url)}`, {
        method: "POST",
    })
}

async function submitCategoryChange(category, url){
    return adminRequest(`${window.ROOT_PATH}/admin/modify-category?category_url=${encodeURIComponent(url)}`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(category)
    })
}