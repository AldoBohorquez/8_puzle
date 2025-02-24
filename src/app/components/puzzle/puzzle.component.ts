import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

// se crea la variable estado para el tablero del puzle y los pasos a resolver y la heuristica de la solucion
type Estado = {
  tablero: number[][];
  pasos: number[][][];
  h: number;
};

@Component({
  selector: 'app-puzzle',
  imports: [CommonModule],
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
})
export class PuzzleComponent implements OnInit {
  ngOnInit(): void {
    // Se genera el puzzle al presionar el botón
  }

  tamaño = 3;
  tableroInicial: number[][] = [];
  tableroObjetivo: number[][] = [];
  pasosSolucion: number[][][] = [];
  estadosExplorados: number[][][] = [];

  resolviendo = false;

  generarTableroAleatorio(): number[][] {
    //crea un arreglo de tamaño x tamaño o 3*3 dando 9 y siendo hasta 8 numeros
    const numeros = Array.from(
      { length: this.tamaño * this.tamaño },
      (_, i) => i
    );
    //desordena los numeros de arreglo
    numeros.sort(() => Math.random() - 0.5);

    //crea un arreglo de tablero de 3*3
    const tablero: number[][] = [];

    //recorrido para llenar la variable tablero
    for (let i = 0; i < this.tamaño; i++) {
      //se hace un push de los numeros desordenados en el tablero de 3*3
      tablero.push(numeros.slice(i * this.tamaño, (i + 1) * this.tamaño));
    }

    return tablero;
  }

  tieneSolucion(tablero: number[][]): boolean {
    //se crea un arreglo de numeros en linea y se quita el 0 que es el espacio vacio para ver las inversiones
    const numerosLinea = tablero.flat().filter((n) => n !== 0);

    //se crea una variable de inversiones donde si es par tiene solucion y si es impar no tiene solucion
    let inversiones = 0;

    //recorrido para ver las inversiones
    for (let i = 0; i < numerosLinea.length; i++) {
      for (let j = i + 1; j < numerosLinea.length; j++) {
        if (numerosLinea[i] > numerosLinea[j]) {
          inversiones++;
        }
      }
    }

    //retorna si es par o impar
    return inversiones % 2 === 0;
  }

  calcularHeuristica(tablero: number[][]): number {
    //crea una variable de distancia
    let distancia = 0;
    //recorrido para calcular la distancia
    for (let i = 0; i < this.tamaño; i++) {
      for (let j = 0; j < this.tamaño; j++) {
        //se obtiene el valor del tablero en la posicion i,j
        const valor = tablero[i][j];
        //si el valor es diferente de 0 se calcula la distancia
        if (valor !== 0) {
          //se obtiene la posicion del valor en el tablero
          let objetivoI = 0;
          let objetivoJ = 0;
          //recorrido para encontrar la posicion del valor
          for (let x = 0; x < this.tamaño; x++) {
            for (let y = 0; y < this.tamaño; y++) {
              //si el tablero objetivo en la posicion x,y es igual al valor se guarda la posicion
              if (this.tableroObjetivo[x][y] === valor) {
                objetivoI = x;
                objetivoJ = y;
                break;
              }
            }
          }
          //se suma la distancia de manhattan
          distancia += Math.abs(i - objetivoI) + Math.abs(j - objetivoJ);
        }
      }
    }
    //retorna la distancia de manhattan
    return distancia;
  }

  private encontrarCero(tablero: number[][]): [number, number] {
    //recorrido para encontrar la posicion del 0
    for (let i = 0; i < this.tamaño; i++) {
      for (let j = 0; j < this.tamaño; j++) {
        //si el tablero en la posicion i,j es igual a 0 retorna la posicion
        if (tablero[i][j] === 0) return [i, j];
      }
    }
    //si no encuentra el 0 retorna un
    return [0, 0];
  }

