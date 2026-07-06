/*
*=====================================================================
* Script for dataset
*=====================================================================
* This script handles the search bar along with creating each dataset
* card that will generate. includes downloading and traversal of
* dataset directories that lets you select individual files
*=====================================================================
*/

const user = window.USER

const rootPaths = {
    "home" : `/home/${USER}`,
    "project": "/anvil/projects",
    "scratch": `/anvil/scratch/${USER}`


}


/** 
 *   
 * Fetches datasets from datasets.json and for each datasets makes a new card
 * 
 * @returns {Promise<void}
*/
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

/**
 * 
 * Takes in the dataset card element, makes html, including all listeners to 
 * make the file directory browser and checkmarks
 * 
 * @param {HTMLElement} dataset 
 */
function addDatasetCard(dataset) {
    try{
        const newCard = document.createElement("div");
        const container = document.querySelector(".dataset-card-container");
        newCard.className = "dataset-card";
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
        const header = newCard.querySelector(".dataset-card-top")

        file_container.downloadPaths = new Map();
        file_container.downloadAmount = file_container.downloadPaths.size
        download_button.addEventListener("click", (event) => {
            // still need to add path looping for downloading in overlay
            console.log(file_container.downloadPaths)    
            download_file(file_container, file_container.downloadPaths)
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
                if(drop_down.isLoaded !== true){
                    loadDirectory(dataset["path"], file_container, breadcrumbs, download_card);
                    drop_down.isLoaded = true
                }

            }
        }) 

        container.appendChild(newCard);

    }catch (error) {
        console.log("adding dataset failed with ", error);
    }
}

/**
 * 
 * Takes in path from the dataset along with related HTML DOM elements, reinitialized
 * the directory window with updated path, creates breadcrumbs and directory folder cards
 * 
 * @param {string} path 
 * @param {HTMLElement} container 
 * @param {HTMLElement} breadcrumbs 
 * @param {HTMLElement} download_card 
 */

function loadDirectory(path, container, breadcrumbs, download_card){
    container.currentPath = path;
    if (!container.basePath) {
        container.basePath = path;
    }

    container.innerHTML = ""
    breadcrumbs.innerHTML = "";

    makeBreadcrumbs(breadcrumbs, container, download_card)
    makeFolderCards(path, container, download_card, breadcrumbs)
}


/**
 * 
 * takes in all of the parent attributes to make each folder card, along with ancestor selections,
 * adds all needed event listeners for checkbox, sub directories, and downloading
 * 
 * 
 * @param {string} path 
 * @param {HTMLElement} container 
 * @param {HTMLElement} download_card 
 * @param {HTMLElement} breadcrumbs
 * @returns {Promise<void>} 
 */
async function makeFolderCards(path, container, download_card, breadcrumbs){
    const paths = await retrieveDirectoryPaths(path);
    paths.forEach(folder_path => {
        const cleanedPath = folder_path.name.replace(/\/$/, "");
        const name = cleanedPath.split("/").pop();
        const newCard = document.createElement("div")
        let imageFile;
        let fileSize;

        if(folder_path["type"] === "directory"){
            imageFile = "folder-icon.png"
        }else{
            fileSize = folder_path["size"];
            if(fileSize > 1000000000){
                fileSize = fileSize / 1000000000
            }else if(fileSize > 1000000){
                fileSize = fileSize / 1000000
                fileSize = truncateDecimals(fileSize, 1)
                console.log(fileSize, "MB")
            }else if(fileSize > 1000){
                fileSize = fileSize / 1000
            }
            imageFile = "file-icon.png"
        }

        newCard.className = "file-browser-directory-folder"
        newCard.dataset.path = folder_path.name

        newCard.innerHTML = `
        <label class="folder-checkbox-wrapper">
            <input type="checkbox" class="folder-checkbox"></input>
            <span class="folder-checkbox-custom"></span>
        </label>
        <img src="${window.ROOT_PATH}/api/static/img/${imageFile}" alt="folder-icon" height="20"></img>
        <div class="folder-name-box">
            ${name} 
        </div>
        `

        const checkBox = newCard.querySelector(".folder-checkbox")
        const clearBox = download_card.querySelector(".file-browser-download-clear")
        const fullPath = folder_path.name;
        const isDirectlySelected = container.downloadPaths.has(fullPath);
        const folderName = newCard.querySelector(".folder-name-box")

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

                container.downloadPaths.set(folder_path.name, folder_path.type)
                updateSelectionAmountBox(container, download_card)
            }else{
                container.downloadPaths.delete(folder_path.name)
                updateSelectionAmountBox(container, download_card)
            }
        })
        if(folder_path["type"] === "directory"){
            folderName.addEventListener("click", (event) =>{
                const newPath = newCard.dataset.path
                loadDirectory(newPath, container, breadcrumbs, download_card)
                event.stopPropagation()
            })
        }
        container.appendChild(newCard);
    })
}

