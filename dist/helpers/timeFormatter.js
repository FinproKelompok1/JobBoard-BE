"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = formatTime;
function formatTime(dateString) {
    const time = new Date(dateString);
    return time.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
