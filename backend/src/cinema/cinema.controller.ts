/// <reference types="multer" />
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CinemaService } from './cinema.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

const posterPipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp)$/ }),
  ],
});

@Controller('cinema')
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  // public: the FilmBoxx page reads pricing + slots from here
  @Get('settings')
  async getPublicSettings() {
    const s = await this.cinemaService.getSettings();
    return {
      message: 'Cinema settings fetched',
      data: {
        basePrice: s.basePrice,
        includedGuests: s.includedGuests,
        maxGuests: s.maxGuests,
        extraSeatPrice: s.extraSeatPrice,
        sessionDurationHours: s.sessionDurationHours,
        vatRate: s.vatRate,
        timeSlots: s.timeSlots,
        rooms: s.rooms,
        bookingEnabled: s.bookingEnabled,
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

  // public: movie catalog for the website
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
  @UseInterceptors(FileInterceptor('poster'))
  async createMovie(
    @Body() dto: CreateMovieDto,
    @UploadedFile(posterPipe) poster?: Express.Multer.File,
  ) {
    const movie = await this.cinemaService.createMovie(dto, poster);
    return { message: 'Movie added', data: movie };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Patch('movies/:id')
  @UseInterceptors(FileInterceptor('poster'))
  async updateMovie(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @UploadedFile(posterPipe) poster?: Express.Multer.File,
  ) {
    const movie = await this.cinemaService.updateMovie(id, dto, poster);
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
