import { PartialType } from '@nestjs/swagger';
import { CreateExampleDto } from './create-example.dto';

/**
 * 예제 업데이트 DTO
 * CreateExampleDto의 모든 필드를 선택적(optional)으로 만듦
 */
export class UpdateExampleDto extends PartialType(CreateExampleDto) {}
