import { jsPDF } from "jspdf";
import { MeiliSearch } from "meilisearch";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Logo_Seas =
  "data:image/png;base64,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";

// Configuraciones necesarias para Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
// Configuraciones necesarias para Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const Storage = getStorage(app);

// Configuraciones necesarias para MeiliSearch
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});
const index = client.index("Precision_Seas");

let Email;
let Files = [];
let Planos = [];
let Cajetin = [];
let Entregas = [];
let Etiquetas = [];
let Emergencia = [];
let Indicadores = [];
let Operaciones = [];
let Descripciones = [];
let events = new Map();

let Casillas = 19;

// Botones
const Boton_LogOut = document.getElementById("Boton_LogOut");
const Boton_Estado = document.getElementById("Boton_Cambiar_Estado");
const Boton_Cerrar_Plano = document.getElementById("Boton_Cerrar_Plano");
const Boton_Imprimir_Plano = document.getElementById("Boton_Imprimir_Plano");
const Boton_Cerrar_Entrega = document.getElementById("Boton_Cerrar_Entrega");
const Boton_Etiqueta_Plano = document.getElementById("Boton_Etiqueta_Plano");
const Boton_Crear_Documento = document.getElementById("Boton_Crear_Documento");
const Boton_Imprimir_Entrega = document.getElementById("Boton_Imprimir_Entrega");
const Boton_Etiqueta_Entrega = document.getElementById("Boton_Etiqueta_Entrega");
const Boton_Cerrar_Emergencia = document.getElementById("Boton_Cerrar_Emergencia");
const Boton_Etiqueta_Urgencia = document.getElementById("Boton_Etiqueta_Urgencia");
const Boton_Busqueda_Avanzada = document.getElementById("Boton_Busqueda_Avanzada");
const Boton_Imprimir_Emergencia = document.getElementById("Boton_Imprimir_Emergencia");
const Boton_Consultar_Documento = document.getElementById("Boton_Consultar_Documento");
const Boton_Modificar_Documento = document.getElementById("Boton_Modificar_Documento");

// Informacion de sesion activa
const User_name = document.getElementById("User_name");
const Layout_02 = document.getElementById("Layout_02");

// Secciones ocultas PopUp
const Plano_PopUp = document.getElementById("Plano_PopUp");
const Estado_PopUp = document.getElementById("Estado_PopUp");
const Entrega_PopUp = document.getElementById("Entrega_PopUp");
const Almacen1_PopUp = document.getElementById("Almacen1_PopUp");
const Emergencia_PopUp = document.getElementById("Emergencia_PopUp");

// Botones generacion de DPL
const Abrir_DPL = document.getElementById(`Boton_DPL`);
const Cargar_DPL = document.getElementById(`Cargar_DPL`);
const Cerrar_DPL = document.getElementById(`Cerrar_DPL`);
const Seccion_DPL = document.getElementById(`Seccion_DPL`);
const Generar_DPL = document.getElementById(`Generar_DPL`);

// Botones de almacen de archivos
const Cargar_Almacen1 = document.getElementById("Cargar_Almacen1");
const Cargar_Almacen2 = document.getElementById("Cargar_Almacen2");
const Cerrar_Almacen1 = document.getElementById("Cerrar_Almacen1");
const Cerrar_Almacen2 = document.getElementById("Cerrar_Almacen2");
const Boton_Almacen1 = document.getElementById(`Boton_Planos`);
const Boton_Almacen2 = document.getElementById(`Boton_Fact`);

// Botones para cambiar de estado
const Entregado = document.getElementById("Entregado");
const Pendiente = document.getElementById("Pendiente");
const Cerrar_E = document.getElementById("Cerrar_E");
const Anulado = document.getElementById("Anulado");
const On_Hold = document.getElementById("On_Hold");

// Casillas de consulta OT
const Input_OT = document.getElementById("OT");
const Input_COT = document.getElementById("COT");

// Casillas de consulta avanzada
const A_Desde = document.getElementById("A_Desde");
const A_Hasta = document.getElementById("A_Hasta");
const A_Estado = document.getElementById("A_Estado");
const A_Empresa = document.getElementById("A_Empresa");
const A_Filtro = document.getElementById("A_Filtro");
const A_Comentario = document.getElementById("A_Comentario");

