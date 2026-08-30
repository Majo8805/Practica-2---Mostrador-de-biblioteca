import { cargarCatalogo } from './catalogo.js';
import { prestar, estadoDe, multaDe, LibroNoEncontradoError, SinEjemplarError } from './dominio/prestamos.js';
import { pedirOpcion, pedirTexto } from './entrada.js';

const OPCIONES = [
  { valor: 'catalogo', etiqueta: '1. Ver catálogo' },
  { valor: 'prestar', etiqueta: '2. Prestar libro' },
  { valor: 'multa', etiqueta: '3. Calcular multa' },
  { valor: 'salir', etiqueta: '3. Salir' }
] as const;

type OpcionMenu = typeof OPCIONES[number]['valor'];

async function main() {
  console.log("Cargando sistema...");
  const catalogo = cargarCatalogo('./datos/catalogo.json');
  console.log(`Catálogo cargado. Registros descartados: ${catalogo.descartados}`);

  const mostrador = {
    libros: catalogo.libros,
    prestamos: []
  };

  while (true) {
    const opcion = await pedirOpcion('¿Qué deseas hacer?', OPCIONES);
    
    if (opcion === undefined || opcion === 'salir') {
      console.log('Saliendo del sistema...');
      break;
    }

    switch (opcion as OpcionMenu) {
      case 'catalogo':
        console.table(mostrador.libros);
        break;
      
      case 'prestar':
        const idLibro = await pedirTexto('Ingresa el ID del libro:');
        const socio = await pedirTexto('Ingresa el nombre del socio:');
        
        if (!idLibro || !socio) {
          console.log('Operación cancelada.');
          break;
        }

        try {
          const hoy = new Date();
          const nuevoPrestamo = prestar(mostrador, idLibro, socio, hoy);
          console.log(`¡Préstamo exitoso! Folio: ${nuevoPrestamo.folio}, Vence: ${nuevoPrestamo.venceEn.toLocaleDateString()}`);
        } catch (error) {
          // Atrapando errores del dominio y traduciéndolos a un mensaje
          if (error instanceof LibroNoEncontradoError) {
            console.error(`Error: ${error.message}`);
          } else if (error instanceof SinEjemplarError) {
            console.error(`Aviso: ${error.message}`);
          } else {
            console.error('Ocurrió un error inesperado.', error);
          }
        }
        break;

        case 'multa':
        const folio = await pedirTexto('Ingresa el folio del préstamo (ej. P-0001):');
        if (!folio) break;

        const prestamoEncontrado = mostrador.prestamos.find(p => p.folio === folio);
        
        if (!prestamoEncontrado) {
          console.log('Préstamo no encontrado.');
          break;
        }

        // Simulamos una fecha futura (ej. 20 días en el futuro) para forzar que esté vencido
        const fechaFutura = new Date();
        fechaFutura.setDate(fechaFutura.getDate() + 20);
        
        const estado = estadoDe(prestamoEncontrado, fechaFutura);
        const multa = multaDe(prestamoEncontrado, estado, fechaFutura);
        
        console.log(`Estado actual: ${estado}`);
        console.log(`Multa a pagar: $${multa}`);
        break;

      default: {
        // Switch exhaustivo
        const _exhaustivo: never = opcion as never;
        return _exhaustivo;
      }
    }
  }
}

main().catch(console.error);