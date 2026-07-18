/// <reference types="multer" />
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import {
  CinemaSettings,
  CinemaSettingsDocument,
} from './schemas/cinema-settings.schema';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class CinemaService implements OnModuleInit {
  constructor(
    @InjectModel(CinemaSettings.name)
    private settingsModel: Model<CinemaSettingsDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private uploadPoster(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'boxxcentral/movies', resource_type: 'image' },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(new InternalServerErrorException('Poster upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  private async destroyPoster(publicId?: string) {
    if (!publicId) return;
    // a failed cleanup should never block the main operation
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
  }

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
    const posterData = poster ? await this.uploadPoster(poster) : undefined;
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
    const movie = await this.movieModel.findById(id);
    if (!movie) throw new NotFoundException('Movie not found');

    if (poster) {
      const posterData = await this.uploadPoster(poster);
      await this.destroyPoster(movie.posterPublicId);
      movie.posterUrl = posterData.url;
      movie.posterPublicId = posterData.publicId;
    }

    Object.assign(movie, dto);
    return movie.save();
  }

  async removeMovie(id: string) {
    const movie = await this.movieModel.findById(id);
    if (!movie) throw new NotFoundException('Movie not found');

    await this.destroyPoster(movie.posterPublicId);
    await movie.deleteOne();
    return { message: `"${movie.title}" removed` };
  }
}
