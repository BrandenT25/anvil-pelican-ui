async function fetchDatasets() {
    try{
        
        const datasetResponse = await fetch(`${window.ROOT_PATH}/retrieve-datasets`);
        if (!datasetResponse.ok){
            throw new Error(`HTTP error! status ${datasetResponse.status} `);
        }
        const datasets = await datasetResponse.json();
        datasets.forEach(dataset => {
            console.log("adding dataset");
            addDatasetCard(dataset);
        })
    } catch (error) {
        console.log("fetch operation failed", error);
    }
}


async function addDatasetCard(dataset) {
    try{
        const newCard = document.createElement("div");
        const container = document.querySelector(".dataset-card-container");
        newCard.innerHTML = `
            <div class="dataset-card-header">
                <span class="dataset-card-title-box">${dataset.name}</span>
                <span class="arrow"></span>
            </div>
            <div class="dataset-card-desc-box">${dataset.description}</div>
            <div class="dataset-card-content">
                <div class="file-browser-container">
                    <p>files</p>
                </div>
            </div>
        `;
        newCard.addEventListener("click", (event) => {
            const drop_down = newCard.querySelector(".dataset-card-content");
            const isToggled = newCard.dataset.toggled === 'true';
            const arrow = newCard.querySelector(".arrow");
            if (isToggled){
                drop_down.style.display = "none";
                newCard.dataset.toggled = 'false';
                arrow.classList.toggle("flipped")
            } else{
                drop_down.style.display = "block";
                newCard.dataset.toggled = 'true';
                arrow.classList.toggle("flipped")

            }
        }) 
        newCard.className = "dataset-card";
        container.appendChild(newCard);
    }catch (error) {
        console.log("adding dataset failed with ", error);
    }
}

function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchDatasets();
    })
}

main();