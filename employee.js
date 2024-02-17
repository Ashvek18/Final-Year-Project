function createAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const timeoutDuration = 3000;
    setTimeout(() => {
        alertDiv.remove();
    }, timeoutDuration);
    return alertDiv;
}

//function to parse csv and xlsx files
function parseFile() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const result = event.target.result;
            const extension = file.name.split('.').pop().toLowerCase();
            
            if (extension === 'csv') {
                const lines = result.split('\n');
                const headers = lines[0].trim().split(',').map(header => header.replace(/^\W+/, ''));
                const requiredColumns = ['emp_id', 'first_name', 'last_name', 'phone'];
                const missingColumns = requiredColumns.filter(column => !headers.includes(column));

                if (missingColumns.length === 0) {
                    const data = [];
                    lines.slice(1).forEach(line => {
                        const rowData = {};
                        line.trim().split(',').forEach((value, index) => {
                            rowData[headers[index]] = value;
                        });
                        data.push(rowData);
                    });
                    data.pop();
                    makePostRequest(data);
                } else {
                    console.log('File is missing the following required columns: ' + missingColumns.join(', '));
                }
            } else if (extension === 'xlsx') {
                const workbook = XLSX.read(result, {type: 'binary'});
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
                const firstRow = XLSX.utils.sheet_to_json(sheet, {header: 1})[0];
                const requiredColumns = ['emp_id', 'first_name', 'last_name', 'phone'];
                const missingColumns = requiredColumns.filter(column => !firstRow.includes(column));

                if (missingColumns.length === 0) {
                    const data = [];
                    rows.slice(1).forEach(row => {
                        const rowData = {};
                        rows[0].forEach((value, index) => {
                            rowData[firstRow[index]] = row[index];
                        });
                        data.push(rowData);
                    });
                    makePostRequest(data);
                } else {
                    console.log('File is missing the following required columns: ' + missingColumns.join(', '));
                }
            } else {
                document.getElementById("alertContainer").appendChild(createAlert("Unsupported File Format", "Danger"));
            }
        };
        reader.readAsBinaryString(file);
    } else {
        document.getElementById("alertContainer").appendChild(createAlert("Please Select a File", "danger"));
    }
}

//make post request to add employee
function makePostRequest(data) {
    fetch('https://safe-gaurd-backend.vercel.app/api/employee/', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4MjAyMjg2LCJpYXQiOjE3MDgxNzIyODYsImp0aSI6IjY0MGU2YTU1MjI3MTRiOGE4OTc5NmU1M2U2MmM3Y2QzIiwidXNlcl9pZCI6MX0.AxCW6-NZxv3tNKztAA44UozmNRZ1TkumCYklmeT6SJo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("alertContainer").appendChild(createAlert("Employee Added Successfully", "success"));
        console.log(data);
        const fileInput = document.getElementById('csvFileInput');
        fileInput.value = '';
        $('#exampleModalToggle').modal('hide');
        fetchTable();
    })
    .catch(error => {
        console.error('Error posting data:', error);
    });
}

//add employee through form
document.querySelector('#employee-form').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const data = {
        emp_id: document.getElementById('exampleInputempid').value,
        first_name: document.getElementById('exampleInputfname').value,
        last_name: document.getElementById('exampleInputlname').value,
        phone: document.getElementById('exampleInputphone').value
    };
    fetch('https://safe-gaurd-backend.vercel.app/api/employee/', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4MjAyMjg2LCJpYXQiOjE3MDgxNzIyODYsImp0aSI6IjY0MGU2YTU1MjI3MTRiOGE4OTc5NmU1M2U2MmM3Y2QzIiwidXNlcl9pZCI6MX0.AxCW6-NZxv3tNKztAA44UozmNRZ1TkumCYklmeT6SJo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("alertContainer").appendChild(createAlert("Employee Added Successfully", "success"));
        console.log(data);
        document.getElementById('exampleInputempid').value = '';
        document.getElementById('exampleInputfname').value = '';
        document.getElementById('exampleInputlname').value = '';
        document.getElementById('exampleInputphone').value = '';
        $('#exampleModalToggle2').modal('hide');
        fetchTable();
    })
    .catch(error => {
        console.error('Error posting data:', error);
    });
});


function fetchTable() {
    fetch('https://safe-gaurd-backend.vercel.app/api/employee/', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4MjAyMjg2LCJpYXQiOjE3MDgxNzIyODYsImp0aSI6IjY0MGU2YTU1MjI3MTRiOGE4OTc5NmU1M2U2MmM3Y2QzIiwidXNlcl9pZCI6MX0.AxCW6-NZxv3tNKztAA44UozmNRZ1TkumCYklmeT6SJo',
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
        const tbody = document.querySelector('.table tbody');
        tbody.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.emp_id}</td>
                    <td>${item.first_name}</td>
                    <td>${item.last_name}</td>
                    <td>${item.phone}</td>
                    <td><i type="button" class="fa fa-user-edit" id="employeeEdit" onclick="editEmployee(${item.emp_id})" data-bs-toggle="modal" data-bs-target="#exampleModalEdit"></i></td>
                    <td><i type="button" class="fa fa-trash text-danger" onclick="deleteEmployee(${item.emp_id})"; id="employeeDelete"></i></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6"><h5 class="text-center">No Employees Were Found</h5></td>';
            tbody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}
fetchTable();

//Function to Delete Employee
function deleteEmployee(employeeId) {
    fetch(`https://safe-gaurd-backend.vercel.app/api/employee/${employeeId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4MjAyMjg2LCJpYXQiOjE3MDgxNzIyODYsImp0aSI6IjY0MGU2YTU1MjI3MTRiOGE4OTc5NmU1M2U2MmM3Y2QzIiwidXNlcl9pZCI6MX0.AxCW6-NZxv3tNKztAA44UozmNRZ1TkumCYklmeT6SJo',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete employee');
        }
        document.getElementById("alertContainer").appendChild(createAlert("Employee Deleted Successfully", "success"));
        fetchTable();
    })
    .catch(error => {
        console.error('Error deleting employee:', error);
    });
}
fetchTable();

// function to edit employee
function editEmployee(emp_id) {
    document.getElementById('editempid').value = emp_id;
    document.getElementById('edit-form').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the form from submitting normally

        const data = {
            emp_id:emp_id.toString(),
            first_name: document.getElementById('editfname').value,
            last_name: document.getElementById('editlname').value,
            phone: document.getElementById('editphone').value
        };
console.log(data);
        // Send PATCH request to update employee details
        fetch(`https://safe-gaurd-backend.vercel.app/api/employee/${emp_id}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4MjAyMjg2LCJpYXQiOjE3MDgxNzIyODYsImp0aSI6IjY0MGU2YTU1MjI3MTRiOGE4OTc5NmU1M2U2MmM3Y2QzIiwidXNlcl9pZCI6MX0.AxCW6-NZxv3tNKztAA44UozmNRZ1TkumCYklmeT6SJo',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("alertContainer").appendChild(createAlert("Employee Updated Successfully", "success"));
            console.log(data);
            // Clear input fields and close modal
            document.getElementById('editfname').value = '';
            document.getElementById('editlname').value = '';
            document.getElementById('editphone').value = '';
            fetchTable();
        })
        .catch(error => {
            console.error('Error updating employee details:', error);
        });
    });
}


