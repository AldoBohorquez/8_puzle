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
    this.generarTableroAleatorio();
    this.tieneSolucion(this.generarTableroAleatorio());
    this.calcularHeuristica(this.generarTableroAleatorio());
    this.simulacionMovimientos(this.generarTableroAleatorio());
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
    console.log(tablero);

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
    console.log(inversiones);

    //retorna si es par o impar
    return inversiones % 2 === 0;
  }

  calcularHeuristica(tablero: number[][]): number {
    //se crea una variable de heuristica contara la distancia manhattan
    let h = 0;

    //recorrido para calcular la heuristica donde se suma la distancia manhattan de cada posicion actual y la posicion objetivo
    for (let i = 0; i < this.tamaño; i++) {
      for (let j = 0; j < this.tamaño; j++) {
        //se obtiene el valor de la posicion actual del tablero
        const valor = tablero[i][j];

        //se obtiene la posicion objetivo del valor actual
        const objetivo = this.tableroObjetivo
          .map((fila) => fila.indexOf(valor))
          .filter((pos) => pos !== -1);

        //se suma la distancia manhattan de la posicion actual y la posicion objetivo
        h += Math.abs(i - objetivo[0]) + Math.abs(j - objetivo[1]);
      }
    }
    console.log(h);

    // retorna la heuristica de la solucion
    return h;
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
    console.log(ceroI, ceroJ);

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
    console.log(movimientos);

    //retorna los movimientos posibles del 0
    return movimientos;
  }
}
