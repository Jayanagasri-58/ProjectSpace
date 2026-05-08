import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'data.json');

function readData() {
  const fileData = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(fileData);
}

function writeData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getUsers() {
  return readData().users || [];
}

export function getRequests() {
  return readData().requests || [];
}

export function getFacultyRequests() {
  return readData().facultyRequests || [];
}

export function saveRequest(request: any) {
  const data = readData();
  data.requests.unshift(request); // Add to beginning
  writeData(data);
  return request;
}

export function updateRequestStatus(id: string, status: string) {
  const data = readData();
  const index = data.requests.findIndex((r: any) => r.id === id);
  if (index !== -1) {
    data.requests[index].status = status;
    writeData(data);
    return data.requests[index];
  }
  return null;
}

export function getAnnouncements() {
  return readData().announcements || [];
}

export function saveAnnouncement(announcement: any) {
  const data = readData();
  data.announcements.unshift(announcement);
  writeData(data);
  return announcement;
}

export function getMessages() {
  return readData().messages || [];
}

export function saveMessage(msg: any) {
  const data = readData();
  if(!data.messages) data.messages = [];
  data.messages.push(msg);
  writeData(data);
  return msg;
}
