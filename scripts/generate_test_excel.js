const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();
const wsData = [
    ["Ma May", "Ten Dich Vu", "Thoi Gian Bat Dau", "Thoi Gian Ket Thuc"],
    ["M001", "Service A", "01/01/2023 08:00", "01/01/2023 09:00"],
    ["M001", "Service A", "01/01/2023 08:30", "01/01/2023 09:30"], // Overlaps with row 1
    ["M002", "Service B", "01/01/2023 10:00", "01/01/2023 11:00"],
    ["M002", "Service B", "01/01/2023 11:00", "01/01/2023 12:00"] // No overlap
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

const filePath = path.join(__dirname, '..', 'test_data.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Created test file at ${filePath}`);
