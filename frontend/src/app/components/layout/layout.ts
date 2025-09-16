import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hamburger } from '../hamburger/hamburger';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, Hamburger],
  templateUrl: 'layout.html',
  styleUrl: './layout.css',
})
export class Layout {}