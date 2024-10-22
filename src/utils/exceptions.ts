import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    name: string = 'InternalServerError',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    cause: unknown = new Error(),
  ) {
    super(
      {
        message,
        name,
        statusCode: status,
      },
      status,
      { cause },
    );
  }
}

export class Unauthorized extends CustomException {
  constructor() {
    super('Unauthorized', 'Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidArguments extends CustomException {
  constructor() {
    super('Invalid arguments', 'InvalidArguments', HttpStatus.NOT_ACCEPTABLE);
  }
}

export class InvalidUser extends CustomException {
  constructor() {
    super('User does not exist', 'InvalidUser', HttpStatus.NOT_FOUND);
  }
}

export class SomethingWentWrong extends CustomException {
  constructor() {
    super(
      'Something Went Wrong',
      'SomethingWentWrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidUsername extends CustomException {
  constructor() {
    super(
      'Account does not exist with this username',
      'InvalidUsername',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidVerifiedEmail extends CustomException {
  constructor() {
    super(
      'Account does not exist with this email or use a verified email to continue',
      'InvalidVerifiedEmail',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class PreviouslyUsedPassword extends CustomException {
  constructor() {
    super(
      'Please choose a different password as it is previously used',
      'PreviouslyUsedPassword',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class SameCurrentUsername extends CustomException {
  constructor() {
    super(
      'Please choose a different username as it is the same as the current one',
      'SameCurrentUsername',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class DuplicateUsername extends CustomException {
  constructor() {
    super(
      'Username already belongs to someone else',
      'DuplicateUsername',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class DuplicateEmail extends CustomException {
  constructor() {
    super(
      'Email already belongs to someone else',
      'DuplicateEmail',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class WrongPassword extends CustomException {
  constructor() {
    super('Password is incorrect', 'WrongPassword', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidOtp extends CustomException {
  constructor() {
    super('Invalid OTP', 'InvalidOtp', HttpStatus.NOT_ACCEPTABLE);
  }
}

export class FileDoesNotExist extends CustomException {
  constructor() {
    super('File Does Not Exist', 'FileDoesNotExist', HttpStatus.NOT_ACCEPTABLE);
  }
}
