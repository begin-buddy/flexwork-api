import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Example } from './entities/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import {
  createPaginatedResult,
  normalizePaginationOptions,
  calculatePagination,
} from '../../common/utils/pagination.util';

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
    private readonly i18n: I18nService,
  ) {}

  /**
   * 새로운 예제를 생성합니다
   */
  async create(createExampleDto: CreateExampleDto): Promise<Example> {
    const example = this.exampleRepository.create(createExampleDto);
    return await this.exampleRepository.save(example);
  }

  /**
   * 모든 예제를 페이지네이션과 함께 조회합니다
   */
  async findAll(page: number = 1, limit: number = 10) {
    const { page: normalizedPage, limit: normalizedLimit } = normalizePaginationOptions(
      page,
      limit,
    );

    const { skip, take } = calculatePagination(normalizedPage, normalizedLimit);

    const [data, totalItems] = await this.exampleRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResult(data, normalizedPage, normalizedLimit, totalItems);
  }

  /**
   * 특정 예제를 조회합니다
   */
  async findOne(id: number): Promise<Example> {
    const example = await this.exampleRepository.findOne({
      where: { id },
    });

    if (!example) {
      const message = await this.i18n.translate('common.notFound');
      throw new NotFoundException(message);
    }

    return example;
  }

  /**
   * 예제를 수정합니다
   */
  async update(id: number, updateExampleDto: UpdateExampleDto): Promise<Example> {
    const example = await this.findOne(id);

    Object.assign(example, updateExampleDto);

    return await this.exampleRepository.save(example);
  }

  /**
   * 예제를 삭제합니다 (소프트 삭제)
   */
  async remove(id: number): Promise<void> {
    const example = await this.findOne(id);
    await this.exampleRepository.softRemove(example);
  }

  /**
   * 활성화된 예제만 조회합니다
   */
  async findActive(page: number = 1, limit: number = 10) {
    const { page: normalizedPage, limit: normalizedLimit } = normalizePaginationOptions(
      page,
      limit,
    );

    const { skip, take } = calculatePagination(normalizedPage, normalizedLimit);

    const [data, totalItems] = await this.exampleRepository.findAndCount({
      where: { isActive: true },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResult(data, normalizedPage, normalizedLimit, totalItems);
  }
}
