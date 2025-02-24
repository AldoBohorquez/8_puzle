import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

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
}