/**
 * 
 * fetches sub directories from a path
 * 
 * @param {string} path 
 * @returns {Promise<Array<Object>>}
 */
async function retrieveDirectoryPaths(path){
    try{

        const response = await fetch((`${window.ROOT_PATH}/datasets/category/list-path?path=${path}`))
        if(!response.ok){
            throw new Error(`HTTP error! status ${response.status} `);
        }

        const paths = await response.json()
        return paths;

    }catch (error){
        console.log("error with", error)
    }
}

/**
 * 
 * updates the box that lets you see how many files selected
 * 
 * @param {HTMLElement} container 
 * @param {HTMLElement} download_card 
 */
function updateSelectionAmountBox(container, download_card){
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
}

/**
 * 
 * makes breadcrumbs to allow you to go back folders
 * 
 * @param {HTMLElement} breadcrumbs 
 * @param {HTMLElement} container 
 * @param {HTMLElement} download_card 
 */
function makeBreadcrumbs(breadcrumbs, container, download_card){

    const baseLength = container.basePath.split("/").filter(Boolean).length;
    const parts = container.currentPath.split("/").filter(Boolean);
    breadcrumbsMakeRootLabel(container, breadcrumbs, download_card);
    parts.forEach((path, index) =>{

        const subPath = "/" + parts.slice(0, index + 1).join("/");
        const newCard = document.createElement("div");

        if(index < baseLength){
            return;
        }

        if(index > baseLength){
            const separator = document.createElement("span");
            separator.textContent = "/";
            separator.className = "breadcrumb-separator";
            breadcrumbs.appendChild(separator) 
        }


        newCard.className = "part-card"
        newCard.innerHTML = `
            <span style="cursor:pointer;">${path}</span>    
        `

        newCard.addEventListener("click", (event) => {
            event.stopPropagation()
            loadDirectory(subPath, container, breadcrumbs, download_card)
        })


        breadcrumbs.appendChild(newCard);


    })
    
}

/**
 * 
 * creates the clickable rootlabel for the breadcrumbs
 * 
 * @param {HTMLElement} container 
 * @param {HTMLElement} breadcrumbs 
 * @param {HTMLElement} download_card 
 */
function breadcrumbsMakeRootLabel(container, breadcrumbs, download_card){

    const baseParts = container.basePath.split("/").filter(Boolean);
    const newCard = document.createElement("div");

    newCard.className = "part-card";
    newCard.innerHTML = `<span style="cursor:pointer;">${baseParts[baseParts.length - 1]} </span>`;
    
    newCard.addEventListener("click", (event) => {
            event.stopPropagation();
            loadDirectory(container.basePath, container, breadcrumbs, download_card);
    });
    
    const separator = document.createElement("span");
    separator.textContent = "/";
    separator.className = "breadcrumb-separator";
    
    breadcrumbs.appendChild(newCard);
    breadcrumbs.appendChild(separator);
}

/**
 * 
 * just reaches fastapi endpoint to download a file
 * will add selection for where to store
 * 
 * @param {string} path 
 * @returns {Promise<void>}
 */