// Casillas para ingresar nuevo proyecto
const Input_Empresa = document.getElementById("Empresa");
const Input_Cliente = document.getElementById("Cliente");
const Input_Entrada = document.getElementById("Entrada");
const Input_Entrega = document.getElementById("Entrega");
const Input_Cantidad = document.getElementById("Cantidad");
const Input_Comentario = document.getElementById("Comentario");

// Formularios generacion DPL
const Operaciones_1 = document.getElementById(`Operaciones_1`);
const Operaciones_2 = document.getElementById(`Operaciones_2`);

// Arrays de elementos dentro de los PopUp
for (let i = 0; i < 7; i++) {
  Emergencia[i] = document.getElementById(`Emergencia_${i}`);
  Entregas[i] = document.getElementById(`Entrega_${i}`);
  Planos[i] = document.getElementById(`Plano_${i}`);
}

// Declaracion de funcion para agregar listeners
function addListener(element, event, callback, id) {
  events.set(id, callback);
  element.addEventListener(event, callback);
}

// Declaracion de funcion para eliminar listeners
function removeListener(element, event, id) {
  element.removeEventListener(event, events.get(id));
  events.delete(id);
}

// Declaracion de funcion para salir de la sesion
function LogOut() {
  signOut(auth).then(() => {
    window.location.href = "https://lista-seas.firebaseapp.com/";
  });
}

// Almacenes de archivos
// Casilla 0 - 7 Almacen 1
// Casilla 8 - 15 Almacen 2
// Casilla 16 - 18 Pagina principal
for (let i = 0; i < Casillas; i++) {
  Indicadores[i] = document.getElementById(`Casilla_${i}`);
  Indicadores[i].addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  Indicadores[i].addEventListener("drop", (event) => {
    Indicadores[i].style.backgroundColor = "#DDD414";
    Files[i] = event.dataTransfer.files.item(0);
    Indicadores[i].innerHTML = trimString(`${Files[i].name}`);
    event.preventDefault();
  });
}

// Genera arrays para informacion del DPL
for (let i = 0; i < 12; i++) {
  Cajetin[i] = document.getElementById(`DPL_${i}`);

  if (i < 10) {
    Etiquetas[i] = document.getElementById(`Label_${i}`);
    Operaciones[i] = document.getElementById(`LOP_${i}`);
    Descripciones[i] = document.getElementById(`OP_${i}`);

    Etiquetas[i].addEventListener("click", () => Marcar(i));
  }
}

Input_COT.addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    Consultar();
  }
});

// Botones pagina principal
Boton_Etiqueta_Plano.addEventListener("click", () => PopUp(1));
Boton_Etiqueta_Entrega.addEventListener("click", () => PopUp(2));
Boton_Etiqueta_Urgencia.addEventListener("click", () => PopUp(3));
Boton_LogOut.addEventListener("click", LogOut);
Boton_Busqueda_Avanzada.addEventListener("click", Avanzada);
Boton_Crear_Documento.addEventListener("click", Versiones);
Boton_Consultar_Documento.addEventListener("click", Consultar);
Boton_Estado.addEventListener("click", () => PopUp(14));
Boton_Modificar_Documento.addEventListener("click", Modificar_Documento);

// Botones popUps
Boton_Imprimir_Plano.addEventListener("click", Print_Plano);
Boton_Imprimir_Entrega.addEventListener("click", Print_Entrega);
Boton_Imprimir_Emergencia.addEventListener("click", Print_Emergencia);
Cerrar_E.addEventListener("click", () => PopUp(15));
Boton_Cerrar_Plano.addEventListener("click", () => PopUp(4));
Boton_Cerrar_Entrega.addEventListener("click", () => PopUp(5));
Boton_Cerrar_Emergencia.addEventListener("click", () => PopUp(6));

