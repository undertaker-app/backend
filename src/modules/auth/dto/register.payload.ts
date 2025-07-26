import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterPayload {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 8자, 영문+숫자+특수문자)',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '닉네임 (최대 50자)',
    example: '지하철왕',
  })
  @IsString()
  @MaxLength(50, { message: '닉네임은 최대 50자까지 가능합니다.' })
  nickname: string;

  @ApiProperty({
    description: '전화번호 (선택)',
    example: '010-1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (010-XXXX-XXXX)',
  })
  phoneNumber?: string;
}