function download_file(container, download_paths){
    try{
        let selectedMedium = "";
        function closeSelector(fileSelectorOverlay){
            fileSelectorOverlay.classList.remove("show");
        }
        function changeMedium(medium, selectDownloadMedium, selectedMediumLabel, selectedMedium, downloadLocationLabel){
            selectedMedium.dataset.currentMedium = medium
            makeLocalDirectoryCards(selectedMedium.dataset.currentMedium, medium, selectedMedium, selectedMediumLabel, downloadLocationLabel)
            selectDownloadMediumContent.style.display = "none"
            arrow.classList.toggle("flipped")
            selectDownloadMedium.dataset.toggled = 'false'
        }
        const fileSelectorOverlay = document.querySelector(".download-file-selector-overlay");
        const fileSelector = document.createElement("div");
        fileSelectorOverlay.innerHTML = ``;
        fileSelector.className = "download-file-selector"
        fileSelector.innerHTML= `
            <div class="download-file-selector-close-btn">
                <span>&times;</span>
            </div>
            <div class="select-static-mediums-wrapper">
                <div class="download-directory-back-btn">
                </div>
                <div class="select-static-mediums-content">
                    <div class="medium-selection-wrapper">
                        <div class="medium-selection-card" id="home"><span class="medium-selection-card-label">/Home</span></div>
                        <div class="medium-selection-card" id="project"><span class="medium-selection-card-label">/Project</span></div>
                        <div class="medium-selection-card" id="scratch"><span class="medium-selection-card-label">/Scratch</span></div>
                    </div>
                </div>
                <div class="select-static-mediums">
                    <span class="selected-static-medium"></span>
                    <span class="select-static-mediums-arrow"></span>
                </div>
                <div class="browse-medium-directory"></div>
                <div class="directory-download-container">
                    <div class="directory-download-button"><span>Download</span></div>
                    <div class="directory-download-container-amount"></div>
                    <div class="directory-download-container-location"></div>
                    <span> | 8Gb </span>
                
                </div>
            </div>
        `

    
        const staticMediumWrapper = fileSelector.querySelector(".select-static-mediums-wrapper")
        const download_card = staticMediumWrapper.querySelector(".directory-download-container")
        const downloadButton = download_card.querySelector(".directory-download-button")
        const downloadLocation = download_card.querySelector(".directory-download-container-location")
        const download_card_amount = download_card.querySelector(".directory-download-container-amount")
        const selectDownloadMedium = staticMediumWrapper.querySelector(".select-static-mediums")
        const arrow = selectDownloadMedium.querySelector(".select-static-mediums-arrow")
        const closeBtn = fileSelector.querySelector(".download-file-selector-close-btn")
        const selectDownloadMediumContent = staticMediumWrapper.querySelector(".select-static-mediums-content")
        const mediumSelectionWrapper = selectDownloadMediumContent.querySelector(".medium-selection-wrapper")
        const selectHome = mediumSelectionWrapper.querySelector("#home")
        const selectProject = mediumSelectionWrapper.querySelector("#project")
        const selectScratch = mediumSelectionWrapper.querySelector("#scratch")
        const selectedMediumLabel = selectDownloadMedium.querySelector(".selected-static-medium")
        const mediumDirectory = staticMediumWrapper.querySelector(".browse-medium-directory")
        const backButton = staticMediumWrapper.querySelector(".download-directory-back-btn")

        updateSelectionAmountBox(container, download_card_amount)

        selectDownloadMedium.addEventListener("click", (event) => {
            const isToggled = selectDownloadMedium.dataset.toggled === 'true';
            if(isToggled){
                selectDownloadMediumContent.style.display = "none"
                arrow.classList.toggle("flipped")
                selectDownloadMedium.dataset.toggled = 'false'
            }else{
                console.log("toggled")
                arrow.classList.toggle("flipped")
                selectDownloadMedium.dataset.toggled = 'true'
                selectDownloadMediumContent.style.display = "block"
                
            }
        });

        selectHome.addEventListener("click", () => changeMedium("home", selectDownloadMedium ,selectedMediumLabel, mediumDirectory, downloadLocation))
        selectProject.addEventListener("click", () => changeMedium("project", selectDownloadMedium ,selectedMediumLabel, mediumDirectory, downloadLocation))
        selectScratch.addEventListener("click", () => changeMedium("scratch", selectDownloadMedium ,selectedMediumLabel, mediumDirectory, downloadLocation))
        backButton.addEventListener("click", () =>{
            const path = mediumDirectory.downloadPath;
            const parts = path.split("/").filter(Boolean)
            const root = parts[0]
            parts.pop()
            const newPath = parts.join("/")
            if(mediumDirectory.dataset.currentMedium == root && parts.length < 1){
                return;
            }else{
                
                makeLocalDirectoryCards(mediumDirectory.dataset.currentMedium, newPath, mediumDirectory, selectedMediumLabel, downloadLocation)
            }
        })
        closeBtn.addEventListener("click", () => closeSelector(fileSelectorOverlay));
        downloadButton.addEventListener("click", () =>{

            downloadFromPath(mediumDirectory.downloadPath, download_paths)
            fileSelectorOverlay.style.display = "none"
        })
        fileSelectorOverlay.appendChild(fileSelector)
        fileSelectorOverlay.classList.add("show");
    


    }catch(error){
        console.log("error with", error)
    }
}