// Botones almacenes
Cargar_Almacen1.addEventListener("click", Modificar_Documento);
Cargar_Almacen2.addEventListener("click", Modificar_Documento);
Cerrar_Almacen1.addEventListener("click", () => PopUp(7));
Cerrar_Almacen2.addEventListener("click", () => PopUp(8));
Boton_Almacen1.addEventListener("click", () => PopUp(10));
Boton_Almacen2.addEventListener("click", () => PopUp(11));

// Botones para cambiar de estado
Entregado.addEventListener("click", () => Cambiar_Estado("Entregado"));
Pendiente.addEventListener("click", () => Cambiar_Estado("Pendiente"));
Anulado.addEventListener("click", () => Cambiar_Estado("Anulado"));
On_Hold.addEventListener("click", () => Cambiar_Estado("On_Hold"));

// Botones generador DPL's
Generar_DPL.addEventListener("click", DPL_Imprimir);
Abrir_DPL.addEventListener("click", () => PopUp(12));
Cerrar_DPL.addEventListener("click", () => PopUp(13));
Cargar_DPL.addEventListener("click", Modificar_Documento);

// Recoger informacion del usuario
onAuthStateChanged(auth, (user) => {
  if (user) {
    Email = user.email;
    User_name.innerHTML = `Usuario: ${Email}`;
  } else {
    Email = "No Registrado";
    User_name.innerHTML = `Usuario: No Registrado`;
  }
});

async function Versiones() {

  if (Casillas_Llenas) { // Revisa si todas las casillas estan llenas
    let Documento = [{ // Establece la estructura del documento que se va a cargar
      Cantidad: Number(Input_Cantidad.value),
      Comentario: Input_Comentario.value,
      Empresa: Input_Empresa.value,
      Cliente: Input_Cliente.value,
      Autor: String(Email),
      id: Input_OT.value,
      Documentos: {},
      Operaciones: [],
      Descripcion: [],
      Completados: [],

      Estado: "Pendiente",
      Generada: new Date().getTime(),
      Entrada: new Date(Input_Entrada.value).getTime(),
      Entrega: new Date(Input_Entrega.value).getTime(),
    }];

    await index.addDocuments(Documento) // Espera que el archivo se suba al db
      .then((res) => { // Respuesta correcta del servidor 
        console.log(res);
        Formulario1.reset();
      }) 
      .catch(() => { // Error de escritura en el servicor
        Mostrar_Error(`Surgio un error al escribir el documento`);
      });
  }
}

async function Modificar_Documento() {

  if (Input_COT.value) {
    let Documento = await index.getDocument(Input_COT.value); // Revisa la informacion existente en el documento
  
    for (let i = 0; i < Casillas; i++) { // Revisa casilla por casilla si hay un documento asociado
      if (Files[i]) {
        Documento.Documentos[i] = `Documentos/${Input_COT.value}/${Files[i].name}`; // Direccion para encontrar el archivo
        uploadBytes(ref(Storage, Documento.Documentos[i]), Files[i]).then(() => { // Sube el archivo al bucket
          Indicadores[i].style.backgroundColor = "#33FFBD";
        });
        Files[i] = null;
    }}

    for (let i = 0; i < 10; i++) { // Revisa las casillas del DPL para incluirlas en el documento
      if (Operaciones[i].value){
        Documento.Operaciones[i] = Operaciones[i].value;
      }
      if (Descripciones[i].value){
        Documento.Descripcion[i] = Descripciones[i].value;
      }
      if (Etiquetas[i].style.backgroundColor){
        Documento.Completados[i] = Etiquetas[i].style.backgroundColor;
      }
    }

    await index.updateDocuments(Documento) // Espera que el archivo se suba al db
    .then((res) => { // Respuesta correcta del servidor 
      Consultar();
    }) 
    .catch(() => { // Error de escritura en el servicor
      Mostrar_Error(`Surgio un error al escribir el documento`);
    });
  }
}

async function Cambiar_Estado(Estado) {
  let Documento = await index.getDocument(Input_COT.value); // Revisa la informacion existente en el documento
  Documento.Estado = Estado;

  await index.updateDocuments(Documento) // Espera que el archivo se suba al db
  .then((res) => { // Respuesta correcta del servidor 
    Consultar();
  }) 
  .catch(() => { // Error de escritura en el servicor
    Mostrar_Error(`Surgio un error al escribir el documento`);
  });
}

