import { ConfigService } from '@nestjs/config';

const config = new ConfigService();

export const ENV = {
  SERVER_PORT: Number(config.get('SERVER_PORT')),
  DB_HOST: config.get<string>('DB_HOST'),
  DB_PORT: Number(config.get<number>('DB_PORT')),
  DB_USERNAME: config.get<string>('DB_USERNAME'),
  DB_PASSWORD: config.get<string>('DB_PASSWORD'),
  DB_NAME: config.get<string>('DB_NAME'),
  DB_SYNC: config.get<string>('DB_SYNC') === 'true',
  ACCESS_TOKEN_SECRET_KEY: config.get<string>('ACCESS_TOKEN_SECRET_KEY'),
  ACCESS_TOKEN_EXPIRED_IN: config.get<string>('ACCESS_TOKEN_EXPIRED_IN'),
  REFRESH_TOKEN_SECRET_KEY: config.get<string>('REFRESH_TOKEN_SECRET_KEY'),
  REFRESH_TOKEN_EXPIRED_IN: config.get<string>('REFRESH_TOKEN_EXPIRED_IN'),
  HASH_ROUNDS: Number(config.get<number>('HASH_ROUNDS')),
  JWT_EMAIL_KEY: config.get<string>('JWT_EMAIL_KEY'),
  ADMIN_ID: Number(config.get<number>('ADMIN_ID')),
  EMAIL_USER: config.get<string>('EMAIL_USER'),
  EMAIL_PASS: config.get<string>('EMAIL_PASS'),
  KAKAO_CLIENT_ID: config.get<string>('KAKAO_CLIENT_ID'),
  KAKAO_CLIENT_SECRET: config.get<string>('KAKAO_CLIENT_SECRET'),
  KAKAO_CALLBACK_URL: config.get<string>('KAKAO_CALLBACK_URL'),
  NAVER_CLIENT_ID: config.get<string>('NAVER_CLIENT_ID'),
  NAVER_CLIENT_SECRET: config.get<string>('NAVER_CLIENT_SECRET'),
  NAVER_CALLBACK_URI: config.get<string>('NAVER_CALLBACK_URI'),
  S3_SECRET_ACCESS_KEY: config.get<string>('S3_SECRET_ACCESS_KEY'),
  S3_ACCESS_KEY: config.get<string>('S3_ACCESS_KEY'),
  AWS_BUCKET: config.get<string>('AWS_BUCKET'),
};
