let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let infoPoints = document.querySelector(".points-info");
let clickPoints = [];
let cam_id = null;

canvas.addEventListener("click", evt => {
    clickPoints.push([evt.offsetX, evt.offsetY]);
    drawDot(evt.offsetX, evt.offsetY);
    infoPoints.textContent = clickPoints.join(" : ")
    if (clickPoints.length >= 4) {
        drawPoly(clickPoints);
        clickPoints = []; // Reset clickPoints after drawing polygon
    }
});

const drawPoly = points => {
    ctx.lineWidth = 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let split = points.splice(0, 4);

    ctx.beginPath();
    ctx.moveTo(split[0][0], split[0][1]);
    for (i of split.reverse()) ctx.lineTo(i[0], i[1]);
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
}

const drawDot = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
}

let biggest = 500;
let axis;
const resize = (x, y) => {
    let ratio = x > y ? x / biggest : y / biggest;
    axis = [x / ratio, y / ratio];
    canvas.height = axis[0];
    canvas.width = axis[1];
}

let rawImg = new Image();
const newImage = src => {
    rawImg.src = src;
    rawImg.onload = () => {
        canvas.style.backgroundImage = "url(" + src + ")";
        console.log(rawImg.width, rawImg.height);
        resize(rawImg.height, rawImg.width);
    };
}

document.getElementById('submitBtn').addEventListener('click', function (event) {
    event.preventDefault();
    let form = document.getElementById('myForm');
    let formData = new FormData(form);

    let formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    fetch('http://127.0.0.1:8000/api/camera/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            let responseTab = document.getElementById('responseTab');
            //let tab = document.getElementById('tab');
            //tab.classList.add('disabled')
            //responseTab.classList.remove('disabled');
            //responseTab.classList.add('active');
            cam_id = data.id;
            $('#formTabs a[href="#responseContent"]').tab('show');
            let rtspFrameUrl = data.rtsp_frame;
            let baseUrl = 'http://127.0.0.1:8000';
            let fullImageUrl = baseUrl + rtspFrameUrl;
            let responseContent = document.getElementById('responseContent');
            let responseImage = document.getElementById('responseImage');
            newImage(fullImageUrl)
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('sendPolygonBtn').addEventListener('click', function () {
    let polygons = document.querySelector(".points-info").textContent;

    fetch(`http://127.0.0.1:8000/api/camera/${cam_id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ polygons: polygons })
    })
        .then(response => response.json())
        .then(data => {
            $('#myModal').modal('hide');
            clearTabContent(document.getElementById('responseContent'));
        })
        .catch(error => {
            console.error('Error sending polygon coordinates:', error);
        });
});

function clearTabContent(tabContent) {
    let canvas = tabContent.querySelector('canvas');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let pointsInfo = tabContent.querySelector('.points-info');
    pointsInfo.textContent = '';
}

function fetchDataForCards() {
    fetch('https://safe-gaurd-backend.vercel.app/api/camera/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA3Nzc1MjUzLCJpYXQiOjE3MDc3NDUyNTMsImp0aSI6ImZkMDU4MDFlMGQxMDRhMjZhMDRmMzY1NDExNjBiZTk1IiwidXNlcl9pZCI6MX0.pORvN14cfbEJUHcFeRkDrXTcB_A3Oh2kxZsgdjn5J-4',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data for cards:', data);
            if (Array.isArray(data)) {
                displayCards(data); 
            } else {
                console.error('Fetched data is not an array:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching data for cards:', error);
        });
}

fetchDataForCards();


function displayCards(data) {
    const container = document.getElementById("cameraCards");
    container.innerHTML = ""; 
    
    data.forEach(item => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("col");
        
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="card">
                <img src="${item.rtsp_frame}" class="card-img-top position-relative" alt="Camera Image">
                <div class="card-body">
                    <h6 class="card-text">ID: ${item.id}</h6>
                    <h5 class="card-title">${item.name}</h5>
                </div>
                <!-- Cross icon -->
                <button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Close" data-bs-toggle="modal" data-bs-target="#exampleModal"></button>
            </div>
            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h6>Are you sure you want to remove this camera? This action cannot be undone.</h6>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary cardDelete">Yes</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        cardDiv.appendChild(card);
        container.appendChild(cardDiv);

        const deleteButton = card.querySelector('.cardDelete');
        deleteButton.addEventListener('click', function() {
            fetch(`https://safe-gaurd-backend.vercel.app/api/camera/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA3Nzc1MjUzLCJpYXQiOjE3MDc3NDUyNTMsImp0aSI6ImZkMDU4MDFlMGQxMDRhMjZhMDRmMzY1NDExNjBiZTk1IiwidXNlcl9pZCI6MX0.pORvN14cfbEJUHcFeRkDrXTcB_A3Oh2kxZsgdjn5J-4',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Camera deleted successfully:', data);
                cardDiv.remove();
                window.location.reload()
            })
            .catch(error => {
                console.error('Error deleting camera:', error);
            });
        });
    });
}
