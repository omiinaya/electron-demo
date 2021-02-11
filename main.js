//dependencies
const { app, BrowserWindow } = require('electron')
const { overlayWindow } = require('electron-overlay-window')
const { exec } = require('child_process')
const memoryjs = require('memoryjs')
const ioHook = require('iohook')
const ipc = require('electron').ipcMain

//modules
const signatures = require('./assets/JS/signatures');
const init = require('./initialize.js');

//target
//var target = 'Craftopia.exe'
//var target = 'notepad.exe'
var target = 'MZZXLC.exe'

//globals
var win;
var visible;

//timers
var waitingT;
var godModeT;

//static
var processObject;
var defaults = {};

function createWindow(title) {
  const window = new BrowserWindow({
    width: 400,
    height: 300,
    ...overlayWindow.WINDOW_OPTS,
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.loadFile('./assets/HTML/index.html')
  window.setIgnoreMouseEvents(false)
  window.setContentProtection(true)
  overlayWindow.attachTo(window, title)
  win = window;
  visible = true;
  hotkeyListener()
}

function hotkeyListener() {
  ioHook.on('keydown', event => {
    if (event.rawcode == 45 || event.rawcode == 46) {
      windowToggle()
    }
  })
  ioHook.start();
}

function windowToggle() {
  if (!visible) {
    win.show()
    win.restore();
    visible = true;
  } else {
    win.minimize()
    win.hide()
    visible = false;
  }
}

function main() {
  getGameWindow()
  if (processObject) {
    clearTimeout(waitingT)
    getWindowTitle()
  } else {
    waitingT = setTimeout(main, 1000);
  }
}

function getGameWindow() {
  var processes = memoryjs.getProcesses();
  for (var i = 0; i < processes.length; i++) {
    if (processes[i].szExeFile == target) {
      processObject = memoryjs.openProcess(target);
    }
  }
}

function getWindowTitle() {
  exec('tasklist /FI "PID eq ' + processObject.th32ProcessID + '" /fo list /v', (err, stdout, stderr) => {
    var index = stdout.search("Window Title: ");
    var title = stdout.substring(index + 14, stdout.length - 2)
    createWindow(title)
  });
}

app.on('ready', () => {
  main()
})

ipc.on('Enable', function (event, arg) {
  if (arg === 'God Mode') {
    GodMode(true)
  }
  if (arg === 'Rank S') {
    RankS(true)
  }
  if (arg === 'Infinite Lives') {
    InfiniteLives(true)
  }
  if (arg === 'Infinite Crystals') {
    InfiniteCrystals(true)
  }
})

ipc.on('Disable', function (event, arg) {
  if (arg === 'God Mode') {
    GodMode(false)
  }
  if (arg === 'Rank S') {
    RankS(false)
  }
  if (arg === 'Infinite Lives') {
    InfiniteLives(false)
  }
  if (arg === 'Infinite Crystals') {
    InfiniteCrystals(false)
  }
})

function GodMode(on) {
  var target = init(processObject).invincible;
  if (on) {
    console.log('God Mode has been enabled.')
    memoryjs.writeMemory(processObject.handle, target, 0x80, memoryjs.BYTE);
  } else {
    console.log('God Mode has been disabled.')
    memoryjs.writeMemory(processObject.handle, target, 0x0, memoryjs.BYTE);
  }
}

function RankS(on) {
  var target = init(processObject).ranks1;
  var target2 = init(processObject).ranks2;
  var target3 = init(processObject).ranks3;
  if (on) {
    console.log("Rank S has been enabled.")
    memoryjs.writeMemory(processObject.handle, target, 0x06, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target2, 0x06, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3 + 1, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3 + 2, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3 + 3, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3 + 4, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target3 + 5, 0x90, memoryjs.BYTE);
  } else {
    console.log("Rank S has been disabled.")
    memoryjs.writeMemory(processObject.handle, target, 0x03, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, target2, 0x03, memoryjs.BYTE);
  }
}

function InfiniteLives(on) {
  //default
  var address1 = memoryjs.findPattern(processObject.handle, processObject.szExeFile, signatures.infinitelives, memoryjs.NORMAL, 0, 0)
  var address2 = memoryjs.findPattern(processObject.handle, processObject.szExeFile, signatures.infinitelives, memoryjs.NORMAL, 1, 0)
  if (on) {
    console.log("Infinite Lives has been enabled.")
    memoryjs.writeMemory(processObject.handle, address1, 0x90, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, address2, 0x90, memoryjs.BYTE);
  } else {
    console.log("Infinite Lives has been disabled.")
    memoryjs.writeMemory(processObject.handle, address1, 0xFE, memoryjs.BYTE);
    memoryjs.writeMemory(processObject.handle, address2, 0x08, memoryjs.BYTE);
  }
}

function InfiniteCrystals(on) {
  if (on) {
    //
  } else {
    //
  }
}

function NoPushBack() {
  var address1 = memoryjs.findPattern(processObject.handle, processObject.szExeFile, signatures.nopushback, memoryjs.NORMAL, 47, 0)
  var address2 = address1 + 1;
  var address3 = address1 + 2;
  var address4 = address1 + 3;
  var address5 = address1 + 4;
  var address6 = address1 + 5;
  memoryjs.writeMemory(processObject.handle, address1, 0x90, memoryjs.BYTE);
  memoryjs.writeMemory(processObject.handle, address2, 0x90, memoryjs.BYTE);
  memoryjs.writeMemory(processObject.handle, address3, 0x90, memoryjs.BYTE);
  memoryjs.writeMemory(processObject.handle, address4, 0x90, memoryjs.BYTE);
  memoryjs.writeMemory(processObject.handle, address5, 0x90, memoryjs.BYTE);
  memoryjs.writeMemory(processObject.handle, address6, 0x90, memoryjs.BYTE);
}