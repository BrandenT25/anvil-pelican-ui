async function fetchDatasets() {
    try{
        
        const datasetResponse = await fetch(`${window.ROOT_PATH}/retrieve-datasets`);
        if (!datasetResponse.ok){
            throw new Error(`HTTP error! status ${datasetResponse.status} `);
        }
        const datasets = await datasetResponse.json();
        datasets.forEach(dataset => {
            dataset["tags"].forEach(tag => {
                if(tag == window.CATEGORY){
                    addDatasetCard(dataset);
                }
            })
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
            <div class="dataset-card-top">
                <div class="dataset-card-header">
                    <span class="dataset-card-title-box">${dataset.name}</span>
                    <span class="arrow"></span>
                </div>
                <div class="dataset-card-desc-box">${dataset.description}</div>
            </div>
            <div class="dataset-card-content">
                <div class="file-browser-container">
                    <div class="file-browser-header">
                        <h1>${dataset["name"]}</h1>
                        <div class="file-browser-header-split"></div>
                        <div class="file-browser-breadcrumbs"></div>
                    </div>
                    <div class="file-browser-directory-container"></div>
                    <div class="file-browser-download-container">
                        <div class="file-browser-download-button"><span>Download</span></div>
                        <div class="file-browser-download-amount"></div>
                        <div class="file-browser-download-clear"></div>
                    </div>
                </div>
            </div>
        `;
        const file_container = newCard.querySelector(".file-browser-directory-container")
        const breadcrumbs = newCard.querySelector(".file-browser-breadcrumbs")
        const download_card = newCard.querySelector(".file-browser-download-amount");
        const download_button = newCard.querySelector(".file-browser-download-button")
        file_container.downloadPaths = new Map();

        file_container.downloadAmount = file_container.downloadPaths.size
        const header = newCard.querySelector(".dataset-card-top")
        download_button.addEventListener("click", (event) => {
            file_container.downloadPaths.forEach((value, key)=>{
                download_file(key)
            })
        })
        header.addEventListener("click", (event) => {
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
                loadDirectory(dataset["path"], file_container, breadcrumbs, download_card);

            }
        }) 
        newCard.className = "dataset-card";
        container.appendChild(newCard);
    }catch (error) {
        console.log("adding dataset failed with ", error);
    }
}


async function loadDirectory(path, container, breadcrumbs, download_card){
    try{
        container.currentPath = path;
        if (!container.basePath) {
            container.basePath = path;
        }
        container.innerHTML = ""
        breadcrumbs.innerHTML = "";
        const parts = container.currentPath.split("/").filter(Boolean);
        console.log(parts);
        const baseParts = container.basePath.split("/").filter(Boolean);
        console.log("basePath:", container.basePath, "| baseParts.length:", baseParts.length);
        console.log("currentPath:", container.currentPath, "| parts:", parts, "| parts.length:", parts.length);
        const rootLabel = document.createElement("div");
        rootLabel.className = "part-card";
        rootLabel.innerHTML = `<span style="cursor:pointer;">${baseParts[baseParts.length - 1]}</span>`;
        rootLabel.addEventListener("click", (event) => {
            event.stopPropagation();
            loadDirectory(container.basePath, container, breadcrumbs, download_card);
        });
        breadcrumbs.appendChild(rootLabel);
        parts.forEach((part, index) =>{
            const partCard = document.createElement("div")
            const subPath = "/" + parts.slice(0, index + 1).join("/");
            if (index < baseParts.length) {
                return; 
            }
            if(index !== 0){
                const separator = document.createElement("span");
                separator.textContent = "<";
                separator.className = "breadcrumb-separator";
                breadcrumbs.appendChild(separator);
            }

            partCard.className = "part-card"
            partCard.innerHTML = `
            <span style="cursor:pointer;">${part}</span>
            `
            partCard.addEventListener("click",(event) => {
                event.stopPropagation()
                console.log(subPath)
                loadDirectory(subPath, container, breadcrumbs, download_card)
            })
            breadcrumbs.appendChild(partCard)
        })
        console.log(parts);
        const response = await fetch(`${window.ROOT_PATH}/datasets/category/list-path?path=${path}`)
        if(!response.ok){
            throw new Error(`HTTP error! status ${datasetResponse.status} `);
        }
        const paths = await response.json()
        console.log(paths)
        paths.forEach(folder_path => {

            const cleanedPath = folder_path.name.replace(/\/$/, "");
            const name = cleanedPath.split("/").pop();
            const newCard = document.createElement("div")
            console.log("raw name:", folder_path.name);
            if(folder_path["type"] === "directory"){
                newCard.className = "file-browser-directory-folder"
                newCard.dataset.path = folder_path.name
                newCard.innerHTML = `
                <label class="folder-checkbox-wrapper">
                    <input type="checkbox" class="folder-checkbox"></input>
                    <span class="folder-checkbox-custom"></span>
                </label>
                <img src="${window.ROOT_PATH}/api/static/img/folder-icon.png" alt="folder-icon" height="20"></img>
                <div class="folder-name-box">
                    ${name} 
                </div>
                `
                const folderName = newCard.querySelector(".folder-name-box")
                const checkBox = newCard.querySelector(".folder-checkbox")
                const clearBox = download_card.querySelector(".file-browser-download-clear")
                const fullPath = folder_path.name;
                const isDirectlySelected = container.downloadPaths.has(fullPath);
                let coveringAncestor = null;
                for (const selectedPath of container.downloadPaths.keys()) {
                    if (fullPath !== selectedPath && fullPath.startsWith(selectedPath.replace(/\/$/, "") + "/")) {
                        coveringAncestor = selectedPath;
                        break;
                    }
                }
                checkBox.checked = isDirectlySelected || Boolean(coveringAncestor);
                checkBox.disabled = Boolean(coveringAncestor) && !isDirectlySelected;
                checkBox.addEventListener("change", (event) => {
                    if(event.target.checked){
                        console.log("folder added")
                        container.downloadPaths.set(folder_path.name, folder_path.type)
                        console.log(container.downloadPaths)
                        container.downloadAmount = container.downloadPaths.size
                        if(container.downloadAmount === 1){
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} item selected</span>
                        `
                        }else{
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} items selected</span>
                        `
                        }
                        /*
                        clearBox.innerHTML = `
                            <div class="clear-button"></div>
                        `
                        const clearButton = clearBox.querySelector('.clear-button');
                         clearButton.addEventListener("click", (event) =>{
                            container.downloadPaths.clear();
                            container.downloadAmount = container.downloadPaths.size;
                            loadDirectory(container.currentPath, container, breadcrumbs, download_card)
                        })*/
         
                        console.log(container.downloadAmount)
                    } else{
                        console.log("folder unadded")
                        container.downloadPaths.delete(folder_path.name)
                        container.downloadAmount = container.downloadPaths.size
                        if(container.downloadAmount === 1){
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} item selected</span>
                        `
                        }else{
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} items selected</span>
                        `
                        }
                        console.log(container.downloadPaths)
                    }

                })
                folderName.addEventListener("click", (event) =>{
                    const newPath = newCard.dataset.path
                    console.log(newPath)
                    loadDirectory(newPath, container, breadcrumbs, download_card)
                    event.stopPropagation()
                })

            }else{
                newCard.className = "file-browser-directory-file"
                newCard.innerHTML = `
                <label class="folder-checkbox-wrapper">
                <input type="checkbox" class="folder-checkbox"></input>
                <span class="folder-checkbox-custom"></span>
                </label>
                <img src="${window.ROOT_PATH}/api/static/img/file-icon.png" alt="folder-icon" height="20"></img>${name}
                `
                const folderName = newCard.querySelector(".folder-name-box")
                const checkBox = newCard.querySelector(".folder-checkbox")
                checkBox.checked = container.downloadPaths.has(folder_path.name);
                checkBox.addEventListener("change", (event) => {
                    if(event.target.checked){
                        console.log("folder added")
                        container.downloadPaths.set(folder_path.name, folder_path.type)
                        console.log(container.downloadPaths)
                        container.downloadAmount = container.downloadPaths.size
                        if(container.downloadAmount === 1){
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} item selected</span>
                        `
                        }else{
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} items selected</span>
                        `
                        }
         
                        console.log(container.downloadAmount)
                    } else{
                        console.log("folder unadded")
                        container.downloadPaths.delete(folder_path.name)
                        container.downloadAmount = container.downloadPaths.size
                        if(container.downloadAmount === 1){
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} item selected</span>
                        `
                        }else{
                            download_card.innerHTML = `
                            <span>${container.downloadAmount} items selected</span>
                        `
                        }
                        console.log(container.downloadPaths)
                    }

                })
            }
    

            container.appendChild(newCard);
        })
    }catch (error){
        console.log("error with", error)
    }
}

async function download_file(path){
    try{
        fetch(`${window.ROOT_PATH}/datasets/download/scratch?filepath=${path}`)
    }catch(error){
        console.log("error with", error)
    }
}
function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchDatasets();
    })
}

main();