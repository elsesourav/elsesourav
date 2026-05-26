import { ProfileRepository } from "../repositories/profile.repository";

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfile(slug?: string) {
    const profile = await this.profileRepository.getProfileBySlug(slug);
    
    if (!profile) {
      return null;
    }

    // Example of mapping domain data to DTOs could happen here
    return profile;
  }
}
