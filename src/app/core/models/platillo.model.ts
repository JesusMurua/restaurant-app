import { ExtraMeal } from "./extraMeal.model";
import { SizeMeal } from "./sizeMeal.model";

export class PlatilloSelected {
  platillo: Platillo;
  size: SizeMeal;
  extras?: ExtraMeal[];
  Cantidad: number;
  Total: number;
  constructor() {
    this.platillo = new Platillo();
    this.size = new SizeMeal();
    this.extras = [];
    this.Cantidad = 1;
    this.Total  = 0
  }
}


export class Platillo {
  id: number;
  idCategoria: number;
  platillo: string;
  precio: number;
  description: string;
  image: string;
}