async function Consultar() {
  Limpiar();
  let data;

  if (Input_COT.value) {
    await index.getDocument(Input_COT.value) // Recibe el documento segun numero COT de la base de datos
      .then((res) => {
      DisplayData(res, 0); // Genera una nueva seccion con la informacion recibida
      data = res; // Guarda la informacion recibida en la variable data
    })

    if (data.Documentos) { // Si encuentra documentos asociado en la BD los muestra y asigna listeners
      for (let i = 0; i < Casillas; i++) {
        if (data.Documentos[i]) { // Recorta el nombre de los planos y colorea las casillas con archivos
          Indicadores[i].innerHTML = trimString(`${data.Documentos[i]}`);
          addListener(Indicadores[i], "click", () => Importar(data.Documentos[i]), i);
          Indicadores[i].style.backgroundColor = "#33FFBD";
        } else {
          Indicadores[i].style.backgroundColor = "#ff6d33";
        }
      }

      Algun_Plano(data); // Colorea el boton de Plano dependiendo si hay informacion
      Alguna_Factura(data); // Colorea el boton de Factura dependiendo si hay informacion
      Alguna_Operacion(data); // Si encuentra informacion en el DPL colorea la casilla
    }

    // Carga los valores en los PopUp para imprimir etiquetas
    Planos[0].value = `${data.Empresa} / ${data.id}`;
    Planos[1].value = `PO:`;
    Planos[2].value = ``;
    Planos[3].value = ``;
    Planos[4].value = `Impreso: ${new Date().toDateString()}`;
    Planos[5].value = `Cantidad: ${data.Cantidad}`;

    Entregas[0].value = `PO: `;
    Entregas[1].value = `FACT: `;
    Entregas[2].value = `${data.Empresa} / ${data.Cliente}`;
    Entregas[3].value = `Precision Seas S.A`;
    Entregas[4].value = `${data.Comentario}`;
    Entregas[5].value = `Cantidad: ${data.Cantidad}`;
    Entregas[6].value = `Entrega: ${data.Entrega}`;

    Emergencia[0].value = `${data.Empresa} / ${data.Cliente}`;
    Emergencia[1].value = `${data.Comentario}`;
    Emergencia[2].value = `Cantidad: ${data.Cantidad}`;
    Emergencia[3].value = `Entrega: ${data.Entrega}`;

    DPL_0.value = `${data.Empresa}`;
    DPL_1.value = ``;
    DPL_2.value = `${data.id}`;
    DPL_3.value = ``;
    DPL_4.value = `${data.Comentario}`;
    DPL_5.value = ``;
    DPL_6.value = ``;
    DPL_7.value = ``;
    DPL_8.value = `${data.Cantidad}`;
    DPL_9.value = ``;
    DPL_10.value = `${data.Entrega}`;
    DPL_11.value = `${data.Entrega}`;
  }
}

async function Avanzada() {
  Limpiar();

  let Query = ``;
  let Filtro = ``;

  if (A_Empresa.value) {
    Query += `${A_Empresa.value} `;
  }
  if (A_Comentario.value) {
    Query += `${A_Comentario.value} `;
  }
  if (A_Estado.value) {
    Filtro = `Estado = ${A_Estado.value} `;
  }

  if (A_Desde.value && A_Hasta.value && A_Filtro) {
    let Busqueda_Inicial = new Date(A_Desde.value).getTime();
    let Busqueda_Final = new Date(A_Hasta.value).getTime();
    Filtro = `${A_Filtro.value} > ${Busqueda_Inicial} AND ${A_Filtro.value} < ${Busqueda_Final}`;
  }

  const doc = (await index.search(Query, { filter: Filtro })).hits;
  doc.forEach((data, indice) => DisplayData(data, indice));
}

function Importar(Data) {
  let Referencia = ref(Storage, Data);
  getDownloadURL(Referencia)
    .then((url) => {
      window.open(url);
    })
    .catch((error) => {
      Mostrar_Error(error);
    });
}

