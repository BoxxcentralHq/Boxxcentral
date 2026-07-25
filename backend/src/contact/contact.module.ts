import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import {
  ContactMessage,
  ContactMessageSchema,
} from './schemas/contact-message.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
    AdminModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