  simulacionMovimientos(tablero: number[][]): number[][][] {
    //crea un arreglo de movimientos donde se guardaran los movimientos posibles
    const movimientos: number[][][] = [];
    //se obtiene la posicion del 0
    const [ceroI, ceroJ] = this.encontrarCero(tablero);

    //se crea un arreglo de direcciones donde se podra mover el 0
    const direcciones = [
      //arriba, abajo, izquierda, derecha
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    //recorrido para ver las direcciones donde se puede mover el 0
    for (const [di, dj] of direcciones) {
      //se obtiene la nueva posicion del 0
      const nuevoI = ceroI + di;
      const nuevoJ = ceroJ + dj;

      //si la nueva posicion esta dentro del tablero se hace el movimiento
      if (
        //si la nueva posicion esta dentro del tablero
        nuevoI >= 0 &&
        nuevoI < this.tamaño &&
        nuevoJ >= 0 &&
        nuevoJ < this.tamaño
      ) {
        //se crea un nuevo tablero donde se hara el movimiento
        const nuevoTablero = tablero.map((row) => [...row]);
        [nuevoTablero[ceroI][ceroJ], nuevoTablero[nuevoI][nuevoJ]] = [
          //se hace el movimiento del 0
          nuevoTablero[nuevoI][nuevoJ],
          nuevoTablero[ceroI][ceroJ],
        ];
        //se guarda el movimiento en el arreglo de movimientos
        movimientos.push(nuevoTablero);
      }
    }

    //retorna los movimientos posibles del 0
    return movimientos;
  }

  async resolverTablero(): Promise<void> {
    //se inicializa la variable estadosExplorados
    this.estadosExplorados = [];
    //se crea la variable visitados donde se guardaran los tableros visitados
    const visitados = new Set<string>();
    //se crea la cola donde se guardaran los estados del tablero
    const cola: Estado[] = [
      {
        // se guarda el tablero inicial
        tablero: this.tableroInicial,
        // se guarda los pasos donde paso el tablero
        pasos: [this.tableroInicial],
        // se guarda la heuristica de la solucion en el tablero
        h: this.calcularHeuristica(this.tableroInicial),
      },
    ];

    //variable para limitar los estados y no se blucle infinito
    const estadosMaximos = 10000;
    let estadosVisitados = 0;

    //recorrido para resolver el tablero
    while (cola.length > 0) {
      //si se alcanza el limite de estados visitados se imprime un mensaje
      if (estadosVisitados >= estadosMaximos) {
        console.log('Se alcanzó el límite de estados visitados');
        return;
      }
      //se ordena la cola por la heuristica
      cola.sort((a, b) => a.h - b.h);
      //se obtiene el estado actual eliminando el primer elemento de la cola
      const actual = cola.shift()!;

      // Agregamos el estado actual a los estados explorados
      this.estadosExplorados.push(actual.tablero);
      // Incrementamos el contador de estados visitados
      estadosVisitados++;

      // Si la heurística es 0, hemos llegado a la solución
      if (this.calcularHeuristica(actual.tablero) === 0) {
        // Guardamos los pasos de la solución
        this.pasosSolucion = actual.pasos;
        return;
      }

      // Generamos los movimientos posibles
      const movimientos = this.simulacionMovimientos(actual.tablero);
      // Recorremos los movimientos y los agregamos a la cola si no han sido visitados
      for (const nuevoTablero of movimientos) {
        // Convertimos el tablero a un string para poder guardarlo en el set
        const tableroStr = JSON.stringify(nuevoTablero);
        // Si el tablero no ha sido visitado, lo agregamos a la cola
        if (!visitados.has(tableroStr)) {
          // Agregamos el tablero a los visitados
          visitados.add(tableroStr);
          cola.push({
            tablero: nuevoTablero,
            // Agregamos los pasos que hemos dado
            pasos: [...actual.pasos, nuevoTablero],
            h: this.calcularHeuristica(nuevoTablero),
          });
        }
      }
    }
  }

  async generarPuzzle(): Promise<void> {
    //si se esta resolviendo no se puede generar otro puzzle
    this.resolviendo = true;
    try {
      do {
        // Generamos los tableros inicial y objetivo aleatorios
        this.tableroInicial = this.generarTableroAleatorio();
        this.tableroObjetivo = this.generarTableroAleatorio();
      } while (!this.tieneSolucion(this.tableroInicial));

      // Limpiamos soluciones anteriores
      this.pasosSolucion = [];
      this.estadosExplorados = [];

      // Resolvemos el puzzle
      await this.resolverTablero();
    } finally {
      // Se termina de resolver el puzzle
      this.resolviendo = false;
    }
  }
}
