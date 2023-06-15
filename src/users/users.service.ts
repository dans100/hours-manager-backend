import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPwd } from '../utils/hash-pwd';

@Injectable()
export class UsersService {
  async findOne(username: string): Promise<User | undefined> {
    return User.findOneBy({ username });
  }

  async create(user: CreateUserDto) {
    const newUser = new User();
    newUser.username = user.username;
    newUser.role = user.role;
    newUser.hashedPassword = await hashPwd(user.password);
    await newUser.save();
  }
}
