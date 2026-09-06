import roomsData from "../../../data/rooms.json";
import templatesData from "../../../data/templates.json";

export function getAllRooms() {
  return roomsData;
}

export function getRoomById(id) {
  return roomsData.find((r) => r.id === id) ?? null;
}

export function getAllTemplates() {
  return templatesData;
}

export function getTemplateById(id) {
  return templatesData.find((t) => t.id === id) ?? null;
}
