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
                console.error('Unsupported file format.');
            }
        };
        reader.readAsBinaryString(file);
    } else {
        console.error('No file selected.');
    }
}

//make post request to add employee
function makePostRequest(data) {
    fetch('https://safe-gaurd-backend.vercel.app/api/employee/', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA3OTI4MTE0LCJpYXQiOjE3MDc4OTgxMTQsImp0aSI6IjUxMGFjMjBhYTRmYTRjZTU4NWQ0MTFlZmU5MzdmZmQyIiwidXNlcl9pZCI6MX0.Yir9-wFfQo6NOwVdCbcGwwKLB8PSn7V2gl8Spxt1yWE',
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
        console.log('Data posted successfully:', data);
        const fileInput = document.getElementById('csvFileInput');
        fileInput.value = '';
        $('#exampleModalToggle').modal('hide');
    })
    .catch(error => {
        console.error('Error posting data:', error);
    });
    fetchTable();
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA3OTI4MTE0LCJpYXQiOjE3MDc4OTgxMTQsImp0aSI6IjUxMGFjMjBhYTRmYTRjZTU4NWQ0MTFlZmU5MzdmZmQyIiwidXNlcl9pZCI6MX0.Yir9-wFfQo6NOwVdCbcGwwKLB8PSn7V2gl8Spxt1yWE',
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
        console.log('Data posted successfully:', data);
        document.getElementById('exampleInputempid').value = '';
        document.getElementById('exampleInputfname').value = '';
        document.getElementById('exampleInputlname').value = '';
        document.getElementById('exampleInputphone').value = '';
        $('#exampleModalToggle2').modal('hide');
    })
    .catch(error => {
        console.error('Error posting data:', error);
    });
    fetchTable();
});

function fetchTable() {
    fetch('https://safe-gaurd-backend.vercel.app/api/employee/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA3OTI4MTE0LCJpYXQiOjE3MDc4OTgxMTQsImp0aSI6IjUxMGFjMjBhYTRmYTRjZTU4NWQ0MTFlZmU5MzdmZmQyIiwidXNlcl9pZCI6MX0.Yir9-wFfQo6NOwVdCbcGwwKLB8PSn7V2gl8Spxt1yWE',
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
                    <td>${item.id}</td>
                    <td>${item.first_name}</td>
                    <td>${item.last_name}</td>
                    <td>${item.phone}</td>
                    <td><i type="button" class="fa fa-user-edit" id="employeeEdit"></i></td>
                    <td><i type="button" class="fa fa-trash text-danger" data-employee-id="${item.id}" id="employeeDelete"></i></td>
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
