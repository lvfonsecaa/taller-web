import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { MuseumEntity } from './museum.entity';

@Injectable()
export class MuseumService {
   constructor(
       @InjectRepository(MuseumEntity)
       private readonly museumRepository: Repository<MuseumEntity>
   ){}

   async findAll(city?: string, name?: string, foundedBefore?: number, page: number =1, limit: number=10): Promise<MuseumEntity[]> {
       let museums: MuseumEntity[] = await this.museumRepository.find({ relations: ["artworks", "exhibitions"] });

        if (city) {
        museums = museums.filter(museum => museum.city.includes(city));
        }

        if (name) {
        museums = museums.filter(museum => museum.name.includes(name));
        }

        if (foundedBefore) {
        museums = museums.filter(museum => museum.foundedBefore < foundedBefore);
        }


        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return museums.slice(startIndex, endIndex);
   }

   async findOne(id: string): Promise<MuseumEntity> {
       const museum: MuseumEntity = await this.museumRepository.findOne({where: {id}, relations: ["artworks", "exhibitions"] } );
       if (!museum)
         throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
  
       return museum;
   }
  
   async create(museum: MuseumEntity): Promise<MuseumEntity> {
       return await this.museumRepository.save(museum);
   }

   async update(id: string, museum: MuseumEntity): Promise<MuseumEntity> {
       const persistedMuseum: MuseumEntity = await this.museumRepository.findOne({where:{id}});
       if (!persistedMuseum)
         throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
      
       museum.id = id; 
      
       return await this.museumRepository.save(museum);
   }

   async delete(id: string) {
       const museum: MuseumEntity = await this.museumRepository.findOne({where:{id}});
       if (!museum)
         throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
    
       await this.museumRepository.remove(museum);
   }
}
