import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ){} 

  async executeSeed() {

    // Eliminar los registros de pokemones que quedaron en la BD para poblarla de nuevo
    await this.pokemonModel.deleteMany({}); // delete * from pokemons;

    const data:PokeResponse = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    /**
     * Primera manera de hacerlo abajo usando Arreglo de promesas
     */
    // const insertPromisesArray = [];

    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/');
    //   const no = +segments[segments.length - 2];
    //   // await this.pokemonModel.create({name, no: no});
    //   insertPromisesArray.push(this.pokemonModel.create({name, no: no}));
    // });

    // await Promise.all( insertPromisesArray );

    /**
     * Segunda manera de hacerlo abajo usando insert many
     */
    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // await this.pokemonModel.create({name, no: no});
      pokemonToInsert.push({name, no: no});
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed executed';
  }
}
