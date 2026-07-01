const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("deskpawDesktop", {
  isDesktop: true,
  openPetWindow: () => ipcRenderer.invoke("deskpaw:open-pet-window"),
  generateStyledPet: (request) => ipcRenderer.invoke("deskpaw:generate-styled-pet", request)
});

