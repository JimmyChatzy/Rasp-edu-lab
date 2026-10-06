import { strapi } from '@strapi/client';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export const strapiClient = strapi({
  baseURL: `${STRAPI_URL}/api`,
  auth: process.env.STRAPI_API_TOKEN
});