import { Controller, Post, Get, Body } from '@nestjs/common';
import { ExtractService } from './extract.service';

@Controller('extract')
export class ExtractController {
  
  constructor(private readonly extractService: ExtractService) {}

  @Get()
  getExtractInfo() {
    return { message: 'Extract endpoint is working', method: 'GET' };
  }

  @Post()
  async extractBrands(@Body('text') text: string) {
    return this.extractService.extractAndStore(text);
  }

  @Get('results')
  async getAllResults() {
    return this.extractService.getAllResults();
  }
}
