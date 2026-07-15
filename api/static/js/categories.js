
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
function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchCategories();
    })
}
main();