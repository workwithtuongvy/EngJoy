export class User {
    user_id?: number;
    username: string;
    password: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    description?: string;
    birthdate?: string;
    registration_date?: string;
    user_type?: number;
  
    constructor(data: Partial<User>) {
      this.user_id = data.user_id;
      this.username = data.username ?? '';
      this.password = data.password ?? '';
      this.email = data.email ?? '';
      this.full_name = data.full_name ?? '';
      this.phone_number = data.phone_number ?? '';
      this.description = data.description ?? '';
      this.birthdate = data.birthdate ?? '';
      this.registration_date = data.registration_date;
      this.user_type = data.user_type ?? 1;
    }
  }
  