/// <reference types="multer" />
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CinemaSettings,
  CinemaSettingsDocument,
} from './schemas/cinema-settings.schema';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const POSTER_FOLDER = 'boxxcentral/movies';

@Injectable()
export class CinemaService implements OnModuleInit {
  constructor(
    @InjectModel(CinemaSettings.name)
    private settingsModel: Model<CinemaSettingsDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // seed the settings singleton on boot so GET never 404s
  async onModuleInit() {
    await this.settingsModel.findOneAndUpdate(
      {},
      { $setOnInsert: {} },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async getSettings(): Promise<CinemaSettingsDocument> {
    const settings = await this.settingsModel.findOne();
    if (!settings) throw new NotFoundException('Cinema settings not found');
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    return this.settingsModel.findOneAndUpdate({}, dto, { new: true });
  }

  async listVisibleMovies() {
    return this.movieModel.find({ visible: true }).sort({ createdAt: -1 });
  }

  async listAllMovies() {
    return this.movieModel.find().sort({ createdAt: -1 });
  }

  async createMovie(dto: CreateMovieDto, poster?: Express.Multer.File) {
    const posterData = poster
      ? await this.cloudinaryService.uploadImage(poster, POSTER_FOLDER)
      : undefined;
    return new this.movieModel({
      ...dto,
      posterUrl: posterData?.url,
      posterPublicId: posterData?.publicId,
    }).save();
  }

  async updateMovie(
    id: string,
    dto: UpdateMovieDto,
    poster?: Express.Multer.File,
  ) {
    const movie = await this.movieModel.findById(id).select('+posterPublicId');
    if (!movie) throw new NotFoundException('Movie not found');

    if (poster) {
      const posterData = await this.cloudinaryService.uploadImage(
        poster,
        POSTER_FOLDER,
      );
      await this.cloudinaryService.destroyImage(movie.posterPublicId);
      movie.posterUrl = posterData.url;
      movie.posterPublicId = posterData.publicId;
    }

    Object.assign(movie, dto);
    return movie.save();
  }

  async removeMovie(id: string) {
    const movie = await this.movieModel.findById(id).select('+posterPublicId');
    if (!movie) throw new NotFoundException('Movie not found');

    await this.cloudinaryService.destroyImage(movie.posterPublicId);
    await movie.deleteOne();
    return { message: `"${movie.title}" removed` };
  }
}
