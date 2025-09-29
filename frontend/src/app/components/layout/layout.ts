import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hamburger } from '../hamburger/hamburger';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, Hamburger, Footer],
  templateUrl: 'layout.html',
  styleUrl: './layout.css',
})
export class Layout {}