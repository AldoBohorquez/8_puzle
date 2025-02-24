import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type Posicion = {
  fila: number;
  columna: number;
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
}
