import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlutterwaveService } from './flutterwave.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [FlutterwaveService],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