function trimString(text) {
  let trimmedText = text.trim();
  let lastSpaceIndex = trimmedText.lastIndexOf(" ");

  if (lastSpaceIndex !== -1 && lastSpaceIndex <= 8) {
    trimmedText = trimmedText.substring(lastSpaceIndex + 1);
  }

  if (trimmedText.length > 8) {
    trimmedText = trimmedText.substring(trimmedText.length - 8);
  }

  return trimmedText;
}

function DisplayData(data, num) {
  let Registro = [];
  data.Entrada = new Date(data.Entrada).toLocaleDateString();
  data.Entrega = new Date(data.Entrega).toLocaleDateString();
  data.Generada = new Date(data.Generada).toLocaleDateString();

  Layout_02.innerHTML += `
  <div id="Registro${num}" class="Registros">
    <p> OT= ${data.id} </p>
    <p> Autor= ${data.Autor} </p>
    <p> Entrada= ${data.Entrada} </p>
    <p> Entrega= ${data.Entrega} </p> 
            
    <p> Cantidad= ${data.Cantidad} </p>
    <p> Empresa= ${data.Empresa} </p> 
    <p> Cliente= ${data.Cliente} </p>
    <p> Registrado= ${data.Generada} </p>

    <p class="Comentarios"> Com: ${data.Comentario}</p>
  </div>`;

  Registro[num] = document.getElementById(`Registro${num}`);

  if (data.Estado == "Entregado") {
    Registro[num].style.backgroundColor = "#33FFBD";
  } else if (data.Estado == "Anulado") {
    Registro[num].style.backgroundColor = "#e7abff";
  } else if (data.Estado == "On_Hold") {
    Registro[num].style.backgroundColor = "#abebff";
  } else if (data.Estado == "Pendiente") {
    if (new Date(data.Entrega) > new Date()) {
      Registro[num].style.backgroundColor = "#e6d70b";
    } else {
      Registro[num].style.backgroundColor = "#ff6d33";
    }
  }
}

function Print_Plano() {
  const Etiqueta = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [51, 26],
  });

  Etiqueta.setFontSize(7);

  Etiqueta.text(`${Planos[0].value}`, 2, 3);
  Etiqueta.text(`${Planos[1].value}`, 2, 6.8);
  Etiqueta.text(`${Planos[2].value}`, 2, 10.6);
  Etiqueta.text(`${Planos[3].value}`, 2, 14.4);
  Etiqueta.text(`${Planos[4].value}`, 2, 18.2);
  Etiqueta.text(`${Planos[5].value}`, 2, 22);

  Etiqueta.output("dataurlnewwindow", "Plano.pdf");
}

function Print_Entrega() {
  const Etiqueta = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [51, 26],
  });

  Etiqueta.setFontSize(7);

  Etiqueta.text(`${Entregas[0].value}`, 2, 2);
  Etiqueta.text(`${Entregas[1].value}`, 2, 5.5);
  Etiqueta.text(`${Entregas[2].value}`, 2, 9);
  Etiqueta.text(`${Entregas[3].value}`, 2, 12.5);
  Etiqueta.text(`${Entregas[4].value}`, 2, 16);
  Etiqueta.text(`${Entregas[5].value}`, 2, 19.5);
  Etiqueta.text(`${Entregas[6].value}`, 2, 23);

  Etiqueta.output("dataurlnewwindow", "Entrega.pdf");
}

function Print_Emergencia() {
  const Etiqueta = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [51, 26],
  });

  Etiqueta.setFontSize(8);

  Etiqueta.text(`${Emergencia[0].value}`, 2, 3);
  Etiqueta.text(`${Emergencia[1].value}`, 2, 8);
  Etiqueta.text(`${Emergencia[2].value}`, 2, 13);
  Etiqueta.text(`${Emergencia[3].value}`, 2, 18);

  Etiqueta.output("dataurlnewwindow", "Emergencia.pdf");
}