async function makeLocalDirectoryCards(root, path="", browseLocalDirectoryContainer, mediumLabel, downloadLocationLabel){
    browseLocalDirectoryContainer.downloadPath = path
    browseLocalDirectoryContainer.innerHTML = ``
    const textParts = path.split("/").filter(Boolean);
    let firstPart = textParts[0] || "";
    const downloadLocation = textParts[textParts.length-1]
    const lastPart = textParts.length > 1 ? textParts[textParts.length - 1] : "";
    firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
    const displayText = `${firstPart}/${lastPart}`
    mediumLabel.textContent = displayText
    downloadLocationLabel.textContent = `| Downloading in Folder: ${downloadLocation}`
    const folders = await fetchLocalDirectory(path);
    folders.forEach(folder => {
        const newCard = document.createElement("div");
        newCard.className = "local-directory-cards"

        browseLocalDirectoryContainer.appendChild(newCard)
        newCard.innerHTML = `
            <span class="local-directory-cards-label">${folder}</span>
        `
        const newPath = `${path}/${folder}`
        newCard.addEventListener("click", () => {
            console.log(path)
            makeLocalDirectoryCards(root, newPath, browseLocalDirectoryContainer, mediumLabel, downloadLocationLabel)
        })


    })
}


async function fetchLocalDirectory(path){
    try{
        const response = await fetch(`${window.ROOT_PATH}/datasets/local-browse/list-root?medium=${path}`);
        if(!response.ok){
            throw new Error(`HTTP ERROR | STATUS CODE ${response.status}`)
        }
        paths = await response.json()
        return paths
    }catch (error){
        console.log(error)
    }
}



/**
 * 
 * just reads DOM window refresh and calls functions that need to be generates at start of window
 * 
 */
function main(){
    document.addEventListener("DOMContentLoaded", (event) => {
        fetchDatasets();
    })
}

async function downloadFromPath(file, paths){
    const parts = file.split("/")
    const root = parts[0]
    const resolved_root = rootPaths[root]
    parts[0] = resolved_root
    const fullPath = parts.join("/")
    console.log(paths)
    paths.forEach((type, path) => {
        try{
            fetch(`${window.ROOT_PATH}/datasets/download?storageLocation=${fullPath}&filepath=${path}`)
            console.log(`downloaded ${path} at ${file}`)
        }catch(error){
            console.log(error)
        }


    })

}
function truncateDecimals(number, digits) {
  const multiplier = Math.pow(10, digits);
  return Math.trunc(number * multiplier) / multiplier;
}

main();