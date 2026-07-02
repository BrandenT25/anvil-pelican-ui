
async function fetchCategories(){
    try{
        const response = await fetch(`${ROOT_PATH}/retrieve-categories`);
        if(!response.ok){
            throw new Error(`HTTP ERROR! Status ${response.status}`);
        }
        const categories = await response.json();
        categories.forEach(category => {
            addCategoryCard(category);
        })
    }catch (error){
        console.log('Fetching categories failed: ', error);
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
                    <img src="${window.ROOT_PATH}/${category["icon"]}" alt="category card icon" height="110"></img>
                </div>
                <div class="category-card-spacer"></div>
                <div class="category-card-description">
                    <h1 class="category-card-description-text">${category["name"]}</h1>
                </div>
            </div>
        </a>
        `
        container.appendChild(newCard)
    }catch{

    }

}
function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchCategories();
    })
}
main();