
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};
let db;
let dbVersion = 1;
let dbReady = false;

function initDb() {
    let request = indexedDB.open('testPics', dbVersion); // create database with name testPics

    request.onerror = function(e) {
        console.error('Unable to open database.');
    }

    request.onsuccess = function(e) {
        db = e.target.result;
        console.log('db opened');
    }

    request.onupgradeneeded = function(e) {
        let db = e.target.result;
        db.createObjectStore('cachedForms', {keyPath:'id', autoIncrement: true});
        dbReady = true;
    }
}

function doFile(e) {
    console.log('change event fired for input field');
    let file = e.target.files[0];
    var reader = new FileReader();
//				reader.readAsDataURL(file);
    reader.readAsBinaryString(file);

    reader.onload = function(e) {
        //alert(e.target.result);
        let bits = e.target.result;
        let ob = {
            created:new Date(),
            fileName: file.name,
            data:bits
        };

        let trans = db.transaction(['cachedForms'], 'readwrite');
        let addReq = trans.objectStore('cachedForms').add(ob); // add  the param created in reader.onload

        addReq.onerror = function(e) {
            console.log('error storing data');
            console.error(e);
        }

        trans.oncomplete = function(e) {
            console.log('data stored');
        }
    }
}

function doImageTest() {
    console.log('doImageTest');
    let image = document.querySelector('#testImage');
    let recordToLoad = parseInt(document.querySelector('#recordToLoad').value,10);
    if(recordToLoad === '') recordToLoad = 1;

    let trans = db.transaction(['cachedForms'], 'readonly');
    //hard coded id
    let req = trans.objectStore('cachedForms').get(recordToLoad);
    req.onsuccess = function(e) {
        let record = e.target.result;
        console.log('get success', record);
        image.src = 'data:image/jpeg;base64,' + btoa(record.data); // btoa mean binary to achieve reading image.src
    }
}

