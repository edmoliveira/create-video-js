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

const timeLabel = document.getElementById('span-time'); 
const timeIcon = document.getElementById('icon-time');

let fileSelected = null;
let filesModal = null;
let videoUrl = null;

let factory = null;

const videosScript = document.createElement('script');

videosScript.setAttribute('src', url + 'factory-frame.js');

videosScript.onload = function() {
    factory = factoryFrame(url);
}

document.body.appendChild(videosScript);

disableLinkButton(playButton);
disableLinkButton(pauseButton);
disableLinkButton(restartButton);
disableLinkButton(stopButton);
disableLinkButton(saveButton);
disableLinkButton(cancelButton);

btnRotate.rotate = true;
setStageSize(btnRotate);

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
    videoUrl  = null;

    disableLinkButton(playButton);
    disableLinkButton(cancelButton);
    enableLinkButton(pauseButton);
    enableLinkButton(stopButton);
    disableLinkButton(saveButton);

    fileSelected.objFrame.resize();
    fileSelected.objFrame.start();

    startRecord(hideStage, 25, "video/mp4", pauseButton, restartButton, stopButton).then(url => {
        videoUrl = url;
    });

    timeIcon.classList.add('fa-record-vinyl');
    timeIcon.classList.add('footer-icon-color');
    timeIcon.classList.remove('fa-video');    
}

pauseButton.onclick = () => {
    disableLinkButton(pauseButton);
    disableLinkButton(stopButton);
    enableLinkButton(restartButton);

    fileSelected.objFrame.pause();

    timeIcon.classList.remove('fa-record-vinyl');
    timeIcon.classList.remove('footer-icon-color');
    timeIcon.classList.add('fa-pause');
}

restartButton.onclick = () => {
    enableLinkButton(pauseButton);
    enableLinkButton(stopButton);
    disableLinkButton(restartButton);

    fileSelected.objFrame.restart();

    timeIcon.classList.add('fa-record-vinyl');
    timeIcon.classList.add('footer-icon-color');
    timeIcon.classList.remove('fa-pause');
}

cancelButton.onclick = () => {
    videoUrl  = null;

    cleanFile();
    cleanTimer();
    enableLinkButton(openButton);
    disableLinkButton(playButton);
    disableLinkButton(cancelButton);
    disableLinkButton(saveButton);
}

saveButton.onclick = () => {
    var link$ = document.createElement('a');

    link$.setAttribute('href', videoUrl);
    link$.setAttribute('target', '_blank');
    link$.click()
}

btnRotate.onclick = () => {
    setStageSize(this);
}

stopButton.addEventListener("click", stopButton_Onclick, false);

function stopButton_Onclick(e) {
    enableLinkButton(playButton);
    enableLinkButton(cancelButton);
    enableLinkButton(saveButton);
    disableLinkButton(stopButton);
    disableLinkButton(pauseButton);

    fileSelected.objFrame.stop();

    timeIcon.classList.remove('fa-record-vinyl');
    timeIcon.classList.remove('footer-icon-color');
    timeIcon.classList.add('fa-video');
}

new ResizeObserver(() => {
    stage.width = stage.offsetWidth;
    stage.height = stage.offsetHeight;

    if(fileSelected != null) {
        fileSelected.objFrame.resize();
    }
}).observe(stage)

function setStageSize(rotateButton){
    if(rotateButton.rotate){
        rotateButton.rotate = false;
        btnIRotate.style.transform = 'translate(-50%, -35%) rotate(-45deg)';
        stage.style.width = '75%';

        hideStage.style.width = '1920px';
        hideStage.style.height = '1080px';

        hideStage.width = 1920;
        hideStage.height = 1080;
    }
    else {
        rotateButton.rotate = true;
        btnIRotate.style.transform = 'translate(-50%, -35%) rotate(45deg)';
        stage.style.width = '33.33333%';

        hideStage.style.width = '1080px';
        hideStage.style.height = '1920px';

        hideStage.width = 1080;
        hideStage.height = 1920;
    }
}

function disableLinkButton(link) {
    link.classList.add('disabled');
}

function enableLinkButton(link) {
    link.classList.remove('disabled');
}

function cleanFile() {
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
            factory.create(obj.key).then(fn => {
                fileSelected = {
                    objFrame: fn(stage, hideStage)
                };

                enableLinkButton(playButton);
                enableLinkButton(cancelButton);  
            });

            fileSelected = null;
            filesModal.hide();
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

function startRecord(elCanvas, fps, type, fnPause, fnRestart, fnStop) {
    return new Promise(function (res, rej) {
        const recordedChunks = [];
        const stream = elCanvas.captureStream(fps);
    
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = function (event) {
            recordedChunks.push(event.data);
        }
    
        mediaRecorder.onstop = function (event) {
            var blob = new Blob(recordedChunks, {type: type });
            var url = URL.createObjectURL(blob);
            res(url);
        }

        fnPause.addEventListener("click", function() {
            if(mediaRecorder.state === 'recording') {
                mediaRecorder.pause();
                pauseTimer();
            }
        }, false);

        fnRestart.addEventListener("click", function() {
            if(mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
                restartTimer();
            }
        }, false);

        fnStop.addEventListener("click", function() {
            if(mediaRecorder.state === 'recording') {
                stopTimer();
                mediaRecorder.stop();  
            }
        }, false);

        mediaRecorder.start();
        startTimer();
    });
}

let secondsTimer = 0;
let idTimer = null;
let wasPausedTimer = false;

function startTimer() {
    timeLabel.innerHTML = toTime(0);

    idTimer = setInterval(() => {
        if(!wasPausedTimer) {
            secondsTimer++;
            timeLabel.innerHTML = toTime(secondsTimer);
        }
    }, 1000);
}

function pauseTimer() {
    wasPausedTimer = true;
}

function restartTimer() {
    wasPausedTimer = false;
}

function stopTimer() {
    clearInterval(idTimer);
}

function cleanTimer() {
    secondsTimer = 0;
    timeLabel.innerHTML = toTime(secondsTimer);
}

function toTime(seconds) {
    const date = new Date(null);

    date.setSeconds(seconds);

    return date.toISOString().substr(11, 8);
 }