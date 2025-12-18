import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginWithSupabaseUseCase } from '../../application/use-cases/users/login-with-supabase.usecase';
import { RegisterUseCase } from '../../application/use-cases/auth/register.usecase';
import { LoginUseCase } from '../../application/use-cases/auth/login.usecase';
import { AuthPayload } from '../../application/dto/auth/auth-payload.output';
import { RegisterInput } from '../../application/dto/auth/register.input';
import { LoginInput } from '../../application/dto/auth/login.input';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginWithSupabaseUseCase: LoginWithSupabaseUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('login-supabase')
  @ApiOperation({ summary: 'Login with Supabase access token' })
  @ApiBody({
    description: 'Supabase access token',
    schema: {
      type: 'object',
      properties: {
        supabaseAccessToken: {
          type: 'string',
          description: 'JWT access token from Supabase authentication',
          example: 'eyJhbGciOiJIUzI1NiIsImtpZCI6InBIeTQyR1k1MUcxNzU1VFAiLCJ0eXAiOiJKV1QifQ...',
        },
      },
      required: ['supabaseAccessToken'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthPayload,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async loginWithSupabase(
    @Body('supabaseAccessToken') supabaseAccessToken: string,
  ): Promise<AuthPayload> {
    return this.loginWithSupabaseUseCase.execute(supabaseAccessToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthPayload,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() input: RegisterInput): Promise<AuthPayload> {
    return this.registerUseCase.execute(input);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthPayload,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() input: LoginInput): Promise<AuthPayload> {
    return this.loginUseCase.execute(input);
  }

}