import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async findAll() {
    return await this.pokemonModel.find();
  }
  
  async findOne(term: string) {
    let pokemon: Pokemon;
    // By No
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    // By Mongo ID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }
    // By Name
    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }
    // Error
    if(!pokemon){
      throw new NotFoundException(`Pokemon with id, name or no ${term} not found`);
    }

    return pokemon;
  }
  
  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const newPokemon = await this.pokemonModel.create(createPokemonDto);
      return newPokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon: Pokemon = await this.findOne(term);
    try {
      if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      
      await pokemon.updateOne(updatePokemonDto, { new: true });
      
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon: Pokemon = await this.findOne(id);
    // try {
      // const result = await this.pokemonModel.findByIdAndDelete(id);
      const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({ _id: id });
      if(deletedCount === 0) throw new BadRequestException(`Pokemon with id '${id}' not found`);
      // await pokemon.deleteOne();
      return `Pokemon removed`;
    // } catch (error) {
    //   this.handleExceptions(error);      
    // }
  }

  private handleExceptions (error: any){
    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon exist in db ${ JSON.stringify(error.keyValue) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
