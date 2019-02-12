const { app, BrowserWindow, Menu } = require('electron')
var printer = require("printer")

var HID = require('node-hid')

let mainWindow = null

let vendorId = 1504
let productId = 4864
let barcodeFound = null;

var thermal_printer = require("node-thermal-printer")
var default_printer = printer.getPrinter('EPSON TM-U220 Receipt')

//var device = new HID.HID(vendorId,productId);

function createWindow() {
    //Crea la ventana del navegador
    mainWindow = new BrowserWindow({ width: 800, height: 600 })
    //Carga el index de la app.
    mainWindow.loadURL('file:///index.html')
    //Emitido cuando se cierra la ventana
    mainWindow.on('closed', () => {
        //Elimina la referencia a la ventana
        mainWindow = null
    })

    console.log(default_printer.name)

    thermal_printer.init({
        type: 'epson',
        interface: `printer:${default_printer.name}`,
        width: 42
    })

    var menu = Menu.buildFromTemplate(menuItems)
    Menu.setApplicationMenu(menu)

    //console.log(mainWindow.webContents.getPrinters())
}

function receiveBarcode(data) {
    const barcode = data.toString('ascii').replace(/\W/g, '')
    const decodedBarcode = barcode.substring(2, barcode.length - 1)
    console.log("Barcode found: ", decodedBarcode.toString());
    return decodedBarcode
}

function startBarcodeScanner() {
    //List all devices
    console.log(HID.devices()[2]);
    device.on("data", function (data) {
        barcodeFound = receiveBarcode(data)
    });
}

//Se llama cuando electron está listo para iniciar el navegador.
app.on('ready', createWindow)

//Cuando todas las ventanas han sido cerradas
app.on('window-all-closed', () => {
    //device.close()
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow == null) {
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
                    //focusedWindow.webContents.print({}, (success) => {})
                    
                    thermal_printer.alignCenter();
                    thermal_printer.println("Arquitectos e Ingenieros");
                    thermal_printer.println("de Tecnología S. A.");
                    console.log(thermal_printer.getBuffer());
                    thermal_printer.newLine();
                    thermal_printer.alignLeft();
                    thermal_printer.tableCustom([                               // Prints table with custom settings (text, align, width, bold)
                        { text:"Articulo", align:"LEFT", width:0.36 },
                        { text:"Precio", align:"RIGHT", width:0.24},
                        { text:"Cant", align:"RIGHT", width:0.10},
                        { text:"Valor", align:"RIGHT", width:0.23 }
                      ]
                      );
                    thermal_printer.tableCustom([                               // Prints table with custom settings (text, align, width, bold)
                        { text:"AGUA SALVAV.BOT", align:"LEFT", width:0.36 },
                        { text:"Q6.50", align:"RIGHT", width:0.24},
                        { text:"x1", align:"RIGHT", width:0.1},
                        { text:"Q6.50", align:"RIGHT", width:0.23 }
                      ]);
                      thermal_printer.tableCustom([                               // Prints table with custom settings (text, align, width, bold)
                        { text:"AGUA SALVAV.BOT", align:"LEFT", width:0.36 },
                        { text:"Q3000.00", align:"RIGHT", width:0.24},
                        { text:"x1", align:"RIGHT", width:0.1},
                        { text:"Q3000.00", align:"RIGHT", width:0.23 }
                      ]);
                    thermal_printer.drawLine();
                    thermal_printer.println("Número de Artículos: 1");
                    
                    thermal_printer.setTypeFontA();
                    thermal_printer.setTextNormal();
                    thermal_printer.cut();
                    thermal_printer.openCashDrawer();
                    thermal_printer.execute(function(err){
                        if (err) {
                        console.error("Print failed", err);
                        } else {
                        console.log("Print done");
                        }
                    })
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
if (process.platform == 'darwin') {
    menuItems.unshift({
        label: '',
        submenu: []
    });
}

//Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
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