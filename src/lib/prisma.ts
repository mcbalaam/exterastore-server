import { PrismaClient } from '@prisma/client';
import LOGGER_SESSION from '..';

const prisma = new PrismaClient();
LOGGER_SESSION.log("generic", "Connected to remote database")
export default prisma;