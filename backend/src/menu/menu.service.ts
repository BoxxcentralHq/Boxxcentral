/// <reference types="multer" />
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const IMAGE_FOLDER = 'boxxcentral/menu';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async listVisible() {
    return this.menuItemModel.find({ visible: true }).sort({ createdAt: -1 });
  }

  async listAll() {
    return this.menuItemModel.find().sort({ createdAt: -1 });
  }

  async create(dto: CreateMenuItemDto, image?: Express.Multer.File) {
    const imageData = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : undefined;
    return new this.menuItemModel({
      ...dto,
      imageUrl: imageData?.url,
      imagePublicId: imageData?.publicId,
    }).save();
  }

  async update(
    id: string,
    dto: UpdateMenuItemDto,
    image?: Express.Multer.File,
  ) {
    const item = await this.menuItemModel.findById(id).select('+imagePublicId');
    if (!item) throw new NotFoundException('Menu item not found');

    if (image) {
      const imageData = await this.cloudinaryService.uploadImage(
        image,
        IMAGE_FOLDER,
      );
      await this.cloudinaryService.destroyImage(item.imagePublicId);
      item.imageUrl = imageData.url;
      item.imagePublicId = imageData.publicId;
    }

    Object.assign(item, dto);
    return item.save();
  }

  async remove(id: string) {
    const item = await this.menuItemModel.findById(id).select('+imagePublicId');
    if (!item) throw new NotFoundException('Menu item not found');

    await this.cloudinaryService.destroyImage(item.imagePublicId);
    await item.deleteOne();
    return { message: `"${item.name}" removed` };
  }
}
