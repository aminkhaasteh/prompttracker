// src/extract/extract.module.ts
import { Module } from '@nestjs/common';
import { ExtractService } from './extract.service';
import { ExtractController } from './extract.controller';

@Module({
  controllers: [ExtractController],
  providers: [ExtractService],
})
export class ExtractModule {}
