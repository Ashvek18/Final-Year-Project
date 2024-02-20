function fetchIncidents(pageNumber = 1) {
    fetch(`https://safe-gaurd-backend.vercel.app/api/incident/?page=${pageNumber}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4NDM2NTI5LCJpYXQiOjE3MDg0MDY1MjksImp0aSI6IjIxYzA2OGIzMzI2NjQ5MjM4NDJlNDNmMzgwOGEzZDZkIiwidXNlcl9pZCI6MX0.cwC5odaXId94cr9wP33AyjQIgrZAo8VdsAzknFL22WY',
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
        return Promise.all(data.map(item => {
            return fetchCamera(item.camera)
                .then(cameraData => {
                    return { incident: item, camera: cameraData };
                })
                .catch(error => {
                    console.error('Error fetching camera data:', error);
                    return { incident: item, camera: null };
                });
        }));
    })
    .then(incidentsWithCameras => {
        const tbody = document.querySelector('.table tbody');
        tbody.innerHTML = '';
    
        incidentsWithCameras.forEach(({ incident, camera }) => {
            const row = document.createElement('tr');
            row.setAttribute('data-bs-toggle', 'modal');
            row.setAttribute('data-bs-target', '#incidentModal');
            row.setAttribute('role', 'button');
            row.innerHTML = `
                <td>${incident.id}</td>
                <td>${camera ? camera.name : 'N/A'}</td>
                <td>${camera ? camera.location : 'N/A'}</td>
                <td>${incident.timestamp}</td>
                <td><button class="btn btn-secondary btn-sm z-1" ><i class="fa fa-search"></i> Identify</button></td>
            `;
            tbody.appendChild(row);
    
            row.addEventListener('click', function() {
                populateModalWithIncidentData(incident, camera); //pass both data
            });
        });
    
        if (incidentsWithCameras.length === 10) {
            createPagination(pageNumber + 1);
        } else if (incidentsWithCameras.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5"><h5 class="text-center">No Incidents Were Found</h5></td>';
            tbody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching incident data:', error);
    });
    
}

fetchIncidents(1);

function fetchCamera(cameraId) {
    return fetch(`https://safe-gaurd-backend.vercel.app/api/camera/${cameraId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4NDM2NTI5LCJpYXQiOjE3MDg0MDY1MjksImp0aSI6IjIxYzA2OGIzMzI2NjQ5MjM4NDJlNDNmMzgwOGEzZDZkIiwidXNlcl9pZCI6MX0.cwC5odaXId94cr9wP33AyjQIgrZAo8VdsAzknFL22WY',
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
        return data;
    });
}

function populateModalWithIncidentData(incidentData, cameraData) {
    document.getElementById("incidentIdCell").textContent = incidentData.id;
    document.getElementById("cameraNameCell").textContent = cameraData ? cameraData.name || 'N/A' : 'N/A';
    document.getElementById("cameraLocationCell").textContent = cameraData ? cameraData.location || 'N/A' : 'N/A';
    document.getElementById("timestampCell").textContent = incidentData.timestamp;
    document.getElementById("employeeCell").textContent = incidentData.employee;
    
    const videoPathCell = document.getElementById("videoPathCell");
    videoPathCell.innerHTML = ''; 
    if (incidentData.video_path) {
        const videoPathLink = document.createElement('a');
        videoPathLink.href = incidentData.video_path;
        videoPathLink.textContent = incidentData.video_path;
        videoPathCell.appendChild(videoPathLink);
    } else {
        videoPathCell.textContent = 'N/A';
    }
}