async function DPL_Imprimir() {
  var docDefinition = {
    content: [
      {
        columns: [
          { width: 150, image: Logo_Seas },

          [
            {
              text: `Device Path Log / Registro de Ruta del Dispositivo ( DPL ) `,
              style: "Header",
              alignment: "center",
            },
          ],
        ],
      },

      {
        style: "Texto",
        alignment: "center",
        margin: [0, 20, 0, 0],

        table: {
          widths: [75, 75, 75, 75, 75, 75],
          heights: [22, 22, 22, 22],

          body: [
            ["CUSTOMER / CLIENTE", "PO / WO", "OT", "ITEM / PARTE", "ITEM DESCRIPTION DESCRIPCION", "PART DRAWING / DIBUJO DE PARTE"],

            [
              `${Cajetin[0].value}`,
              `${Cajetin[1].value}`,
              `${Cajetin[2].value}`,
              `${Cajetin[3].value}`,
              `${Cajetin[4].value}`,
              `${Cajetin[5].value}`,
            ],

            [
              "MATERIAL / MATERIAL",
              "EXT.PROCESS / PROC.EXTERNO",
              "QTY REQUIRED / QTY REQUERIDA",
              "ACTUAL QUANTITY / CANTIDAD ACTUAL",
              "DATE GENERATED / FECHA GENERADO",
              "DELIVERY DATE / FECHA DE ENTREGA",
            ],

            [
              `${Cajetin[6].value}`,
              `${Cajetin[7].value}`,
              `${Cajetin[8].value}`,
              `${Cajetin[9].value}`,
              `${Cajetin[10].value}`,
              `${Cajetin[11].value}`,
            ],
          ],
        },
      },
    ],

    styles: {
      Texto: {
        fontSize: 8,
      },
      Header: {
        width: "*",
        bold: true,
        fontSize: 13,
      },
    },
  };

  Append1(docDefinition);
  pdfMake.createPdf(docDefinition).open();
}

function Append1(doc) {
  for (let i = 0; i < 10; i++) {
    if (Operaciones[i].value) {
      doc.content.push(
        {
          margin: [0, 15, 0, 0],
          text: `${Operaciones[i].value}`,
          style: "Header",
        },

        {
          table: {
            widths: [300, 180],
            heights: 50,

            body: [
              [
                `${Descripciones[i].value}`,
                [
                  {
                    text: "ACCEPTABLE QTY / QTY ACEPTADA:____________ ",
                    style: "Texto",
                  },

                  {
                    text: "SCRAP / DESECHO:_____________________________",
                    style: "Texto",
                  },

                  {
                    text: "VERIFIED / VERIFICADO:_________________________",
                    style: "Texto",
                  },

                  {
                    text: "VERIFIED DATE / FECHA VERIFICACION:_________",
                    style: "Texto",
                  },

                  {
                    text: "START/INICIO_________ END/FINAL______________",
                    style: "Texto",
                  },

                  {
                    text: "EFECTIVE TIME/ TIEMPO EFECTIVO _____________",
                    style: "Texto",
                  },
                ],
              ],
            ],
          },
        }
      );
    }
  }

  doc.content.push({
    columns: [
      { qr: `${DPL_2.value}`, width: 100, margin: [10, 10, 10, 0] },
      {
        text: `Precision Seas S.A`,
        margin: [0, 10, 0, 0],
        alignment: "center",
      },
    ],
  });
}

function Limpiar() {
  Indicadores[16].innerHTML = `MR`;
  Indicadores[17].innerHTML = `COT`;
  Indicadores[18].innerHTML = `PO`;

  Layout_02.style.display = "grid";
  Layout_02.innerHTML = "";
  Formulario1.reset();

  Abrir_DPL.style.backgroundColor = "#D3D3D3";
  Boton_Almacen1.style.backgroundColor = "#D3D3D3";
  Boton_Almacen2.style.backgroundColor = "#D3D3D3";

  Operaciones_1.reset();
  Operaciones_2.reset();

  DPL_0.value = "";
  DPL_1.value = "";
  DPL_2.value = "";
  DPL_3.value = "";
  DPL_4.value = "";
  DPL_5.value = "";
  DPL_6.value = "";
  DPL_7.value = "";
  DPL_8.value = "";
  DPL_9.value = "";
  DPL_10.value = "";
  DPL_11.value = "";

  for (let i = 0; i < 10; i++) {
    Etiquetas[i].style.backgroundColor = "";
  }

  for (let i = 0; i < Casillas; i++) {
    removeListener(Indicadores[i], "click", i);
    Indicadores[i].style.backgroundColor = "#D3D3D3";

    if (i < 8) {
      Indicadores[i].innerHTML = `Plano ${i + 1}`;
    } else if (i < 16) {
      Indicadores[i].innerHTML = `Fact ${i - 7}`;
    }
  }
}

