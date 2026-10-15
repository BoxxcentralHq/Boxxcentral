/// <reference types="multer" />
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CinemaService, MovieImages } from './cinema.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

const imagePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp)$/ }),
  ],
});

const movieImages = FileFieldsInterceptor([
  { name: 'poster', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

type MovieUploads = {
  poster?: Express.Multer.File[];
  banner?: Express.Multer.File[];
};

async function validateImages(files?: MovieUploads): Promise<MovieImages> {
  const [poster, banner] = (await Promise.all([
    imagePipe.transform(files?.poster?.[0]),
    imagePipe.transform(files?.banner?.[0]),
  ])) as (Express.Multer.File | undefined)[];
  return { poster, banner };
}

@Controller('cinema')
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Get('settings')
  async getPublicSettings() {
    const s = await this.cinemaService.getSettings();
    return {
      message: 'Cinema settings fetched',
      data: {
        vatRate: s.vatRate,
        rooms: s.rooms,
        defaultTicketPrice: s.defaultTicketPrice,
        screeningBufferMins: s.screeningBufferMins,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Patch('settings')
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const settings = await this.cinemaService.updateSettings(dto);
    return { message: 'Cinema settings updated', data: settings };
  }

  @Get('movies')
  async listVisibleMovies() {
    const movies = await this.cinemaService.listVisibleMovies();
    return { message: 'Movies fetched', data: movies };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Get('movies/all')
  async listAllMovies() {
    const movies = await this.cinemaService.listAllMovies();
    return { message: 'Movies fetched', data: movies };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Post('movies')
  @UseInterceptors(movieImages)
  async createMovie(
    @Body() dto: CreateMovieDto,
    @UploadedFiles() files?: MovieUploads,
  ) {
    const images = await validateImages(files);
    const movie = await this.cinemaService.createMovie(dto, images);
    return { message: 'Movie added', data: movie };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Patch('movies/:id')
  @UseInterceptors(movieImages)
  async updateMovie(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @UploadedFiles() files?: MovieUploads,
  ) {
    const images = await validateImages(files);
    const movie = await this.cinemaService.updateMovie(id, dto, images);
    return { message: 'Movie updated', data: movie };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Delete('movies/:id')
  async removeMovie(@Param('id') id: string) {
    const result = await this.cinemaService.removeMovie(id);
    return { message: result.message, data: null };
  }
}
