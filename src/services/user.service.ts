import { loginDTO } from "../dto/login.dto";
import { SignupDTO } from "../dto/signup.dto";
import { userRepository } from "../repositories/user.repository";

class UserService {
    async signup (signupDto: SignupDTO) {
        return await userRepository.signup(signupDto);
    }

    async login (loginDto: loginDTO) {
        return await userRepository.login(loginDto);
    }
}

export const userService = new UserService();