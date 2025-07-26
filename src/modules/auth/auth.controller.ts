import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterPayload } from './dto/register.payload';
import { LoginPayload } from './dto/login.payload';
import { RefreshTokenPayload } from './dto/refresh-token.payload';
import { SendVerificationPayload } from './dto/send-verification.payload';
import { VerifyEmailPayload } from './dto/verify-email.payload';
import {
  UserResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('인증 (Authentication)')
@Controller('auth')
@UseGuards(ThrottlerGuard) // Rate limiting
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiSuccessResponse(UserResponseDto, '회원가입 성공')
  @ApiErrorResponse(409, '이미 등록된 이메일 또는 닉네임')
  @ApiErrorResponse(400, '입력값 검증 실패')
  async register(@Body() registerData: RegisterPayload) {
    const user = await this.authService.register(registerData);
    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: user,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiSuccessResponse(LoginResponseDto, '로그인 성공')
  @ApiErrorResponse(401, '이메일 또는 비밀번호 오류')
  async login(@Body() loginData: LoginPayload) {
    const loginResult = await this.authService.login(loginData);
    return {
      success: true,
      message: '로그인에 성공했습니다.',
      data: loginResult,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiSuccessResponse(RefreshResponseDto, '토큰 갱신 성공')
  @ApiErrorResponse(401, '유효하지 않은 리프레시 토큰')
  async refresh(@Body() refreshData: RefreshTokenPayload) {
    const refreshResult = await this.authService.refresh(
      refreshData.refreshToken,
    );
    return {
      success: true,
      message: '토큰이 갱신되었습니다.',
      data: refreshResult,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiSuccessResponse(undefined, '로그아웃 성공')
  @ApiErrorResponse(401, '인증 실패')
  async logout(@Body() refreshData: RefreshTokenPayload) {
    await this.authService.logout(refreshData.refreshToken);
    return {
      success: true,
      message: '로그아웃이 완료되었습니다.',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiSuccessResponse(UserResponseDto, '사용자 정보 조회 성공')
  @ApiErrorResponse(401, '인증 실패')
  async getMe(@User() user: any) {
    const userResponse = new UserResponseDto(user);
    return {
      success: true,
      message: '사용자 정보를 조회했습니다.',
      data: userResponse,
    };
  }

  @Post('send-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 발송' })
  @ApiSuccessResponse(undefined, '인증 코드 발송 성공')
  @ApiErrorResponse(400, '잘못된 이메일 주소')
  async sendVerification(@Body() sendData: SendVerificationPayload) {
    await this.authService.sendVerificationCode(sendData.email);
    return {
      success: true,
      message: '인증 코드가 발송되었습니다.',
    };
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiSuccessResponse(undefined, '이메일 인증 성공')
  @ApiErrorResponse(400, '유효하지 않은 인증 코드')
  async verifyEmail(@Body() verifyData: VerifyEmailPayload) {
    await this.authService.verifyEmail(verifyData);
    return {
      success: true,
      message: '이메일 인증이 완료되었습니다.',
    };
  }

  @Get('check-email')
  @Public()
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiQuery({ name: 'email', description: '확인할 이메일 주소' })
  @ApiSuccessResponse(undefined, '이메일 중복 확인 결과')
  async checkEmail(@Query('email') email: string) {
    const exists = await this.authService.checkEmailExists(email);
    return {
      success: true,
      message: exists
        ? '이미 사용중인 이메일입니다.'
        : '사용 가능한 이메일입니다.',
      data: { exists },
    };
  }

  @Get('check-nickname')
  @Public()
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @ApiQuery({ name: 'nickname', description: '확인할 닉네임' })
  @ApiSuccessResponse(undefined, '닉네임 중복 확인 결과')
  async checkNickname(@Query('nickname') nickname: string) {
    const exists = await this.authService.checkNicknameExists(nickname);
    return {
      success: true,
      message: exists
        ? '이미 사용중인 닉네임입니다.'
        : '사용 가능한 닉네임입니다.',
      data: { exists },
    };
  }
}
