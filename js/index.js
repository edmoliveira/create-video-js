const url = 'http://localhost/container-videos/src/';
const btnRotate = document.getElementsByClassName('btn-rotate')[0];
const btnIRotate = document.getElementsByClassName('btn-i-rotate')[0];
const stage = document.getElementById('stage');
const hideStage = document.getElementById('hideStage');

const openButton = document.getElementById('openButton');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const stopButton = document.getElementById('stopButton');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');

let fileSelected = null;
let filesModal = null;

disableLinkButton(playButton);
disableLinkButton(pauseButton);
disableLinkButton(restartButton);
disableLinkButton(stopButton);
disableLinkButton(saveButton);
disableLinkButton(cancelButton);

openButton.onclick = () => {
    disableLinkButton(openButton);

    getFile(url + 'file-list.json', fileData => {
        const el = document.getElementById("popup-files");
        
        filesModal = new bootstrap.Modal(el, {});
    
        el.addEventListener("hidden.bs.modal", function () {
            if(fileSelected == null) {
                enableLinkButton(openButton);
            }

            filesModal = null;
        });

        createFilesModal(JSON.parse(fileData), document.querySelector('.card-modal-files'));
    
        filesModal.show();
    }, error => {
        enableLinkButton(openButton);
        alert(error);
    });
}

playButton.onclick = () => {
    disableLinkButton(playButton);
    disableLinkButton(cancelButton);
    enableLinkButton(pauseButton);
    enableLinkButton(stopButton);

    fileSelected.objFrame.start();
}

pauseButton.onclick = () => {
    disableLinkButton(pauseButton);
    disableLinkButton(stopButton);
    enableLinkButton(restartButton);

    fileSelected.objFrame.pause();
}

restartButton.onclick = () => {
    enableLinkButton(pauseButton);
    enableLinkButton(stopButton);
    disableLinkButton(restartButton);

    fileSelected.objFrame.restart();
}

cancelButton.onclick = () => {
    cleanFile();
    enableLinkButton(openButton);
    disableLinkButton(playButton);
    disableLinkButton(cancelButton);
}

btnRotate.onclick = () => {
    if(this.rotate){
        this.rotate = false;
        btnIRotate.style.transform = 'translate(-50%, -35%) rotate(-45deg)';
        stage.style.width = '75%';

        hideStage.width = 1920;
        hideStage.height = 1080;
    }
    else {
        this.rotate = true;
        btnIRotate.style.transform = 'translate(-50%, -35%) rotate(45deg)';
        stage.style.width = '33.33333%';

        hideStage.width = 1080;
        hideStage.height = 1920;
    }
}

new ResizeObserver(() => {
    stage.width = stage.offsetWidth;
    stage.height = stage.offsetHeight;
}).observe(stage)

function disableLinkButton(link) {
    link.classList.add('disabled');
}

function enableLinkButton(link) {
    link.classList.remove('disabled');
}

function cleanFile() {
    document.body.removeChild(fileSelected.script);

    fileSelected = null;
}

function getFile(path, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                callback(xhr.responseText);
            } else {
                errorCallback('Error');
            }
        }
    };
    xhr.open("GET", path);
    xhr.send();
}

function createFilesModal(data, container) {
    const files = data.files;

    while(container.firstChild){
        container.removeChild(container.firstChild);
    }

    const createElemRow = () => {
        const element = document.createElement('DIV');

        element.className = 'row';

        container.appendChild(element);

        return element;
    }

    let colCount = 0;
    let elemRow = createElemRow();

    for(let index = 0; index < files.length;index++){
        const obj = files[index];

        if(colCount > 2) {
            elemRow = createElemRow();
        }

        const elemCol = document.createElement('DIV');

        elemCol.className = 'col-lg-4';
        elemCol.style.marginBottom = '5px';
        elemCol.file = obj;

        elemCol.onclick = function() {
            var script = document.createElement('script');

            script.setAttribute('src', url + obj.path);

            script.onload = function() {
                fileSelected = {
                    objFrame: factoryFrame(stage, hideStage),
                    script: script
                };
    
                enableLinkButton(playButton);
                enableLinkButton(cancelButton);                
            }

            fileSelected = '';
            filesModal.hide();

            document.body.appendChild(script);
        }

        const card = document.createElement('DIV');

        card.className = 'card card-file';
        card.style.width = '100%';

        const img = document.createElement('IMG');

        img.src = url + obj.image;
        img.alt = obj.title;
        img.className = 'card-img-top';
        img.style.transform = 'scale(0.7)';

        const cardBody = document.createElement('DIV');

        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h5');

        cardTitle.className = 'card-title';
        cardTitle.innerHTML = obj.title;
        cardTitle.style.userSelect = 'none';

        const cardText = document.createElement('p');

        cardText.className = 'card-text';
        cardText.innerHTML = obj.text;
        cardText.style.userSelect = 'none';

        elemRow.appendChild(elemCol);
        elemCol.appendChild(card);
        card.appendChild(img);
        card.appendChild(cardBody);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);

        colCount++;
    }
}