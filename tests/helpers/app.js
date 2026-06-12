// tests/helpers/app.js
//
// A single configured Express app instance + a supertest agent factory.

import supertest from 'supertest';
import { createApp } from '../../backend/src/app.js';

export const app = createApp();

// fresh supertest request bound to the app
export const api = () => supertest(app);