function PopUp(Seccion) {
  switch (Seccion) {
    case 1:
      Plano_PopUp.style.display = "grid";
      break;

    case 2:
      Entrega_PopUp.style.display = "grid";
      break;

    case 3:
      Emergencia_PopUp.style.display = "grid";
      break;

    case 4:
      Plano_PopUp.style.display = "none";
      break;

    case 5:
      Entrega_PopUp.style.display = "none";
      break;

    case 6:
      Emergencia_PopUp.style.display = "none";
      break;

    case 7:
      Almacen1_PopUp.style.display = "none";
      break;

    case 8:
      Almacen2_PopUp.style.display = "none";
      break;

    case 10:
      Almacen1_PopUp.style.display = "grid";
      break;

    case 11:
      Almacen2_PopUp.style.display = "grid";
      break;

    case 12:
      Seccion_DPL.style.display = "grid";
      break;

    case 13:
      Seccion_DPL.style.display = "none";
      break;

    case 14:
      Estado_PopUp.style.display = "grid";
      break;

    case 15:
      Estado_PopUp.style.display = "none";
      break;
  }
}

function Mostrar_Error(error) {
  Limpiar();
  Layout_02.innerHTML += `Un error ha surgido: `;
  Layout_02.innerHTML += error;
}

function Marcar(i) {
  if (Etiquetas[i].style.backgroundColor == "rgb(51, 255, 189)") {
    Etiquetas[i].style.backgroundColor = "#ff6d33";
  } else {
    Etiquetas[i].style.backgroundColor = "#33FFBD";
  }
}

function Casillas_Llenas() {
  if (
    Input_OT.value &&
    Input_Empresa.value &&
    Input_Cliente.value &&
    Input_Entrada.value &&
    Input_Entrega.value &&
    Input_Cantidad.value &&
    Input_Comentario.value
  ) {
    return true;
  } else {
    return false;
  }
}

function Algun_Plano(data) {
  if (
    data.Documentos[0] ||
    data.Documentos[1] ||
    data.Documentos[2] ||
    data.Documentos[3] ||
    data.Documentos[4] ||
    data.Documentos[5] ||
    data.Documentos[6] ||
    data.Documentos[7]
  ) {
    Boton_Almacen1.style.backgroundColor = "#33FFBD";;
  } else {
    Boton_Almacen1.style.backgroundColor = "#ff6d33";;
  }
}

function Alguna_Factura(data) {
  if (
    data.Documentos[8] ||
    data.Documentos[9] ||
    data.Documentos[10] ||
    data.Documentos[11] ||
    data.Documentos[12] ||
    data.Documentos[13] ||
    data.Documentos[14] ||
    data.Documentos[15]
  ) {
    Boton_Almacen2.style.backgroundColor = "#33FFBD";;
  } else {
    Boton_Almacen2.style.backgroundColor = "#ff6d33";;
  }
}

function Alguna_Operacion(data) {
  if (data.Operaciones) { // Si encuentra informacion en las operaciones muestra la informacion
    Abrir_DPL.style.backgroundColor = "#33FFBD";
    for (let i = 0; i < 10; i++) {
      if (data.Operaciones[i]) {
        Operaciones[i].value = data.Operaciones[i];
        Descripciones[i].value = data.Descripcion[i];
        Etiquetas[i].style.backgroundColor = data.Estado[i];
      }
    }
  } else {
    Abrir_DPL.style.backgroundColor = "#ff6d33";
  }
}
