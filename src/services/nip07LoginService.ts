import type { LoginStrategyInterface } from '../interfaces/LoginStrategyInterface';
import { NDKlogin } from '../utils/helper';
import { ndkUser } from '../stores/stores';
import { UserProfileService } from './userProfileService';

export class NIP07LoginService implements LoginStrategyInterface {
	userProfileService = new UserProfileService();

	async login(): Promise<'success' | 'error'> {
		try {
			const user = await NDKlogin();
			if (user) {
				ndkUser.set(user);
				this.userProfileService.fetchUserProfile(user.pubkey);
				return 'success';
			} else {
				throw new Error('NIP07 login failed.');
			}
		} catch (error) {
			console.log('Error with NIP07 login ' + error);
			return 'error';
		}
	}
}
