import { Component, OnInit, Input } from '@angular/core';
import { Platillo } from './../../../../core/models/Platillo.model'

@Component({
  selector: 'app-platillo',
  templateUrl: './platillo.component.html',
  styleUrls: ['./platillo.component.scss']
})
export class PlatilloComponent implements OnInit {

  @Input() Platillo: Platillo;

  constructor() { }

  ngOnInit(): void {
  }

}
