import { Module } from '@nestjs/common';
import { MuseumService } from './museum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuseumEntity } from './museum.entity';
import { MuseumController } from './museum.controller';

@Module({
  providers: [MuseumService],
  imports: [TypeOrmModule.forFeature([MuseumEntity])],
  controllers: [MuseumController],
})
export class MuseumModule {}
