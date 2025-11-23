import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { ExampleResponseDto } from './dto/response-example.dto';
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
} from '../../common/decorators/api-response.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('examples')
@Controller('examples')
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '새로운 예제 생성' })
  @ApiCreatedResponse(ExampleResponseDto)
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() createExampleDto: CreateExampleDto) {
    const result = await this.exampleService.create(createExampleDto);
    const message = await this.i18n.translate('common.created');

    return {
      message,
      data: result,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '모든 예제 조회 (페이지네이션)' })
  @ApiSuccessResponse(ExampleResponseDto, true)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.exampleService.findAll(page, limit);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: '활성화된 예제만 조회 (페이지네이션)' })
  @ApiSuccessResponse(ExampleResponseDto, true)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findActive(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.exampleService.findActive(page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '특정 예제 조회' })
  @ApiParam({ name: 'id', type: Number, description: '예제 ID' })
  @ApiSuccessResponse(ExampleResponseDto)
  @ApiResponse({ status: 404, description: '예제를 찾을 수 없음' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.exampleService.findOne(id);

    return {
      data: result,
    };
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: '예제 수정' })
  @ApiParam({ name: 'id', type: Number, description: '예제 ID' })
  @ApiSuccessResponse(ExampleResponseDto)
  @ApiResponse({ status: 404, description: '예제를 찾을 수 없음' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateExampleDto: UpdateExampleDto) {
    const result = await this.exampleService.update(id, updateExampleDto);
    const message = await this.i18n.translate('common.updated');

    return {
      message,
      data: result,
    };
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '예제 삭제' })
  @ApiParam({ name: 'id', type: Number, description: '예제 ID' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '예제를 찾을 수 없음' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.exampleService.remove(id);
  }
}
