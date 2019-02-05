const { app, BrowserWindow, Menu } = require('electron')

var HID = require('node-hid')

let mainWindow = null
 
let vendorId = 1504
let productId = 4864
let barcodeFound = null;

var device = new HID.HID(vendorId,productId);

function createWindow(){
    //Crea la ventana del navegador
    mainWindow = new BrowserWindow({width: 800, height: 600})
    //Carga el index de la app.
    mainWindow.loadURL('file:///index.html')
    //Emitido cuando se cierra la ventana
    mainWindow.on('closed', () => {
        //Elimina la referencia a la ventana
        mainWindow = null
    })
    var menu = Menu.buildFromTemplate(menuItems)
    Menu.setApplicationMenu(menu)

    console.log(mainWindow.webContents.getPrinters())
}

function receiveBarcode(data){
    const barcode = data.toString('ascii').replace(/\W/g, '')
    const decodedBarcode = barcode.substring(2,barcode.length-1)
    console.log("Barcode found: ", decodedBarcode.toString());
    return decodedBarcode
}   

function startBarcodeScanner(){
    //List all devices
    console.log(HID.devices()[2]);
    device.on("data", function(data) {
        barcodeFound = receiveBarcode(data)
    });
}

//Se llama cuando electron está listo para iniciar el navegador.
app.on('ready', createWindow)

//Cuando todas las ventanas han sido cerradas
app.on('window-all-closed', () => {
    device.close()
    if (process.platform !== 'darwin'){
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow == null){
        createWindow()
    }
})

//Opciones del menú
const menuItems = [
    {
        label: 'Menu',
        submenu: [
            { 
                label: 'Iniciar lector',
                click() {
                    startBarcodeScanner()
                }
            },
            {
                label: 'Imprimir',
                click(item, focusedWindow) {
                    focusedWindow.webContents.print({silent: true}, (success) => {})
                },
                accelerator: 'CmdOrCtrl+P'
            },
            {
                label: 'Salir',
                click() {
                    app.quit();
                },
                accelerator: 'CmdOrCtrl+Q'
            }
        ]
    }
]

//If mac add empty object to menu
if  (process.platform == 'darwin'){
    menuItems.unshift({
        label:'',
        submenu:[]
    });
}

//Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    menuItems.push(
        {
            label: 'Herramientas',
            submenu: [
                {
                    label: 'Opciones Desarrollador',
                    click(item, focusedWindow) {
                        //Abre herramientas de desarrollador
                        focusedWindow.webContents.toggleDevTools();
                    }
                },
                { 
                    label: 'Refrescar',
                    role: 'reload'
                }
            ]
        }
    )
}