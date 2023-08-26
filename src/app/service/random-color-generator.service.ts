import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomColorGeneratorService {

  constructor() { }

  getRandomColor(): string {
    const red = Math.floor(Math.random() * 128);
    const green = Math.floor(Math.random() * 128);
    const blue = Math.floor(Math.random() * 128);
    return `${red}, ${green}, ${blue}`;
  }
}
