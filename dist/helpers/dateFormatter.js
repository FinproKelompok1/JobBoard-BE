"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateFormatter = dateFormatter;
exports.formatDate = formatDate;
function dateFormatter(age, currentDate) {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${age}-${month}-${day}T00:00:00Z`;
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
