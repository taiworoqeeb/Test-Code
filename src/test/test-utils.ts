import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer, MongoMemoryReplSet  } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryReplSet;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) => MongooseModule.forRootAsync({
  useFactory: async () => {
    mongod = await MongoMemoryReplSet.create({ replSet: { count: 4 } });
    const mongoUri = mongod.getUri();
    return {
      uri: mongoUri,
      ...options,
    }
  },
});

export const closeInMongodConnection = async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
    if (mongod) {
        await mongod.stop()
    };
}
