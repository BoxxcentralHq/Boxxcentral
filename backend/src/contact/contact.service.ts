import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private messageModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateMessageDto) {
    await new this.messageModel(dto).save();
    return { message: 'Thanks for reaching out — we will get back to you.' };
  }

  async findAll(query?: { page?: number; limit?: number; unread?: boolean }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: Record<string, unknown> = {};
    if (query?.unread) filter.read = false;

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.messageModel.countDocuments(filter),
    ]);

    return {
      messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markRead(id: string) {
    const message = await this.messageModel.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async remove(id: string) {
    const message = await this.messageModel.findByIdAndDelete(id);
    if (!message) throw new NotFoundException('Message not found');
    return { message: 'Message deleted' };
  }
}
