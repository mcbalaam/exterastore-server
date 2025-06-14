import { PrismaClient } from '@prisma/client';
import { updateLogFile } from './logger';

const prisma = new PrismaClient();
updateLogFile("generic", "Connected to remote database")
export default prisma;