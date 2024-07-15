// Import necessary decorators and components from NestJS
import { Controller, Get, Post, Body, Patch, Put, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { PhoneNumberDto } from './dto/phone-number.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ExtractToken } from '../../common/decorators/extract-token.decorator';
import {
  AssignRoleDto,
  CreateDevicePreferenceDto,
  CreateLanguageDto,
  CreateUserDto,
  QueryOtpTypeDto,
  QueryUserProfile,
  ResetMpinDto,
  UpdateDevicePreferenceDto,
} from './dto';

import { CreateMPinDto } from './dto/create-mpin.dto';
import { DeviceIdDto } from '../../common/utils/dto/device-dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { RateOrderDto } from './dto/rate.order';

// Define the UserController with API tags for Swagger documentation
@ApiTags('user')
@Controller({ version: '1', path: 'user' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Endpoint to send OTP

  @Post('/send-otp')
  sendOtp(@Body() phoneNumber: PhoneNumberDto) {
    return this.userService.sendOtp(phoneNumber);
  }

  // Endpoint to send MPIN OTP
  @Put('/send-mpin-otp')
  sendMpinOtp(@ExtractToken() token: string) {
    return this.userService.sendMpinOtp(token);
  }

  // Endpoint to verify OTP
  @Post('/verify-otp')
  verifyOtp(
    @ExtractToken() token: string,
    @Query() queryOtpTypeDto: QueryOtpTypeDto,
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.userService.verifyOtp(token, queryOtpTypeDto, verifyOtpDto);
  }

  @Put('/reset-mpin')
  resetMpin(@ExtractToken() token: string, @Body() resetMpinDto: ResetMpinDto) {
    return this.userService.resetMpin(token, resetMpinDto);
  }

  // Endpoint to get user journey
  @Get('journey')
  getUserJourney(@ExtractToken() token: string) {
    return this.userService.getUserJourney(token);
  }

  // Endpoint to find roles
  @Get('roles')
  findRoles(@Query() deviceIdDto: DeviceIdDto) {
    return this.userService.findRoles(deviceIdDto);
  }

  // Endpoint to assign role
  @Patch('role')
  assignRole(@Body() assignRoleDto: AssignRoleDto, @ExtractToken() token: string) {
    return this.userService.assignRole(assignRoleDto, token);
  }

  // // Endpoint to update user KYC
  // @Patch('kyc')
  // updateUserKyc(@ExtractToken() token: string) {
  //   return this.userService.updateUserKyc(token);
  // }

  // Endpoint to get user details
  @Get()
  getUser(@ExtractToken() token: string, @Query() query: QueryUserProfile) {
    return this.userService.findOne(token, query);
  }

  // Endpoint to create MPIN
  @Post('create-mpin')
  createMPin(@ExtractToken() token: string, @Body() mPin: CreateMPinDto) {
    return this.userService.createMPin(token, mPin);
  }

  // Endpoint to verify MPIN
  @Put('verify-mpin')
  verifyMPin(@ExtractToken() token: string, @Body() mPin: CreateMPinDto) {
    return this.userService.verifyMPin(token, mPin);
  }

  // Endpoint to get refresh token

  @Get('access-token')
  getAccessToken(@ExtractToken() token: string) {
    return this.userService.getAccessToken(token);
  }

  // Endpoint to logout user
  @Put('logout')
  logoutUser(@ExtractToken() token: string) {
    return this.userService.logoutUser(token);
  }

  // Endpoint to create user

  @Post()
  createUser(@ExtractToken() token: string, @Body() user: CreateUserDto) {
    return this.userService.createUser(token, user);
  }

  @Patch('language-preference')
  updateUserLanguagePreference(@ExtractToken() token: string, @Body() createLanguageDto: CreateLanguageDto) {
    return this.userService.updateUserLanguagePreference(token, createLanguageDto);
  }

  @Post('device-preference')
  createDevicePreference(@Body() createDevicePreferenceDto: CreateDevicePreferenceDto) {
    return this.userService.createDevicePreference(createDevicePreferenceDto);
  }

  @Patch('device-preference')
  updateDevicePreference(@Body() updateDevicePreferenceDto: UpdateDevicePreferenceDto) {
    return this.userService.updateDevicePreference(updateDevicePreferenceDto);
  }

  @Get('device-preference/:id')
  getDevicePreferenceByDeviceId(@Param('id') deviceId: string) {
    return this.userService.getDevicePreferenceById(deviceId);
  }

  @Get('orders')
  getUserOrders(@Query() paginationRequest: GetOrdersQueryDto, @ExtractToken() token: string) {
    return this.userService.getUserOrders(token, paginationRequest);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') orderId: string, @ExtractToken() token: string) {
    return this.userService.getOrderById(token, orderId);
  }

  @Patch('orders/:id/rate')
  rateOrder(@Param('id') orderId: string, @ExtractToken() token: string, @Body() rateOrderRequest: RateOrderDto) {
    return this.userService.rateOrder(token, orderId, rateOrderRequest);
  }
  @Patch('orders/mark-add-to-wallet')
  updatedIsAddedToWallet(@Query('orderId') orderId: string) {
    return this.userService.updateIsAddedToWallet(orderId);
  }
}
