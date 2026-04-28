import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MuseumEntity } from './museum.entity';
import { MuseumService } from './museum.service';
import { faker } from '@faker-js/faker';
 
describe('MuseumService', () => {
  let service: MuseumService;
  let repository: Repository<MuseumEntity>;
  let museumsList: MuseumEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MuseumService],
    }).compile();

    service = module.get<MuseumService>(MuseumService);
    repository = module.get<Repository<MuseumEntity>>(getRepositoryToken(MuseumEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    museumsList = [];
    for(let i = 0; i < 5; i++){
        const museum: MuseumEntity = await repository.save({
        name: faker.company.name(), 
        description: faker.lorem.sentence(), 
        address: faker.address.secondaryAddress(), 
        city: faker.address.city(), 
        image: faker.image.imageUrl(),
        foundedBefore : 1800})
      museumsList.push(museum);
    }
  }
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all museums', async () => {
    const museums: MuseumEntity[] = await service.findAll();
    expect(museums).not.toBeNull();
    expect(museums).toHaveLength(museumsList.length);
  });

  it('findOne should return a museum by id', async () => {
    const storedMuseum: MuseumEntity = museumsList[0];
    const museum: MuseumEntity = await service.findOne(storedMuseum.id);
    expect(museum).not.toBeNull();
    expect(museum.name).toEqual(storedMuseum.name)
    expect(museum.description).toEqual(storedMuseum.description)
    expect(museum.address).toEqual(storedMuseum.address)
    expect(museum.city).toEqual(storedMuseum.city)
    expect(museum.image).toEqual(storedMuseum.image)
    expect(museum.foundedBefore).toEqual(storedMuseum.foundedBefore)
  });

  it('findOne should throw an exception for an invalid museum', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });

  it('create should return a new museum', async () => {
    const museum: MuseumEntity = {
      id: "",
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      address: faker.address.secondaryAddress(), 
      city: faker.address.city(), 
      image: faker.image.imageUrl(),
      exhibitions: [],
      artworks: [],
      foundedBefore: 1500,
    }

    const newMuseum: MuseumEntity = await service.create(museum);
    expect(newMuseum).not.toBeNull();

    const storedMuseum: MuseumEntity = await repository.findOne({where: {id: newMuseum.id}})
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum.name).toEqual(newMuseum.name)
    expect(storedMuseum.description).toEqual(newMuseum.description)
    expect(storedMuseum.address).toEqual(newMuseum.address)
    expect(storedMuseum.city).toEqual(newMuseum.city)
    expect(storedMuseum.image).toEqual(newMuseum.image)
    expect(storedMuseum.foundedBefore).toEqual(newMuseum.foundedBefore)
  });

  it('update should modify a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    museum.name = "New name";
    museum.address = "New address";
    museum.foundedBefore = 3000
  
    const updatedMuseum: MuseumEntity = await service.update(museum.id, museum);
    expect(updatedMuseum).not.toBeNull();
  
    const storedMuseum: MuseumEntity = await repository.findOne({ where: { id: museum.id } })
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum.name).toEqual(museum.name)
    expect(storedMuseum.address).toEqual(museum.address)
    expect(storedMuseum.foundedBefore).toEqual(museum.foundedBefore)
  });
 
  it('update should throw an exception for an invalid museum', async () => {
    let museum: MuseumEntity = museumsList[0];
    museum = {
      ...museum, name: "New name", address: "New address"
    }
    await expect(() => service.update("0", museum)).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });

  it('delete should remove a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    await service.delete(museum.id);
  
    const deletedMuseum: MuseumEntity = await repository.findOne({ where: { id: museum.id } })
    expect(deletedMuseum).toBeNull();
  });

  it('delete should throw an exception for an invalid museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    await service.delete(museum.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });
 
  it ('findAll, if filtered by city, should return museums filtered by city', async () => {
    museumsList[0].city = "Bogota"
    museumsList[1].city = "Bogota"
    museumsList[2].city = "Cali"

    await repository.save(museumsList[0]);
    await repository.save(museumsList[1]);
    await repository.save(museumsList[2]);

    const museumsFiltered: MuseumEntity[] = await service.findAll("Bogota");

    expect(museumsFiltered).not.toBeNull();
    expect(museumsFiltered).toHaveLength(2);

    museumsFiltered.forEach((museum) => {
      expect(museum.city).toContain("Bogota");
    });

  });

  it('findAll, if filtered by foundedBefore, should return museums founded before the given year', async () => {
    museumsList[0].foundedBefore = 1700;
    museumsList[1].foundedBefore = 1850;
    museumsList[2].foundedBefore = 1950;
    museumsList[3].foundedBefore = 2000;
    museumsList[4].foundedBefore = 2100;

    await repository.save(museumsList[0]);
    await repository.save(museumsList[1]);
    await repository.save(museumsList[2]);
    await repository.save(museumsList[3]);
    await repository.save(museumsList[4]);

    const museumsFiltered: MuseumEntity[] = await service.findAll(undefined, undefined, 1900);

    expect(museumsFiltered).not.toBeNull();
    expect(museumsFiltered).toHaveLength(2);

    museumsFiltered.forEach((museum) => {
      expect(museum.foundedBefore).toBeLessThan(1900);
    });
  });

  it('findAll, if filtered by name, should return museums filtered by name', async () => {
    museumsList[0].name = "Museo del Oro";
    museumsList[1].name = "Museo Botero";
    museumsList[2].name = "Casa de la Memoria";

    await repository.save(museumsList[0]);
    await repository.save(museumsList[1]);
    await repository.save(museumsList[2]);

    const museumsFiltered: MuseumEntity[] = await service.findAll(undefined, "Museo");

    expect(museumsFiltered).not.toBeNull();
    expect(museumsFiltered).toHaveLength(2);

    museumsFiltered.forEach((museum) => {
      expect(museum.name).toContain("Museo");
    });
  });

  it('findAll, if filtered by city, name and foundedBefore, should return the museums that satisfy all filters', async () => {
    museumsList[0].city = "Bogota";
    museumsList[0].name = "Museo del Oro";
    museumsList[0].foundedBefore = 1800;

    museumsList[1].city = "Bogota";
    museumsList[1].name = "Museo Botero";
    museumsList[1].foundedBefore = 1950;

    museumsList[2].city = "Medellin";
    museumsList[2].name = "Museo de Antioquia";
    museumsList[2].foundedBefore = 1850;

    await repository.save(museumsList[0]);
    await repository.save(museumsList[1]);
    await repository.save(museumsList[2]);

    const museumsFiltered: MuseumEntity[] = await service.findAll("Bogota", "Museo", 1900);

    expect(museumsFiltered).not.toBeNull();
    expect(museumsFiltered).toHaveLength(1);
    expect(museumsFiltered[0].city).toContain("Bogota");
    expect(museumsFiltered[0].name).toContain("Museo");
    expect(museumsFiltered[0].foundedBefore).toBeLessThan(1900);
  });  

  it('findAll should return paginated museums', async () => {
    const museumsPaged: MuseumEntity[] = await service.findAll(undefined, undefined, undefined, 1, 2);

    expect(museumsPaged).not.toBeNull();
    expect(museumsPaged).toHaveLength(2);
    expect(museumsPaged[0].id).toEqual(museumsList[0].id);
    expect(museumsPaged[1].id).toEqual(museumsList[1].id);
  });


  it('findAll should use default pagination values when page and limit are not provided', async () => {
    const museums: MuseumEntity[] = await service.findAll();

    expect(museums).not.toBeNull();
    expect(museums).toHaveLength(museumsList.length);
  });



});
