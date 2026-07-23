
async function fetchCategories(){
    const emptyState = document.querySelector(".category-empty-state");
    const emptyStateText = emptyState ? emptyState.querySelector(".category-empty-state-text") : null;
    try{
        const response = await fetch(`${ROOT_PATH}/retrieve-categories`);
        if(!response.ok){
            throw new Error(`HTTP ERROR! Status ${response.status}`);
        }
        const categories = await response.json();
        if(categories.length === 0){
            if(emptyStateText) emptyStateText.textContent = "No categories have been added yet.";
            if(emptyState) emptyState.style.display = "flex";
            return;
        }
        categories.forEach(category => {
            addCategoryCard(category);
        })
    }catch (error){
        console.log('Fetching categories failed: ', error);
        showToast("Couldn't load categories. Try refreshing the page.", "error");
        if(emptyStateText) emptyStateText.textContent = "Something went wrong loading categories.";
        if(emptyState) emptyState.style.display = "flex";
    }
}
async function addCategoryCard(category){
    try{
        const newCard = document.createElement("div");
        const container = document.querySelector(".category-card-container")
        const rootpath = 
        newCard.className="category-card";
        console.log(category["icon"])
        newCard.innerHTML=`
        <a href="${window.ROOT_PATH}/datasets/category/${category["url"]}">
            <div class="category-card-content">
                <div class="category-card-icon">
                    <img src="${window.ROOT_PATH}/${category["icon"]}" alt="category card icon"></img>
                </div>
                <h2 class="category-card-name">${category["name"]}</h2>
                <p class="category-card-description-text">${category["description"]}</p>
            </div>
        </a>
        `
        container.appendChild(newCard)
    }catch{

    }

}
function initCategorySearch(){
    const input = document.querySelector(".category-search-input");
    const button = document.querySelector(".category-search-submit");
    function submitSearch(){
        const query = input.value.trim();
        if(!query) return;
        window.location.href = `${window.ROOT_PATH}/datasets/search?search=${encodeURIComponent(query)}`;
    }
    button.addEventListener("click", submitSearch);
    input.addEventListener("keydown", (event) => {
        if(event.key === "Enter"){
            submitSearch();
        }
    });
}
function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchCategories();
        initCategorySearch();
    })
}
main();