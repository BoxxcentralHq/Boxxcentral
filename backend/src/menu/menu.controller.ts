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
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

const imagePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp)$/ }),
  ],
});

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // public: the Lounge page's menu grid
  @Get()
  async listVisible() {
    const items = await this.menuService.listVisible();
    return { message: 'Menu items fetched', data: items };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.LOUNGE_ADMIN)
  @Get('all')
  async listAll() {
    const items = await this.menuService.listAll();
    return { message: 'Menu items fetched', data: items };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.LOUNGE_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateMenuItemDto,
    @UploadedFile(imagePipe) image?: Express.Multer.File,
  ) {
    const item = await this.menuService.create(dto, image);
    return { message: 'Menu item added', data: item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.LOUNGE_ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile(imagePipe) image?: Express.Multer.File,
  ) {
    const item = await this.menuService.update(id, dto, image);
    return { message: 'Menu item updated', data: item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.LOUNGE_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.menuService.remove(id);
    return { message: result.message, data: null };
  }
}
